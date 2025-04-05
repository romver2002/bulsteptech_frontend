<template>
  <div class="micro-learning-view">
    <div class="container mx-auto px-4 py-8">
      <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
        <div class="loader">
          <div class="spinner"></div>
          <span class="mt-4 text-gray-600 dark:text-gray-400">Загрузка курса...</span>
        </div>
      </div>
      
      <div v-else-if="!courseData" class="text-center py-12">
        <div class="mb-6 text-gray-600 dark:text-gray-400">
          <i class="fas fa-exclamation-circle text-4xl"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Курс не найден</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Запрошенный курс не существует или был удален.
        </p>
        <button 
          @click="$router.push('/courses')" 
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          Вернуться к списку курсов
        </button>
      </div>
      
      <div v-else class="course-container">
        <!-- Заголовок курса и информация -->
        <div class="course-header mb-8">
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ courseData.title }}</h1>
              <p class="text-gray-600 dark:text-gray-400">{{ courseData.description }}</p>
            </div>
            <div class="flex items-center mt-4 md:mt-0">
              <div class="course-progress-container mr-4">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Прогресс курса</div>
                <div class="flex items-center">
                  <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                    <div 
                      class="bg-blue-600 h-2.5 rounded-full" 
                      :style="{ width: `${courseProgress}%` }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ courseProgress }}%</span>
                </div>
              </div>
              
              <button 
                v-if="currentModule && currentLesson"
                @click="continueLearning" 
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                Продолжить обучение
              </button>
            </div>
          </div>
          
          <div class="course-meta grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="meta-item p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <i class="fas fa-user-graduate text-blue-600 mr-3"></i>
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Студентов</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ courseData.studentsCount }}</div>
                </div>
              </div>
            </div>
            <div class="meta-item p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <i class="fas fa-star text-yellow-500 mr-3"></i>
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Рейтинг</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ courseData.rating }} / 5</div>
                </div>
              </div>
            </div>
            <div class="meta-item p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <i class="fas fa-book text-green-600 mr-3"></i>
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Модулей</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ courseData.modules.length }}</div>
                </div>
              </div>
            </div>
            <div class="meta-item p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <i class="fas fa-calendar-alt text-purple-600 mr-3"></i>
                <div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Последнее обновление</div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-white">{{ formatDate(courseData.lastUpdated) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Основное содержимое -->
        <div class="course-content grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Навигация по модулям и урокам -->
          <div class="course-navigation md:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Содержание курса</h3>
              </div>
              
              <div class="course-modules">
                <div v-for="(module, moduleIndex) in courseData.modules" :key="module.id" class="module">
                  <div 
                    @click="toggleModule(moduleIndex)"
                    class="module-header p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer"
                    :class="{ 'bg-gray-50 dark:bg-gray-750': expandedModules[moduleIndex] }"
                  >
                    <div class="flex items-center">
                      <div 
                        class="module-progress-indicator w-4 h-4 rounded-full mr-3"
                        :class="getModuleProgressClass(module)"
                      ></div>
                      <h4 class="text-gray-900 dark:text-white font-medium">{{ module.title }}</h4>
                    </div>
                    <div class="text-gray-500">
                      <i class="fas" :class="expandedModules[moduleIndex] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                    </div>
                  </div>
                  
                  <div v-show="expandedModules[moduleIndex]" class="module-lessons">
                    <div 
                      v-for="lesson in module.lessons" 
                      :key="lesson.id" 
                      @click="selectLesson(moduleIndex, lesson)"
                      class="lesson p-3 pl-10 border-b border-gray-200 dark:border-gray-700 cursor-pointer flex items-center"
                      :class="{
                        'bg-blue-50 dark:bg-blue-900/10': isCurrentLesson(moduleIndex, lesson),
                        'hover:bg-gray-50 dark:hover:bg-gray-750': !isCurrentLesson(moduleIndex, lesson)
                      }"
                    >
                      <div 
                        class="lesson-status-indicator w-3 h-3 rounded-full mr-3"
                        :class="lesson.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
                      ></div>
                      <div class="lesson-info flex-grow">
                        <div class="text-sm text-gray-900 dark:text-white">{{ lesson.title }}</div>
                        <div v-if="lesson.duration" class="text-xs text-gray-500 dark:text-gray-400">
                          <i class="far fa-clock mr-1"></i> {{ lesson.duration }}
                        </div>
                      </div>
                      <div class="lesson-type-icon">
                        <i class="fas" :class="getLessonTypeIcon(lesson.type)"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Содержимое текущего урока -->
          <div class="lesson-content md:col-span-2">
            <div v-if="!currentLesson" class="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 min-h-[400px]">
              <div class="text-gray-500 dark:text-gray-400 mb-4 text-6xl">
                <i class="fas fa-book-open"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Выберите урок для начала обучения</h3>
              <p class="text-gray-600 dark:text-gray-400 text-center max-w-md">
                Выберите любой урок из содержания курса слева, чтобы начать обучение.
              </p>
            </div>
            
            <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ currentLesson.title }}</h3>
                <div class="lesson-controls flex space-x-2">
                  <button 
                    v-if="hasPreviousLesson"
                    @click="navigateToPreviousLesson" 
                    class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none" 
                    title="Предыдущий урок"
                  >
                    <i class="fas fa-arrow-left"></i>
                  </button>
                  <button 
                    v-if="hasNextLesson"
                    @click="navigateToNextLesson" 
                    class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none" 
                    title="Следующий урок"
                  >
                    <i class="fas fa-arrow-right"></i>
                  </button>
                  <button 
                    @click="markLessonComplete"
                    class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none" 
                    :class="{ 'text-green-500 hover:text-green-600 dark:text-green-500 dark:hover:text-green-400': currentLesson.completed }"
                    :title="currentLesson.completed ? 'Отметить как непройденное' : 'Отметить как пройденное'"
                  >
                    <i class="fas" :class="currentLesson.completed ? 'fa-check-circle' : 'fa-circle'"></i>
                  </button>
                </div>
              </div>
              
              <div class="lesson-content-wrapper p-6">
                <!-- Видеоурок -->
                <div v-if="currentLesson.type === 'video'" class="video-lesson">
                  <div class="aspect-w-16 aspect-h-9 mb-6 bg-gray-900 rounded-lg overflow-hidden">
                    <div class="flex items-center justify-center h-full">
                      <div class="text-center">
                        <div class="text-white text-5xl mb-4">
                          <i class="fas fa-play-circle"></i>
                        </div>
                        <p class="text-gray-300">Видео находится в разработке</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="video-details">
                    <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Описание</h4>
                    <p class="text-gray-700 dark:text-gray-300 mb-6">
                      {{ getVideoDescription() }}
                    </p>
                    
                    <div class="video-resources mb-6">
                      <h5 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Дополнительные материалы</h5>
                      <div class="flex flex-wrap gap-3">
                        <a href="#" class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <i class="fas fa-file-pdf text-red-500 mr-2"></i>
                          Конспект лекции
                        </a>
                        <a href="#" class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <i class="fas fa-file-code text-blue-500 mr-2"></i>
                          Примеры кода
                        </a>
                      </div>
                    </div>
                    
                    <div class="video-notes">
                      <h5 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Мои заметки</h5>
                      <textarea 
                        v-model="currentLessonNotes" 
                        placeholder="Добавьте ваши заметки к этому уроку..." 
                        class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                      ></textarea>
                      <div class="flex justify-end mt-2">
                        <button 
                          @click="saveNotes"
                          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          Сохранить заметки
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Тест -->
                <div v-else-if="currentLesson.type === 'test'" class="test-lesson">
                  <micro-test 
                    :test="getTestData()" 
                    @test-completed="handleTestCompletion"
                  />
                </div>
                
                <!-- Задание -->
                <div v-else-if="currentLesson.type === 'assignment'" class="assignment-lesson">
                  <div class="p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/20 mb-6">
                    <div class="flex items-start">
                      <div class="text-yellow-500 dark:text-yellow-400 mr-4 text-2xl">
                        <i class="fas fa-exclamation-circle"></i>
                      </div>
                      <div>
                        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Практическое задание</h4>
                        <p class="text-gray-700 dark:text-gray-300">
                          Задание находится в разработке. Скоро вы сможете выполнять практические задания прямо на платформе.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button 
                  v-if="hasPreviousLesson"
                  @click="navigateToPreviousLesson" 
                  class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                >
                  <i class="fas fa-arrow-left mr-2"></i>Предыдущий урок
                </button>
                <div v-else></div>
                
                <button 
                  v-if="hasNextLesson"
                  @click="navigateToNextLesson" 
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  Следующий урок<i class="fas fa-arrow-right ml-2"></i>
                </button>
                <button 
                  v-else
                  @click="finishCourse" 
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                >
                  Завершить курс<i class="fas fa-check ml-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotificationStore } from '../../stores/notification';
