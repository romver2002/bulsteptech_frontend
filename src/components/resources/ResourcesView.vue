<template>
  <div class="resources-container">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Учебные материалы</h2>
      
      <div class="flex items-center">
        <div class="relative mr-3">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск материалов..." 
            class="bg-discord-dark border border-gray-700 rounded-md px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-discord-accent w-64"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-discord-text-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div class="sort-selector relative">
          <select 
            v-model="sortBy" 
            class="bg-discord-dark border border-gray-700 rounded-md px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-discord-accent"
          >
            <option value="date">По дате (новые)</option>
            <option value="popularity">По популярности</option>
            <option value="title">По алфавиту</option>
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-discord-text-gray pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Категории ресурсов -->
    <div class="resource-categories mb-6 flex flex-wrap gap-2">
      <button 
        @click="activeCategory = 'all'" 
        class="px-3 py-1 rounded-md text-sm" 
        :class="activeCategory === 'all' ? 'bg-discord-accent text-white' : 'bg-discord-dark text-discord-text-gray hover:bg-discord-dark-hover hover:text-white'"
      >
        Все материалы
      </button>
      <button 
        v-for="category in categories" 
        :key="category.id" 
        @click="activeCategory = category.id" 
        class="px-3 py-1 rounded-md text-sm" 
        :class="activeCategory === category.id ? 'bg-discord-accent text-white' : 'bg-discord-dark text-discord-text-gray hover:bg-discord-dark-hover hover:text-white'"
      >
        {{ category.name }}
      </button>
    </div>
    
    <!-- Список ресурсов -->
    <div v-if="filteredResources.length > 0" class="resources-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="resource in filteredResources" 
        :key="resource.id" 
        class="resource-card bg-discord-secondary rounded-lg overflow-hidden transition-transform hover:translate-y-[-4px]"
      >
        <div class="resource-image relative h-40 overflow-hidden">
          <img :src="resource.image" :alt="resource.title" class="w-full h-full object-cover" />
          <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
            <div class="flex items-center">
              <span class="text-xs px-2 py-0.5 rounded-full bg-discord-accent bg-opacity-90 text-white">{{ getCategoryName(resource.category) }}</span>
              <span v-if="resource.premium" class="ml-2 text-xs px-2 py-0.5 rounded-full bg-discord-warning bg-opacity-90 text-white">Премиум</span>
            </div>
          </div>
        </div>
        
        <div class="p-4">
          <h3 class="font-medium mb-1 text-white">{{ resource.title }}</h3>
          <p class="text-sm text-discord-text-gray mb-3 line-clamp-2">{{ resource.description }}</p>
          
          <div class="flex justify-between items-center text-xs text-discord-text-gray mb-3">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ formatDate(resource.date) }}
            </div>
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {{ resource.views }}
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-xs">
              <span :class="getResourceTypeClass(resource.type)">{{ getResourceTypeLabel(resource.type) }}</span>
            </span>
            <a 
              :href="resource.url" 
              target="_blank" 
              class="text-discord-accent hover:underline text-sm font-medium flex items-center"
            >
              Открыть
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Пустое состояние -->
    <div v-else class="empty-state bg-discord-secondary rounded-lg p-8 text-center">
      <div class="text-4xl mb-3">📚</div>
      <h3 class="font-medium text-xl mb-2">Материалы не найдены</h3>
      <p class="text-discord-text-gray mb-4">Не найдено материалов, соответствующих вашему запросу.</p>
      <button 
        @click="resetFilters" 
        class="px-4 py-2 bg-discord-accent rounded-md hover:bg-opacity-90"
      >
        Сбросить фильтры
      </button>
    </div>
    
    <!-- Пагинация -->
    <div v-if="filteredResources.length > 0" class="pagination flex justify-center mt-8">
      <div class="flex space-x-1">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)" 
          :disabled="currentPage === 1" 
          class="px-3 py-1 rounded-md" 
          :class="currentPage === 1 ? 'bg-discord-dark text-discord-text-gray cursor-not-allowed' : 'bg-discord-dark hover:bg-discord-dark-hover text-white'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <template v-for="page in totalPages" :key="page">
          <button 
            v-if="showPageButton(page)" 
            @click="currentPage = page" 
            class="px-3 py-1 rounded-md" 
            :class="currentPage === page ? 'bg-discord-accent text-white' : 'bg-discord-dark hover:bg-discord-dark-hover text-white'"
          >
            {{ page }}
          </button>
          
          <span 
            v-else-if="page === Math.floor((totalPages + 1) / 2) && totalPages > 5" 
            class="px-3 py-1 text-discord-text-gray"
          >
            ...
          </span>
        </template>
        
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)" 
          :disabled="currentPage === totalPages" 
          class="px-3 py-1 rounded-md" 
          :class="currentPage === totalPages ? 'bg-discord-dark text-discord-text-gray cursor-not-allowed' : 'bg-discord-dark hover:bg-discord-dark-hover text-white'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Состояние компонента
