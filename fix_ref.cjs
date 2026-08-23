const fs = require('fs');

let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

code = code.replace(/const glowMeshRef = useRef<THREE\.Sprite>\(null\);/, 'const glowMeshRef = useRef<THREE.Group>(null);');

fs.writeFileSync('src/components/Universe.tsx', code);
