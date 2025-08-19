import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    global: 'globalThis',
    __IS_DEV__: mode === 'development',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
  },
  preview: {
    port: 8887,
    host: '0.0.0.0',
  },
}));