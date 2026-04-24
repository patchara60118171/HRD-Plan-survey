const fs = require('fs');

const raw = fs.readFileSync('idp-dashboard/dashboards/exec.jsx', 'utf8');

// Check what's at the end
console.log('Last 500 chars of raw file:');
console.log(raw.slice(-500));
console.log('\n---\n');

// Check if regex matches
const matches = raw.match(/window\.__DASHBOARDS__[^;]+;\s*window\.__DASHBOARDS__\[[^\]]+\]\s*=\s*[^;]+;/);
console.log('Matches found:', matches ? matches[0] : 'none');
