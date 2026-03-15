const fs = require('fs');
let content = fs.readFileSync('admin.html', 'utf8');
const before = content.includes('renderOrganizations(summary)');

// Replace all renderOrganizations calls with renderOrgs
content = content.replace(/renderOrganizations\(summary\)/g, 'renderOrgs(summary)');
content = content.replace(/renderOrganizations\(summarizeOrgs\(\)\)/g, 'renderOrgs(summarizeOrgs())');

fs.writeFileSync('admin.html', content, 'utf8');

// Verify
const updated = fs.readFileSync('admin.html', 'utf8');
if (updated.includes('renderOrganizations')) {
  console.log('⚠ Some renderOrganizations instances remain');
} else {
  console.log('✅ All renderOrganizations replaced with renderOrgs');
}
