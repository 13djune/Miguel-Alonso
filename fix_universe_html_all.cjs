const fs = require('fs');
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

// The file has instances of:
// <Html position={[0, 1.2, 0]} center style={{ pointerEvents: 'none' }}>
code = code.replace(/<Html position=\{\[0, 1\.2, 0\]\} center style=\{\{ pointerEvents: 'none' \}\}>/g, '<Html position={[0, 1.2, 0]} center style={{ pointerEvents: \'none\', opacity: selectedProject ? 0 : 1, display: selectedProject ? "none" : "block", transition: "opacity 0.2s" }}>');

fs.writeFileSync('src/components/Universe.tsx', code);