import MicroTest from './MicroTest.vue';
import { sampleLearningContent, sampleTest } from '../../data/test-data';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();

// Состояние компонента
const isLoading = ref(true);
const courseData = ref(null);
const currentModuleIndex = ref(null);
const currentLesson = ref(null);
const expandedModules = ref([]);
const currentLessonNotes = ref('');
const lessonNotes = ref({});

// Вычисляемые свойства
const courseProgress = computed(() => {
  if (!courseData.value) return 0;
  
  const totalLessons = getAllLessonsCount();
  if (totalLessons === 0) return 0;
  
  const completedLessons = getCompletedLessonsCount();
  return Math.round((completedLessons / totalLessons) * 100);
});

const currentModule = computed(() => {
  if (currentModuleIndex.value === null || !courseData.value) return null;
  return courseData.value.modules[currentModuleIndex.value];
});

const hasPreviousLesson = computed(() => {
  if (currentModuleIndex.value === null || !currentLesson.value) return false;
  
  const currentLessonIndex = getCurrentLessonIndex();
  if (currentLessonIndex > 0) return true;
  
  return currentModuleIndex.value > 0;
});

const hasNextLesson = computed(() => {
  if (currentModuleIndex.value === null || !currentLesson.value) return false;
  
  const currentLessonIndex = getCurrentLessonIndex();
  const currentModule = courseData.value.modules[currentModuleIndex.value];
  
  if (currentLessonIndex < currentModule.lessons.length - 1) return true;
  
  return currentModuleIndex.value < courseData.value.modules.length - 1;
});

