const fs = require('fs');
const path = 'C:\\Users\\Pchr Pyl\\Desktop\\Well-being Survey\\admin.html';

// Read file
let content = fs.readFileSync(path, 'utf8');

// Find and log locations of key functions
const renderOrgsMatch = content.match(/function renderOrganizations/);
const formConfigMatch = content.match(/FORM_CONFIG_SCHEMAS\s*=\s*{/);
const renderFeMatch = content.match(/function renderFeFields/);

console.log('Key function locations:');
if (renderOrgsMatch) {
  const before = content.substring(0, renderOrgsMatch.index);
  const lineNum = before.split('\n').length;
  console.log(`renderOrganizations at line ~${lineNum}`);
}

if (formConfigMatch) {
  const before = content.substring(0, formConfigMatch.index);
  const lineNum = before.split('\n').length;
  console.log(`FORM_CONFIG_SCHEMAS at line ~${lineNum}`);
}

if (renderFeMatch) {
  const before = content.substring(0, renderFeMatch.index);
  const lineNum = before.split('\n').length;
  console.log(`renderFeFields at line ~${lineNum}`);
}

console.log('\nFile read successfully. Size:', content.length, 'chars');
