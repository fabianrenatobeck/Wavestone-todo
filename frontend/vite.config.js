import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // --- NEU: PROXY KONFIGURATION ---
    proxy: {
      '/tasks': {
        target: 'http://localhost:8080', // Leitet an dein Backend weiter
        changeOrigin: true,
        secure: false,
      }
    },
    // --------------------------------
    watch: {
      usePolling: true
    }
  }
})