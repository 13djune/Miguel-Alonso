const fs = require('fs');

// 1. App.tsx - lower DPR for performance
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/dpr=\{\[1, 1\.5\]\}/g, 'dpr={1}'); // just 1 for better performance
// Remove antialias=true since it causes lag, let's keep false or high-performance.
// Wait, gl={{ antialias: true }} is there, let's make it gl={{ antialias: false, powerPreference: 'high-performance' }}
appCode = appCode.replace(/gl=\{\{ antialias: true, powerPreference: 'high-performance' \}\}/g, "gl={{ antialias: false, powerPreference: 'high-performance' }}");
fs.writeFileSync('src/App.tsx', appCode);

// 2. DesignerModal.tsx - Full width, remove boxshadow animation
let designer = fs.readFileSync('src/components/DesignerModal.tsx', 'utf8');
// Full width header and content
designer = designer.replace(/w-full max-w-\[1200px\] mx-auto/g, 'w-full');
// Optimize animations
designer = designer.replace(/gsap\.to\('\.modal-content', \{[\s\S]*?repeat: -1,[\s\S]*?delay: 0\.5\n\s*\}\);/m, ''); // removing the box-shadow pulsing
designer = designer.replace(/boxShadow: '4px 4px 10px rgba\(255, 255, 255,0\.1\)',/g, '');
// Let's reduce backdrop blurs
designer = designer.replace(/backdrop-blur-md/g, 'backdrop-blur-sm');
fs.writeFileSync('src/components/DesignerModal.tsx', designer);

// 3. ProjectModal.tsx - Full width, remove boxshadow animation
let project = fs.readFileSync('src/components/ProjectModal.tsx', 'utf8');
// Optimize animations
const pMatch = project.match(/gsap\.to\('\.modal-content', \{\s*borderColor:[^}]*stagger: 0\.1\s*\}\);/);
if (pMatch) {
  project = project.replace(pMatch[0], '');
}
// Reduce backdrop blur
project = project.replace(/backdrop-blur-md/g, 'backdrop-blur-sm');
project = project.replace(/backdrop-blur-xl/g, 'backdrop-blur-sm');
fs.writeFileSync('src/components/ProjectModal.tsx', project);

// 4. CollectionsView.tsx - Full width
let collections = fs.readFileSync('src/components/CollectionsView.tsx', 'utf8');
collections = collections.replace(/max-w-5xl h-full max-h-\[85vh\]/g, 'w-full h-full border-0');
collections = collections.replace(/p-4 md:p-8 bg-black\/80/g, 'p-0 bg-black/95'); // remove padding for full screen
// Adjust inner padding of content
collections = collections.replace(/p-4 border-b border-white/g, 'p-4 md:px-8 border-b border-white');
fs.writeFileSync('src/components/CollectionsView.tsx', collections);

// 5. AsciiImage.tsx - Remove cyan drop-shadow and grayscale hover image
let ascii = fs.readFileSync('src/components/AsciiImage.tsx', 'utf8');
ascii = ascii.replace(/196,255,255/g, '255,255,255');
ascii = ascii.replace(/<img([\s\S]*?)className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 \$\{isHovered \? 'opacity-100' : 'opacity-0'\}`}/g, 
  `<img$1className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 grayscale mix-blend-screen \${isHovered ? 'opacity-100' : 'opacity-0'}\`}`);
fs.writeFileSync('src/components/AsciiImage.tsx', ascii);

console.log("Optimizations done.");
