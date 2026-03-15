const fs = require('fs');
const fpath = 'admin.html';
let content = fs.readFileSync(fpath, 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
console.log('Line 1671:', lines[1670].substring(0, 80));
console.log('Line 3347:', lines[3346].substring(0, 80));
console.log('Line 3454:', lines[3453].substring(0, 80));