// Методы
const loadCourse = async () => {
  isLoading.value = true;
  
  try {
    // В реальном приложении это был бы API-запрос
    await new Promise(resolve => setTimeout(resolve, 800)); // Имитация задержки сети
    courseData.value = sampleLearningContent;
    
    // Инициализация состояния модулей
    expandedModules.value = Array(courseData.value.modules.length).fill(false);
    
    // Загрузка сохраненных заметок из localStorage
    const savedNotes = localStorage.getItem(`course_${courseData.value.id}_notes`);
    if (savedNotes) {
      lessonNotes.value = JSON.parse(savedNotes);
    }
    
    // Найти первый незавершенный урок для продолжения обучения
    findNextLessonToComplete();
    
  } catch (error) {
    console.error('Ошибка при загрузке курса:', error);
    notificationStore.error('Не удалось загрузить курс. Пожалуйста, попробуйте позже.');
    courseData.value = null;
  } finally {
    isLoading.value = false;
  }
};

const findNextLessonToComplete = () => {
  if (!courseData.value) return;
  
  for (let i = 0; i < courseData.value.modules.length; i++) {
    const module = courseData.value.modules[i];
    for (let j = 0; j < module.lessons.length; j++) {
      if (!module.lessons[j].completed) {
        selectLesson(i, module.lessons[j]);
        return;
      }
    }
  }
  
  // Если все уроки завершены, выбираем первый урок
  if (courseData.value.modules.length > 0 && courseData.value.modules[0].lessons.length > 0) {
    selectLesson(0, courseData.value.modules[0].lessons[0]);
  }
};

const getAllLessonsCount = () => {
  if (!courseData.value) return 0;
  
  return courseData.value.modules.reduce((count, module) => {
    return count + module.lessons.length;
  }, 0);
};

const getCompletedLessonsCount = () => {
  if (!courseData.value) return 0;
  
  return courseData.value.modules.reduce((count, module) => {
    return count + module.lessons.filter(lesson => lesson.completed).length;
  }, 0);
};

const toggleModule = (moduleIndex) => {
  expandedModules.value[moduleIndex] = !expandedModules.value[moduleIndex];
};

