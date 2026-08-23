const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const oldGradient = `  background: linear-gradient(
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

const newGradient = `  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.2) 3%,
    rgba(255, 255, 255, 0.02) 5%,
    transparent 10%,
    transparent 90%,
    rgba(255, 255, 255, 0.01) 95%,
    rgba(0, 0, 0, 0.2) 97%,
    rgba(0, 0, 0, 0.7) 100%
  );`;

if (css.includes(oldGradient)) {
  css = css.replace(oldGradient, newGradient);
  fs.writeFileSync('src/index.css', css);
  console.log("Vignette updated");
} else {
  console.log("Old gradient not found, searching with regex...");
  const regex = /background:\s*linear-gradient\([\s\S]*?100%\s*\);/;
  css = css.replace(regex, newGradient);
  fs.writeFileSync('src/index.css', css);
  console.log("Vignette updated via regex");
}
