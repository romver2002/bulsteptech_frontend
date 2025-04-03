import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Импортируем хранилище пользователя после инициализации Pinia
import { useUserStore } from './stores/user'

// Настраиваем router guard после инициализации Pinia
const userStore = useUserStore()

router.beforeEach((to, from, next) => {
  // Проверка авторизации
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'login' })
    return
  }
  
  // Если пользователь авторизован и пытается попасть на страницу логина
  if (to.name === 'login' && userStore.isAuthenticated) {
    next({ name: userStore.isTeacher ? 'teacher' : 'student' })
    return
  }
  
  // Проверка прав доступа по роли
  if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
    next({ name: userStore.isTeacher ? 'teacher' : 'student' })
    return
  }
  
  next()
})

app.use(router)
app.mount('#app')