const searchQuery = ref('');
const activeCategory = ref('all');
const sortBy = ref('date');
const currentPage = ref(1);
const itemsPerPage = 9;

// Категории ресурсов
const categories = [
  { id: 'vue', name: 'Vue.js' },
  { id: 'js', name: 'JavaScript' },
  { id: 'html-css', name: 'HTML/CSS' },
  { id: 'tools', name: 'Инструменты' },
  { id: 'design', name: 'UI/UX Дизайн' }
];

// Данные ресурсов (в реальном приложении будут загружаться из API)
const resources = ref([
  {
    id: 1,
    title: 'Официальная документация Vue.js',
    description: 'Полное руководство по Vue.js с примерами и объяснениями основных концепций фреймворка.',
    image: 'https://vuejs.org/images/logo.png',
    category: 'vue',
    type: 'doc',
    url: 'https://vuejs.org/guide/introduction.html',
    date: '2023-03-15',
    views: 5240,
    premium: false
  },
  {
    id: 2,
    title: 'Composition API в Vue 3',
    description: 'Подробное руководство по использованию Composition API в Vue 3 с практическими примерами и советами.',
    image: 'https://vueschool.io/storage/media/4e4754bb5222f5e6f39a87f2f7dff614/vueschool-composition-api.jpg',
    category: 'vue',
    type: 'course',
    url: '#',
    date: '2023-04-02',
    views: 3128,
    premium: true
  },
  {
    id: 3,
    title: 'JavaScript: продвинутые концепции',
    description: 'Изучите продвинутые концепции JavaScript, включая замыкания, прототипы, асинхронное программирование и многое другое.',
    image: 'https://miro.medium.com/max/1200/1*LyZcwuLWv2FArOumCxobpA.png',
    category: 'js',
    type: 'course',
    url: '#',
    date: '2023-02-18',
    views: 4750,
    premium: true
  },
  {
    id: 4,
    title: 'Руководство по Tailwind CSS',
    description: 'Подробное руководство по использованию Tailwind CSS для создания стильного и отзывчивого интерфейса.',
    image: 'https://tailwindcss.com/_next/static/media/tailwindui-small@75.8bb955b2.jpg',
    category: 'html-css',
    type: 'doc',
    url: 'https://tailwindcss.com/docs',
    date: '2023-03-28',
    views: 3580,
    premium: false
  },
  {
    id: 5,
    title: 'Vue Router: полное руководство',
    description: 'Научитесь эффективно использовать Vue Router для создания одностраничных приложений с маршрутизацией.',
    image: 'https://router.vuejs.org/logo.png',
    category: 'vue',
    type: 'tutorial',
    url: 'https://router.vuejs.org/',
    date: '2023-01-25',
    views: 2980,
    premium: false
  },
  {
    id: 6,
    title: 'Интерактивная карта JavaScript',
    description: 'Визуальное руководство по концепциям JavaScript с интерактивными примерами и объяснениями.',
    image: 'https://miro.medium.com/max/1200/1*9AbbVli10NreTXCpiVYLYQ.png',
    category: 'js',
    type: 'interactive',
    url: '#',
    date: '2023-04-10',
    views: 1890,
    premium: false
  },
  {
    id: 7,
    title: 'Мастер-класс по CSS Grid',
    description: 'Полное руководство по CSS Grid Layout с практическими примерами и упражнениями.',
    image: 'https://css-tricks.com/wp-content/uploads/2018/11/grid-tools.jpg',
    category: 'html-css',
    type: 'tutorial',
    url: '#',
    date: '2023-02-05',
    views: 3210,
    premium: false
  },
  {
    id: 8,
    title: 'Работа с Git и GitHub',
    description: 'Руководство по использованию Git и GitHub для эффективного управления версиями кода.',
    image: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    category: 'tools',
    type: 'tutorial',
    url: '#',
    date: '2023-03-01',
    views: 4120,
    premium: false
  },
  {
    id: 9,
    title: 'Оптимизация производительности Vue.js',
    description: 'Советы и методы повышения производительности ваших Vue.js приложений, включая виртуализацию списков и ленивую загрузку.',
    image: 'https://miro.medium.com/max/1200/1*-PlqBEySgC3qK9Io8qcEEw.png',
    category: 'vue',
    type: 'article',
    url: '#',
    date: '2023-04-05',
    views: 2130,
    premium: true
  },
  {
    id: 10,
    title: 'Принципы чистого кода в JavaScript',
    description: 'Изучите принципы написания чистого, поддерживаемого и эффективного JavaScript кода.',
    image: 'https://bs-uploads.toptal.io/blackfish-uploads/components/blog_post_page/content/cover_image_file/cover_image/687289/cover-clean-code-vb-3a6656f5b32158e58c009efdba562f73.png',
    category: 'js',
    type: 'article',
    url: '#',
    date: '2023-01-15',
    views: 5670,
    premium: false
  },
  {
    id: 11,
    title: 'Продвинутая анимация в CSS',
    description: 'Руководство по созданию сложных анимаций с использованием CSS transitions, transforms и animations.',
    image: 'https://miro.medium.com/max/1200/1*iKJx57JU9sKdff-nLoGJbw.jpeg',
    category: 'html-css',
    type: 'tutorial',
    url: '#',
    date: '2023-02-28',
    views: 2960,
    premium: false
  },
  {
    id: 12,
    title: 'Введение в TypeScript',
    description: 'Начните использовать TypeScript для создания более надежных и масштабируемых приложений JavaScript.',
    image: 'https://miro.medium.com/max/1200/1*JsyV8lXMuTbRVLQ2FPYWAg.png',
    category: 'js',
    type: 'course',
    url: '#',
    date: '2023-03-20',
    views: 3850,
    premium: true
  },
  {
    id: 13,
    title: 'Основы Responsive Web Design',
    description: 'Изучите основы адаптивного веб-дизайна и создания сайтов, которые хорошо работают на всех устройствах.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLmfT8T1W2KAi4QvYgKzGZ53jh9XlLtmFq8C1mg7xdHQ&s',
    category: 'html-css',
    type: 'tutorial',
    url: '#',
    date: '2023-01-05',
    views: 4350,
    premium: false
  },
  {
    id: 14,
    title: 'Pinia: новое хранилище для Vue',
    description: 'Изучите Pinia - современную замену Vuex для управления состоянием в приложениях Vue.',
    image: 'https://pinia.vuejs.org/logo.png',
    category: 'vue',
    type: 'tutorial',
    url: 'https://pinia.vuejs.org/',
    date: '2023-04-15',
    views: 1980,
    premium: false
  },
  {
    id: 15,
    title: 'Figma для разработчиков',
    description: 'Руководство для frontend-разработчиков по эффективному использованию Figma для работы с дизайнами.',
    image: 'https://www.vectorlogo.zone/logos/figma/figma-ar21.png',
    category: 'design',
    type: 'tutorial',
    url: '#',
    date: '2023-03-10',
    views: 2720,
    premium: false
  }
]);

