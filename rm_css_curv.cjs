const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Find the start of the curvature block
const curvStart = css.indexOf('/* \n * 1. CAPA DE CURVATURA SUAVE');
if (curvStart !== -1) {
  // Find the end of the body::before block
  const beforeEnd = css.indexOf('}', curvStart) + 1;
  css = css.substring(0, curvStart) + css.substring(beforeEnd);
}

fs.writeFileSync('src/index.css', css);
console.log('Removed body::before curvature from CSS');
