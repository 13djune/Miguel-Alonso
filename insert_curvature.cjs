const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes('CurvatureEffect')) {
  // Insert import
  app = app.replace(
    "import TargetCursor from './components/TargetCursor';",
    "import TargetCursor from './components/TargetCursor';\nimport CurvatureEffect from './components/CurvatureEffect';"
  );
  
  // Insert component
  const target = '      </div>\n    \n      <TargetCursor />';
  app = app.replace(
    target,
    '        <CurvatureEffect curvature={0.12} />\n      </div>\n    \n      <TargetCursor />'
  );
  
  fs.writeFileSync('src/App.tsx', app);
  console.log("Curvature effect inserted");
}
