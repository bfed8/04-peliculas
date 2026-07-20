import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El cliente Vite (puerto 5173) reenvia las peticiones /api al backend Express (3001).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
