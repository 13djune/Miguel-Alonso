const fs = require('fs');
let code = fs.readFileSync('src/components/SystemLog.tsx', 'utf8');

code = code.replace(
  'className="absolute top-32 md:top-48 left-4 md:left-12 z-50',
  'className="absolute bottom-12 md:bottom-24 left-4 md:left-12 z-50'
);

fs.writeFileSync('src/components/SystemLog.tsx', code);
