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
 * 1. CAPA DE CURVATURA SUAVE (Difuminada y menos oscura)
 * Volumen abombado pero con transiciones mucho más suaves y viñeta transparente.
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
  
  /* Viñeta difuminada y transparente: difuminado gigante (250px) pero muy baja opacidad */
  box-shadow: 
    inset 0 0 250px rgba(0, 0, 0, 0.45),
    inset 0 0 70px rgba(0, 0, 0, 0.2);
    
  /* Gradientes muy suaves para esculpir el volumen curvo sin manchar de negro */
  background: 
    /* 1. LUZ DIRECTA: brillo central más difuminado */
    radial-gradient(circle at 50% 50%, 
      rgba(255, 255, 255, 0.05) 0%, 
      transparent 60%
    ),
    /* 2. CURVATURA RADIAL: viñeta muy transparente en bordes */
    radial-gradient(ellipse 130% 130% at 50% 50%, 
      transparent 50%, 
      rgba(0, 0, 0, 0.15) 80%, 
      rgba(0, 0, 0, 0.45) 100%
    ),
    /* 3. REFLEJO VERTICAL: luces de cristal superior e inferior rebajadas */
    linear-gradient(to bottom,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(255, 255, 255, 0.04) 6%,
      transparent 20%,
      transparent 80%,
      rgba(255, 255, 255, 0.02) 94%,
      rgba(0, 0, 0, 0.4) 100%
    );
}

/* 
 * 2. CAPA DE TEXTURA CRT (Scanlines restauradas al nivel sutil)
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
  
  /* Scanlines menos intensas (como en el paso anterior) */
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
  /* Separación de colores más fina y menos borrosa */
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
console.log('CRT soft curvature applied');
