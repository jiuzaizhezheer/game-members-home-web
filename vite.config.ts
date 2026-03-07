import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      // 统一使用 /api 前缀
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true,
        timeout: 60000,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
