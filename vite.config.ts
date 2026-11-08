import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// base './' faz os caminhos funcionarem em https://<usuario>.github.io/<repositorio>/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2022',
    // Duas páginas: o jogo e a página "Sobre".
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        sobre: resolve(import.meta.dirname, 'sobre.html'),
      },
    },
  },
});
