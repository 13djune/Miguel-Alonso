const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Remove import
app = app.replace("import CRTMask from './components/CRTMask';\n", '');

// Remove component
app = app.replace("      <CRTMask curvature={0.15} />\n", '');

fs.writeFileSync('src/App.tsx', app);
console.log('CRTMask removed from App.tsx');
