import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useChannelStore } from '../stores/channels'

const homeRouteFor = (userStore) => (
  userStore.isTeacher ? { name: 'Teacher' } : { name: 'Student' }
)

const routes = [
  {
    path: '/',
    redirect: () => {
      const userStore = useUserStore()
      return userStore.isAuthenticated ? homeRouteFor(userStore) : { name: 'Login' }
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/student',
    name: 'Student',
    component: () => import('../views/StudentView.vue'),
    meta: { requiresAuth: true, roles: ['student'] }
  },
  {
    path: '/teacher',
    name: 'Teacher',
    component: () => import('../views/TeacherView.vue'),
    meta: { requiresAuth: true, roles: ['teacher'] }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher-dashboard',
    name: 'TeacherDashboard',
    redirect: { name: 'Teacher' },
    meta: { requiresAuth: true, roles: ['teacher'] }
  },
  {
    path: '/microlearning',
    name: 'MicroLearning',
    component: () => import('../views/MicroLearningView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/resources',
    name: 'Resources',
    redirect: () => {
      const userStore = useUserStore()
      if (!userStore.isAuthenticated) return { name: 'Login' }
      useChannelStore().setCurrentChannel('resources')
      return homeRouteFor(userStore)
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  const userStore = useUserStore()

  if (to.name === 'Login' && userStore.isAuthenticated) {
    return homeRouteFor(userStore)
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
    return homeRouteFor(userStore)
  }

  if (userStore.isAuthenticated) {
    useChannelStore().ensureAccessibleChannel(userStore.role)
  }

  return true
})

export default router