const selectLesson = (moduleIndex, lesson) => {
  currentModuleIndex.value = moduleIndex;
  currentLesson.value = lesson;
  
  // Раскрываем модуль, если он свернут
  if (!expandedModules.value[moduleIndex]) {
    expandedModules.value[moduleIndex] = true;
  }
  
  // Загружаем заметки для текущего урока
  currentLessonNotes.value = lessonNotes.value[lesson.id] || '';
  
  // Прокрутка к началу контента
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const isCurrentLesson = (moduleIndex, lesson) => {
  return currentModuleIndex.value === moduleIndex && currentLesson.value && currentLesson.value.id === lesson.id;
};

const getCurrentLessonIndex = () => {
  if (!currentModule.value || !currentLesson.value) return -1;
  
  return currentModule.value.lessons.findIndex(lesson => lesson.id === currentLesson.value.id);
};

const navigateToPreviousLesson = () => {
  const currentLessonIndex = getCurrentLessonIndex();
  
  if (currentLessonIndex > 0) {
    // Перейти к предыдущему уроку в текущем модуле
    selectLesson(currentModuleIndex.value, currentModule.value.lessons[currentLessonIndex - 1]);
  } else if (currentModuleIndex.value > 0) {
    // Перейти к последнему уроку в предыдущем модуле
    const prevModule = courseData.value.modules[currentModuleIndex.value - 1];
    selectLesson(currentModuleIndex.value - 1, prevModule.lessons[prevModule.lessons.length - 1]);
  }
};

const navigateToNextLesson = () => {
  const currentLessonIndex = getCurrentLessonIndex();
  
  if (currentLessonIndex < currentModule.value.lessons.length - 1) {
    // Перейти к следующему уроку в текущем модуле
    selectLesson(currentModuleIndex.value, currentModule.value.lessons[currentLessonIndex + 1]);
  } else if (currentModuleIndex.value < courseData.value.modules.length - 1) {
    // Перейти к первому уроку в следующем модуле
    const nextModule = courseData.value.modules[currentModuleIndex.value + 1];
    selectLesson(currentModuleIndex.value + 1, nextModule.lessons[0]);
  }
};

const markLessonComplete = () => {
  if (!currentLesson.value) return;
  
  // Переключение статуса завершенности
  currentLesson.value.completed = !currentLesson.value.completed;
  
  // Уведомление пользователя
  if (currentLesson.value.completed) {
    notificationStore.success(`Урок "${currentLesson.value.title}" отмечен как завершенный!`);
  } else {
    notificationStore.info(`Урок "${currentLesson.value.title}" отмечен как незавершенный`);
  }
};

const saveNotes = () => {
  if (!currentLesson.value) return;
  
  lessonNotes.value[currentLesson.value.id] = currentLessonNotes.value;
  
  // Сохранение в localStorage
  localStorage.setItem(`course_${courseData.value.id}_notes`, JSON.stringify(lessonNotes.value));
  
  notificationStore.success('Заметки успешно сохранены');
};

const continueLearning = () => {
  if (!currentLesson.value) {
    findNextLessonToComplete();
  }
  
  // Прокрутка к содержимому урока
  const lessonContentElement = document.querySelector('.lesson-content');
  if (lessonContentElement) {
    lessonContentElement.scrollIntoView({ behavior: 'smooth' });
  }
};

const finishCourse = () => {
  notificationStore.success('Поздравляем с завершением курса!');
  
  // В реальном приложении здесь могла бы быть логика для получения сертификата
};

const getModuleProgressClass = (module) => {
  const totalLessons = module.lessons.length;
  if (totalLessons === 0) return 'bg-gray-300 dark:bg-gray-600';
  
  const completedLessons = module.lessons.filter(lesson => lesson.completed).length;
  const progress = completedLessons / totalLessons;
  
  if (progress === 1) return 'bg-green-500';
  if (progress > 0) return 'bg-yellow-500';
  return 'bg-gray-300 dark:bg-gray-600';
};

const getLessonTypeIcon = (type) => {
  switch (type) {
    case 'video': return 'fa-play-circle text-blue-500';
    case 'test': return 'fa-question-circle text-purple-500';
    case 'assignment': return 'fa-tasks text-orange-500';
    default: return 'fa-file-alt text-gray-500';
  }
};

const getVideoDescription = () => {
  if (!currentLesson.value) return '';
  
  return `В этом уроке вы изучите ${currentLesson.value.title.toLowerCase()}. Мы рассмотрим основные концепции и применение их на практике. После просмотра видео рекомендуется выполнить практические упражнения для закрепления материала.`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
};

const getTestData = () => {
  // В реальном приложении получали бы данные теста по его ID
  return sampleTest;
};

const handleTestCompletion = (result) => {
  console.log('Тест завершен с результатом:', result);
  
  // Отметить урок как завершенный, если результат хороший
  if (result.score >= 60) {
    currentLesson.value.completed = true;
    notificationStore.success(`Тест успешно пройден с результатом ${result.score}%!`);
  } else {
    notificationStore.warning(`Вы не прошли тест. Попробуйте еще раз после повторения материала.`);
  }
};

// Жизненный цикл
onMounted(() => {
  loadCourse();
});

// Обработка изменений
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadCourse();
  }
});
</script>

<style scoped>
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%;
}

.aspect-w-16 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

@media (max-width: 768px) {
  .course-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style> 