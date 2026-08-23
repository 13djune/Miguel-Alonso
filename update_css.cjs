const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Reduce tv-dot-overlay opacity
css = css.replace(
  /background-image: radial-gradient\(circle, rgba\(255, 255, 255, 0\.15\) 1px, transparent 1px\);/,
  'background-image: radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px);'
);

// Remove the old CRT layers at the bottom to inject the new ones cleanly
// Looking for the start of /* * 2. CAPA DE TEXTURA CRT
const cutIndex = css.indexOf('/*\n * 2. CAPA DE TEXTURA CRT');
if (cutIndex !== -1) {
  css = css.substring(0, cutIndex);
}
const cutIndex2 = css.indexOf('/*\n* 2. CAPA DE TEXTURA CRT');
if (cutIndex2 !== -1) {
  css = css.substring(0, cutIndex2);
}
// Clean any leftover body shadow
css = css.replace(/body\s*\{[^}]*text-shadow:[^}]*\}\s*/g, '');

const newCrtEffect = `
/*
 * 1. CAPA DE CURVATURA TRINITRON (Arriba a abajo)
 * Simula la geometría cilíndrica vertical de los monitores CRT clásicos Sony.
 */
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999998;
  pointer-events: none; /* REGLA DE ORO: No bloquea clicks */

  /* Sombra interior enfocada solo arriba y abajo para simular el abombamiento vertical */
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
  );
}

/*
 * 2. CAPA DE TEXTURA CRT (Scanlines + Reflejo sutil)
 */
body::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999;
  pointer-events: none;

  /* Scanlines menos agresivos */
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.12) 50%
  );
  background-size: 100% 4px;
  
  /* Animación parpadeo */
  animation: crt-scanlines 12s linear infinite;
}

/*
 * 3. ABERRACIÓN CROMÁTICA SUTIL
 */
body {
  position: relative;
  text-shadow: 
    1.5px 0 1px rgba(255, 0, 0, 0.35), 
    -1.5px 0 1px rgba(0, 255, 255, 0.35) !important;
}

@keyframes crt-scanlines {
  0% { background-position: 0 0; }
  100% { background-position: 0 100vh; }
}
`;

css += newCrtEffect;

fs.writeFileSync('src/index.css', css);
console.log('CSS updated successfully.');
