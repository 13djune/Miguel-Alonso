const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Buscamos dónde empieza nuestra inyección anterior
const oldBlockStart = css.indexOf('/* \n * 1. CAPA DE CURVATURA');
if (oldBlockStart !== -1) {
  css = css.substring(0, oldBlockStart);
} else {
  const fallbackStart = css.indexOf('body::before {');
  if (fallbackStart !== -1) {
    // Si no encuentra el comentario exacto, corta desde body::before y quita el comentario de arriba
    css = css.substring(0, css.lastIndexOf('/*', fallbackStart));
  }
}

css += `/* 
 * 1. CAPA DE CURVATURA CILÍNDRICA (De arriba a abajo - Versión más abombada y luminosa)
 * Simula la geometría del tubo de cristal CRT curvado verticalmente.
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
  
  /* Sombra interior mucho más suave: reduce el negro en los bordes y crea una curva más amplia */
  box-shadow: 
    inset 0 40px 60px -20px rgba(0, 0, 0, 0.5),
    inset 0 -40px 60px -20px rgba(0, 0, 0, 0.5),
    inset 0 0 30px rgba(0, 0, 0, 0.25);
    
  /* Gradientes superpuestos para simular un cristal abombado (convexo) */
  background: 
    /* 1. Brillo central: simula que el centro del cristal sobresale hacia el usuario y capta luz */
    radial-gradient(ellipse 150% 120% at 50% 50%, 
      rgba(255, 255, 255, 0.04) 0%, 
      transparent 40%, 
      rgba(0, 0, 0, 0.1) 80%,
      rgba(0, 0, 0, 0.3) 100%
    ),
    /* 2. Reflejos cilíndricos superior e inferior (cristal doblado) */
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(255, 255, 255, 0.06) 6%,
      transparent 25%,
      transparent 75%,
      rgba(255, 255, 255, 0.03) 94%,
      rgba(0, 0, 0, 0.3) 100%
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
  
  /* Líneas de escaneo horizontales (Scanlines) - Ligeramente más suaves */
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.12) 50%
  );
  background-size: 100% 4px;
  
  /* Animación */
  animation: crt-scanlines 12s linear infinite;
}

/*
 * 3. ABERRACIÓN CROMÁTICA
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

fs.writeFileSync('src/index.css', css);
console.log('CRT updated for brighter, more bulging effect');
