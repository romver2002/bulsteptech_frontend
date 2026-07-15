import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const persistedRole = localStorage.getItem('userRole')
  const persistedUsername = localStorage.getItem('username')
  const role = ref(['student', 'teacher'].includes(persistedRole) ? persistedRole : null)
  const username = ref(persistedUsername?.trim() || null)
  const id = ref(Number(localStorage.getItem('userId')) || null)
  const isAuthenticated = computed(() => Boolean(role.value && username.value))
  
  function login(inputUsername, selectedRole = 'student') {
    const normalizedUsername = String(inputUsername || '').trim()
    const normalizedRole = selectedRole === 'teacher' ? 'teacher' : 'student'

    if (!normalizedUsername) {
      throw new Error('Введите имя пользователя')
    }

    role.value = normalizedRole
    username.value = normalizedUsername
    id.value = normalizedRole === 'teacher' ? 1 : 2
    localStorage.setItem('userRole', role.value)
    localStorage.setItem('username', username.value)
    localStorage.setItem('userId', String(id.value))

    return { id: id.value, role: role.value, username: username.value }
  }
  
  function logout() {
    role.value = null
    username.value = null
    id.value = null
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
  }
  
  const isTeacher = computed(() => role.value === 'teacher')
  const isStudent = computed(() => role.value === 'student')
  
  return {
    role,
    username,
    id,
    isAuthenticated,
    isTeacher,
    isStudent,
    login,
    logout
  }
})
