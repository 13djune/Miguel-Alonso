const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add the CameraDebug component
const debugComponent = `
function CameraDebug() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    const el = document.getElementById('debug-coords');
    if (el) {
      el.innerText = \`CAM: X:\${camera.position.x.toFixed(2)} Y:\${camera.position.y.toFixed(2)} Z:\${camera.position.z.toFixed(2)} | PTR: X:\${pointer.x.toFixed(2)} Y:\${pointer.y.toFixed(2)}\`;
    }
  });
  return null;
}
`;

code = code.replace('export const hoverState = { hovered: false };', debugComponent + '\nexport const hoverState = { hovered: false };');

// Mount it inside Canvas
code = code.replace(
  '<CameraController selectedProject={selectedProject} />',
  '<CameraController selectedProject={selectedProject} />\n            <CameraDebug />'
);

// Add the div outside Canvas
code = code.replace(
  '{/* Scanlines Effect */}',
  '<div id="debug-coords" className="absolute bottom-4 right-4 text-[10px] font-mono text-[#c4ffff] pointer-events-none z-50 opacity-60 text-right tracking-wider"></div>\n        {/* Scanlines Effect */}'
);

fs.writeFileSync('src/App.tsx', code);
