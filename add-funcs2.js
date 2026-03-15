const fs = require('fs');
let content = fs.readFileSync('admin.html', 'utf8');

// New functions to add before showOrgDetail
const newFunctions = `
function filterOrgTable() {
  const search = document.getElementById('org-search')?.value.toLowerCase() || '';
  const ministry = document.getElementById('org-filter-ministry')?.value || '';
  const table = document.getElementById('org-table');
  if (!table) return;
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const nameEl = row.querySelector('td:nth-child(2)');
    const ministryEl = row.querySelector('td:nth-child(3)');
    const name = nameEl?.textContent.toLowerCase() || '';
    const min = ministryEl?.textContent.toLowerCase() || '';
    const matchName = search === '' || name.includes(search);
    const matchMin = ministry === '' || min.includes(ministry);
    row.style.display = (matchName && matchMin) ? '' : 'none';
  });
}

function openOrgModal(orgName) {
  const modal = document.getElementById('org-modal') || createOrgModal();
  const titleEl = modal.querySelector('h3');
  const formEl = modal.querySelector('form');
  if (orgName) {
    const org = ORG_LOOKUP.get(orgName);
    if (org) {
      titleEl.textContent = 'แก้ไขหน่วยงาน';
      formEl.querySelector('[name="name"]').value = org.name || '';
      formEl.querySelector('[name="letter"]').value = org.letter || '';
      formEl.querySelector('[name="ministry"]').value = org.ministry || '';
    }
  } else {
    titleEl.textContent = 'เพิ่มหน่วยงานใหม่';
    formEl.reset();
  }
  modal.style.display = 'flex';
}

function createOrgModal() {
  const overlay = document.createElement('div');
  overlay.id = 'org-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999';
  const html = \`<div class="card" style="width:90%;max-width:500px;margin:0"><h3></h3><form onsubmit="saveOrgProfile(event)"><input type="text" name="name" placeholder="ชื่อหน่วยงาน" required><input type="text" name="letter" placeholder="ตัวอักษรย่อ" maxlength="5"><input type="text" name="ministry" placeholder="กระทรวง"><div style="display:flex;gap:8px;margin-top:16px"><button type="submit" class="btn b-blue">บันทึก</button><button type="button" class="btn" onclick="document.getElementById('org-modal').style.display='none'">ยกเลิก</button></div></form></div>\`;
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.style.display = 'none';
  });
  return overlay;
}

`;

// Find the insertion point (before showOrgDetail function)
const insertPoint = content.indexOf('function showOrgDetail');
if (insertPoint !== -1) {
  content = content.slice(0, insertPoint) + newFunctions + '\n' + content.slice(insertPoint);
  fs.writeFileSync('admin.html', content, 'utf8');
  console.log('✅ Added filterOrgTable, openOrgModal, createOrgModal functions');
} else {
  console.log('⚠ Could not find insertion point for new functions');
}
