import path from 'node:path'

import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { tanstackRouter } from '@tanstack/router-vite-plugin'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tanstackRouter(), react(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'react'
          }

          if (id.includes('@tanstack')) {
            return 'tanstack'
          }

          if (
            id.includes('@base-ui') ||
            id.includes('cmdk') ||
            id.includes('lucide-react') ||
            id.includes('sonner')
          ) {
            return 'ui'
          }

          return 'vendor'
        },
      },
    },
  },
  server: {
    https: {},
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
