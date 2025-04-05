<template>
  <AppLayout>
    <div class="p-4">
      <div v-if="currentChannel && currentChannel.id === 'microlearning'">
        <h2 class="text-xl font-bold mb-4"># {{ currentChannel.name }}</h2>
        
        <div class="bg-discord-secondary p-4 rounded-lg">
          <!-- Заголовок и описание -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-2">Микрообучение</h3>
            <p class="text-discord-text-gray">Изучайте материал небольшими порциями и проверяйте знания с помощью интерактивных квизов.</p>
          </div>
          
          <!-- Вкладки -->
          <div class="tabs-header flex border-b border-gray-700 mb-4">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-4 py-2 font-medium transition-colors mr-2"
              :class="activeTab === tab.id ? 'text-discord-accent border-b-2 border-discord-accent -mb-[2px]' : 'text-discord-text-gray hover:text-white'"
            >
              {{ tab.name }}
            </button>
          </div>
          
          <!-- Содержимое вкладок -->
          <div class="tab-content">
            <!-- Вкладка "Доступные модули" -->
            <div v-if="activeTab === 'modules'" class="modules-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="module in availableModules" 
                :key="module.id"
                class="module-card bg-discord-primary p-4 rounded-lg hover:shadow-lg transition-all cursor-pointer"
                @click="startModule(module)"
              >
                <div class="module-icon text-3xl mb-2">{{ module.icon }}</div>
                <h4 class="font-semibold mb-1">{{ module.title }}</h4>
                <p class="text-sm text-discord-text-gray mb-2">{{ module.description }}</p>
                <div class="flex items-center text-xs text-discord-text-gray">
                  <span class="mr-3">{{ module.lessons.length }} уроков</span>
                  <span>{{ module.estimatedTime }} мин.</span>
                </div>
                
                <!-- Прогресс -->
                <div v-if="module.progress" class="mt-2">
                  <div class="w-full bg-discord-dark h-1.5 rounded-full">
                    <div 
                      class="h-1.5 rounded-full bg-discord-accent" 
                      :style="`width: ${module.progress}%`"
                    ></div>
                  </div>
                  <div class="text-xs text-discord-text-gray mt-1">{{ module.progress }}% завершено</div>
                </div>
              </div>
            </div>
            
            <!-- Вкладка "В процессе" -->
            <div v-else-if="activeTab === 'in-progress'" class="in-progress">
              <div v-if="inProgressModules.length === 0" class="text-center py-10 text-discord-text-gray">
                <div class="text-4xl mb-3">📚</div>
                <p>У вас пока нет начатых модулей</p>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="module in inProgressModules" 
                  :key="module.id"
                  class="module-item bg-discord-primary p-4 rounded-lg flex items-center"
                >
                  <div class="module-icon text-2xl mr-4">{{ module.icon }}</div>
                  <div class="flex-grow">
                    <h4 class="font-semibold mb-1">{{ module.title }}</h4>
                    <div class="w-full bg-discord-dark h-1.5 rounded-full">
                      <div 
                        class="h-1.5 rounded-full bg-discord-accent" 
                        :style="`width: ${module.progress}%`"
                      ></div>
                    </div>
                    <div class="text-xs text-discord-text-gray mt-1">{{ module.progress }}% завершено</div>
                  </div>
                  <button 
                    @click="continueModule(module)"
                    class="ml-4 px-3 py-1.5 bg-discord-accent rounded-md hover:bg-discord-accent-hover text-sm"
                  >
                    Продолжить
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Вкладка "Завершенные" -->
            <div v-else-if="activeTab === 'completed'" class="completed-modules">
              <div v-if="completedModules.length === 0" class="text-center py-10 text-discord-text-gray">
                <div class="text-4xl mb-3">🏆</div>
                <p>Вы пока не завершили ни одного модуля</p>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="module in completedModules" 
                  :key="module.id"
                  class="module-item bg-discord-primary p-4 rounded-lg flex items-center"
                >
                  <div class="module-icon text-2xl mr-4">{{ module.icon }}</div>
                  <div class="flex-grow">
                    <h4 class="font-semibold mb-1">{{ module.title }}</h4>
                    <div class="flex items-center">
                      <span class="text-discord-success text-sm mr-2">Завершено</span>
                      <span class="text-xs text-discord-text-gray">{{ formatDate(module.completedAt) }}</span>
                    </div>
                  </div>
                  <button 
                    @click="reviewModule(module)"
                    class="ml-4 px-3 py-1.5 bg-discord-dark rounded-md hover:bg-discord-dark-hover text-sm"
                  >
                    Повторить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Модальное окно для прохождения квиза -->
        <div v-if="selectedQuiz" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div class="bg-discord-secondary rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-4">
              <InteractiveQuiz 
                :quiz="selectedQuiz" 
                @complete="completeQuiz"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import AppLayout from '../components/layout/AppLayout.vue';
import InteractiveQuiz from '../components/learning/InteractiveQuiz.vue';
import { useChannelStore } from '../stores/channels';
import { useUserStore } from '../stores/user';
import { useNotificationStore } from '../stores/notification';

const channelStore = useChannelStore();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const activeTab = ref('modules');
const selectedQuiz = ref(null);

