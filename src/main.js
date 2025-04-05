import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import './assets/main.css'
import i18n from './i18n'

import { useUserStore } from './stores/user'
import { useChannelStore } from './stores/channels'

const app = createApp(App)
const pinia = createPinia()

// Регистрируем плагины
app.use(pinia)
app.use(i18n)

// Используем роутер и монтируем приложение
app.use(router)
app.mount('#app')
