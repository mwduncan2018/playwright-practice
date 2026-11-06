import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// For development without Docker: the app runs at http://localhost:3001, the address Keycloak
// accepts, and API and settings requests go to the FastAPI server on port 8001.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:8001',
      '/config.json': 'http://localhost:8001',
    },
  },
});
