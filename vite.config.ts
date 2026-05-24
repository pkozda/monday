import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { mondayDbSnapshotPlugin } from './scripts/vite-db-snapshot-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), mondayDbSnapshotPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './assets'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    proxy: {
      '/api/translate': {
        target: 'https://api.mymemory.translated.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/translate/, '/get'),
      },
    },
  },
})
