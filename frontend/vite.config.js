import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Relative asset URLs work at GitHub Pages' /Nira/ project path.
  base: './',
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: {
        home: fileURLToPath(new URL('./index.html', import.meta.url)),
        consultation: fileURLToPath(new URL('./consultation.html', import.meta.url)),
      },
    },
  },
});
