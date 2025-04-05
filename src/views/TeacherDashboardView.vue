<template>
  <AppLayout>
    <div class="p-6 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Панель преподавателя</h1>
      
      <!-- Табы для навигации -->
      <div class="flex border-b border-gray-700 mb-6 overflow-x-auto">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2 font-medium text-sm whitespace-nowrap"
          :class="activeTab === tab.id ? 'border-b-2 border-discord-accent text-white' : 'text-discord-text-gray hover:text-white'"
        >
          {{ tab.name }}
        </button>
      </div>
      
      <!-- Аналитика -->
      <div v-if="activeTab === 'analytics'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-discord-secondary p-4 rounded-lg">
            <div class="text-discord-text-gray text-sm mb-1">Студентов всего</div>
            <div class="text-2xl font-bold">{{ analytics.totalStudents }}</div>
            <div class="text-xs text-discord-success mt-1">+{{ analytics.newStudents }} за неделю</div>
          </div>
          <div class="bg-discord-secondary p-4 rounded-lg">
            <div class="text-discord-text-gray text-sm mb-1">Средняя посещаемость</div>
            <div class="text-2xl font-bold">{{ analytics.avgAttendance }}%</div>
            <div class="text-xs text-discord-text-gray mt-1">За последние 30 дней</div>
          </div>
          <div class="bg-discord-secondary p-4 rounded-lg">
            <div class="text-discord-text-gray text-sm mb-1">Активность в чате</div>
            <div class="text-2xl font-bold">{{ analytics.messageCount }}</div>
            <div class="text-xs text-discord-success mt-1">+{{ analytics.messageGrowth }}% к прошлой неделе</div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div class="bg-discord-secondary p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4">Активность по курсам</h3>
            <div class="space-y-4">
              <div v-for="course in analytics.courseActivity" :key="course.id" class="flex items-center">
                <div class="w-1/3 text-sm">{{ course.name }}</div>
                <div class="w-2/3 flex items-center">
                  <div class="w-full bg-discord-dark rounded-full h-2.5 mr-2">
                    <div class="bg-discord-accent h-2.5 rounded-full" :style="`width: ${course.activity}%`"></div>
                  </div>
                  <span class="text-xs text-discord-text-gray">{{ course.activity }}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-discord-secondary p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4">Последняя активность</h3>
            <div class="space-y-3">
              <div v-for="(activity, index) in analytics.recentActivity" :key="index" class="flex items-start p-2 rounded hover:bg-discord-dark">
                <div class="w-8 h-8 rounded-full bg-discord-primary flex items-center justify-center text-sm mr-3">
                  {{ activity.user.substring(0, 2) }}
                </div>
                <div>
                  <p class="text-sm">
                    <span class="font-medium">{{ activity.user }}</span> 
                    <span class="text-discord-text-gray">{{ activity.action }}</span>
                  </p>
                  <p class="text-xs text-discord-text-gray">{{ formatDate(activity.time) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Курсы -->
      <div v-else-if="activeTab === 'courses'" class="space-y-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Мои курсы</h3>
          <button class="bg-discord-accent hover:bg-discord-accent-hover text-white px-3 py-1.5 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Создать курс
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="course in courses" :key="course.id" class="bg-discord-secondary rounded-lg overflow-hidden">
            <div class="h-40 bg-discord-dark flex items-center justify-center relative">
              <img v-if="course.image" :src="course.image" alt="Course image" class="w-full h-full object-cover">
              <div v-else class="text-5xl">📚</div>
              
              <div class="absolute top-2 right-2 bg-discord-secondary rounded-full p-1">
                <button class="text-discord-text-gray hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="p-4">
              <h4 class="font-semibold text-lg mb-1">{{ course.title }}</h4>
              <div class="flex justify-between items-center mb-3">
                <span class="text-discord-text-gray text-sm">{{ course.duration }}</span>
                <span class="text-xs bg-discord-dark px-2 py-0.5 rounded-full">{{ course.students }} студентов</span>
              </div>
              
              <div class="flex justify-between mt-4">
                <button class="bg-discord-dark hover:bg-discord-dark-hover text-white py-1.5 px-3 rounded text-sm">
                  Редактировать
                </button>
                <button class="bg-discord-accent hover:bg-discord-accent-hover text-white py-1.5 px-3 rounded text-sm">
                  Начать занятие
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Расписание -->
      <div v-else-if="activeTab === 'schedule'" class="space-y-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Расписание занятий</h3>
          <button 
            @click="showAddScheduleForm = !showAddScheduleForm" 
            class="px-3 py-1.5 rounded flex items-center"
            :class="showAddScheduleForm ? 'bg-discord-error' : 'bg-discord-accent'"
          >
            <svg v-if="!showAddScheduleForm" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {{ showAddScheduleForm ? 'Отмена' : 'Добавить занятие' }}
          </button>
        </div>
        
        <!-- Форма добавления занятия -->
        <div v-if="showAddScheduleForm" class="mb-6 p-4 bg-discord-primary rounded-lg">
          <h4 class="text-md font-semibold mb-4">Новое занятие</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm mb-1">Название</label>
              <input v-model="newScheduleItem.title" type="text" class="w-full px-3 py-2 bg-discord-secondary border border-gray-700 rounded">
            </div>
            <div>
              <label class="block text-sm mb-1">Курс</label>
              <select v-model="newScheduleItem.courseId" class="w-full px-3 py-2 bg-discord-secondary border border-gray-700 rounded">
                <option value="">Выберите курс</option>
                <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm mb-1">Дата</label>
              <input v-model="newScheduleItem.date" type="date" class="w-full px-3 py-2 bg-discord-secondary border border-gray-700 rounded">
            </div>
            <div>
              <label class="block text-sm mb-1">Время</label>
              <input v-model="newScheduleItem.time" type="time" class="w-full px-3 py-2 bg-discord-secondary border border-gray-700 rounded">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm mb-1">Описание</label>
              <textarea v-model="newScheduleItem.description" rows="3" class="w-full px-3 py-2 bg-discord-secondary border border-gray-700 rounded"></textarea>
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <button @click="addScheduleItem" class="px-4 py-2 bg-discord-success hover:bg-discord-success/90 rounded">
              Сохранить
            </button>
          </div>
        </div>
        
        <!-- Календарь (упрощенный) -->
        <div class="bg-discord-secondary rounded-lg p-4">
          <div class="grid grid-cols-7 gap-1">
            <div v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="day" class="text-center text-xs text-discord-text-gray py-2">
              {{ day }}
            </div>
            <div v-for="dayNum in calendarDays" :key="dayNum.date" 
                 class="aspect-square p-1 border border-discord-dark rounded"
                 :class="dayNum.isToday ? 'bg-discord-accent/10 border-discord-accent' : 'hover:bg-discord-dark'">
              <div class="h-full rounded flex flex-col">
                <div class="text-xs text-right p-1" :class="dayNum.isCurrentMonth ? 'text-white' : 'text-discord-text-gray'">
                  {{ dayNum.day }}
                </div>
                <div v-if="dayNum.hasEvents" class="flex-1 flex items-end justify-center pb-1">
                  <div class="w-1.5 h-1.5 bg-discord-accent rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Список занятий -->
        <div class="bg-discord-secondary rounded-lg overflow-hidden">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-gray-700">
                <th class="px-4 py-3">Дата</th>
                <th class="px-4 py-3">Время</th>
                <th class="px-4 py-3">Название</th>
                <th class="px-4 py-3">Курс</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in scheduleItems" :key="index" class="border-b border-gray-700">
                <td class="px-4 py-3">{{ formatDisplayDate(item.date) }}</td>
                <td class="px-4 py-3">{{ item.time }}</td>
                <td class="px-4 py-3">{{ item.title }}</td>
                <td class="px-4 py-3">
                  <span v-if="item.courseId" class="text-xs bg-discord-dark px-2 py-1 rounded">
                    {{ getCourseTitle(item.courseId) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2 justify-end">
                    <button @click="editScheduleItem(index)" class="text-discord-text-gray hover:text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="deleteScheduleItem(index)" class="text-discord-text-gray hover:text-discord-error">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="scheduleItems.length === 0">
                <td colspan="5" class="px-4 py-6 text-center text-discord-text-gray">
                  У вас пока нет запланированных занятий
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Тесты и задания -->
      <div v-else-if="activeTab === 'assignments'" class="space-y-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Тесты и задания</h3>
          <button class="bg-discord-accent hover:bg-discord-accent-hover text-white px-3 py-1.5 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Создать
          </button>
        </div>
        
        <div class="flex gap-2 mb-4">
          <button class="px-3 py-1.5 bg-discord-accent rounded">Все</button>
          <button class="px-3 py-1.5 hover:bg-discord-dark rounded">Активные</button>
          <button class="px-3 py-1.5 hover:bg-discord-dark rounded">На проверке</button>
          <button class="px-3 py-1.5 hover:bg-discord-dark rounded">Завершенные</button>
        </div>
        
        <div class="space-y-4">
          <div v-for="assignment in assignments" :key="assignment.id" class="bg-discord-secondary rounded-lg p-4">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold text-lg">{{ assignment.title }}</h4>
                <div class="flex items-center mt-1">
                  <span class="text-xs bg-discord-dark px-2 py-0.5 rounded mr-2">{{ assignment.course }}</span>
                  <span class="text-xs text-discord-text-gray">{{ formatDate(assignment.deadline) }}</span>
                </div>
              </div>
              <div>
                <span class="px-2 py-1 text-xs rounded font-medium" 
                      :class="getStatusClass(assignment.status)">
                  {{ assignment.status }}
                </span>
              </div>
            </div>
            
            <p class="text-discord-text-gray text-sm mt-3">{{ assignment.description }}</p>
            
            <div class="flex items-center justify-between mt-4">
              <div class="text-sm">
                <span class="text-discord-text-gray">Сдали:</span>
                <span class="ml-1">{{ assignment.submitted }} / {{ assignment.total }}</span>
              </div>
              <div class="flex gap-2">
                <button class="px-3 py-1.5 bg-discord-dark hover:bg-discord-dark-hover text-sm rounded">
                  Редактировать
                </button>
                <button class="px-3 py-1.5 bg-discord-accent hover:bg-discord-accent-hover text-sm rounded">
                  Проверить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AppLayout from '../components/layout/AppLayout.vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();

// Табы
const tabs = [
  { id: 'analytics', name: 'Аналитика' },
  { id: 'courses', name: 'Курсы' },
  { id: 'schedule', name: 'Расписание' },
  { id: 'assignments', name: 'Тесты и задания' }
];
const activeTab = ref('analytics');

// Расписание (импортируем из существующего TeacherView)
const showAddScheduleForm = ref(false);
const newScheduleItem = ref({
  title: '',
  date: '',
  time: '',
  description: '',
  courseId: ''
});
const scheduleItems = ref([]);

// Загрузка расписания из localStorage
onMounted(() => {
  const savedSchedule = localStorage.getItem('scheduleItems');
  if (savedSchedule) {
    scheduleItems.value = JSON.parse(savedSchedule);
  }
});

// Добавление занятия
const addScheduleItem = () => {
  if (!newScheduleItem.value.title || !newScheduleItem.value.date || !newScheduleItem.value.time) {
    alert('Пожалуйста, заполните все обязательные поля');
    return;
  }
  
  scheduleItems.value.push({...newScheduleItem.value});
  localStorage.setItem('scheduleItems', JSON.stringify(scheduleItems.value));
  
  // Сброс формы
  newScheduleItem.value = {
    title: '',
    date: '',
    time: '',
    description: '',
    courseId: ''
  };
  showAddScheduleForm.value = false;
};

// Редактирование и удаление занятия
const editScheduleItem = (index) => {
  // В реальном приложении здесь будет форма редактирования
  alert('Функционал редактирования будет доступен в следующей версии');
};

const deleteScheduleItem = (index) => {
  if (confirm('Вы уверены, что хотите удалить это занятие?')) {
    scheduleItems.value.splice(index, 1);
    localStorage.setItem('scheduleItems', JSON.stringify(scheduleItems.value));
  }
};

// Тестовые данные для аналитики
const analytics = {
  totalStudents: 47,
  newStudents: 5,
  avgAttendance: 78,
  messageCount: 1452,
  messageGrowth: 12,
  courseActivity: [
    { id: 1, name: 'Vue 3 Основы', activity: 85 },
    { id: 2, name: 'JavaScript Продвинутый', activity: 62 },
    { id: 3, name: 'Веб-разработка', activity: 94 },
    { id: 4, name: 'React Базовый', activity: 45 }
  ],
  recentActivity: [
    { user: 'Мария Сидорова', action: 'выполнила задание "Компоненты Vue"', time: new Date(Date.now() - 1800000) },
    { user: 'Алексей Иванов', action: 'присоединился к курсу "JavaScript Продвинутый"', time: new Date(Date.now() - 3600000) },
    { user: 'Дмитрий Кузнецов', action: 'задал вопрос в лекции "Введение в Vuex"', time: new Date(Date.now() - 7200000) },
    { user: 'Елена Петрова', action: 'сдала тест на 92%', time: new Date(Date.now() - 14400000) }
  ]
};

// Тестовые данные для курсов
const courses = [
  { 
    id: 1, 
    title: 'Vue 3 Основы', 
    duration: '8 недель', 
    students: 24, 
    image: 'https://via.placeholder.com/300x180?text=Vue+3' 
  },
  { 
    id: 2, 
    title: 'JavaScript Продвинутый', 
    duration: '10 недель', 
    students: 18, 
    image: 'https://via.placeholder.com/300x180?text=JavaScript' 
  },
  { 
    id: 3, 
    title: 'Веб-разработка', 
    duration: '12 недель', 
    students: 32, 
    image: 'https://via.placeholder.com/300x180?text=Web+Dev' 
  }
];

// Получение названия курса по ID
const getCourseTitle = (courseId) => {
  const course = courses.find(c => c.id === parseInt(courseId));
  return course ? course.title : 'Неизвестный курс';
};

// Тестовые данные для тестов и заданий
const assignments = [
  {
    id: 1,
    title: 'Финальный проект Vue 3',
    course: 'Vue 3 Основы',
    deadline: new Date('2025-04-15'),
    status: 'Активно',
    description: 'Создание SPA на Vue 3 с использованием Composition API и Vue Router',
    submitted: 8,
    total: 24
  },
  {
    id: 2,
    title: 'Тест по асинхронному JavaScript',
    course: 'JavaScript Продвинутый',
    deadline: new Date('2025-04-10'),
    status: 'На проверке',
    description: 'Промисы, async/await, обработка ошибок',
    submitted: 15,
    total: 18
  },
  {
    id: 3,
    title: 'Домашнее задание: Адаптивная вёрстка',
    course: 'Веб-разработка',
    deadline: new Date('2025-04-02'),
    status: 'Завершено',
    description: 'Создание адаптивного лендинга с использованием CSS Grid и Flexbox',
    submitted: 32,
    total: 32
  }
];

// Получение класса для статуса задания
const getStatusClass = (status) => {
  switch(status) {
    case 'Активно': return 'bg-discord-accent text-white';
    case 'На проверке': return 'bg-discord-warning text-white';
    case 'Завершено': return 'bg-discord-success text-white';
    default: return 'bg-discord-dark text-discord-text-gray';
  }
};

// Календарь (упрощенный)
const calendarDays = Array.from({ length: 35 }, (_, i) => {
  const day = i % 31 + 1;
  const isCurrentMonth = day <= 30;
  const isToday = day === new Date().getDate() && isCurrentMonth;
  const hasEvents = [5, 12, 18, 25].includes(day) && isCurrentMonth;
  
  return {
    day,
    date: `2025-04-${day.toString().padStart(2, '0')}`,
    isCurrentMonth,
    isToday,
    hasEvents
  };
});

// Вспомогательные функции
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatDisplayDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long'
  });
};
</script>

<style scoped>
.achievement-card {
  transition: all 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.progress-bar {
  transition: width 1s ease-in-out;
}
</style>
