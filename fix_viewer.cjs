const fs = require('fs');

let code = fs.readFileSync('src/components/GarmentViewer.tsx', 'utf8');

// Optimize Canvas
code = code.replace(
  '<Canvas shadows camera={{ position: [0, 0, 8], fov: 40 }} gl={{ antialias: true, powerPreference: \'high-performance\' }} dpr={[1, 1.5]}>',
  '<Canvas camera={{ position: [0, 0, 8], fov: 40 }} gl={{ antialias: false, powerPreference: \'high-performance\', depth: true, stencil: false }} dpr={1}>'
);

// Remove shadow props
code = code.replace(/castShadow/g, '');
code = code.replace(/receiveShadow/g, '');
code = code.replace(/shadow-mapSize=\{\[2048, 2048\]\}/g, '');
code = code.replace(/shadow-bias=\{-0\.0001\}/g, '');

fs.writeFileSync('src/components/GarmentViewer.tsx', code);
console.log('Fixed GarmentViewer');
