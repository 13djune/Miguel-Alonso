const fs = require('fs');
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

code = code.replace(/const radii = \[2\.5, 3\.2, 3\.8, 4\.5\];/, 'const radii = [2.0, 2.6, 3.2, 3.8];');
fs.writeFileSync('src/components/Universe.tsx', code);
