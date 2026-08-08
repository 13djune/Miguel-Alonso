import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Subimos el límite de advertencia porque Three.js y GSAP son pesados por defecto
    chunkSizeWarningLimit: 2500,
  }
});
