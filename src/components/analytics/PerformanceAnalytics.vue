<template>
  <div class="performance-analytics">
    <h3 class="text-lg font-semibold mb-4">Аналитика успеваемости</h3>
    
    <!-- Фильтры -->
    <div class="bg-discord-dark p-3 rounded-lg mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm text-discord-text-gray mb-1">Курс</label>
          <select 
            v-model="selectedCourse" 
            class="w-full bg-discord-secondary border-none rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
          >
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm text-discord-text-gray mb-1">Период</label>
          <select 
            v-model="selectedPeriod" 
            class="w-full bg-discord-secondary border-none rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
          >
            <option v-for="period in periods" :key="period.value" :value="period.value">
              {{ period.label }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm text-discord-text-gray mb-1">Тип</label>
          <select 
            v-model="selectedType" 
            class="w-full bg-discord-secondary border-none rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
          >
            <option v-for="type in dataTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Основная аналитика -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div class="bg-discord-secondary rounded-lg p-4 shadow-md">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-medium">Распределение успеваемости</h4>
          <div class="text-sm text-discord-text-gray">
            {{ students.length }} студентов
          </div>
        </div>
        <div class="h-64">
          <canvas ref="studentsDistributionChart"></canvas>
        </div>
      </div>
      
      <div class="bg-discord-secondary rounded-lg p-4 shadow-md">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-medium">Динамика среднего балла</h4>
          <div class="text-sm text-discord-text-gray">
            За {{ periodLabels[selectedPeriod] }}
          </div>
        </div>
        <div class="h-64">
          <canvas ref="trendChart"></canvas>
        </div>
      </div>
    </div>
    
    <!-- Детальная аналитика по студентам -->
    <div class="bg-discord-secondary rounded-lg p-4 shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h4 class="font-medium">Детальная статистика по студентам</h4>
        <div class="flex items-center">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск студента..."
            class="bg-discord-dark border-none rounded p-1.5 text-sm text-white mr-2 focus:outline-none focus:ring-2 focus:ring-discord-accent"
          />
          <select 
            v-model="sortBy" 
            class="bg-discord-dark border-none rounded p-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-discord-accent"
          >
            <option value="name">По имени</option>
            <option value="attendance">По посещаемости</option>
            <option value="score">По оценке</option>
            <option value="activity">По активности</option>
          </select>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="px-4 py-2 text-left text-xs font-medium text-discord-text-gray uppercase tracking-wider">
                Студент
              </th>
              <th class="px-4 py-2 text-left text-xs font-medium text-discord-text-gray uppercase tracking-wider">
                Посещаемость
              </th>
              <th class="px-4 py-2 text-left text-xs font-medium text-discord-text-gray uppercase tracking-wider">
                Средний балл
              </th>
              <th class="px-4 py-2 text-left text-xs font-medium text-discord-text-gray uppercase tracking-wider">
                Завершено заданий
              </th>
              <th class="px-4 py-2 text-left text-xs font-medium text-discord-text-gray uppercase tracking-wider">
                Активность
              </th>
              <th class="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="student in filteredStudents" 
              :key="student.id"
              class="border-b border-gray-700 hover:bg-discord-dark-hover"
            >
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <div
                    class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white shadow-lg shadow-indigo-950/30"
                    :aria-label="student.name"
                  >
                    {{ getInitials(student.name) }}
                  </div>
                  <div class="ml-3">
                    <div class="font-medium">{{ student.name }}</div>
                    <div class="text-sm text-discord-text-gray">{{ student.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <div class="relative w-16 h-2 bg-discord-dark rounded-full mr-2">
                    <div 
                      class="absolute top-0 left-0 h-2 rounded-full"
                      :class="getProgressColor(student.attendance)"
                      :style="`width: ${student.attendance}%`"
                    ></div>
                  </div>
                  <span>{{ student.attendance }}%</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <div class="relative w-16 h-2 bg-discord-dark rounded-full mr-2">
                    <div 
                      class="absolute top-0 left-0 h-2 rounded-full"
                      :class="getProgressColor(student.averageScore)"
                      :style="`width: ${student.averageScore}%`"
                    ></div>
                  </div>
                  <span>{{ student.averageScore }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <div class="relative w-16 h-2 bg-discord-dark rounded-full mr-2">
                    <div 
                      class="absolute top-0 left-0 h-2 rounded-full"
                      :class="getProgressColor(student.completedAssignments.percentage)"
                      :style="`width: ${student.completedAssignments.percentage}%`"
                    ></div>
                  </div>
                  <span>{{ student.completedAssignments.completed }}/{{ student.completedAssignments.total }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <div class="relative w-16 h-2 bg-discord-dark rounded-full mr-2">
                    <div 
                      class="absolute top-0 left-0 h-2 rounded-full"
                      :class="getProgressColor(student.activity)"
                      :style="`width: ${student.activity}%`"
                    ></div>
                  </div>
                  <span>{{ student.activity }}%</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  type="button"
                  class="text-discord-accent hover:underline text-sm"
                  @click="selectedStudent = student"
                >
                  Подробнее
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <transition name="student-details">
        <div
          v-if="selectedStudent"
          class="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4"
          role="region"
          aria-live="polite"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-indigo-300">Карточка студента</p>
              <h5 class="mt-1 font-semibold text-white">{{ selectedStudent.name }}</h5>
              <p class="text-sm text-discord-text-gray">{{ selectedStudent.email }}</p>
            </div>
            <button type="button" class="rounded-lg px-2 py-1 text-discord-text-gray hover:bg-white/10 hover:text-white" @click="selectedStudent = null" aria-label="Закрыть карточку">×</button>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-lg bg-black/20 p-3"><span class="block text-xs text-discord-text-gray">Посещаемость</span><strong>{{ selectedStudent.attendance }}%</strong></div>
            <div class="rounded-lg bg-black/20 p-3"><span class="block text-xs text-discord-text-gray">Средний балл</span><strong>{{ selectedStudent.averageScore }}</strong></div>
            <div class="rounded-lg bg-black/20 p-3"><span class="block text-xs text-discord-text-gray">Задания</span><strong>{{ selectedStudent.completedAssignments.completed }}/{{ selectedStudent.completedAssignments.total }}</strong></div>
            <div class="rounded-lg bg-black/20 p-3"><span class="block text-xs text-discord-text-gray">Активность</span><strong>{{ selectedStudent.activity }}%</strong></div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  ArcElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';

Chart.register(
  ArcElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip
);

const props = defineProps({
  courseId: {
    type: Number,
    default: 1
  }
});

// Состояние компонента
const selectedCourse = ref(props.courseId);
const selectedPeriod = ref('month');
const selectedType = ref('all');
const searchQuery = ref('');
const sortBy = ref('name');
const selectedStudent = ref(null);

// Ссылки на элементы canvas для графиков
const studentsDistributionChart = ref(null);
const trendChart = ref(null);
let distributionChartInstance = null;
let trendChartInstance = null;

// Доступные опции для фильтров
const courses = [
  { id: 1, name: 'Vue.js для профессионалов' },
  { id: 2, name: 'JavaScript Продвинутый уровень' },
  { id: 3, name: 'Введение в React' }
];

const periods = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' }
];

const dataTypes = [
  { value: 'all', label: 'Все данные' },
  { value: 'attendance', label: 'Только посещаемость' },
  { value: 'scores', label: 'Только оценки' },
  { value: 'assignments', label: 'Только задания' }
];

const periodLabels = {
  'week': 'неделю',
  'month': 'месяц',
  'quarter': 'квартал',
  'year': 'год'
};

// Тестовые данные студентов
const students = ref([
  {
    id: 1,
    name: 'Иванов Иван',
    email: 'ivanov@example.com',
    attendance: 95,
    averageScore: 87,
    completedAssignments: {
      completed: 18,
      total: 20,
      percentage: 90
    },
    activity: 88
  },
  {
    id: 2,
    name: 'Петрова Мария',
    email: 'petrova@example.com',
    attendance: 98,
    averageScore: 92,
    completedAssignments: {
      completed: 20,
      total: 20,
      percentage: 100
    },
    activity: 95
  },
  {
    id: 3,
    name: 'Сидоров Алексей',
    email: 'sidorov@example.com',
    attendance: 78,
    averageScore: 65,
    completedAssignments: {
      completed: 14,
      total: 20,
      percentage: 70
    },
    activity: 62
  },
  {
    id: 4,
    name: 'Кузнецова Анна',
    email: 'kuznetsova@example.com',
    attendance: 86,
    averageScore: 78,
    completedAssignments: {
      completed: 16,
      total: 20,
      percentage: 80
    },
    activity: 75
  },
  {
    id: 5,
    name: 'Морозов Игорь',
    email: 'morozov@example.com',
    attendance: 92,
    averageScore: 83,
    completedAssignments: {
      completed: 17,
      total: 20,
      percentage: 85
    },
    activity: 80
  }
]);

// Computed свойства
const filteredStudents = computed(() => {
  let result = students.value;
  
  // Применяем поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.email.toLowerCase().includes(query)
    );
  }
  
  // Применяем сортировку
  result = [...result].sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy.value === 'attendance') {
      return b.attendance - a.attendance;
    } else if (sortBy.value === 'score') {
      return b.averageScore - a.averageScore;
    } else if (sortBy.value === 'activity') {
      return b.activity - a.activity;
    }
    return 0;
  });
  
  return result;
});

