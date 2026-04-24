const fs = require('fs');

const raw = fs.readFileSync('idp-dashboard/dashboards/exec.jsx', 'utf8');
let code = raw
  .replace(/\/\* auto-generated[\s\S]*?\*\//, '')
  .replace(/const\s*\{\s*useState[^}]+\}\s*=\s*React;?\s*\n?/g, '')
  .replace(/const\s*\{[\s\S]*?\}\s*=\s*Recharts;?\s*\n?/, '')
  .replace(/window\.__DASHBOARDS__[^;]+;\s*window\.__DASHBOARDS__\[[^\]]+\]\s*=\s*[^;]+;/, '')
  .trim();

// Check if code starts with function or const
console.log('First 500 chars:');
console.log(code.slice(0, 500));

// Check for function declarations
const functionMatches = code.match(/function\s+\w+\s*\(/g);
console.log('\nFunction declarations found:', functionMatches);

// Check for export default
const exportMatch = code.match(/export\s+default\s+function\s+(\w+)/);
console.log('Export default function:', exportMatch ? exportMatch[1] : 'none');
