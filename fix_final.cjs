const fs = require('fs');

// 1. Overlay.tsx
let overlay = fs.readFileSync('src/components/Overlay.tsx', 'utf8');

// Button top-right adjustment
overlay = overlay.replace(/mr-2 md:mr-4 bg-white text-black font-mono font-bold text-xs px-2 py-8 hover:bg-gray-200 border border-white z-50 cursor-crosshair shadow-\[0_0_10px_rgba\(255,255,255,0\.3\)\] transition-colors/, 
  'top-0 bg-white text-black font-mono font-bold text-xs px-2 py-4 hover:bg-[#c4ffff] hover:border-[#c4ffff] border border-white z-50 cursor-crosshair shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-colors');

// Remove main right padding 
overlay = overlay.replace(/items-center justify-end md:pr-12/g, 'items-center justify-end');

// Remove sidebar wrapper margin
overlay = overlay.replace(/hidden md:block mr-2 md:mr-4 bg-black\/40/g, 'hidden md:block bg-black/40');

// Restore cyan hover on elements
overlay = overlay.replace(/hover:text-white hover:bg-white\/10 px-2 py-1 border border-transparent hover:border-white\/50/g, 'hover:text-[#c4ffff] hover:bg-[#c4ffff]/10 px-2 py-1 border border-transparent hover:border-[#c4ffff]/50');
overlay = overlay.replace(/text-white border-white hover:bg-white\/10 pulse-border' : 'text-white\/70 border-transparent hover:text-white hover:border-white\/50'/g, "text-[#c4ffff] border-[#c4ffff] hover:bg-[#c4ffff]/10 pulse-border' : 'text-white/70 border-transparent hover:text-[#c4ffff] hover:border-[#c4ffff]/50'");
overlay = overlay.replace(/color="#ffffff" speed="3s"/g, 'color="#c4ffff" speed="3s"'); // StarBorders
overlay = overlay.replace(/hover:bg-white transition-colors/g, 'hover:bg-[#c4ffff] hover:text-black transition-colors');
overlay = overlay.replace(/text-black bg-white px-2 py-1/g, 'text-black bg-[#c4ffff] px-2 py-1');

// Update transform to just 100% since there's no margin now
overlay = overlay.replace(/translate-x-\[calc\(100%\+0\.5rem\)\] md:translate-x-\[calc\(100%\+4rem\)\]/g, 'translate-x-full');

fs.writeFileSync('src/components/Overlay.tsx', overlay);

// 2. Universe.tsx
let universe = fs.readFileSync('src/components/Universe.tsx', 'utf8');

// Restore Cyan brackets
universe = universe.replace(/<div className="absolute -inset-4 border border-dashed animate-\[spin_10s_linear_infinite\]" style=\{\{ borderColor: "#ffffff", opacity: 0\.5 \}\} \/>/, 
  '<div className="absolute -inset-4 border border-dashed animate-[spin_10s_linear_infinite]" style={{ borderColor: "#c4ffff", opacity: 0.5 }} />');

universe = universe.replace(/<div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style=\{\{ borderColor: "#ffffff" \}\}><\/div>/g, 
  '<div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: "#c4ffff" }}></div>');
universe = universe.replace(/<div className="absolute top-0 right-0 w-2 h-2 border-t border-r" style=\{\{ borderColor: "#ffffff" \}\}><\/div>/g, 
  '<div className="absolute top-0 right-0 w-2 h-2 border-t border-r" style={{ borderColor: "#c4ffff" }}></div>');
universe = universe.replace(/<div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style=\{\{ borderColor: "#ffffff" \}\}><\/div>/g, 
  '<div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l" style={{ borderColor: "#c4ffff" }}></div>');
universe = universe.replace(/<div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style=\{\{ borderColor: "#ffffff" \}\}><\/div>/g, 
  '<div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: "#c4ffff" }}></div>');

fs.writeFileSync('src/components/Universe.tsx', universe);

// 3. ProjectModal.tsx 
let projectModal = fs.readFileSync('src/components/ProjectModal.tsx', 'utf8');

// Use cyan for accent buttons
projectModal = projectModal.replace(/hover:bg-white hover:text-black/g, 'hover:bg-[#c4ffff] hover:text-black');
projectModal = projectModal.replace(/hover:text-black transition-colors cursor-crosshair flex items-center gap-2/g, 'hover:bg-[#c4ffff] hover:text-black transition-colors cursor-crosshair flex items-center gap-2');

fs.writeFileSync('src/components/ProjectModal.tsx', projectModal);

// 4. CollectionsView.tsx
let collections = fs.readFileSync('src/components/CollectionsView.tsx', 'utf8');
collections = collections.replace(/style=\{\{ backgroundColor: "#ffffff", boxShadow: `0 0 10px #ffffff` \}\}/g, 'style={{ backgroundColor: "#c4ffff", boxShadow: `0 0 10px #c4ffff` }}');

fs.writeFileSync('src/components/CollectionsView.tsx', collections);

console.log("Updates applied.");
