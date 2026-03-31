/* ========== ADMIN PORTAL — NAVIGATION ========== */

function go(id, el) {
  const roleLvl = { viewer: 0, admin: 1, superadmin: 2, super_admin: 2 };
  const myLvl = roleLvl[state.myRole] ?? 0;
  const adminOnlyPages = {};
  const superOnlyPages = { 'org-credentials': 2, settings: 2, audit: 2, 'form-editor': 2 };
  const reqLvl = superOnlyPages[id] ?? adminOnlyPages[id] ?? 0;
  if (myLvl < reqLvl) { showToast('⛔ ไม่มีสิทธิ์เข้าถึงหน้านี้', 'warn'); return; }
  document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  if (el) el.classList.add('active');
  const title = titles[id];
  if (title) {
    document.getElementById('ttl').textContent = title[0];
    document.getElementById('tbc').textContent = title[1];
  }
  if (id === 'ch1-summary') renderCh1Summary();
  if (id === 'settings') loadSettingsUI();
  if (id === 'form-editor') loadFormEditorFields();
  if (id === 'org-credentials') loadOrgCredentialsPage();
}

function st(el, targetId) {
  const page = el.closest('.page');
  page.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
  el.classList.add('active');
  ['c1-ctrl','c1-data','c1-pdf','c1-sheet'].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.style.display = 'none';
  });
  const target = document.getElementById(targetId);
  if (target) target.style.display = 'block';
}

function swb(el, targetId) {
  const page = el.closest('.page');
  page.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
  el.classList.add('active');
  ['wb-ctrl','wb-org','wb-sheet'].forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.style.display = 'none';
  });
  const target = document.getElementById(targetId);
  if (target) target.style.display = 'block';
}
