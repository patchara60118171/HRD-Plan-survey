/* ========== ADMIN PORTAL — AUTH & SESSION ========== */

async function requireSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
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
  state.myRole = isLockedSuper ? 'superadmin' : (myRow?.role || 'viewer');
  const roleLvl = { viewer: 0, admin: 1, superadmin: 2 };
  const myLvl = roleLvl[state.myRole] ?? 0;
  document.querySelectorAll('[data-min-role]').forEach((el) => {
    const minLvl = roleLvl[el.dataset.minRole] ?? 99;
    el.style.display = myLvl >= minLvl ? '' : 'none';
  });
  document.querySelector('.u-role').innerHTML = `<div class="u-role-dot"></div> ${state.myRole === 'superadmin' ? 'Super Admin' : state.myRole === 'admin' ? 'Admin' : 'Viewer'}`;
  const roleInfoEl = document.getElementById('users-role-info');
  if (roleInfoEl) {
    if (state.myRole === 'superadmin') roleInfoEl.innerHTML = '🔑 คุณเข้าสู่ระบบในฐานะ <b>Super Admin</b> — สามารถจัดการผู้ใช้ทุกระดับได้';
    else if (state.myRole === 'admin') roleInfoEl.innerHTML = '🔑 คุณเข้าสู่ระบบในฐานะ <b>Admin</b> — สามารถเพิ่ม/จัดการ Viewer ได้เท่านั้น';
  }

  window.doLogout = async () => {
    await sb.auth.signOut();
    window.location.href = '/admin-login';
  };

  const buttons = document.querySelectorAll('.topbar-btn');
  if (buttons[0]) {
    buttons[0].textContent = '🔄 รีเฟรช';
    buttons[0].onclick = () => window.location.reload();
  }
  if (buttons[1]) {
    buttons[1].textContent = '📤 Export';
    buttons[1].onclick = exportCurrentPage;
  }
}
