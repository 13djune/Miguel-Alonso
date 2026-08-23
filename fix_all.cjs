const fs = require('fs');

// 1. Overlay.tsx
let overlay = fs.readFileSync('src/components/Overlay.tsx', 'utf8');

// Fix translation so button stays on screen
overlay = overlay.replace(/translate-x-\[calc\(100%\+2rem\)\]/g, 'translate-x-full');

// Replace white/70 with white
overlay = overlay.replace(/text-white\/70/g, 'text-white');

// Ensure hover colors are cyan
overlay = overlay.replace(/hover:text-white hover:border-white\/50/g, 'hover:text-[#c4ffff] hover:border-[#c4ffff]/50');

fs.writeFileSync('src/components/Overlay.tsx', overlay);

// 2. DesignerModal.tsx
let designer = fs.readFileSync('src/components/DesignerModal.tsx', 'utf8');
designer = designer.replace(/text-white\/70/g, 'text-white');
designer = designer.replace(/#a3a3a3/g, '#ffffff');
fs.writeFileSync('src/components/DesignerModal.tsx', designer);

// 3. ProjectModal.tsx
let project = fs.readFileSync('src/components/ProjectModal.tsx', 'utf8');
project = project.replace(/text-white\/70/g, 'text-white');
fs.writeFileSync('src/components/ProjectModal.tsx', project);

// 4. CollectionsView.tsx
let collections = fs.readFileSync('src/components/CollectionsView.tsx', 'utf8');
collections = collections.replace(/text-white\/70/g, 'text-white');
fs.writeFileSync('src/components/CollectionsView.tsx', collections);

// 5. LineSidebar.tsx and css
if (fs.existsSync('src/components/LineSidebar.tsx')) {
  let sidebar = fs.readFileSync('src/components/LineSidebar.tsx', 'utf8');
  sidebar = sidebar.replace(/#a3a3a3/g, '#ffffff');
  fs.writeFileSync('src/components/LineSidebar.tsx', sidebar);
}
if (fs.existsSync('src/components/LineSidebar.css')) {
  let sidebarCss = fs.readFileSync('src/components/LineSidebar.css', 'utf8');
  sidebarCss = sidebarCss.replace(/#a3a3a3/g, '#ffffff');
  fs.writeFileSync('src/components/LineSidebar.css', sidebarCss);
}

// Ensure the main overlay div has no margin
overlay = fs.readFileSync('src/components/Overlay.tsx', 'utf8');
overlay = overlay.replace(/hidden md:block mr-2 md:mr-4/g, 'hidden md:block');
fs.writeFileSync('src/components/Overlay.tsx', overlay);

console.log("Fixes applied.");
