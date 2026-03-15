const fs = require('fs');
const html = fs.readFileSync('admin.html', 'utf8');
const scripts = [];
let m;
const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi;

while ((m = re.exec(html))) {
  scripts.push(m[1]);
}

try {
  new Function(scripts.join('\n'));
  console.log('✅ Syntax check PASSED');
  
  // Also check for function names
  const content = scripts.join('\n');
  if (content.includes('function renderOrgs')) {
    console.log('✓ renderOrgs function found');
  }
  if (content.includes('function renderOrganizations')) {
    console.log('⚠ renderOrganizations still exists');
  }
  
} catch (e) {
  console.error('❌ Syntax error:', e.message);
  process.exit(1);
}
