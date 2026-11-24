import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config – the React plugin enables JSX compilation & Fast Refresh
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
