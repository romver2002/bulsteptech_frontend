import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Отдельный конфиг для тестов, чтобы не тянуть base/404-плагин из vite.config.js.
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
})
