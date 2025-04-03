import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/student',
    name: 'student',
    component: () => import('../views/StudentView.vue'),
    meta: { requiresAuth: true, roles: ['student', 'teacher'] }
  },
  {
    path: '/teacher',
    name: 'teacher',
    component: () => import('../views/TeacherView.vue'),
    meta: { requiresAuth: true, roles: ['teacher'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
