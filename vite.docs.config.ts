import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@batype\/ui\/antd$/,
        replacement: fileURLToPath(new URL('./src/antd.tsx', import.meta.url)),
      },
      {
        find: /^@batype\/ui$/,
        replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
      {
        find: '@batype/ui/style.css',
        replacement: fileURLToPath(new URL('./src/styles.css', import.meta.url)),
      },
    ],
  },
  root: 'playground',
  base: process.env.BUI_DOCS_BASE || './',
  server: { host: '127.0.0.1', port: 5192, strictPort: true },
  build: { outDir: '../site', emptyOutDir: true },
})
