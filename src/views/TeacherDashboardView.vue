<template>
  <AppLayout>
    <div class="p-6 max-w-6xl mx-auto relative z-10">
      <h1 class="text-3xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">Панель преподавателя</h1>
      
      <!-- Табы для навигации -->
      <div class="flex border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-6 py-3 font-semibold text-sm whitespace-nowrap transition-all duration-300 relative"
          :class="activeTab === tab.id ? 'text-indigo-400' : 'text-discord-text-gray hover:text-white'"
        >
          {{ tab.name }}
          <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
        </button>
      </div>
      
      <!-- Аналитика -->
      <div v-if="activeTab === 'analytics'" class="space-y-6 animate-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors"></div>
            <div class="text-discord-text-gray text-sm mb-2 font-medium uppercase tracking-wider">Студентов всего</div>
            <div class="text-4xl font-extrabold text-white mb-2">{{ analytics.totalStudents }}</div>
            <div class="text-xs font-semibold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full inline-block">+{{ analytics.newStudents }} за неделю</div>
          </div>
          <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-colors"></div>
            <div class="text-discord-text-gray text-sm mb-2 font-medium uppercase tracking-wider">Средняя посещаемость</div>
            <div class="text-4xl font-extrabold text-white mb-2">{{ analytics.avgAttendance }}%</div>
            <div class="text-xs font-semibold px-2 py-1 bg-white/10 text-discord-text-gray rounded-full inline-block">За последние 30 дней</div>
          </div>
          <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl group-hover:bg-pink-500/30 transition-colors"></div>
            <div class="text-discord-text-gray text-sm mb-2 font-medium uppercase tracking-wider">Активность в чате</div>
            <div class="text-4xl font-extrabold text-white mb-2">{{ analytics.messageCount }}</div>
            <div class="text-xs font-semibold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full inline-block">+{{ analytics.messageGrowth }}% к прошлой неделе</div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div class="glass-card p-6 rounded-2xl">
            <h3 class="text-xl font-bold mb-6 text-white flex items-center">
              <span class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3">📈</span>
              Активность по курсам
            </h3>
            <div class="space-y-5">
              <div v-for="course in analytics.courseActivity" :key="course.id" class="flex items-center group">
                <div class="w-1/3 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{{ course.name }}</div>
                <div class="w-2/3 flex items-center">
                  <div class="w-full bg-black/40 rounded-full h-3 mr-3 overflow-hidden shadow-inner border border-white/5">
                    <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" :style="`width: ${course.activity}%`"></div>
                  </div>
                  <span class="text-xs font-bold text-discord-text-gray w-8 text-right">{{ course.activity }}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="glass-card p-6 rounded-2xl">
            <h3 class="text-xl font-bold mb-6 text-white flex items-center">
              <span class="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center mr-3">⚡</span>
              Последняя активность
            </h3>
            <div class="space-y-4">
              <div v-for="(activity, index) in analytics.recentActivity" :key="index" class="flex items-start p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold mr-4 border border-white/10 shadow-md">
                  {{ activity.user.substring(0, 2) }}
                </div>
                <div class="flex-1">
                  <p class="text-sm leading-tight">
                    <span class="font-bold text-white">{{ activity.user }}</span>
                    <span class="text-gray-400 ml-1">{{ activity.action }}</span>
                  </p>
                  <p class="text-xs text-indigo-400 mt-1 font-medium">{{ formatDate(activity.time) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Курсы -->
      <div v-else-if="activeTab === 'courses'" class="space-y-6 animate-fade-in">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Мои курсы</h3>
          <button @click="createCourse" class="glass-button text-white px-5 py-2.5 rounded-xl flex items-center font-semibold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Создать курс
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="course in courses" :key="course.id" class="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
            <div class="h-48 bg-black/50 flex items-center justify-center relative overflow-hidden group">
              <img v-if="course.image" :src="course.image" alt="Course image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100">
              <div v-else class="text-6xl drop-shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">📚</div>
              
              <div class="absolute inset-0 bg-gradient-to-t from-[#151b2b] to-transparent opacity-80"></div>

              <button
                type="button"
                class="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-full p-2 border border-white/10 hover:bg-white/20 transition-colors"
                :aria-label="`Управлять курсом ${course.title}`"
                @click="manageCourse(course)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
            
            <div class="p-5 flex-1 flex flex-col">
              <h4 class="font-bold text-xl mb-2 text-white">{{ course.title }}</h4>
              <div class="flex justify-between items-center mb-4">
                <span class="text-discord-text-gray text-sm font-medium">{{ course.duration }}</span>
                <span class="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-bold border border-indigo-500/30">{{ course.students }} студентов</span>
              </div>
              
              <div class="flex justify-between mt-auto pt-4 border-t border-white/5 gap-3">
                <button @click="editCourse(course)" class="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                  Редактировать
                </button>
                <button @click="manageCourse(course)" class="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors shadow-glow">
                  Начать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Расписание -->
      <div v-else-if="activeTab === 'schedule'" class="space-y-6 animate-fade-in">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Расписание занятий</h3>
          <button 
            @click="showAddScheduleForm = !showAddScheduleForm" 
            class="px-4 py-2.5 rounded-xl flex items-center font-semibold text-sm transition-all"
            :class="showAddScheduleForm ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/50' : 'glass-button text-white'"
          >
            <svg v-if="!showAddScheduleForm" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {{ showAddScheduleForm ? 'Отмена' : 'Добавить занятие' }}
          </button>
        </div>
        
        <!-- Форма добавления занятия -->
        <div v-if="showAddScheduleForm" class="mb-6 p-6 glass-card border border-indigo-500/30 rounded-2xl animate-slide-up">
          <h4 class="text-lg font-bold mb-5 text-indigo-300">Новое занятие</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1.5">Название</label>
              <input v-model="newScheduleItem.title" type="text" class="w-full px-4 py-2.5 glass-input rounded-xl text-white placeholder-gray-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1.5">Курс</label>
              <select v-model="newScheduleItem.courseId" class="w-full px-4 py-2.5 glass-input rounded-xl text-white appearance-none">
                <option value="" class="bg-discord-primary">Выберите курс</option>
                <option v-for="course in courses" :key="course.id" :value="course.id" class="bg-discord-primary">{{ course.title }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1.5">Дата</label>
              <input v-model="newScheduleItem.date" type="date" class="w-full px-4 py-2.5 glass-input rounded-xl text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1.5">Время</label>
              <input v-model="newScheduleItem.time" type="time" class="w-full px-4 py-2.5 glass-input rounded-xl text-white">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-400 mb-1.5">Описание</label>
              <textarea v-model="newScheduleItem.description" rows="3" class="w-full px-4 py-2.5 glass-input rounded-xl text-white"></textarea>
            </div>
          </div>
          <div class="flex justify-end mt-6">
            <button @click="addScheduleItem" class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all transform hover:scale-[1.02]">
              Сохранить
            </button>
          </div>
        </div>
        
        <!-- Календарь (упрощенный) -->
        <div class="glass-card rounded-2xl p-5 border border-white/5">
          <div class="grid grid-cols-7 gap-2">
            <div v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="day" class="text-center text-xs font-bold text-discord-text-gray/70 py-2 uppercase tracking-widest">
              {{ day }}
            </div>
            <div v-for="dayNum in calendarDays" :key="dayNum.date" 
                 class="aspect-square p-1.5 rounded-xl border transition-all duration-300"
                 :class="dayNum.isToday ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[inset_0_0_10px_rgba(99,102,241,0.2)]' : 'border-transparent hover:bg-white/5 hover:border-white/10'">
              <div class="h-full rounded-lg flex flex-col">
                <div class="text-sm font-medium text-right p-1" :class="dayNum.isToday ? 'text-indigo-300 font-bold' : (dayNum.isCurrentMonth ? 'text-gray-300' : 'text-gray-600')">
                  {{ dayNum.day }}
                </div>
                <div v-if="dayNum.hasEvents" class="flex-1 flex items-end justify-center pb-1.5">
                  <div class="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_5px_rgba(129,140,248,0.8)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Список занятий -->
        <div class="glass-card rounded-2xl overflow-hidden border border-white/5">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/10 bg-white/5">
                  <th class="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Дата</th>
                  <th class="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Время</th>
                  <th class="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Название</th>
                  <th class="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Курс</th>
                  <th class="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="(item, index) in scheduleItems" :key="index" class="hover:bg-white/5 transition-colors group">
                  <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-white">{{ formatDisplayDate(item.date) }}</td>
                  <td class="px-5 py-4 whitespace-nowrap text-sm text-indigo-300 font-semibold">{{ item.time }}</td>
                  <td class="px-5 py-4 text-sm font-medium text-white">{{ item.title }}</td>
                  <td class="px-5 py-4">
                    <span v-if="item.courseId" class="text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-full font-medium">
                      {{ getCourseTitle(item.courseId) }}
                    </span>
                  </td>
                  <td class="px-5 py-4 whitespace-nowrap">
                    <div class="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="editScheduleItem(index)" class="p-2 bg-white/10 hover:bg-indigo-500/50 rounded-lg text-gray-300 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="deleteScheduleItem(index)" class="p-2 bg-white/10 hover:bg-rose-500/50 rounded-lg text-gray-300 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="scheduleItems.length === 0">
                  <td colspan="5" class="px-5 py-12 text-center text-gray-500 font-medium">
                    <div class="text-4xl mb-3">📅</div>
                    У вас пока нет запланированных занятий
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Тесты и задания -->
      <div v-else-if="activeTab === 'assignments'" class="space-y-6 animate-fade-in">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white">Тесты и задания</h3>
          <button @click="createAssignment" class="glass-button text-white px-5 py-2.5 rounded-xl flex items-center font-semibold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Создать
          </button>
        </div>
        
        <div class="flex gap-3 mb-6 overflow-x-auto hide-scrollbar pb-1">
          <button v-for="filter in assignmentFilters" :key="filter.id" @click="assignmentFilter = filter.id" class="px-4 py-2 border font-medium rounded-lg text-sm whitespace-nowrap transition-colors" :class="assignmentFilter === filter.id ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'">{{ filter.label }}</button>
        </div>
        
        <div class="space-y-4">
          <div v-for="assignment in filteredAssignments" :key="assignment.id" class="glass-card rounded-2xl p-5 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-lg text-white mb-1 group-hover:text-indigo-300 transition-colors">{{ assignment.title }}</h4>
                <div class="flex flex-wrap gap-2 items-center mt-2">
                  <span class="text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full font-medium">{{ assignment.course }}</span>
                  <span class="text-xs text-gray-400 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {{ formatDate(assignment.deadline) }}
                  </span>
                </div>
              </div>
              <div>
                <span class="px-3 py-1.5 text-xs rounded-full font-bold shadow-sm"
                      :class="getStatusClass(assignment.status)">
                  {{ assignment.status }}
                </span>
              </div>
            </div>
            
            <p class="text-gray-400 text-sm mt-4 leading-relaxed">{{ assignment.description }}</p>
            
            <div class="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
              <div class="text-sm font-medium flex items-center">
                <span class="text-gray-500 mr-2">Сдали:</span>
                <div class="flex items-center">
                  <div class="w-24 h-2 bg-black/40 rounded-full mr-3 overflow-hidden shadow-inner">
                    <div class="h-full rounded-full bg-emerald-500" :style="`width: ${(assignment.submitted / assignment.total) * 100}%`"></div>
                  </div>
                  <span class="text-white">{{ assignment.submitted }}</span>
                  <span class="text-gray-500 mx-1">/</span>
                  <span class="text-gray-400">{{ assignment.total }}</span>
                </div>
              </div>
              <div class="flex gap-3">
                <button @click="editAssignment(assignment)" class="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors">
                  Редактировать
                </button>
                <button @click="reviewAssignment(assignment)" class="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors shadow-glow">
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
import { useNotificationStore } from '../stores/notification';

const userStore = useUserStore();
const notificationStore = useNotificationStore();

// Табы
const tabs = [
  { id: 'analytics', name: 'Аналитика' },
  { id: 'courses', name: 'Курсы' },
  { id: 'schedule', name: 'Расписание' },
  { id: 'assignments', name: 'Тесты и задания' }
];
const activeTab = ref('analytics');
const assignmentFilter = ref('all');
const assignmentFilters = [
  { id: 'all', label: 'Все' },
  { id: 'active', label: 'Активные' },
  { id: 'review', label: 'На проверке' },
  { id: 'completed', label: 'Завершённые' }
];

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
    notificationStore.warning('Заполните название, дату и время');
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
  notificationStore.success('Занятие добавлено в расписание');
};

// Редактирование и удаление занятия
const editScheduleItem = (index) => {
  const item = scheduleItems.value[index];
  if (!item) return;
  newScheduleItem.value = { ...item };
  scheduleItems.value.splice(index, 1);
  showAddScheduleForm.value = true;
  notificationStore.info('Измените данные и сохраните занятие снова');
};

const deleteScheduleItem = (index) => {
  if (confirm('Вы уверены, что хотите удалить это занятие?')) {
    scheduleItems.value.splice(index, 1);
    localStorage.setItem('scheduleItems', JSON.stringify(scheduleItems.value));
    notificationStore.success('Занятие удалено');
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
    image: null
  },
  { 
    id: 2, 
    title: 'JavaScript Продвинутый', 
    duration: '10 недель', 
    students: 18, 
    image: null
  },
  { 
    id: 3, 
    title: 'Веб-разработка', 
    duration: '12 недель', 
    students: 32, 
    image: null
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

const filteredAssignments = computed(() => {
  if (assignmentFilter.value === 'all') return assignments;
  const statusByFilter = {
    active: 'Активно',
    review: 'На проверке',
    completed: 'Завершено'
  };
  return assignments.filter(assignment => assignment.status === statusByFilter[assignmentFilter.value]);
});

const createCourse = () => notificationStore.success('Создан черновик нового курса', 'Конструктор курса');
const editCourse = (course) => notificationStore.info(`Редактирование «${course.title}»`, 'Курс');
const manageCourse = (course) => notificationStore.info(`${course.students} студентов · ${course.duration}`, course.title);
const createAssignment = () => notificationStore.success('Создан черновик задания', 'Задание');
const editAssignment = (assignment) => notificationStore.info(`Редактирование «${assignment.title}»`, 'Задание');
const reviewAssignment = (assignment) => notificationStore.info(`${assignment.submitted} из ${assignment.total} работ готовы к проверке`, assignment.title);

// Получение класса для статуса задания
const getStatusClass = (status) => {
  switch(status) {
    case 'Активно': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    case 'На проверке': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'Завершено': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    default: return 'bg-white/10 text-gray-400 border border-white/5';
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
