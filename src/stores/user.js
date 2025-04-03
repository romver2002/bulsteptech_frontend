import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const role = ref(localStorage.getItem('userRole') || null)
  const username = ref(localStorage.getItem('username') || null)
  const isAuthenticated = computed(() => !!role.value)
  
  function login(inputUsername, password) {
    // Для MVP пароль не проверяется
    role.value = inputUsername === 'teacher' ? 'teacher' : 'student'
    username.value = inputUsername
    localStorage.setItem('userRole', role.value)
    localStorage.setItem('username', inputUsername)
  }
  
  function logout() {
    role.value = null
    username.value = null
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
  }
  
  const isTeacher = computed(() => role.value === 'teacher')
  const isStudent = computed(() => role.value === 'student')
  
  return {
    role,
    username,
    isAuthenticated,
    isTeacher,
    isStudent,
    login,
    logout
  }
})
