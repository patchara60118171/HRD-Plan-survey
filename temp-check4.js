const fs = require('fs');

const raw = fs.readFileSync('idp-dashboard/dashboards/exec.jsx', 'utf8');
let code = raw
  .replace(/\/\* auto-generated[\s\S]*?\*\//, '')
  .replace(/const\s*\{\s*useState[^}]+\}\s*=\s*React;?\s*\n?/g, '')
  .replace(/const\s*\{[\s\S]*?\}\s*=\s*Recharts;?\s*\n?/, '')
  .replace(/window\.__DASHBOARDS__[^;]+;\s*window\.__DASHBOARDS__\[[^\]]+\]\s*=\s*[^;]+;/, '')
  .trim();

console.log('First 300 chars of cleaned code:');
console.log(code.slice(0, 300));
