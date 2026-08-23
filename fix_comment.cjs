const fs = require('fs');
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');
code = code.replace('// Varied speeds per planet', '/* Varied speeds */');
fs.writeFileSync('src/components/Universe.tsx', code);
