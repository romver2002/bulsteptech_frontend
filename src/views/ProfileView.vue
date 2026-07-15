<template>
  <AppLayout>
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Личный кабинет</h1>
      
      <!-- Табы для навигации -->
      <div class="flex border-b border-gray-700 mb-6">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2 font-medium text-sm"
          :class="activeTab === tab.id ? 'border-b-2 border-discord-accent text-white' : 'text-discord-text-gray hover:text-white'"
        >
          {{ tab.name }}
        </button>
      </div>
      
      <!-- Спиннер загрузки -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-discord-accent"></div>
      </div>
      
      <!-- Сообщение об ошибке -->
      <div v-else-if="error" class="bg-discord-error/20 border border-discord-error rounded-md p-4 text-center">
        <p class="text-white">{{ error }}</p>
        <button @click="loadUserData" class="mt-3 px-4 py-2 bg-discord-error hover:bg-opacity-80 rounded-md text-white">
          Попробовать снова
        </button>
      </div>
      
      <!-- Профиль -->
      <div v-else-if="activeTab === 'profile'" class="space-y-6">
        <div class="flex items-start gap-6 flex-col md:flex-row">
          <div class="relative">
            <div class="w-24 h-24 bg-discord-accent rounded-full overflow-hidden flex items-center justify-center">
              <span v-if="!userData.avatarUrl" class="text-white text-3xl font-bold">{{ userInitials }}</span>
              <img v-else :src="userData.avatarUrl" alt="Аватар" class="w-full h-full object-cover">
            </div>
            <div :class="`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-discord-secondary ${statusColor}`"></div>
          </div>
          
          <div class="flex-1">
            <h2 class="text-xl font-bold">{{ userData.firstName || userStore.username }}</h2>
            <p class="text-discord-text-gray mb-2">@{{ userStore.username }}</p>
            <div class="flex items-center mb-2">
              <span class="bg-discord-accent text-xs px-2 py-1 rounded mr-2">{{ userStore.role }}</span>
              <span class="text-xs text-discord-text-gray">С нами с {{ formatDate(userData.registrationDate) }}</span>
            </div>
            <p class="text-discord-text-gray mt-2">
              <span v-if="userStore.isTeacher">Преподаватель курса по Vue js, фронтенд разработке и новым технологиям.</span>
              <span v-else>Студент курса по Vue js, интересуюсь фронтенд разработкой и новыми технологиями.</span>
            </p>
          </div>
        </div>
        
        <!-- Данные аккаунта -->
        <div class="bg-discord-secondary p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">Данные аккаунта</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-discord-text-gray mb-1">Email</p>
              <p>{{ userData.email || 'Не указан' }}</p>
            </div>
            <div>
              <p class="text-sm text-discord-text-gray mb-1">Роль</p>
              <p class="capitalize">{{ userStore.role }}</p>
            </div>
            <div>
              <p class="text-sm text-discord-text-gray mb-1">Статус</p>
              <p class="capitalize">{{ userData.status || 'онлайн' }}</p>
            </div>
            <div>
              <p class="text-sm text-discord-text-gray mb-1">Достижения</p>
              <p>{{ userAchievements.length || 0 }} / {{ achievements.length }}</p>
            </div>
          </div>
        </div>
        
        <!-- Блоки аналитики только для преподавателя -->
        <div v-if="userStore.isTeacher" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-discord-secondary p-4 rounded-lg shadow-md">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Аналитика</h3>
              <router-link 
                to="/" 
                @click.prevent="goToChannel('student-progress')"
                class="text-discord-accent hover:underline text-sm"
              >
                Подробнее →
              </router-link>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-discord-text-gray">Студентов</p>
                  <p class="text-lg font-semibold">24</p>
                </div>
                <div class="bg-discord-accent bg-opacity-10 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-discord-text-gray">Средняя успеваемость</p>
                  <p class="text-lg font-semibold">78%</p>
                </div>
                <div class="bg-discord-success bg-opacity-10 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-discord-secondary p-4 rounded-lg shadow-md">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">Посещаемость</h3>
              <router-link 
                to="/" 
                @click.prevent="goToChannel('attendance')"
                class="text-discord-accent hover:underline text-sm"
              >
                Подробнее →
              </router-link>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-discord-text-gray">Активных студентов</p>
                  <p class="text-lg font-semibold">22/24</p>
                </div>
                <div class="bg-discord-warning bg-opacity-10 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-discord-text-gray">Посещаемость последней лекции</p>
                  <p class="text-lg font-semibold">92%</p>
                </div>
                <div class="bg-discord-success bg-opacity-10 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Блок достижений для студента -->
        <div v-else class="bg-discord-secondary p-4 rounded-lg shadow-md">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Достижения</h3>
            <router-link 
              to="/" 
              @click.prevent="goToChannel('achievements')"
              class="text-discord-accent hover:underline text-sm"
            >
              Все достижения →
            </router-link>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div v-for="(achievement, index) in recentAchievements" :key="index" 
                class="achievement-card p-3 bg-discord-primary rounded-lg flex flex-col items-center text-center">
              <div class="achievement-icon w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-discord-accent">
                <span class="text-xl">{{ achievement.icon }}</span>
              </div>
              <h4 class="font-medium text-sm mb-1">{{ achievement.name }}</h4>
              <p class="text-xs text-discord-text-gray">{{ achievement.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Курсы -->
      <div v-else-if="activeTab === 'courses'" class="space-y-6">
        <h3 class="text-lg font-semibold mb-4">Мои курсы</h3>
        
        <div v-if="enrolledCourses.length === 0" class="bg-discord-secondary p-6 rounded-lg text-center">
          <div class="text-5xl mb-4">📚</div>
          <h4 class="text-xl font-semibold mb-2">У вас пока нет купленных курсов</h4>
          <p class="text-discord-text-gray mb-4">Просмотрите наш каталог курсов и выберите что-то интересное для себя</p>
          <button @click="goToChannel('resources')" class="bg-discord-accent hover:bg-discord-accent-hover text-white py-2 px-4 rounded-md">
            Перейти в каталог
          </button>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="course in enrolledCourses" :key="course.id" class="course-card bg-discord-secondary rounded-lg overflow-hidden">
            <div class="h-32 bg-discord-dark flex items-center justify-center">
              <img v-if="course.image" :src="course.image" :alt="course.title" loading="lazy" decoding="async" width="300" height="200" class="w-full h-full object-cover">
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-emerald-400/20 text-4xl">🎓</div>
            </div>
            <div class="p-4">
              <h4 class="font-semibold text-lg mb-1">{{ course.title }}</h4>
              <p class="text-discord-text-gray text-sm mb-3">{{ course.instructor }}</p>
              <div class="flex justify-between items-center">
                <div class="progress-bar w-3/4 h-2 bg-discord-dark rounded-full overflow-hidden">
                  <div class="h-full bg-discord-accent" :style="`width: ${course.progress}%`"></div>
                </div>
                <span class="text-xs text-discord-text-gray">{{ course.progress }}%</span>
              </div>
              <button @click="continueCourse(course)" class="mt-3 w-full bg-discord-dark hover:bg-discord-dark-hover text-white py-1.5 px-3 rounded text-sm">
                Продолжить
              </button>
            </div>
          </div>
        </div>
        
        <h3 class="text-lg font-semibold mb-4 mt-8">Корзина</h3>
        <div v-if="cartCourses.length === 0" class="bg-discord-secondary p-6 rounded-lg text-center">
          <div class="text-5xl mb-4">🛒</div>
          <h4 class="text-xl font-semibold mb-2">Ваша корзина пуста</h4>
          <p class="text-discord-text-gray mb-4">Добавьте курсы в корзину, чтобы приобрести их</p>
        </div>
        
        <div v-else class="bg-discord-secondary rounded-lg p-4">
          <div v-for="course in cartCourses" :key="course.id" class="flex justify-between items-center mb-3 pb-3 border-b border-discord-dark">
            <div>
              <h4 class="font-medium">{{ course.title }}</h4>
              <p class="text-sm text-discord-text-gray">{{ course.instructor }}</p>
            </div>
            <div class="flex items-center">
              <span class="font-semibold mr-4">{{ course.price }}₽</span>
              <button @click="removeFromCart(course.id)" class="text-discord-text-gray hover:text-discord-error" :aria-label="`Удалить ${course.title} из корзины`">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="flex justify-between items-center border-t border-discord-dark pt-4 mt-2">
            <div>
              <p class="text-sm text-discord-text-gray">Всего</p>
              <p class="font-semibold text-lg">{{ totalCartPrice }}₽</p>
            </div>
            <button @click="checkout" class="bg-discord-accent hover:bg-discord-accent-hover text-white py-2 px-4 rounded-md">
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
      
      <!-- Достижения -->
      <div v-else-if="activeTab === 'achievements'" class="space-y-6">
        <h3 class="text-lg font-semibold mb-4">Мои достижения</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="achievement in achievements" :key="achievement.id" 
               class="achievement-card bg-discord-secondary rounded-lg p-4 flex items-center"
               :class="{ 'opacity-40': !userAchievements.includes(achievement.id) }">
            <div class="achievement-icon w-12 h-12 rounded-full bg-discord-dark flex items-center justify-center text-2xl mr-3">
              {{ achievement.icon }}
            </div>
            <div>
              <h4 class="font-medium">{{ achievement.title }}</h4>
              <p class="text-sm text-discord-text-gray">{{ achievement.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppLayout from '../components/layout/AppLayout.vue';
import { useUserStore } from '../stores/user';
import { useNotificationStore } from '../stores/notification';
import { useChannelStore } from '../stores/channels';

const userStore = useUserStore();
const notificationStore = useNotificationStore();
const channelStore = useChannelStore();
const router = useRouter();

// Табы
const tabs = [
  { id: 'profile', name: 'Профиль' },
  { id: 'courses', name: 'Курсы' },
  { id: 'achievements', name: 'Достижения' }
];
const activeTab = ref('profile');
const isLoading = ref(true);
const error = ref(null);

// Метод для навигации к каналу
const goToChannel = (channelId) => {
  channelStore.setCurrentChannel(channelId);
  router.push({ name: userStore.isTeacher ? 'Teacher' : 'Student' });
};

// Тестовые данные для профиля
const userData = ref({
  firstName: '',
  lastName: '',
  email: '',
  registrationDate: new Date(),
  bio: '',
  status: 'online',
  achievements: []
});

// Тестовые курсы
const enrolledCourses = ref([
  { 
    id: 1, 
    title: 'Основы Vue.js',
    instructor: 'Иван Петров', 
    image: null,
    progress: 75
  },
  { 
    id: 2, 
    title: 'Продвинутый Vue.js',
    instructor: 'Иван Петров',
    image: null,
    progress: 40
  }
]);

const cartCourses = ref([
  {
    id: 3,
    title: 'TypeScript для Vue разработчиков',
    instructor: 'Сергей Сидоров',
    price: 2990
  }
]);

// Достижения
const achievements = ref([
  {
    id: 1,
    title: 'Первые шаги',
    description: 'Завершите первый урок',
    icon: '🚀'
  },
  {
    id: 2,
    title: 'Эксперт по CSS',
    description: 'Завершите все уроки по CSS',
    icon: '🎨'
  },
  {
    id: 3,
    title: 'Мастер Vue',
    description: 'Создайте 3 компонента Vue',
    icon: '⚡'
  },
  { 
    id: 4, 
    title: 'Помощник',
    description: 'Ответьте на 10 вопросов других студентов',
    icon: '👋'
  },
  { 
    id: 5, 
    title: 'Ежедневное обучение',
    description: 'Заходите в приложение 7 дней подряд',
    icon: '🔥'
  },
  {
    id: 6,
    title: 'Первая трансляция',
    description: 'Примите участие в прямой трансляции',
    icon: '📺'
  }
]);

// Недавние достижения (показываются на главной странице профиля)
const recentAchievements = ref([
  {
    name: 'Мастер Vue',
    description: 'Создайте 3 компонента Vue',
    icon: '⚡'
  },
  {
    name: 'Первая трансляция',
    description: 'Примите участие в прямой трансляции',
    icon: '📺'
  },
  {
    name: 'Первые шаги',
    description: 'Завершите первый урок',
    icon: '🚀'
  }
]);

// Полученные достижения пользователя
const userAchievements = ref([1, 3, 6]);

// Computed properties
const userInitials = computed(() => {
  const username = userStore.username || '';
  return username.substring(0, 2).toUpperCase();
});

const totalCartPrice = computed(() => {
  return cartCourses.value.reduce((total, course) => total + course.price, 0);
});

const statusColor = computed(() => {
  const status = userData.value.status;
  if (status === 'online') return 'bg-discord-success';
  if (status === 'idle') return 'bg-discord-warning';
  if (status === 'dnd') return 'bg-discord-error';
  return 'bg-discord-text-gray';
});

const continueCourse = (course) => {
  channelStore.setCurrentChannel('lecture');
  notificationStore.info(`Продолжаем «${course.title}» с отметки ${course.progress}%`, 'Курс открыт');
  router.push({ name: userStore.isTeacher ? 'Teacher' : 'Student' });
};

const removeFromCart = (courseId) => {
  const course = cartCourses.value.find(item => item.id === courseId);
  cartCourses.value = cartCourses.value.filter(item => item.id !== courseId);
  if (course) notificationStore.info(`«${course.title}» удалён из корзины`);
};

const checkout = () => {
  if (!cartCourses.value.length) return;
  const purchased = cartCourses.value.map(course => ({ ...course, progress: 0, image: null }));
  enrolledCourses.value.push(...purchased);
  cartCourses.value = [];
  notificationStore.success('Курсы добавлены в ваш профиль', 'Заказ оформлен');
};

// Methods
const loadUserData = () => {
  isLoading.value = true;
  error.value = null;
  
  // В реальном приложении здесь был бы API-запрос
  setTimeout(() => {
    isLoading.value = false;
    userData.value = {
      firstName: 'Петр',
      lastName: 'Иванов',
      email: 'peter@example.com',
      registrationDate: new Date(2023, 0, 15),
      bio: 'Студент курса по Vue.js, интересуюсь фронтенд разработкой и новыми технологиями.',
      status: 'online',
      achievements: [1, 3, 6]
    };
  }, 260);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
};

onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.achievement-card {
  transition: all 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-5px);
}

.achievement-icon {
  transition: all 0.3s ease;
}

.achievement-card:hover .achievement-icon {
  transform: scale(1.1);
}

.course-card {
  transition: all 0.3s ease;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style>
