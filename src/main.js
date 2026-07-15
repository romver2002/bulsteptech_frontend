import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import './style.css'
import i18n from './i18n'

const app = createApp(App)
const pinia = createPinia()

// Регистрируем плагины
app.use(pinia)
app.use(i18n)

// Используем роутер и монтируем приложение
app.use(router)
app.mount('#app')
