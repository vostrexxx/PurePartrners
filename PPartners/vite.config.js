import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis' // Заменяем global на globalThis
  },
  server: {
    host: '0.0.0.0', // Слушать запросы на всех сетевых интерфейсах
    port: 5173,      // Порт, который вы используете (можно заменить при необходимости)
    open: true,      // Опционально: автоматически открыть приложение в браузере на хосте
  },
});