const fs = require('fs');
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');
console.log(code.includes('Line'));
