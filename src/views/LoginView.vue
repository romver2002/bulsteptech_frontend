<template>
  <div class="login-page h-screen w-screen relative overflow-hidden flex items-center justify-center">
    <!-- Анимированный фон -->
    <div class="animated-bg absolute inset-0 z-0">
      <div class="circles">
        <div v-for="i in 10" :key="i" class="circle" :style="generateCircleStyle(i)"></div>
      </div>
    </div>
    
    <!-- Форма входа -->
    <div class="login-container bg-discord-secondary p-8 rounded-lg shadow-xl z-10 w-full max-w-md transform transition-all hover:scale-[1.02]">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-white">BulstepTech</h1>
        <p class="text-discord-text-gray">Образовательная платформа</p>
      </div>
      
      <div v-if="error" class="bg-discord-error/20 border border-discord-error text-white p-3 rounded mb-4">
        {{ error }}
      </div>
      
      <div class="mb-4">
        <label class="block text-discord-text-light mb-2 text-sm">Имя пользователя</label>
        <input 
          v-model="username" 
          type="text" 
          class="w-full px-3 py-2 bg-discord-dark rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-discord-accent focus:border-transparent"
          @keyup.enter="login"
          placeholder="Пожалуйста, введите имя пользователя"
        >
      </div>
      
      <div class="mb-6">
        <label class="block text-discord-text-light mb-2 text-sm">Роль</label>
        <div class="role-selector grid grid-cols-2 gap-3">
          <div
            @click="selectedRole = 'student'"
            class="role-option p-3 rounded-lg cursor-pointer transition-all border"
            :class="selectedRole === 'student' ? 'bg-discord-accent/20 border-discord-accent' : 'bg-discord-dark border-transparent hover:bg-discord-dark-hover'"
          >
            <div class="flex flex-col items-center">
              <span class="text-2xl mb-2">👨‍🎓</span>
              <span class="text-sm font-medium text-white">Студент</span>
            </div>
          </div>
          
          <div
            @click="selectedRole = 'teacher'"
            class="role-option p-3 rounded-lg cursor-pointer transition-all border"
            :class="selectedRole === 'teacher' ? 'bg-discord-accent/20 border-discord-accent' : 'bg-discord-dark border-transparent hover:bg-discord-dark-hover'"
          >
            <div class="flex flex-col items-center">
              <span class="text-2xl mb-2">👨‍🏫</span>
              <span class="text-sm font-medium text-white">Преподаватель</span>
            </div>
          </div>
        </div>
      </div>
      
      <animated-button 
        @click="login" 
        class="w-full"
        :loading="loading"
        variant="primary"
        size="lg"
      >
        Войти
      </animated-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useNotificationStore } from '../stores/notification';
import AnimatedButton from '../components/ui/AnimatedButton.vue';

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const username = ref('');
const selectedRole = ref('student');
const error = ref('');
const loading = ref(false);

// Функция генерации стиля для круга фона
const generateCircleStyle = (index) => {
  const size = Math.floor(Math.random() * 80) + 20; // 20-100px
  const posX = Math.floor(Math.random() * 100); // 0-100%
  const posY = Math.floor(Math.random() * 100); // 0-100%
  const animationDelay = Math.random() * 5; // 0-5s
  const opacity = (Math.random() * 0.6) + 0.1; // 0.1-0.7
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${posX}%`,
    top: `${posY}%`,
    animationDelay: `${animationDelay}s`,
    opacity: opacity,
    backgroundColor: index % 3 === 0 ? 'var(--color-discord-accent)' : 
                    index % 3 === 1 ? 'var(--color-discord-success)' : 
                    'var(--color-discord-warning)'
  };
};

const login = async () => {
  if (!username.value.trim()) {
    error.value = 'Пожалуйста, введите имя пользователя';
    return;
  }
  
  loading.value = true;
  
  try {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await userStore.login(username.value, selectedRole.value);
    
    notificationStore.success(`Добро пожаловать, ${username.value}!`, 'Успешный вход');
    
    // Редирект на соответствующую страницу
    if (selectedRole.value === 'teacher') {
      router.push('/teacher');
    } else {
      router.push('/student');
    }
  } catch (err) {
    error.value = err.message || 'Произошла ошибка при входе';
    notificationStore.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  background-color: var(--color-discord-primary);
}

.animated-bg {
  overflow: hidden;
}

.circles .circle {
  position: absolute;
  border-radius: 50%;
  animation: float 8s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.role-option {
  transition: all 0.3s ease;
}

.role-option:hover {
  transform: translateY(-2px);
}
</style>
