const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/maxDistance=\{22\}/, "maxDistance={18}");

fs.writeFileSync('src/App.tsx', code);
