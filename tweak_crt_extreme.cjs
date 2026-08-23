const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Buscamos dónde empieza nuestra inyección anterior
const oldBlockStart = css.indexOf('/* \n * 1. CAPA DE CURVATURA');
if (oldBlockStart !== -1) {
  css = css.substring(0, oldBlockStart);
} else {
  const fallbackStart = css.indexOf('body::before {');
  if (fallbackStart !== -1) {
    css = css.substring(0, css.lastIndexOf('/*', fallbackStart));
  }
}

css += `/* 
 * 1. CAPA DE CURVATURA EXTREMA (Volumen abombado masivo visible en toda la pantalla)
 * Simula el grosor de un tubo CRT pesado mediante reflejos y viñetas muy agresivas.
 */
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999998;
  pointer-events: none;
  
  /* Sombra interior bestial: hunde los bordes en total oscuridad simulando profundidad */
  box-shadow: 
    inset 0 0 180px 40px rgba(0, 0, 0, 0.95),
    inset 0 0 50px rgba(0, 0, 0, 1);
    
  /* Gradientes mapeados para esculpir una lente convexa de cristal */
  background: 
    /* 1. LUZ DIRECTA (Esfera central brillante): el centro sobresale y capta la luz ambiental */
    radial-gradient(circle at 50% 50%, 
      rgba(255, 255, 255, 0.12) 0%, 
      rgba(255, 255, 255, 0.03) 30%, 
      transparent 50%
    ),
    /* 2. CURVATURA RADIAL (Viñeta intensa en esquinas): Oscurece todo el borde de la lente */
    radial-gradient(ellipse 130% 130% at 50% 50%, 
      transparent 40%, 
      rgba(0, 0, 0, 0.6) 75%, 
      rgba(0, 0, 0, 0.98) 100%
    ),
    /* 3. REFLEJO VERTICAL (Cristal cilíndrico): Luces en los extremos superior/inferior */
    linear-gradient(to bottom,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(255, 255, 255, 0.1) 8%,
      transparent 25%,
      transparent 75%,
      rgba(255, 255, 255, 0.04) 92%,
      rgba(0, 0, 0, 0.9) 100%
    ),
    /* 4. REFLEJO HORIZONTAL: Caída de luz en los lados para cerrar el efecto globo */
    linear-gradient(to right,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(255, 255, 255, 0.05) 5%,
      transparent 20%,
      transparent 80%,
      rgba(255, 255, 255, 0.02) 95%,
      rgba(0, 0, 0, 0.8) 100%
    );
}

/* 
 * 2. CAPA DE TEXTURA CRT (Scanlines de alto contraste)
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
  
  /* Scanlines con mayor contraste de negro para simular los hilos de fósforo */
  background: linear-gradient(
    rgba(0, 0, 0, 0.35) 50%, 
    rgba(255, 255, 255, 0.02) 50%
  );
  background-size: 100% 4px;
  
  /* Animación parpadeo lento */
  animation: crt-scanlines 10s linear infinite;
}

/*
 * 3. ABERRACIÓN CROMÁTICA INTENSA
 */
body {
  position: relative;
  /* Fuerte separación de RGB (rojo a la izquierda, cyan a la derecha, verde ligero abajo) */
  text-shadow: 
    2px 0 2px rgba(255, 0, 0, 0.6), 
    -2px 0 2px rgba(0, 255, 255, 0.6),
    0 2px 2px rgba(0, 255, 0, 0.15) !important;
}

@keyframes crt-scanlines {
  0% { background-position: 0 0; }
  100% { background-position: 0 100vh; }
}
`;

fs.writeFileSync('src/index.css', css);
console.log('CRT extreme curvature applied');
