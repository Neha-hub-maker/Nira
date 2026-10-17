import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs work at GitHub Pages' /Nira/ project path.
  base: './',
  plugins: [react()],
});
