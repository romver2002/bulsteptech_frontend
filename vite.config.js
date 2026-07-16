import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, existsSync } from 'node:fs'

// Имя репозитория GitHub Pages -> базовый путь в проде.
// Локальная разработка (`vite dev`) работает от корня "/".
const REPO = 'bulsteptech_frontend'

// SPA-fallback для GitHub Pages: history-режим vue-router требует,
// чтобы прямой переход на /route возвращал index.html. Pages отдаёт
// 404.html для неизвестных путей — поэтому копируем в него index.html.
function spaFallback() {
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    closeBundle() {
      const index = 'dist/index.html'
      if (existsSync(index)) copyFileSync(index, 'dist/404.html')
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${REPO}/` : '/',
  plugins: [vue(), spaFallback()],
  server: {
    port: 3000,
  },
}))
