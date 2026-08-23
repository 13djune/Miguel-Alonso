const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
// Comment out EffectComposer and DynamicBloom
appCode = appCode.replace(
  '<EffectComposer>\n              <DynamicBloom selectedProject={selectedProject} />\n            </EffectComposer>',
  '{/* Effect Composer (Bloom) disabled for massive performance boost */}'
);

fs.writeFileSync('src/App.tsx', appCode);

let uniCode = fs.readFileSync('src/components/Universe.tsx', 'utf8');
uniCode = uniCode.replace(
  'const orbitSpeed = 0.05 / (radius * 0.5);',
  'const orbitSpeed = (0.04 / (radius * 0.5)) * (1 + (index % 5) * 0.45); // Varied speeds per planet'
);

fs.writeFileSync('src/components/Universe.tsx', uniCode);
console.log('Fixed performance in App.tsx and Universe.tsx');
