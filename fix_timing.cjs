const fs = require('fs');
let code = fs.readFileSync('src/components/ProjectModal.tsx', 'utf8');

code = code.replace(
  'const timer = setTimeout(() => setShow3D(true), 1200);',
  'const timer = setTimeout(() => setShow3D(true), 1600);'
);

fs.writeFileSync('src/components/ProjectModal.tsx', code);
console.log('Fixed timing in ProjectModal');
