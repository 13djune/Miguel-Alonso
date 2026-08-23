const fs = require('fs');
const files = [
  'src/components/DesignerModal.tsx',
  'src/components/CollectionsView.tsx',
  'src/components/ProjectModal.tsx',
  'src/components/Overlay.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  // We want to remove opacities from borders and bg where it's white to make them pure white?
  // Wait, if we remove bg-white/5 to bg-white, it becomes fully opaque white.
  // The user says "todos los bordes estructurales, el árbol ASCII, los textos, los paneles y componentes inactivos estén rigurosamente en color blanco"
  // If the background is white, it will just be a white block.
  // Let's change border-white/20, border-white/30 to border-white
  code = code.replace(/border-white\/[0-9]+/g, 'border-white');
  
  // bg-black/40 and bg-black/90 are fine because the background is black, we just want the borders/text to be white.
  fs.writeFileSync(file, code);
}
console.log("Opacities fixed.");
