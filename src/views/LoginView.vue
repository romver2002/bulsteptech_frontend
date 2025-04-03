<template>
  <div class="min-h-screen bg-discord-primary flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-discord-secondary rounded-lg shadow-lg p-8">
      <h1 class="text-2xl font-bold text-center mb-6">БулСтепТех</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-discord-text-gray mb-1">
            Логин
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 bg-discord-primary border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-discord-accent"
            placeholder="Введите логин"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-discord-text-gray mb-1">
            Пароль
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 bg-discord-primary border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-discord-accent"
            placeholder="Введите пароль"
          />
        </div>
        
        <div v-if="error" class="text-discord-error text-sm">
          {{ error }}
        </div>
        
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-discord-accent hover:bg-opacity-90 focus:outline-none disabled:opacity-50"
        >
          <span v-if="isLoading">Вход...</span>
          <span v-else>Войти</span>
        </button>
      </form>
      
      <div class="mt-4 text-sm text-center text-discord-text-gray">
        <p>Для входа как преподаватель используйте логин: teacher</p>
        <p>Для входа как студент используйте любой другой логин</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Пожалуйста, заполните все поля'
    return
  }
  
  try {
    isLoading.value = true
    error.value = ''
    
    // Имитация задержки запроса
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    userStore.login(username.value, password.value)
    
    if (userStore.isTeacher) {
      router.push('/teacher')
    } else {
      router.push('/student')
    }
  } catch (e) {
    error.value = 'Произошла ошибка при входе'
  } finally {
    isLoading.value = false
  }
}
</script>
