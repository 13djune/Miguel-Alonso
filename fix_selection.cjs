const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/::selection \{\n  background: #ffffff;/g, '::selection {\n  background: #c4ffff;');
fs.writeFileSync('src/index.css', css);
