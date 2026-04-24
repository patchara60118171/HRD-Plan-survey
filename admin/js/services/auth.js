/* ========== ADMIN PORTAL — AUTH & SESSION ========== */

// Top-level so logout always works even if renderChrome() has not run yet.
async function doLogout() {
  await sb.auth.signOut();
  window.location.href = '/admin-login';
}

async function requireSession() {
  const SESSION_TIMEOUT_MS = 12000;
  const sessionPromise = sb.auth.getSession().then(({ data: { session } }) => session);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('หมดเวลาตรวจสอบ session (12s)')), SESSION_TIMEOUT_MS)
  );
  const session = await Promise.race([sessionPromise, timeoutPromise]);
  if (!session) {
    window.location.href = '/admin-login';
    return null;
  }

  // Validate that this user has an admin portal role (not org_hr from org-portal)
  // Query the user's role from admin_user_roles table
  const { data: roleRow, error: roleErr } = await sb
    .from('admin_user_roles')
    .select('role, is_active')
    .eq('email', session.user.email)
    .maybeSingle();

  // Allowed roles for admin portal (org_hr and viewer are NOT allowed)
  const adminRoles = ['superadmin', 'super_admin', 'admin'];
  const userRole = roleRow?.role?.toLowerCase() || '';

  // If user is org_hr or doesn't have a valid admin role, sign out and redirect
  if (roleErr || !roleRow?.is_active || !adminRoles.includes(userRole)) {
    await sb.auth.signOut();
    window.location.href = '/admin-login';
    return null;
  }

  state.session = session;
  return session;
}

function renderChrome() {
  const email = state.session?.user?.email || 'admin';
  document.querySelector('.u-name').textContent = email;
  document.querySelector('.u-avatar').textContent = email.charAt(0).toUpperCase();
  // ตรวจสอบ role ของผู้ใช้ที่ login อยู่
  const myRow = state.userRows.find((r) => r.email === email);
  // Locked superadmin emails — ไม่สามารถเปลี่ยน role ได้จาก UI
  const isLockedSuper = LOCKED_SUPERADMIN_EMAILS.includes(email);
  // Normalize: DB may store 'super_admin' (underscore) — canonicalize to 'superadmin'
  const rawRole = (myRow?.role || 'admin').replace('super_admin', 'superadmin');
  state.myRole = isLockedSuper ? 'superadmin' : rawRole;
  const roleLvl = { admin: 1, superadmin: 2, super_admin: 2 };
  const myLvl = roleLvl[state.myRole] ?? 1;
  document.querySelectorAll('[data-min-role]').forEach((el) => {
    const minLvl = roleLvl[el.dataset.minRole] ?? 99;
    el.style.display = myLvl >= minLvl ? '' : 'none';
  });
  document.querySelector('.u-role').innerHTML = `<div class="u-role-dot"></div> ${state.myRole === 'superadmin' ? 'Super Admin' : 'Admin'}`;
  const roleInfoEl = document.getElementById('users-role-info');
  if (roleInfoEl) {
    if (state.myRole === 'superadmin') roleInfoEl.innerHTML = '🔑 คุณเข้าสู่ระบบในฐานะ <b>Super Admin</b> — สามารถจัดการผู้ใช้ทุกระดับได้';
    else if (state.myRole === 'admin') roleInfoEl.innerHTML = '🔑 คุณเข้าสู่ระบบในฐานะ <b>Admin</b> — สามารถเพิ่ม/จัดการ Org HR ได้เท่านั้น';
  }

  // doLogout is defined at top-level above — no need to reassign here.
}
