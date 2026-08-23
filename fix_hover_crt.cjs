const fs = require('fs');

// --- Fix index.css ---
let css = fs.readFileSync('src/index.css', 'utf8');

// Decrease dot opacity from 0.05 to 0.02
css = css.replace(
  /background-image: radial-gradient\(circle, rgba\(255, 255, 255, 0\.05\) 1px, transparent 1px\);/,
  'background-image: radial-gradient(circle, rgba(255, 255, 255, 0.02) 1px, transparent 1px);'
);

// Increase CRT gradient
const oldGradient = `  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.4) 5%,
    rgba(255, 255, 255, 0.04) 7%,
    transparent 18%,
    transparent 82%,
    rgba(255, 255, 255, 0.02) 93%,
    rgba(0, 0, 0, 0.4) 95%,
    rgba(0, 0, 0, 0.9) 100%
  );`;

const newGradient = `  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.98) 0%,
    rgba(0, 0, 0, 0.7) 6%,
    rgba(255, 255, 255, 0.05) 9%,
    transparent 20%,
    transparent 80%,
    rgba(255, 255, 255, 0.03) 91%,
    rgba(0, 0, 0, 0.7) 94%,
    rgba(0, 0, 0, 0.98) 100%
  );`;

if (css.includes(oldGradient)) {
  css = css.replace(oldGradient, newGradient);
} else {
  console.log("Could not find the exact old gradient in CSS, but proceeding...");
}

// Increase chromatic aberration slightly (0.35 to 0.5)
css = css.replace(
  '1.5px 0 1px rgba(255, 0, 0, 0.35), \n    -1.5px 0 1px rgba(0, 255, 255, 0.35) !important;',
  '2px 0 1px rgba(255, 0, 0, 0.5), \n    -2px 0 1px rgba(0, 255, 255, 0.5) !important;'
);

fs.writeFileSync('src/index.css', css);


// --- Fix Universe.tsx ---
let code = fs.readFileSync('src/components/Universe.tsx', 'utf8');

// Replace the span
code = code.replace(
  '<span className="bg-black/50 px-1 ">[ {project.title.replace(/^[0-9]+ /, \'\')} ]</span>',
  '<span className={`px-1 transition-colors ${hovered ? \'bg-[#c4ffff] text-black font-bold\' : \'bg-black/50\'}`}>[ {project.title.replace(/^[0-9]+ /, \'\')} ]</span>'
);

fs.writeFileSync('src/components/Universe.tsx', code);
console.log('Done modifying CSS and Universe.tsx');
