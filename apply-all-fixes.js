const fs = require('fs');
let content = fs.readFileSync('admin.html', 'utf8');

console.log('Applying all CHANGE 1 modifications...\n');

// 1. Replace renderOrganizations function name
content = content.replace('function renderOrganizations(summary)', 'function renderOrgs(summary)');
console.log('✓ Renamed function to renderOrgs');

// 2. Update the querySelector in renderOrgs function
content = content.replace(
  "const table = page.querySelector('tbody');",
  "const table = page.querySelector('#org-table tbody');"
);
console.log('✓ Updated querySelector to use #org-table tbody');

// 3. Replace all renderOrganizations calls with renderOrgs
content = content.replace(/renderOrganizations\(/g, 'renderOrgs(');
console.log('✓ Updated all function calls');

// 4. Add new helper functions before showOrgDetail
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
  const modalContent = '<div class="card" style="width:90%;max-width:500px;margin:0"><h3></h3><form onsubmit="saveOrgProfile(event)"><input type="text" name="name" placeholder="ชื่อหน่วยงาน" required><input type="text" name="letter" placeholder="ตัวอักษรย่อ" maxlength="5"><input type="text" name="ministry" placeholder="กระทรวง"><div style="display:flex;gap:8px;margin-top:16px"><button type="submit" class="btn b-blue">บันทึก</button><button type="button" class="btn" onclick="document.getElementById(\\'org-modal\\').style.display=\\'none\\'">ยกเลิก</button></div></form></div>';
  overlay.innerHTML = modalContent;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.style.display = 'none';
  });
  return overlay;
}

`;

const insertPoint = content.indexOf('function showOrgDetail');
if (insertPoint !== -1) {
  content = content.slice(0, insertPoint) + newFunctions + '\n' + content.slice(insertPoint);
  console.log('✓ Added filterOrgTable, openOrgModal, createOrgModal functions');
}

// Save the file
fs.writeFileSync('admin.html', content, 'utf8');
console.log('\n✅ All CHANGE 1 modifications applied successfully');
