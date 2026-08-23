const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Replace box-shadow and the previous linear-gradient with a single composite gradient that adds the dark edges without blur
const oldShadow = `  /* Sombra interior enfocada solo arriba y abajo para simular el abombamiento vertical */
  box-shadow: 
    inset 0 60px 80px -30px rgba(0, 0, 0, 0.9),
    inset 0 -60px 80px -30px rgba(0, 0, 0, 0.9);

  /* Gradiente lineal vertical para simular el brillo del cristal curvado */
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(255, 255, 255, 0.04) 5%,
    transparent 20%,
    transparent 80%,
    rgba(255, 255, 255, 0.02) 95%,
    rgba(0, 0, 0, 0.4) 100%
  );`;

const newGradient = `  /* REEMPLAZO DE BOX-SHADOW POR GRADIENTE PARA RENDIMIENTO EXTREMO (0 lag en repaints) */
  background: linear-gradient(
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

css = css.replace(oldShadow, newGradient);

// Optional: we can also ensure the scanlines are optimized
// Just write it back
fs.writeFileSync('src/index.css', css);
