const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace('        {/* Scanlines Effect */}\n        <div className="scanlines pointer-events-none"></div>\n', '');
fs.writeFileSync('src/App.tsx', app);
