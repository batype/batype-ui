import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        editors: 'src/editors.ts',
        markdown: 'src/markdown.ts',
        antd: 'src/antd.tsx',
      },
      formats: ['es', 'cjs'],
      fileName: (f, name) => name + (f === 'es' ? '.js' : '.cjs'),
      cssFileName: 'style',
    },
    rollupOptions: {
      external: (id) =>
        /^(?:react(?:-dom)?(?:\/|$)|antd(?:\/|$)|@codemirror\/|@wangeditor\/|react-markdown$|remark-gfm$)/.test(
          id,
        ),
      output: { banner: "'use client';" },
    },
    sourcemap: false,
    target: 'es2020',
  },
})