// Фильтрация ресурсов
const filteredResources = computed(() => {
  let result = resources.value;
  
  // Применение фильтра по категории
  if (activeCategory.value !== 'all') {
    result = result.filter(resource => resource.category === activeCategory.value);
  }
  
  // Применение поискового запроса
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(resource => 
      resource.title.toLowerCase().includes(query) || 
      resource.description.toLowerCase().includes(query)
    );
  }
  
  // Сортировка результатов
  if (sortBy.value === 'date') {
    result = [...result].sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy.value === 'popularity') {
    result = [...result].sort((a, b) => b.views - a.views);
  } else if (sortBy.value === 'title') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title));
  }
  
  return result;
});

// Вычисление общего количества страниц
const totalPages = computed(() => {
  return Math.ceil(filteredResources.value.length / itemsPerPage);
});

// Получение ресурсов для текущей страницы
const paginatedResources = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredResources.value.slice(startIndex, endIndex);
});

// Форматирование даты
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Получение названия категории по ID
const getCategoryName = (categoryId) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : 'Общее';
};

// Получение класса для типа ресурса
const getResourceTypeClass = (type) => {
  switch (type) {
    case 'doc': return 'text-discord-accent';
    case 'course': return 'text-discord-success';
    case 'tutorial': return 'text-discord-warning';
    case 'article': return 'text-discord-text-light';
    case 'interactive': return 'text-purple-400';
    default: return 'text-discord-text-gray';
  }
};

// Получение метки для типа ресурса
const getResourceTypeLabel = (type) => {
  switch (type) {
    case 'doc': return 'Документация';
    case 'course': return 'Курс';
    case 'tutorial': return 'Руководство';
    case 'article': return 'Статья';
    case 'interactive': return 'Интерактив';
    default: return 'Ресурс';
  }
};

// Сброс фильтров
const resetFilters = () => {
  searchQuery.value = '';
  activeCategory.value = 'all';
  sortBy.value = 'date';
  currentPage.value = 1;
};

// Определение, показывать ли кнопку страницы
const showPageButton = (page) => {
  // Всегда показываем первую и последнюю страницу
  if (page === 1 || page === totalPages.value) return true;
  
  // Показываем страницы рядом с текущей
  if (Math.abs(page - currentPage.value) <= 1) return true;
  
  return false;
};
</script>

<style scoped>
.resources-container {
  max-width: 100%;
  overflow-x: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.resource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style> 