// Методы
const getProgressColor = (value) => {
  if (value >= 85) return 'bg-discord-success';
  if (value >= 70) return 'bg-discord-warning';
  return 'bg-discord-error';
};

const getInitials = (name) => String(name || '?')
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map(part => part.charAt(0))
  .join('')
  .toUpperCase();

const initCharts = () => {
  distributionChartInstance?.destroy();
  trendChartInstance?.destroy();

  // График распределения студентов
  if (studentsDistributionChart.value) {
    const ctx = studentsDistributionChart.value;
    
    distributionChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Отлично (85-100)', 'Хорошо (70-84)', 'Удовлетворительно (50-69)', 'Требует внимания (<50)'],
        datasets: [{
          data: [2, 2, 1, 0],
          backgroundColor: [
            'rgba(59, 165, 92, 0.8)',  // success
            'rgba(244, 127, 64, 0.8)', // warning
            'rgba(230, 126, 34, 0.8)', // orange
            'rgba(237, 66, 69, 0.8)'   // error
          ],
          borderWidth: 1,
          borderColor: '#1e2124'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: {
                size: 11
              },
              boxWidth: 15
            }
          }
        }
      }
    });
  }
  
  // График тренда успеваемости
  if (trendChart.value) {
    const ctx = trendChart.value;
    
    trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4'],
        datasets: [{
          label: 'Средний балл',
          data: [75, 78, 80, 84],
          borderColor: 'rgba(88, 101, 242, 1)',
          backgroundColor: 'rgba(88, 101, 242, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            min: 60,
            max: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        }
      }
    });
  }
};

// Обновление графиков при изменении фильтров
watch([selectedCourse, selectedPeriod, selectedType], () => {
  if (trendChartInstance) {
    const base = selectedPeriod.value === 'week' ? [78, 80, 82, 84] : selectedPeriod.value === 'year' ? [69, 74, 79, 84] : [75, 78, 80, 84];
    trendChartInstance.data.datasets[0].data = base;
    trendChartInstance.update('none');
  }
});

// Инициализация графиков после загрузки компонента
onMounted(() => {
  initCharts();
});

onUnmounted(() => {
  distributionChartInstance?.destroy();
  trendChartInstance?.destroy();
  distributionChartInstance = null;
  trendChartInstance = null;
});
</script>

<style scoped>
.performance-analytics {
  max-width: 100%;
  overflow-x: hidden;
}

table {
  border-collapse: separate;
  border-spacing: 0;
}

td, th {
  white-space: nowrap;
}

.student-details-enter-active,
.student-details-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.student-details-enter-from,
.student-details-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