const currentChannel = computed(() => channelStore.currentChannel);

// Вкладки
const tabs = [
  { id: 'modules', name: 'Доступные модули' },
  { id: 'in-progress', name: 'В процессе' },
  { id: 'completed', name: 'Завершенные' }
];

// Пример данных для модулей (в реальном приложении будут загружаться из API)
const availableModules = ref([
  {
    id: 1,
    title: 'Основы Vue 3',
    description: 'Изучите основы работы с фреймворком Vue 3',
    icon: '⚡',
    lessons: [
      { id: 1, title: 'Введение в Vue 3', completed: true },
      { id: 2, title: 'Реактивность в Vue 3', completed: true },
      { id: 3, title: 'Composition API', completed: false }
    ],
    estimatedTime: 30,
    progress: 66
  },
  {
    id: 2,
    title: 'Работа с Pinia',
    description: 'Управление состоянием приложения с Pinia',
    icon: '🔄',
    lessons: [
      { id: 1, title: 'Введение в Pinia', completed: false },
      { id: 2, title: 'Создание хранилища', completed: false },
      { id: 3, title: 'Асинхронные действия', completed: false }
    ],
    estimatedTime: 25,
    progress: 0
  },
  {
    id: 3,
    title: 'Основы Tailwind CSS',
    description: 'Изучите основы стилизации с Tailwind CSS',
    icon: '🎨',
    lessons: [
      { id: 1, title: 'Введение в Tailwind', completed: true },
      { id: 2, title: 'Работа с сеткой', completed: false }
    ],
    estimatedTime: 20,
    progress: 50
  },
  {
    id: 4,
    title: 'Маршрутизация с Vue Router',
    description: 'Создание многостраничных приложений с Vue Router',
    icon: '🔀',
    lessons: [
      { id: 1, title: 'Настройка роутера', completed: false },
      { id: 2, title: 'Вложенные маршруты', completed: false },
      { id: 3, title: 'Защита маршрутов', completed: false }
    ],
    estimatedTime: 35,
    progress: 0
  }
]);

// Модули в процессе (фильтрация из доступных модулей)
const inProgressModules = computed(() => {
  return availableModules.value.filter(module => module.progress > 0 && module.progress < 100);
});

// Завершенные модули
const completedModules = ref([
  {
    id: 101,
    title: 'Введение в веб-разработку',
    icon: '🌐',
    completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 дней назад
  }
]);

// Примеры квизов
const quizzes = {
  'vue': {
    id: 'vue',
    title: 'Квиз по основам Vue 3',
    questions: [
      {
        question: 'Какой метод жизненного цикла вызывается после создания компонента Vue?',
        options: ['mounted', 'created', 'beforeCreate', 'updated'],
        correctAnswer: 0,
        explanation: 'Метод mounted вызывается после того, как компонент был вставлен в DOM.'
      },
      {
        question: 'Какую директиву следует использовать для условного рендеринга?',
        options: ['v-if', 'v-for', 'v-show', 'v-bind'],
        correctAnswer: 0,
        explanation: 'v-if используется для условного рендеринга блока, который будет отрисован только если выражение вернет truthy значение.'
      },
      {
        question: 'Как создать реактивную переменную в Composition API?',
        options: ['const count = ref(0)', 'const count = reactive(0)', 'const count = 0', 'const count = computed(0)'],
        correctAnswer: 0,
        explanation: 'Функция ref создает реактивную ссылку на переданное значение, возвращая реактивный и изменяемый объект.'
      }
    ]
  },
  'pinia': {
    id: 'pinia',
    title: 'Квиз по Pinia',
    questions: [
      {
        question: 'Что такое Pinia?',
        options: [
          'Библиотека для управления состоянием Vue-приложений', 
          'Фреймворк для создания UI-компонентов', 
          'Инструмент для тестирования Vue-приложений', 
          'Пакет для работы с анимациями'
        ],
        correctAnswer: 0
      },
      {
        question: 'Какой метод используется для определения хранилища в Pinia?',
        options: ['defineStore', 'createStore', 'useStore', 'makeStore'],
        correctAnswer: 0
      }
    ]
  }
};

// Методы
const startModule = (module) => {
  // В реальном приложении здесь будет логика начала модуля
  // Для демонстрации покажем квиз
  if (module.id === 1) {
    selectedQuiz.value = quizzes['vue'];
  } else if (module.id === 2) {
    selectedQuiz.value = quizzes['pinia'];
  } else {
    notificationStore.info('Этот модуль пока недоступен для прохождения');
  }
};

const continueModule = (module) => {
  // Продолжить модуль
  startModule(module);
};

const reviewModule = (module) => {
  // Повторить модуль
  notificationStore.info(`Модуль "${module.title}" доступен для повторения`);
};

const completeQuiz = (result) => {
  notificationStore.success(`Вы завершили квиз с результатом ${result.score} из ${result.total}!`);
  selectedQuiz.value = null;
  
  // В реальном приложении здесь будет обновление прогресса и статистики
};

// Форматирование даты
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.module-card {
  transition: all 0.3s ease;
}

.module-card:hover {
  transform: translateY(-5px);
}
</style>
