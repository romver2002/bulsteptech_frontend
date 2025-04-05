import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/',
    redirect: to => {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) return { name: 'Login' }
      return userStore.role === 'teacher' ? { name: 'Teacher' } : { name: 'Student' }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/student',
    name: 'Student',
    component: () => import('../views/StudentView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['student']
    }
  },
  {
    path: '/teacher',
    name: 'Teacher',
    component: () => import('../views/TeacherView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['teacher']
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/teacher-dashboard',
    name: 'TeacherDashboard',
    component: () => import('../views/TeacherDashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['teacher']
    }
  },
  {
    path: '/microlearning',
    name: 'microlearning',
    component: () => import('../views/MicroLearningView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  // Редирект при отсутствии маршрута
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  },
  // Добавляю маршрут для ресурсов
  {
    path: '/resources', 
    name: 'resources',
    component: () => import('../components/resources/ResourcesView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Защита маршрутов - единая логика защиты
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth === false) {
    // Если страница не требует авторизации, пропускаем
    return next()
  }
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    // Если требуется авторизация, но пользователь не авторизован
    return next({ name: 'Login' })
  }
  
  // Если пользователь авторизован и пытается попасть на страницу логина
  if (to.name === 'Login' && userStore.isAuthenticated) {
    return next({ name: userStore.isTeacher ? 'Teacher' : 'Student' })
  }
  
  // Проверка прав доступа по роли
  if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
    return next({ name: userStore.isTeacher ? 'Teacher' : 'Student' })
  }
  
  next()
})

export default router
