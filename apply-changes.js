const fs = require('fs');
const path = 'admin.html';

// Read file
let content = fs.readFileSync(path, 'utf8');
let modified = false;

// CHANGE 1: Replace renderOrganizations with renderOrgs
const renderOrgOld = `function renderOrganizations() {
	const page = document.getElementById('page-orgs');
	const table = page.querySelector('tbody');`;

const renderOrgNew = `function renderOrgs() {
	const page = document.getElementById('page-orgs');
	const table = page.querySelector('#org-table tbody');`;

if (content.includes(renderOrgOld)) {
  content = content.replace(renderOrgOld, renderOrgNew);
  console.log('✓ Updated renderOrganizations -> renderOrgs');
  modified = true;
} else {
  console.log('✗ Could not find renderOrganizations function');
}

// Add new functions before showOrgDetail
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
  overlay.innerHTML = \`<div class="card" style="width:90%;max-width:500px;margin:0">\n    <h3></h3>\n    <form onsubmit="saveOrgProfile(event)">\n      <input type="text" name="name" placeholder="ชื่อหน่วยงาน" required>\n      <input type="text" name="letter" placeholder="ตัวอักษรย่อ" maxlength="5">\n      <input type="text" name="ministry" placeholder="กระทรวง">\n      <div style="display:flex;gap:8px;margin-top:16px">\n        <button type="submit" class="btn b-blue">บันทึก</button>\n        <button type="button" class="btn" onclick="document.getElementById('org-modal').style.display='none'">ยกเลิก</button>\n      </div>\n    </form>\n  </div>\`;\n  document.body.appendChild(overlay);\n  overlay.addEventListener('click', (e) => {\n    if (e.target === overlay) overlay.style.display = 'none';\n  });\n  return overlay;
}

`;

// Find the location to insert new functions (before showOrgDetail)
const insertPoint = content.indexOf('function showOrgDetail');
if (insertPoint !== -1) {
  content = content.slice(0, insertPoint) + newFunctions + '\n' + content.slice(insertPoint);
  console.log('✓ Added filterOrgTable, openOrgModal, createOrgModal functions');
  modified = true;
}

// Save the modified content
if (modified) {
  fs.writeFileSync(path, content, 'utf8');
  console.log('\n✓ admin.html updated successfully');
} else {
  console.log('\n✗ No changes were made');
}
