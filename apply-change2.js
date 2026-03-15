const fs = require('fs');
let content = fs.readFileSync('admin.html', 'utf8');

console.log('Applying CHANGE 2 modifications...\n');

// Find and update FORM_CONFIG_SCHEMAS ch1 object
const ch1OldPattern = /ch1:\s*\{[^}]*label:\s*['"](ฟอร์ม Ch1[^'"]*)['"],[^}]*(sections:\s*\[(?:[^[\]]*(?:\[(?:[^[\]]*(?:\[[^\[\]]*\])*)*\])*)*\])[^}]*\}/;
const ch1ReplaceStart = content.indexOf('ch1: {');

if (ch1ReplaceStart !== -1) {
  // Find the closing bracket for ch1 object
  let braceCount = 0;
  let i = content.indexOf('{', ch1ReplaceStart);
  let j = i;
  
  while (j < content.length) {
    if (content[j] === '{') braceCount++;
    if (content[j] === '}') {
      braceCount--;
      if (braceCount === 0) {
        const ch1Old = content.substring(i, j + 1);
        const ch1New = `{
    label: 'ฟอร์ม Ch1 (ข้อมูลองค์กร)',
    sections: [
      { key: 'general', label: '🏠 ทั่วไป', fields: [
        { key: 'main_title', label: 'ชื่อฟอร์มหลัก', default: 'แบบสำรวจข้อมูลสุขภาวะองค์กร' },
        { key: 'intro_text', label: 'ข้อความแนะนำ', default: 'กรุณากรอกข้อมูล' }
      ]}
    ]
  }`;
        
        content = content.substring(0, i) + ch1New + content.substring(j + 1);
        console.log('✓ Updated FORM_CONFIG_SCHEMAS ch1 object');
        break;
      }
    }
    j++;
  }
}

// Add helper functions for inline editing before renderFeFields
const helperFunctions = `
function toggleFeFieldEdit(formId, fieldKey) {
  const inputId = 'fe-field-' + formId + '-' + fieldKey.replace(/\\./g, '-');
  const previewEl = document.getElementById(inputId + '-preview');
  const editEl = document.getElementById(inputId + '-edit');
  if (!previewEl || !editEl) return;
  previewEl.style.display = previewEl.style.display === 'none' ? '' : 'none';
  editEl.style.display = editEl.style.display === 'none' ? '' : 'none';
}

function cancelFeFieldInline(formId, fieldKey) {
  const inputId = 'fe-field-' + formId + '-' + fieldKey.replace(/\\./g, '-');
  const inputEl = document.getElementById(inputId);
  const origValue = _feConfigCache[formId]?.[fieldKey];
  if (inputEl && origValue) {
    inputEl.value = origValue;
  }
  toggleFeFieldEdit(formId, fieldKey);
}

function saveFeFieldInline(formId, fieldKey) {
  const inputId = 'fe-field-' + formId + '-' + fieldKey.replace(/\\./g, '-');
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;
  
  const newValue = inputEl.value.trim();
  if (newValue !== '') {
    _feConfigCache[formId] = _feConfigCache[formId] || {};
    _feConfigCache[formId][fieldKey] = newValue;
    
    const previewEl = document.getElementById(inputId + '-preview');
    if (previewEl) {
      previewEl.textContent = newValue;
    }
    
    toggleFeFieldEdit(formId, fieldKey);
    
    setTimeout(() => saveFormConfig(formId), 100);
  }
}

`;

const renderFeFieldsPoint = content.indexOf('function renderFeFields');
if (renderFeFieldsPoint !== -1) {
  content = content.slice(0, renderFeFieldsPoint) + helperFunctions + '\n' + content.slice(renderFeFieldsPoint);
  console.log('✓ Added toggleFeFieldEdit, cancelFeFieldInline, saveFeFieldInline functions');
}

fs.writeFileSync('admin.html', content, 'utf8');
console.log('\n✅ CHANGE 2 modifications applied');
