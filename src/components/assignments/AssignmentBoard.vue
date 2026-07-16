<template>
  <div class="assignments-container bg-discord-secondary p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-4">{{ isTeacher ? 'Управление заданиями' : 'Мои задания' }}</h3>
    
    <!-- Фильтры и поиск -->
    <div class="mb-4 flex flex-wrap gap-3">
      <div class="flex items-center bg-discord-primary rounded-md p-1">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          @click="activeFilter = filter.value"
          class="px-3 py-1 rounded-md text-sm transition-colors"
          :class="activeFilter === filter.value ? 'bg-discord-accent text-white' : 'text-discord-text-gray hover:text-white'"
        >
          {{ filter.label }}
        </button>
      </div>
      
      <div class="flex-grow">
        <input
          v-model="searchQuery"
          type="text"
          class="w-full px-3 py-2 bg-discord-primary border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-discord-accent"
          placeholder="Поиск заданий..."
        >
      </div>
    </div>
    
    <!-- Список заданий -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="assignment in filteredAssignments" 
        :key="assignment.id"
        class="assignment-card bg-discord-primary p-4 rounded-lg transition-all hover:shadow-lg"
      >
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-medium">{{ assignment.title }}</h4>
          <span 
            class="text-xs px-2 py-0.5 rounded-full" 
            :class="getStatusClass(assignment.status)"
          >
            {{ getStatusLabel(assignment.status) }}
          </span>
        </div>
        
        <p class="text-sm text-discord-text-gray mb-3">{{ assignment.description }}</p>
        
        <div class="flex justify-between text-xs text-discord-text-gray mb-3">
          <div>
            <span class="text-discord-text-light mr-1">Срок:</span>
            {{ formatDate(assignment.dueDate) }}
          </div>
          <div>
            <span class="text-discord-text-light mr-1">Сложность:</span>
            {{ assignment.difficulty }}
          </div>
        </div>
        
        <!-- Прогресс выполнения для заданий в работе -->
        <div v-if="assignment.status === 'in-progress' && assignment.progress" class="mb-3">
          <div class="w-full bg-discord-dark h-1.5 rounded-full">
            <div 
              class="h-1.5 rounded-full bg-discord-accent" 
              :style="`width: ${assignment.progress}%`"
            ></div>
          </div>
          <div class="text-xs text-discord-text-gray mt-1">{{ assignment.progress }}% завершено</div>
        </div>
        
        <!-- Теги -->
        <div class="flex flex-wrap gap-1 mb-3">
          <span 
            v-for="(tag, index) in assignment.tags" 
            :key="index"
            class="text-xs px-2 py-0.5 bg-discord-dark rounded-full"
          >
            {{ tag }}
          </span>
        </div>
        
        <!-- Кнопки действий -->
        <div class="flex justify-between">
          <button 
            @click="viewAssignment(assignment)"
            class="text-sm text-discord-accent hover:underline"
          >
            Подробнее
          </button>
          
          <button
            v-if="isTeacher"
            type="button"
            @click="handleTeacherAction(assignment)"
            class="text-sm px-2 py-1 rounded-md"
            :class="getTeacherActionClass(assignment.status)"
          >
            {{ getTeacherActionLabel(assignment.status) }}
          </button>

          <button
            v-else-if="assignment.status !== 'completed'"
            type="button"
            @click="toggleAssignmentStatus(assignment)"
            class="text-sm px-2 py-1 rounded-md"
            :class="getActionClass(assignment.status)"
          >
            {{ getActionLabel(assignment.status) }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Пустое состояние -->
    <div v-if="filteredAssignments.length === 0" class="text-center py-10 text-discord-text-gray">
      <div class="text-4xl mb-3">📝</div>
      <p>Нет заданий, соответствующих фильтру</p>
    </div>
    
    <!-- Модальное окно с подробностями задания -->
    <div
      v-if="selectedAssignment"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assignment-dialog-title"
      @click.self="selectedAssignment = null"
    >
      <div class="bg-discord-secondary rounded-lg max-w-2xl w-full">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <input
              v-if="isTeacher && isEditing"
              id="assignment-dialog-title"
              v-model.trim="selectedAssignment.title"
              class="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xl font-semibold text-white outline-none focus:border-indigo-400/50"
              aria-label="Название задания"
            >
            <h3 v-else id="assignment-dialog-title" class="text-xl font-semibold">{{ selectedAssignment.title }}</h3>
            <button type="button" aria-label="Закрыть задание" @click="selectedAssignment = null" class="text-discord-text-gray hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div class="mb-4">
            <span 
              class="text-xs px-2 py-0.5 rounded-full" 
              :class="getStatusClass(selectedAssignment.status)"
            >
              {{ getStatusLabel(selectedAssignment.status) }}
            </span>
            <div class="mt-2 flex gap-2">
              <span class="text-sm text-discord-text-gray">Срок: {{ formatDate(selectedAssignment.dueDate) }}</span>
              <span class="text-sm text-discord-text-gray">Сложность: {{ selectedAssignment.difficulty }}</span>
            </div>
          </div>
          
          <div class="mb-4">
            <h4 class="text-sm text-discord-text-gray mb-1">Описание:</h4>
            <textarea
              v-if="isTeacher && isEditing"
              v-model.trim="selectedAssignment.description"
              rows="4"
              class="w-full resize-y rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-discord-text-light outline-none focus:border-indigo-400/50"
              aria-label="Описание задания"
            ></textarea>
            <p v-else class="text-discord-text-light">{{ selectedAssignment.description }}</p>
          </div>
          
          <div class="mb-4">
            <h4 class="text-sm text-discord-text-gray mb-1">Задачи:</h4>
            <div class="space-y-2">
              <div 
                v-for="(task, index) in selectedAssignment.tasks" 
                :key="index"
                class="flex items-center"
              >
                <input 
                  type="checkbox" 
                  :id="`task-${index}`" 
                  v-model="task.completed"
                  :disabled="isTeacher"
                  class="mr-2"
                  @change="updateTaskStatus(index)"
                >
                <label :for="`task-${index}`" class="text-sm" :class="task.completed ? 'line-through text-discord-text-gray' : ''">
                  {{ task.text }}
                </label>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <h4 class="text-sm text-discord-text-gray mb-1">Материалы:</h4>
            <div class="space-y-2">
              <a 
                v-for="(resource, index) in selectedAssignment.resources" 
                :key="index"
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center p-2 bg-discord-dark rounded-md hover:bg-discord-dark-hover"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-discord-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span class="text-sm">{{ resource.title }}</span>
              </a>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button
              v-if="isTeacher && isEditing"
              type="button"
              @click="saveAssignmentEdits"
              class="px-4 py-2 rounded-md bg-discord-accent hover:bg-discord-accent-hover text-white"
            >
              Сохранить изменения
            </button>
            <button
              v-else-if="isTeacher"
              type="button"
              @click="handleTeacherAction(selectedAssignment)"
              class="px-4 py-2 rounded-md text-white"
              :class="getTeacherActionClass(selectedAssignment.status)"
            >
              {{ getTeacherActionLabel(selectedAssignment.status) }}
            </button>
            <button
              v-else-if="selectedAssignment.status !== 'completed'"
              type="button"
              @click="submitAssignment"
              class="px-4 py-2 bg-discord-accent rounded-md hover:bg-discord-accent-hover text-white"
            >
              {{ selectedAssignment.status === 'in-progress' ? 'Завершить задание' : 'Начать выполнение' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue';
import { useNotificationStore } from '../../stores/notification';

const props = defineProps({
  isTeacher: {
    type: Boolean,
    default: false
  }
});

const notificationStore = useNotificationStore();

const activeFilter = ref('all');
const searchQuery = ref('');
const selectedAssignment = ref(null);
const isEditing = ref(false);

// Фильтры
const filters = [
  { label: 'Все', value: 'all' },
  { label: 'К выполнению', value: 'to-do' },
  { label: 'В работе', value: 'in-progress' },
  { label: 'Завершённые', value: 'completed' }
];

// Пример данных заданий (в реальном приложении будет загружаться из API)
const assignments = ref([
  {
    id: 1,
    title: 'Создание компонента в Vue 3',
    description: 'Создайте переиспользуемый компонент кнопки с различными вариантами стилей.',
    status: 'to-do',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    difficulty: 'Лёгкое',
    tags: ['Vue 3', 'Компоненты'],
    tasks: [
      { text: 'Создать файл компонента', completed: false },
      { text: 'Реализовать props для различных вариантов', completed: false },
      { text: 'Добавить стили с использованием Tailwind', completed: false },
      { text: 'Написать документацию по использованию', completed: false }
    ],
    resources: [
      { title: 'Документация Vue 3', url: 'https://v3.vuejs.org/' },
      { title: 'Руководство по компонентам', url: 'https://v3.vuejs.org/guide/component-basics.html' }
    ]
  },
  {
    id: 2,
    title: 'Работа с Pinia Store',
    description: 'Создайте хранилище Pinia для управления состоянием задач в приложении.',
    status: 'in-progress',
    progress: 40,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    difficulty: 'Среднее',
    tags: ['Vue 3', 'Pinia', 'State Management'],
    tasks: [
      { text: 'Настроить Pinia в проекте', completed: true },
      { text: 'Создать хранилище задач', completed: true },
      { text: 'Реализовать CRUD операции', completed: false },
      { text: 'Добавить асинхронные действия', completed: false },
      { text: 'Протестировать работу хранилища', completed: false }
    ],
    resources: [
      { title: 'Официальная документация Pinia', url: 'https://pinia.vuejs.org/' },
      { title: 'Туториал по Pinia', url: 'https://pinia.vuejs.org/introduction.html' }
    ]
  },
  {
    id: 3,
    title: 'Вёрстка страницы профиля',
    description: 'Создайте адаптивную страницу профиля пользователя с использованием Tailwind CSS.',
    status: 'completed',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    difficulty: 'Лёгкое',
    tags: ['HTML', 'Tailwind CSS', 'Адаптивный дизайн'],
    tasks: [
      { text: 'Сверстать макет страницы', completed: true },
      { text: 'Реализовать адаптивность для мобильных устройств', completed: true },
      { text: 'Добавить анимации переходов', completed: true },
      { text: 'Протестировать на различных размерах экрана', completed: true }
    ],
    resources: [
      { title: 'Документация Tailwind CSS', url: 'https://tailwindcss.com/docs' }
    ]
  },
  {
    id: 4,
    title: 'Создание маршрутизации',
    description: 'Настройте маршрутизацию в приложении с защищенными маршрутами и редиректами.',
    status: 'to-do',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    difficulty: 'Среднее',
    tags: ['Vue Router', 'Авторизация'],
    tasks: [
      { text: 'Настроить базовые маршруты', completed: false },
      { text: 'Добавить защиту маршрутов', completed: false },
      { text: 'Реализовать редиректы для неавторизованных пользователей', completed: false },
      { text: 'Добавить анимации переходов между страницами', completed: false }
    ],
    resources: [
      { title: 'Документация Vue Router', url: 'https://router.vuejs.org/' },
      { title: 'Руководство по защите маршрутов', url: 'https://router.vuejs.org/guide/advanced/navigation-guards.html' }
    ]
  }
]);

// Фильтрация заданий
const filteredAssignments = computed(() => {
  let filtered = assignments.value;
  
  // Применяем фильтр по статусу
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(assignment => assignment.status === activeFilter.value);
  }
  
  // Применяем поиск
  if (searchQuery.value.trim()) {
    const search = searchQuery.value.toLowerCase();
    filtered = filtered.filter(assignment => 
      assignment.title.toLowerCase().includes(search) || 
      assignment.description.toLowerCase().includes(search) ||
      assignment.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }
  
  return filtered;
});

// Методы для работы с заданиями
const viewAssignment = (assignment) => {
  isEditing.value = false;
  selectedAssignment.value = JSON.parse(JSON.stringify(assignment));
};

const toggleAssignmentStatus = (assignment) => {
  if (props.isTeacher) return;
  const index = assignments.value.findIndex(a => a.id === assignment.id);
  
  if (index !== -1) {
    const currentAssignment = assignments.value[index];
    
    if (currentAssignment.status === 'to-do') {
      currentAssignment.status = 'in-progress';
      currentAssignment.progress = 0;
      notificationStore.success('Задание переведено в работу');
    } else if (currentAssignment.status === 'in-progress') {
      currentAssignment.status = 'completed';
      delete currentAssignment.progress;
      notificationStore.success('Задание выполнено!');
    } else if (currentAssignment.status === 'completed' && props.isTeacher) {
      currentAssignment.status = 'to-do';
      notificationStore.info('Задание возвращено к выполнению');
    }
  }
};

const updateTaskStatus = (taskIndex) => {
  if (!selectedAssignment.value || props.isTeacher) return;
  
  // Обновляем статус задачи
  const tasks = selectedAssignment.value.tasks;
  
  // Подсчитываем прогресс
  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = Math.round((completedTasks / tasks.length) * 100);
  
  // Обновляем прогресс в выбранном задании
  selectedAssignment.value.progress = progress;
  
  // Обновляем прогресс в оригинальном массиве
  const index = assignments.value.findIndex(a => a.id === selectedAssignment.value.id);
  if (index !== -1) {
    assignments.value[index].progress = progress;
    // Синхронизируем отметки задач с источником (иначе сбрасываются при повторном открытии)
    assignments.value[index].tasks = JSON.parse(JSON.stringify(tasks));

    // Если все задачи выполнены, предлагаем завершить задание
    if (progress === 100) {
      notificationStore.info('Все задачи выполнены. Вы можете завершить задание!');
    }
  }
};

const submitAssignment = () => {
  if (!selectedAssignment.value || props.isTeacher) return;
  
  const index = assignments.value.findIndex(a => a.id === selectedAssignment.value.id);
  
  if (index !== -1) {
    if (selectedAssignment.value.status === 'to-do') {
      // Начинаем выполнение
      assignments.value[index].status = 'in-progress';
      assignments.value[index].progress = 0;
      selectedAssignment.value.status = 'in-progress';
      selectedAssignment.value.progress = 0;
      notificationStore.success('Вы начали выполнение задания');
    } else if (selectedAssignment.value.status === 'in-progress') {
      // Завершаем задание
      assignments.value[index].status = 'completed';
      delete assignments.value[index].progress;
      selectedAssignment.value.status = 'completed';
      delete selectedAssignment.value.progress;
      notificationStore.success('Задание успешно завершено!');
    }
  }
};

const handleTeacherAction = (assignment) => {
  const index = assignments.value.findIndex(item => item.id === assignment.id);
  if (index === -1) return;

  const current = assignments.value[index];
  if (current.status === 'to-do') {
    selectedAssignment.value = JSON.parse(JSON.stringify(current));
    isEditing.value = true;
    return;
  }

  if (current.status === 'in-progress') {
    current.status = 'completed';
    delete current.progress;
    notificationStore.success('Работа принята');
  } else {
    current.status = 'in-progress';
    current.progress = 100;
    notificationStore.info('Работа возвращена на доработку');
  }

  if (selectedAssignment.value?.id === current.id) {
    isEditing.value = false;
    selectedAssignment.value = JSON.parse(JSON.stringify(current));
  }
};

const saveAssignmentEdits = () => {
  if (!selectedAssignment.value?.title.trim()) {
    notificationStore.warning('Добавьте название задания');
    return;
  }

  const index = assignments.value.findIndex(item => item.id === selectedAssignment.value.id);
  if (index === -1) return;
  assignments.value[index] = JSON.parse(JSON.stringify(selectedAssignment.value));
  isEditing.value = false;
  notificationStore.success('Изменения задания сохранены');
};

const getTeacherActionLabel = (status) => {
  if (status === 'to-do') return 'Редактировать';
  if (status === 'in-progress') return 'Принять работу';
  return 'Вернуть на доработку';
};

const getTeacherActionClass = (status) => {
  if (status === 'to-do') return 'bg-discord-accent hover:bg-discord-accent-hover';
  if (status === 'in-progress') return 'bg-discord-success hover:bg-discord-success/90';
  return 'bg-discord-warning hover:bg-discord-warning/90';
};

const handleEscape = (event) => {
  if (event.key === 'Escape') selectedAssignment.value = null;
};

onMounted(() => document.addEventListener('keydown', handleEscape));
onBeforeUnmount(() => document.removeEventListener('keydown', handleEscape));

// Вспомогательные методы для отображения
const getStatusLabel = (status) => {
  switch (status) {
    case 'to-do': return 'К выполнению';
    case 'in-progress': return 'В работе';
    case 'completed': return 'Завершено';
    default: return 'Неизвестно';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'to-do': return 'bg-discord-primary text-discord-text-gray';
    case 'in-progress': return 'bg-discord-accent text-white';
    case 'completed': return 'bg-discord-success text-white';
    default: return 'bg-discord-dark text-discord-text-gray';
  }
};

const getActionLabel = (status) => {
  switch (status) {
    case 'to-do': return 'Начать';
    case 'in-progress': return 'Завершить';
    case 'completed': return props.isTeacher ? 'Сбросить' : 'Завершено';
    default: return 'Действие';
  }
};

const getActionClass = (status) => {
  switch (status) {
    case 'to-do': return 'bg-discord-accent hover:bg-discord-accent-hover text-white';
    case 'in-progress': return 'bg-discord-success hover:bg-discord-success/90 text-white';
    case 'completed': return props.isTeacher ? 'bg-discord-warning hover:bg-discord-warning/90 text-white' : 'bg-discord-dark text-discord-text-gray';
    default: return 'bg-discord-dark text-discord-text-gray';
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.assignment-card {
  transition: all 0.3s ease;
}

.assignment-card:hover {
  transform: translateY(-3px);
}
</style>
