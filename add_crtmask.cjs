const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Insert import if not present
if (!app.includes('CRTMask')) {
  app = app.replace(
    "import TargetCursor from './components/TargetCursor';",
    "import TargetCursor from './components/TargetCursor';\nimport CRTMask from './components/CRTMask';"
  );
  
  // Insert component
  const target = '      <TargetCursor />';
  app = app.replace(
    target,
    '      <CRTMask curvature={0.15} />\n      <TargetCursor />'
  );
  
  fs.writeFileSync('src/App.tsx', app);
  console.log('CRTMask inserted into App.tsx');
} else {
  console.log('CRTMask already in App.tsx');
}
