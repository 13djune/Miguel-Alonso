const fs = require('fs');
let overlay = fs.readFileSync('src/components/Overlay.tsx', 'utf8');

const regex = /<\/div>\s*\);\s*\}\)}\s*<\/div>\s*<div className="hidden md:flex ml-auto items-center gap-4 pointer-events-auto">/;
overlay = overlay.replace(regex, '</div>\n\n        <div className="hidden md:flex ml-auto items-center gap-4 pointer-events-auto">');

fs.writeFileSync('src/components/Overlay.tsx', overlay);
console.log("Syntax fixed");
