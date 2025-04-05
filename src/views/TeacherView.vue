<template>
  <AppLayout>
    <div class="p-4">
      <div v-if="currentChannel">
        <h2 class="text-xl font-bold mb-4"># {{ currentChannel.name }}</h2>
        
        <!-- Компонент трансляции для канала #лекция -->
        <StreamView v-if="currentChannel.id === 'lecture'" />
        
        <!-- Расписание для канала #расписание -->
        <div v-else-if="currentChannel.id === 'schedule'" class="bg-discord-secondary p-4 rounded-lg">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Расписание занятий</h3>
            <button
              @click="showAddScheduleForm = !showAddScheduleForm"
              class="px-3 py-1 bg-discord-accent rounded"
            >
              {{ showAddScheduleForm ? 'Отмена' : 'Добавить занятие' }}
            </button>
          </div>
          
          <!-- Форма добавления занятия -->
          <div v-if="showAddScheduleForm" class="mb-4 p-3 bg-discord-primary rounded">
            <h4 class="text-md font-semibold mb-2">Новое занятие</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm mb-1">Тема</label>
                <input 
                  v-model="newScheduleItem.title" 
                  type="text" 
                  class="w-full px-3 py-2 bg-discord-secondary border border-gray-700 rounded"
                />
              </div>
              <div>
                <label class="block text-sm mb-1">Дата</label>
                <input 
                  v-model="newScheduleItem.date" 
                  type="date" 
                  class="w-full px-3 py-2 bg-discord-secondary border border-gray-700 rounded"
                />
              </div>
              <div>
                <label class="block text-sm mb-1">Время</label>
                <input 
                  v-model="newScheduleItem.time" 
                  type="time" 
                  class="w-full px-3 py-2 bg-discord-secondary border border-gray-700 rounded"
                />
              </div>
              <div>
                <label class="block text-sm mb-1">Описание</label>
                <textarea 
                  v-model="newScheduleItem.description" 
                  rows="3" 
                  class="w-full px-3 py-2 bg-discord-secondary border border-gray-700 rounded"
                ></textarea>
              </div>
              <div class="flex justify-end">
                <button
                  @click="addScheduleItem"
                  class="px-4 py-2 bg-discord-success rounded"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
          
          <!-- Таблица расписания -->
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-gray-700">
                  <th class="px-4 py-2">Дата</th>
                  <th class="px-4 py-2">Время</th>
                  <th class="px-4 py-2">Тема</th>
                  <th class="px-4 py-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(item, index) in scheduleItems" 
                  :key="index"
                  class="border-b border-gray-700"
                >
                  <td class="px-4 py-2">{{ item.date }}</td>
                  <td class="px-4 py-2">{{ item.time }}</td>
                  <td class="px-4 py-2">{{ item.title }}</td>
                  <td class="px-4 py-2">
                    <button
                      @click="deleteScheduleItem(index)"
                      class="text-discord-error hover:underline"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
                <tr v-if="scheduleItems.length === 0">
                  <td colspan="4" class="px-4 py-2 text-center text-discord-text-gray">
                    Нет запланированных занятий
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Компонент аналитики для канала #аналитика -->
        <div v-else-if="currentChannel.id === 'analytics' || currentChannel.id === 'student-progress'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="stat-card bg-discord-secondary p-4 rounded-lg shadow-md">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-discord-text-gray text-sm mb-1">Всего студентов</div>
                  <div class="text-2xl font-bold">{{ totalStudents }}</div>
                </div>
                <div class="rounded-full bg-discord-accent bg-opacity-20 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div class="text-xs text-discord-success mt-3">
                <span class="font-medium">+5%</span> по сравнению с прошлым месяцем
              </div>
            </div>
            
            <div class="stat-card bg-discord-secondary p-4 rounded-lg shadow-md">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-discord-text-gray text-sm mb-1">Средняя успеваемость</div>
                  <div class="text-2xl font-bold">78%</div>
                </div>
                <div class="rounded-full bg-discord-success bg-opacity-20 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div class="text-xs text-discord-success mt-3">
                <span class="font-medium">+2.5%</span> по сравнению с прошлым месяцем
              </div>
            </div>
            
            <div class="stat-card bg-discord-secondary p-4 rounded-lg shadow-md">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-discord-text-gray text-sm mb-1">Активность студентов</div>
                  <div class="text-2xl font-bold">92%</div>
                </div>
                <div class="rounded-full bg-discord-warning bg-opacity-20 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div class="text-xs text-discord-success mt-3">
                <span class="font-medium">+8%</span> по сравнению с прошлым месяцем
              </div>
            </div>
          </div>
          
          <!-- Основные графики -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-discord-secondary p-4 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold mb-4">Посещаемость занятий</h3>
              <div class="h-64">
                <canvas ref="attendanceChart"></canvas>
              </div>
            </div>
            
            <div class="bg-discord-secondary p-4 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold mb-4">Успеваемость по модулям</h3>
              <div class="h-64">
                <canvas ref="performanceChart"></canvas>
              </div>
            </div>
          </div>
          
          <!-- Подробная аналитика для преподавателя -->
          <PerformanceAnalytics :course-id="1" />
        </div>
        
        <!-- Компонент посещаемости -->
        <div v-else-if="currentChannel.id === 'attendance'" class="bg-discord-secondary p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">Журнал посещаемости</h3>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-gray-700">
                  <th class="px-4 py-2 sticky left-0 bg-discord-secondary">Студент</th>
                  <th v-for="date in attendanceDates" :key="date" class="px-4 py-2 text-center">
                    {{ formatAttendanceDate(date) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, index) in attendanceData" :key="index" class="border-b border-gray-700">
                  <td class="px-4 py-2 sticky left-0 bg-discord-secondary font-medium">{{ student.name }}</td>
                  <td v-for="(status, dateIdx) in student.attendance" :key="dateIdx" class="px-4 py-2 text-center">
                    <span 
                      class="inline-flex items-center justify-center w-6 h-6 rounded-full"
                      :class="{
                        'bg-discord-success bg-opacity-20 text-discord-success': status === 'present',
                        'bg-discord-error bg-opacity-20 text-discord-error': status === 'absent',
                        'bg-discord-warning bg-opacity-20 text-discord-warning': status === 'late'
                      }"
                    >
                      <template v-if="status === 'present'">✓</template>
                      <template v-else-if="status === 'absent'">✕</template>
                      <template v-else-if="status === 'late'">L</template>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Компонент генерации отчетов -->
        <div v-else-if="currentChannel.id === 'reports'" class="bg-discord-secondary p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">Отчеты и аналитика</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="report-card bg-discord-dark p-4 rounded-lg hover:bg-discord-primary transition-colors cursor-pointer">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="font-medium">Отчет по успеваемости</h4>
                  <p class="text-sm text-discord-text-gray">Полная статистика по всем студентам</p>
                </div>
                <div class="text-discord-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-discord-text-gray">Обновлен: сегодня</span>
                <button class="text-xs text-discord-accent">Скачать PDF</button>
              </div>
            </div>
            
            <div class="report-card bg-discord-dark p-4 rounded-lg hover:bg-discord-primary transition-colors cursor-pointer">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="font-medium">Активность и посещаемость</h4>
                  <p class="text-sm text-discord-text-gray">Посещаемость и активность на занятиях</p>
                </div>
                <div class="text-discord-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-discord-text-gray">Обновлен: вчера</span>
                <button class="text-xs text-discord-accent">Скачать PDF</button>
              </div>
            </div>
            
            <div class="report-card bg-discord-dark p-4 rounded-lg hover:bg-discord-primary transition-colors cursor-pointer">
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="font-medium">Индивидуальная аналитика</h4>
                  <p class="text-sm text-discord-text-gray">Анализ по каждому студенту</p>
                </div>
                <div class="text-discord-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-discord-text-gray">Обновлен: 2 дня назад</span>
                <button class="text-xs text-discord-accent">Скачать PDF</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Компонент управления заданиями для канала #задания -->
        <AssignmentBoard 
          v-else-if="currentChannel.id === 'assignments'" 
          :is-teacher="true" 
        />
        
        <!-- Компонент управления студентами -->
        <div v-else-if="currentChannel.id === 'student-management'" class="bg-discord-secondary p-4 rounded-lg">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Управление студентами</h3>
            <div class="flex gap-2">
              <input 
                type="text" 
                placeholder="Поиск студентов..." 
                class="px-3 py-1.5 bg-discord-primary border border-gray-700 rounded"
              />
              <button class="px-3 py-1.5 bg-discord-accent rounded">
                Добавить студента
              </button>
            </div>
          </div>
          
          <!-- Таблица студентов -->
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-gray-700">
                  <th class="px-4 py-2">ФИО</th>
                  <th class="px-4 py-2">Email</th>
                  <th class="px-4 py-2">Дата регистрации</th>
                  <th class="px-4 py-2">Статус</th>
                  <th class="px-4 py-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, index) in [
                  {id: 1, name: 'Иванов Алексей', email: 'ivanov@example.com', registered: '10.01.2023', status: 'active'},
                  {id: 2, name: 'Петрова Мария', email: 'petrova@example.com', registered: '15.01.2023', status: 'active'},
                  {id: 3, name: 'Сидоров Дмитрий', email: 'sidorov@example.com', registered: '20.01.2023', status: 'inactive'},
                  {id: 4, name: 'Кузнецова Анна', email: 'kuznetsova@example.com', registered: '25.01.2023', status: 'active'},
                  {id: 5, name: 'Морозов Игорь', email: 'morozov@example.com', registered: '01.02.2023', status: 'active'}
                ]" 
                :key="index"
                class="border-b border-gray-700 hover:bg-discord-dark-hover">
                  <td class="px-4 py-3">
                    <div class="flex items-center">
                      <div class="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center mr-2">
                        {{ student.name.charAt(0) }}
                      </div>
                      <span>{{ student.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3">{{ student.email }}</td>
                  <td class="px-4 py-3">{{ student.registered }}</td>
                  <td class="px-4 py-3">
                    <span 
                      class="px-2 py-1 rounded-full text-xs" 
                      :class="student.status === 'active' ? 'bg-discord-success bg-opacity-20 text-discord-success' : 'bg-discord-error bg-opacity-20 text-discord-error'"
                    >
                      {{ student.status === 'active' ? 'Активен' : 'Неактивен' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex space-x-2">
                      <button class="text-discord-accent hover:underline">Профиль</button>
                      <button class="text-discord-warning hover:underline">Деактивировать</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Пагинация -->
          <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-discord-text-gray">
              Показано 5 из 24 студентов
            </div>
            <div class="flex space-x-1">
              <button class="px-3 py-1 bg-discord-primary rounded hover:bg-discord-dark-hover">
                Предыдущая
              </button>
              <button class="px-3 py-1 bg-discord-accent rounded">
                1
              </button>
              <button class="px-3 py-1 bg-discord-primary rounded hover:bg-discord-dark-hover">
                2
              </button>
              <button class="px-3 py-1 bg-discord-primary rounded hover:bg-discord-dark-hover">
                3
              </button>
              <button class="px-3 py-1 bg-discord-primary rounded hover:bg-discord-dark-hover">
                Следующая
              </button>
            </div>
          </div>
        </div>
        
        <!-- Компонент тестов и опросов -->
        <div v-else-if="currentChannel.id === 'tests'" class="bg-discord-secondary p-4 rounded-lg">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Тесты и опросы</h3>
            <div class="flex gap-2">
              <button class="px-3 py-1.5 bg-discord-success rounded">
                Создать тест
              </button>
              <button class="px-3 py-1.5 bg-discord-accent rounded">
                Создать опрос
              </button>
            </div>
          </div>
          
          <!-- Вкладки -->
          <div class="border-b border-gray-700 mb-4">
            <div class="flex">
              <button class="px-4 py-2 border-b-2 border-discord-accent">
                Активные
              </button>
              <button class="px-4 py-2 text-discord-text-gray hover:text-white">
                Завершенные
              </button>
              <button class="px-4 py-2 text-discord-text-gray hover:text-white">
                Черновики
              </button>
            </div>
          </div>
          
          <!-- Список тестов -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-discord-primary p-4 rounded-lg">
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-medium">Основы Vue.js</h4>
                <span class="text-xs px-2 py-0.5 rounded-full bg-discord-success bg-opacity-20 text-discord-success">
                  Активный
                </span>
              </div>
              <p class="text-sm text-discord-text-gray mb-3">
                Тест по основам Vue.js включает вопросы по реактивности, компонентам и жизненному циклу.
              </p>
              <div class="flex justify-between text-xs text-discord-text-gray mb-3">
                <span>15 вопросов</span>
                <span>30 минут</span>
              </div>
              <div class="flex justify-between mt-4">
                <span class="text-xs text-discord-text-gray">
                  Срок: 20.04.2023
                </span>
                <button class="text-discord-accent hover:underline text-sm">
                  Просмотреть
                </button>
              </div>
            </div>
            
            <div class="bg-discord-primary p-4 rounded-lg">
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-medium">JavaScript ES6+</h4>
                <span class="text-xs px-2 py-0.5 rounded-full bg-discord-success bg-opacity-20 text-discord-success">
                  Активный
                </span>
              </div>
              <p class="text-sm text-discord-text-gray mb-3">
                Тест по современным возможностям JavaScript, включая стрелочные функции, деструктуризацию и async/await.
              </p>
              <div class="flex justify-between text-xs text-discord-text-gray mb-3">
                <span>20 вопросов</span>
                <span>45 минут</span>
              </div>
              <div class="flex justify-between mt-4">
                <span class="text-xs text-discord-text-gray">
                  Срок: 25.04.2023
                </span>
                <button class="text-discord-accent hover:underline text-sm">
                  Просмотреть
                </button>
              </div>
            </div>
            
            <div class="bg-discord-primary p-4 rounded-lg">
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-medium">Опрос по учебному процессу</h4>
                <span class="text-xs px-2 py-0.5 rounded-full bg-discord-warning bg-opacity-20 text-discord-warning">
                  Опрос
                </span>
              </div>
              <p class="text-sm text-discord-text-gray mb-3">
                Опрос для сбора обратной связи от студентов о качестве учебных материалов и процессе обучения.
              </p>
              <div class="flex justify-between text-xs text-discord-text-gray mb-3">
                <span>10 вопросов</span>
                <span>Анонимный</span>
              </div>
              <div class="flex justify-between mt-4">
                <span class="text-xs text-discord-text-gray">
                  Срок: 30.04.2023
                </span>
                <button class="text-discord-accent hover:underline text-sm">
                  Просмотреть
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Компонент ресурсов -->
        <div v-else-if="currentChannel.id === 'resources'" class="bg-discord-secondary p-4 rounded-lg">
          <ResourcesView />
        </div>
        
        <!-- Компонент прогресса студентов - убедимся, что он правильно привязан к ID 'student-progress' -->
        <div v-else-if="currentChannel.id === 'student-progress'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="stat-card bg-discord-secondary p-4 rounded-lg shadow-md">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-discord-text-gray text-sm mb-1">Всего студентов</div>
                  <div class="text-2xl font-bold">{{ totalStudents }}</div>
                </div>
                <div class="rounded-full bg-discord-accent bg-opacity-20 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div class="text-xs text-discord-success mt-3">
                <span class="font-medium">+5%</span> по сравнению с прошлым месяцем
              </div>
            </div>
            
            <div class="stat-card bg-discord-secondary p-4 rounded-lg shadow-md">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-discord-text-gray text-sm mb-1">Средняя успеваемость</div>
                  <div class="text-2xl font-bold">78%</div>
                </div>
                <div class="rounded-full bg-discord-success bg-opacity-20 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div class="text-xs text-discord-success mt-3">
                <span class="font-medium">+2.5%</span> по сравнению с прошлым месяцем
              </div>
            </div>
            
            <div class="stat-card bg-discord-secondary p-4 rounded-lg shadow-md">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-discord-text-gray text-sm mb-1">Активность студентов</div>
                  <div class="text-2xl font-bold">92%</div>
                </div>
                <div class="rounded-full bg-discord-warning bg-opacity-20 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div class="text-xs text-discord-success mt-3">
                <span class="font-medium">+8%</span> по сравнению с прошлым месяцем
              </div>
            </div>
          </div>
          
          <!-- Основные графики -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-discord-secondary p-4 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold mb-4">Посещаемость занятий</h3>
              <div class="h-64">
                <canvas ref="attendanceChart"></canvas>
              </div>
            </div>
            
            <div class="bg-discord-secondary p-4 rounded-lg shadow-md">
              <h3 class="text-lg font-semibold mb-4">Успеваемость по модулям</h3>
              <div class="h-64">
                <canvas ref="performanceChart"></canvas>
              </div>
            </div>
          </div>
          
          <!-- Подробная аналитика для преподавателя -->
          <PerformanceAnalytics :course-id="1" />
        </div>
        
        <!-- Компонент для отображения чата в соответствующих каналах -->
        <div v-else-if="['chat', 'general', 'announcements', 'help', 'feedback'].includes(currentChannel.id)" class="bg-discord-secondary p-4 rounded-lg">
          <MessageContainer />
        </div>
        
        <!-- ResourcesView для канала ресурсы -->
        <ResourcesView v-else-if="currentChannel.id === 'resources'" />
        
        <!-- Контент для других каналов -->
        <div v-else class="bg-discord-secondary p-4 rounded-lg">
          <div v-for="message in channelMessages" :key="message.id" class="mb-4">
            <div class="flex items-start">
              <div class="bg-gray-700 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center">
                {{ message.username?.charAt(0).toUpperCase() }}
              </div>
              <div class="ml-3 flex-1">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-medium">{{ message.username }}</span>
                    <span class="ml-2 text-xs text-discord-text-gray">{{ formatTime(message.timestamp) }}</span>
                  </div>
                  <button
                    v-if="isTeacher"
                    @click="deleteMessage(message.id)"
                    class="text-discord-text-gray hover:text-discord-error"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p class="text-discord-text-light">{{ message.content }}</p>
              </div>
            </div>
          </div>
          
          <!-- Форма отправки сообщения -->
          <div class="mt-4">
            <div class="flex">
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                type="text"
                class="flex-1 px-3 py-2 bg-discord-primary border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-discord-accent"
                placeholder="Отправить сообщение..."
              />
              <button
                @click="sendMessage"
                class="bg-discord-accent px-4 py-2 rounded-r-md hover:bg-opacity-90"
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import Chart from 'chart.js/auto'
import AppLayout from '../components/layout/AppLayout.vue'
import StreamView from '../components/stream/StreamView.vue'
import PerformanceAnalytics from '../components/analytics/PerformanceAnalytics.vue'
import AssignmentBoard from '../components/assignments/AssignmentBoard.vue'
import { useUserStore } from '../stores/user'
import { useChannelStore } from '../stores/channels'
import ResourcesView from '../components/resources/ResourcesView.vue'
import MessageContainer from '../components/chat/MessageContainer.vue'

const userStore = useUserStore()
const channelStore = useChannelStore()

const newMessage = ref('')
const showAddScheduleForm = ref(false)
const newScheduleItem = ref({
  title: '',
  date: '',
  time: '',
  description: ''
})
const scheduleItems = ref([])

// Данные для аналитики
const totalStudents = ref(24)
const attendanceChart = ref(null)
const performanceChart = ref(null)

// Данные для посещаемости
const attendanceDates = ref([
  '2023-04-01',
  '2023-04-03',
  '2023-04-08',
  '2023-04-10',
  '2023-04-15',
  '2023-04-17',
  '2023-04-22',
  '2023-04-24',
])

const attendanceData = ref([
  {
    name: 'Иванов Алексей',
    attendance: ['present', 'present', 'present', 'late', 'present', 'present', 'absent', 'present']
  },
  {
    name: 'Петрова Мария',
    attendance: ['present', 'present', 'absent', 'present', 'present', 'present', 'present', 'present']
  },
  {
    name: 'Сидоров Дмитрий',
    attendance: ['absent', 'present', 'present', 'present', 'late', 'present', 'present', 'present']
  },
  {
    name: 'Кузнецова Анна',
    attendance: ['present', 'late', 'present', 'present', 'present', 'absent', 'present', 'present']
  },
  {
    name: 'Морозов Игорь',
    attendance: ['present', 'present', 'present', 'present', 'present', 'present', 'late', 'absent']
  }
])

// Загрузка расписания из localStorage
onMounted(() => {
  const savedSchedule = localStorage.getItem('scheduleItems')
  if (savedSchedule) {
    scheduleItems.value = JSON.parse(savedSchedule)
  }
  
  // Инициализация графиков после монтирования компонента
  nextTick(() => {
    initCharts()
  })
})

// Получаем данные из хранилищ
const isTeacher = computed(() => userStore.isTeacher)
const currentChannel = computed(() => channelStore.currentChannel)
const channelMessages = computed(() => channelStore.channelMessages)

// Методы работы с расписанием
const addScheduleItem = () => {
  if (!newScheduleItem.value.title || !newScheduleItem.value.date || !newScheduleItem.value.time) {
    return
  }
  
  scheduleItems.value.push({ ...newScheduleItem.value })
  localStorage.setItem('scheduleItems', JSON.stringify(scheduleItems.value))
  
  // Сброс формы
  newScheduleItem.value = {
    title: '',
    date: '',
    time: '',
    description: ''
  }
  showAddScheduleForm.value = false
}

const deleteScheduleItem = (index) => {
  scheduleItems.value.splice(index, 1)
  localStorage.setItem('scheduleItems', JSON.stringify(scheduleItems.value))
}

// Методы для отправки и удаления сообщений
const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  channelStore.addMessage({
    username: userStore.username,
    content: newMessage.value
  })
  
  newMessage.value = ''
}

const deleteMessage = (messageId) => {
  const messageIndex = channelStore.messages[channelStore.currentChannelId].findIndex(m => m.id === messageId)
  if (messageIndex !== -1) {
    channelStore.messages[channelStore.currentChannelId].splice(messageIndex, 1)
  }
}

// Форматирование времени
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

// Форматирование даты для журнала посещаемости
const formatAttendanceDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

// Методы
const initCharts = () => {
  // График посещаемости
  if (attendanceChart.value) {
    const ctxAttendance = attendanceChart.value;
    if (ctxAttendance) {
      new Chart(ctxAttendance, {
        type: 'line',
        data: {
          labels: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4', 'Неделя 5', 'Неделя 6', 'Неделя 7', 'Неделя 8'],
          datasets: [{
            label: 'Посещаемость',
            data: [95, 88, 92, 85, 90, 93, 89, 94],
            backgroundColor: 'rgba(88, 101, 242, 0.2)',
            borderColor: 'rgba(88, 101, 242, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              min: 70,
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
  }
  
  // График успеваемости по модулям
  if (performanceChart.value) {
    const ctxPerformance = performanceChart.value;
    if (ctxPerformance) {
      new Chart(ctxPerformance, {
        type: 'bar',
        data: {
          labels: ['HTML/CSS', 'JavaScript', 'Vue Basics', 'Vue Advanced', 'Routing', 'State Management'],
          datasets: [{
            label: 'Средний балл студентов',
            data: [85, 76, 82, 74, 80, 72],
            backgroundColor: [
              'rgba(59, 165, 92, 0.7)',  // success
              'rgba(88, 101, 242, 0.7)', // accent
              'rgba(59, 165, 92, 0.7)',
              'rgba(244, 127, 64, 0.7)', // warning
              'rgba(59, 165, 92, 0.7)',
              'rgba(244, 127, 64, 0.7)'
            ],
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            },
            x: {
              grid: {
                display: false
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
  }
}
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.report-card {
  transition: all 0.3s ease;
}

.report-card:hover {
  transform: translateY(-2px);
}
</style>
