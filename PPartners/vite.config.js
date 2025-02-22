import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis', // Заменяем global на globalThis
  },
  server: {
    host: '0.0.0.0', // Слушать запросы на всех сетевых интерфейсах
    port: 5173,      // Порт для разработки (dev-сервер)
    open: true,      // Опционально: автоматически открыть приложение в браузере на хосте
    // https: {
    //   key: fs.readFileSync('./localhost+1-key.pem'), // Путь к приватному ключу
    //   cert: fs.readFileSync('./localhost+1.pem'),    // Путь к сертификату
    // },
  },
  preview: {
    port: 8887, // Порт для production-сборки
    host: '0.0.0.0', // Слушать запросы на всех сетевых интерфейсах
  },
});