import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    // Library mode выносит CSS в отдельный файл и не импортирует его из JS —
    // без стилей компонент не работает, поэтому подключаем их сами.
    {
      name: 'import-css',
      renderChunk (code, chunk) {
        if (chunk.isEntry) return `import './style.css';\n${code}`
      }
    }
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style'
    },
    rollupOptions: {
      external: ['vue']
    }
  }
})
