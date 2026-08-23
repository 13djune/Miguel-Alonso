const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Replace the previous CRT block with a top-to-bottom curved one
const oldBlockStart = css.indexOf('/* \n * 1. CAPA DE CURVATURA Y VOLUMEN');
if (oldBlockStart !== -1) {
  css = css.substring(0, oldBlockStart);
}

css += `/* 
 * 1. CAPA DE CURVATURA CILÍNDRICA (De arriba a abajo)
 * Simula la geometría del tubo de cristal CRT curvado verticalmente (estilo Trinitron).
 */
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999998;
  pointer-events: none; /* Permite clicks debajo */
  
  /* Sombra interior profunda arriba y abajo para simular el abombado vertical */
  box-shadow: 
    inset 0 80px 100px -30px rgba(0, 0, 0, 0.95),
    inset 0 -80px 100px -30px rgba(0, 0, 0, 0.95),
    inset 0 0 20px rgba(0, 0, 0, 0.5);
    
  /* Gradiente lineal para el brillo y curvatura del cristal */
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(255, 255, 255, 0.03) 8%,
    transparent 25%,
    transparent 75%,
    rgba(255, 255, 255, 0.02) 92%,
    rgba(0, 0, 0, 0.5) 100%
  );
}

/* 
 * 2. CAPA DE TEXTURA CRT (Scanlines + Reflejo de cristal)
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
  
  /* Líneas de escaneo horizontales (Scanlines) */
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.15) 50%
  );
  background-size: 100% 4px;
  
  /* Reflejo blanco sutil en la parte superior del cristal */
  box-shadow: inset 0 15px 40px rgba(255, 255, 255, 0.04);
  
  /* Animación */
  animation: crt-scanlines 12s linear infinite;
}

/*
 * 3. ABERRACIÓN CROMÁTICA
 */
body {
  position: relative;
  text-shadow: 
    1.5px 0 1px rgba(255, 0, 0, 0.4), 
    -1.5px 0 1px rgba(0, 255, 255, 0.4) !important;
}

@keyframes crt-scanlines {
  0% { background-position: 0 0; }
  100% { background-position: 0 100vh; }
}
`;

fs.writeFileSync('src/index.css', css);
console.log('CRT updated for top-to-bottom curvature');
