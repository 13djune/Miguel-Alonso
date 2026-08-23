const fs = require('fs');

// 1. Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace("import CurvatureEffect from './components/CurvatureEffect';\n", '');
app = app.replace("        <CurvatureEffect curvature={0.12} />\n", '');
fs.writeFileSync('src/App.tsx', app);

// 2. Remove old scanlines class from index.css (optional, but it might conflict if they both add scanlines. The user provided a CRT effect.)
// Actually the user provided new css, let's just append it.

// 3. Append to index.css
let css = fs.readFileSync('src/index.css', 'utf8');

// I will just append the new CSS exactly as the user provided it (without the <style> tags)
css += `
/* 
 * 1. CAPA DE CURVATURA Y VOLUMEN (Vignette + Radial Glow)
 * Simula la geometria del tubo de cristal CRT abombado.
 */
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999998;
  pointer-events: none; /* REGLA DE ORO: Permite todos los clicks, scroll e inputs debajo */
  
  /* Sombra interior profunda para curvar las esquinas visualmente */
  box-shadow: 
    inset 0 0 120px rgba(0, 0, 0, 0.95),
    inset 0 0 40px rgba(0, 0, 0, 0.6);
    
  /* Gradiente radial para simular que el centro esta mas cerca de la pantalla (Barrel effect) */
  background: radial-gradient(
    circle at center, 
    transparent 50%, 
    rgba(0, 0, 0, 0.35) 100%
  );
}

/* 
 * 2. CAPA DE TEXTURA CRT (Scanlines + Reflejo de cristal)
 * Anade el parpadeo y la textura fisica del monitor.
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
  
  /* Lineas de escaneo horizontales (Scanlines) */
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.15) 50%
  );
  background-size: 100% 4px; /* Grosor de la linea */
  
  /* Reflejo blanco sutil en la parte superior del cristal curvo */
  box-shadow: inset 0 15px 40px rgba(255, 255, 255, 0.04);
  
  /* Animacion para el movimiento de las lineas */
  animation: crt-scanlines 12s linear infinite;
}

/*
 * 3. ABERRACION CROMATICA (Opcional pero recomendado)
 * Aplica un desfase RGB a todo el contenido del body sin alterar su caja (box-model).
 */
body {
  position: relative; /* Asegura que los pseudoelementos cubran correctamente */
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

console.log('App.tsx and index.css updated!');
