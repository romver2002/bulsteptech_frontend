<template>
  <section class="resources-view mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
    <header class="library-hero relative overflow-hidden rounded-[2rem] border border-white/[0.08] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
      <div class="hero-orb hero-orb--one" aria-hidden="true" />
      <div class="hero-orb hero-orb--two" aria-hidden="true" />
      <div class="hero-lines pointer-events-none absolute inset-0" aria-hidden="true" />

      <div class="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
            <span class="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_9px_rgba(103,232,249,.9)]" />
            Библиотека знаний
          </div>
          <h1 class="text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
            Всё нужное для следующего
            <span class="hero-title-gradient">шага.</span>
          </h1>
          <p class="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            Отобранные материалы по разработке и дизайну: документация, интерактивные руководства и практические курсы.
          </p>
        </div>

        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <div v-for="metric in libraryMetrics" :key="metric.label" class="hero-metric min-w-20 rounded-2xl border border-white/[0.07] bg-black/15 px-3 py-3 text-center sm:min-w-24 sm:px-4">
            <p class="text-xl font-black tracking-tight text-white sm:text-2xl">{{ metric.value }}</p>
            <p class="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{{ metric.label }}</p>
          </div>
        </div>
      </div>
    </header>

    <div class="sticky-toolbar sticky top-0 z-20 -mx-1 mt-5 rounded-2xl border border-white/[0.07] bg-[#0a101c]/90 p-3 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-4">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label class="search-control group relative flex min-w-0 flex-1 items-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 focus-within:border-cyan-300/35 focus-within:ring-4 focus-within:ring-cyan-300/[0.06] xl:max-w-md">
          <svg class="h-5 w-5 flex-none text-slate-600 transition-colors group-focus-within:text-cyan-300" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4a7 7 0 100 14 7 7 0 000-14zm5 12l4 4" /></svg>
          <input
            v-model="searchQuery"
            type="search"
            class="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-white outline-none placeholder:text-slate-600"
            placeholder="Название, тема или формат..."
            aria-label="Поиск материалов"
          >
          <kbd class="hidden rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-slate-600 sm:block">⌘ K</kbd>
        </label>

        <div class="category-scroll flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 xl:pb-0">
          <button
            v-for="category in categoryOptions"
            :key="category.id"
            class="category-pill flex-none rounded-xl border px-3.5 py-2.5 text-xs font-bold transition"
            :class="activeCategory === category.id ? 'category-pill--active' : 'category-pill--idle'"
            :aria-pressed="activeCategory === category.id"
            @click="activeCategory = category.id"
          >
            {{ category.name }}
            <span class="ml-1.5 text-[10px] opacity-55">{{ category.count }}</span>
          </button>
        </div>

        <label class="sort-control relative flex h-12 flex-none items-center rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h12M8 12h8M8 18h4M4 5v14m0 0l-2-2m2 2l2-2" /></svg>
          <select v-model="sortBy" class="h-full cursor-pointer appearance-none bg-transparent pl-2 pr-6 text-xs font-bold text-slate-300 outline-none" aria-label="Сортировка материалов">
            <option class="bg-slate-900" value="date">Сначала новые</option>
            <option class="bg-slate-900" value="popularity">По популярности</option>
            <option class="bg-slate-900" value="title">По названию</option>
          </select>
          <svg class="pointer-events-none absolute right-3 h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9l5 5 5-5" /></svg>
        </label>
      </div>
    </div>

    <div class="mb-4 mt-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/70">Коллекция</p>
        <h2 class="mt-1 text-2xl font-black tracking-[-0.025em] text-white">{{ activeCategoryName }}</h2>
      </div>
      <p class="text-xs font-medium text-slate-500">
        Показано {{ paginatedResources.length }} из {{ filteredResources.length }}
      </p>
    </div>

    <div v-if="paginatedResources.length" class="resources-grid grid gap-4 xl:gap-5">
      <article
        v-for="(resource, index) in paginatedResources"
        :key="resource.id"
        class="resource-card group relative flex min-w-0 flex-col overflow-hidden rounded-[1.45rem] border border-white/[0.075] bg-[#0e1625]/88 shadow-lg shadow-black/10"
        :style="{ animationDelay: `${Math.min(index, 5) * 45}ms` }"
      >
        <div class="resource-cover relative h-44 overflow-hidden" :style="coverStyle(resource.category)">
          <div class="cover-grid absolute inset-0 opacity-20" aria-hidden="true" />
          <div class="cover-halo absolute -right-12 -top-16 h-48 w-48 rounded-full" aria-hidden="true" />
          <div class="cover-ring absolute -bottom-16 -left-12 h-40 w-40 rounded-full border-[18px] border-white/[0.07]" aria-hidden="true" />
          <div class="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span class="cover-monogram select-none text-7xl font-black tracking-[-0.09em] text-white/[0.92]">{{ resource.mark }}</span>
          </div>
          <div class="absolute left-4 top-4 flex items-center gap-2">
            <span class="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/85 backdrop-blur-md">
              {{ getCategoryName(resource.category) }}
            </span>
            <span v-if="resource.premium" class="rounded-full border border-amber-300/25 bg-amber-300/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-100 backdrop-blur-md">pro</span>
          </div>
          <button
            class="bookmark-button absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-black/25 text-white/70 backdrop-blur-md transition hover:bg-black/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            :class="{ 'bookmark-button--active': isBookmarked(resource.id) }"
            :aria-label="isBookmarked(resource.id) ? 'Убрать из сохранённых' : 'Сохранить материал'"
            :aria-pressed="isBookmarked(resource.id)"
            @click="toggleBookmark(resource)"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v17l-5-3-5 3V4z" /></svg>
          </button>
          <div class="cover-sheen absolute inset-0" aria-hidden="true" />
        </div>

        <div class="flex flex-1 flex-col p-5">
          <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            <span :class="typeColor(resource.type)">{{ typeLabel(resource.type) }}</span>
            <span class="h-1 w-1 rounded-full bg-slate-700" />
            <span>{{ resource.duration }}</span>
          </div>
          <h3 class="mt-3 text-lg font-black leading-snug tracking-[-0.02em] text-white transition-colors group-hover:text-cyan-100">{{ resource.title }}</h3>
          <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{{ resource.description }}</p>

          <div class="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-4 text-[11px] font-medium text-slate-500">
            <span class="flex items-center gap-1.5">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6zm8 2.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /></svg>
              {{ formatViews(resource.views) }}
            </span>
            <span>{{ formatDate(resource.date) }}</span>
          </div>

          <button
            class="open-resource mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] text-xs font-bold text-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            @click="openResource(resource)"
          >
            Открыть материал
            <svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5m0-5l-8 8M18 13v6H5V6h6" /></svg>
          </button>
        </div>
      </article>
    </div>

    <div v-else class="rounded-[2rem] border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-16 text-center">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-300">
        <svg class="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4a7 7 0 100 14 7 7 0 000-14zm5 12l4 4M8.5 9.5l5 5m0-5l-5 5" /></svg>
      </div>
      <h3 class="mt-5 text-xl font-black text-white">Материалы не найдены</h3>
      <p class="mx-auto mt-2 max-w-md text-sm text-slate-500">Попробуйте другой запрос или вернитесь ко всей коллекции.</p>
      <button class="mt-5 rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-cyan-200" @click="resetFilters">Сбросить фильтры</button>
    </div>

    <nav v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2" aria-label="Пагинация материалов">
      <button class="page-button" :disabled="currentPage === 1" aria-label="Предыдущая страница" @click="currentPage--">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        class="page-button text-xs font-black"
        :class="{ 'page-button--active': currentPage === page }"
        :aria-current="currentPage === page ? 'page' : undefined"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
      <button class="page-button" :disabled="currentPage === totalPages" aria-label="Следующая страница" @click="currentPage++">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </nav>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useNotificationStore } from '../../stores/notification'

const notificationStore = useNotificationStore()
const searchQuery = ref('')
const activeCategory = ref('all')
const sortBy = ref('date')
const currentPage = ref(1)
const itemsPerPage = 6

const palettes = {
  vue: ['#34d399', '#4f46e5'],
  js: ['#facc15', '#f97316'],
  'html-css': ['#38bdf8', '#7c3aed'],
  tools: ['#fb7185', '#8b5cf6'],
  design: ['#c084fc', '#06b6d4']
}

const categories = [
  { id: 'vue', name: 'Vue.js' },
  { id: 'js', name: 'JavaScript' },
  { id: 'html-css', name: 'HTML/CSS' },
  { id: 'tools', name: 'Инструменты' },
  { id: 'design', name: 'UI/UX' }
]

const resources = [
  { id: 1, title: 'Vue.js: фундамент современного интерфейса', description: 'Официальное введение в реактивность, компоненты и декларативный рендеринг Vue.', mark: 'V', category: 'vue', type: 'doc', duration: '35 мин', url: 'https://vuejs.org/guide/introduction.html', date: '2026-07-12', views: 8240, premium: false },
  { id: 2, title: 'Composition API без магии', description: 'Как проектировать переиспользуемую логику и сохранять компоненты понятными.', mark: 'CA', category: 'vue', type: 'guide', duration: '42 мин', url: 'https://vuejs.org/guide/extras/composition-api-faq.html', date: '2026-07-10', views: 6128, premium: true },
  { id: 3, title: 'JavaScript: продвинутые концепции', description: 'Замыкания, прототипы, асинхронность и модель выполнения языка на практике.', mark: 'JS', category: 'js', type: 'course', duration: '2.4 ч', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', date: '2026-07-08', views: 9750, premium: true },
  { id: 4, title: 'Tailwind CSS: системный подход', description: 'Создавайте интерфейсы быстрее с токенами, вариантами и адаптивными состояниями.', mark: 'TW', category: 'html-css', type: 'doc', duration: '55 мин', url: 'https://tailwindcss.com/docs', date: '2026-07-06', views: 7580, premium: false },
  { id: 5, title: 'Vue Router: маршрутизация продукта', description: 'Вложенные маршруты, guards, data fetching и плавные переходы между экранами.', mark: 'VR', category: 'vue', type: 'guide', duration: '48 мин', url: 'https://router.vuejs.org/', date: '2026-07-03', views: 4980, premium: false },
  { id: 6, title: 'Интерактивная карта JavaScript', description: 'Визуальный маршрут по языку с примерами, задачами и объяснениями.', mark: '{}', category: 'js', type: 'interactive', duration: '3.1 ч', url: 'https://javascript.info/', date: '2026-06-29', views: 11890, premium: false },
  { id: 7, title: 'CSS Grid: макеты без компромиссов', description: 'Современные сетки, auto-fit, minmax и контейнерный подход к адаптивности.', mark: '#', category: 'html-css', type: 'guide', duration: '1.2 ч', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout', date: '2026-06-26', views: 6210, premium: false },
  { id: 8, title: 'Git: уверенная работа с историей', description: 'Коммиты, ветки, rebase и совместная разработка без страха потерять изменения.', mark: 'G', category: 'tools', type: 'doc', duration: '1.6 ч', url: 'https://git-scm.com/docs', date: '2026-06-22', views: 8420, premium: false },
  { id: 9, title: 'Производительность Vue на практике', description: 'Профилирование, code splitting, виртуализация и контроль реактивных обновлений.', mark: '⚡', category: 'vue', type: 'article', duration: '28 мин', url: 'https://vuejs.org/guide/best-practices/performance.html', date: '2026-06-18', views: 7130, premium: true },
  { id: 10, title: 'Чистый JavaScript для больших команд', description: 'Практики именования, декомпозиции и поддержки понятной кодовой базы.', mark: '</>', category: 'js', type: 'article', duration: '31 мин', url: 'https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript', date: '2026-06-14', views: 8890, premium: false },
  { id: 11, title: 'CSS-анимации с характером', description: 'Плавные переходы, keyframes и motion-дизайн без потери производительности.', mark: '↝', category: 'html-css', type: 'guide', duration: '46 мин', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations', date: '2026-06-09', views: 5960, premium: false },
  { id: 12, title: 'TypeScript: надёжный фронтенд', description: 'Типизация приложений, generics, narrowing и проектирование контрактов.', mark: 'TS', category: 'js', type: 'course', duration: '2.8 ч', url: 'https://www.typescriptlang.org/docs/', date: '2026-06-04', views: 7850, premium: true },
  { id: 13, title: 'Responsive design сегодня', description: 'Адаптивная типографика, container queries и интерфейсы для любых экранов.', mark: 'RWD', category: 'html-css', type: 'course', duration: '1.9 ч', url: 'https://web.dev/learn/design/', date: '2026-05-28', views: 7350, premium: false },
  { id: 14, title: 'Pinia: состояние без лишнего шума', description: 'Stores, getters, actions и устойчивые паттерны для приложений Vue.', mark: 'P', category: 'vue', type: 'guide', duration: '52 мин', url: 'https://pinia.vuejs.org/', date: '2026-05-21', views: 4980, premium: false },
  { id: 15, title: 'Figma для разработчиков', description: 'Dev Mode, компоненты, переменные и точная передача дизайна в код.', mark: 'F', category: 'design', type: 'guide', duration: '1.1 ч', url: 'https://help.figma.com/hc/en-us/categories/360002042553-Figma-Design', date: '2026-05-16', views: 6720, premium: false }
]

const storedBookmarks = (() => {
  try { return JSON.parse(localStorage.getItem('resourceBookmarks') || '[]') }
  catch { return [] }
})()
const bookmarks = ref(new Set(storedBookmarks))

const categoryOptions = computed(() => [
  { id: 'all', name: 'Все', count: resources.length },
  ...categories.map((category) => ({ ...category, count: resources.filter((resource) => resource.category === category.id).length }))
])

const activeCategoryName = computed(() => (
  activeCategory.value === 'all'
    ? 'Все материалы'
    : categories.find((category) => category.id === activeCategory.value)?.name || 'Материалы'
))

const libraryMetrics = computed(() => [
  { value: resources.length, label: 'материалов' },
  { value: categories.length, label: 'направлений' },
  { value: bookmarks.value.size, label: 'сохранено' }
])

const filteredResources = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('ru-RU')
  let result = activeCategory.value === 'all'
    ? resources
    : resources.filter((resource) => resource.category === activeCategory.value)

  if (query) {
    result = result.filter((resource) => `${resource.title} ${resource.description} ${typeLabel(resource.type)}`.toLocaleLowerCase('ru-RU').includes(query))
  }

  return [...result].sort((a, b) => {
    if (sortBy.value === 'popularity') return b.views - a.views
    if (sortBy.value === 'title') return a.title.localeCompare(b.title, 'ru')
    return new Date(b.date) - new Date(a.date)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredResources.value.length / itemsPerPage)))
const paginatedResources = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredResources.value.slice(start, start + itemsPerPage)
})

watch([searchQuery, activeCategory, sortBy], () => { currentPage.value = 1 })
watch(totalPages, (pages) => { if (currentPage.value > pages) currentPage.value = pages })

function coverStyle(category) {
  const [accent, secondary] = palettes[category] || palettes.vue
  return { '--cover-accent': accent, '--cover-secondary': secondary }
}

function getCategoryName(categoryId) {
  return categories.find((category) => category.id === categoryId)?.name || 'Общее'
}

function typeLabel(type) {
  return ({ doc: 'Документация', course: 'Курс', guide: 'Руководство', article: 'Статья', interactive: 'Интерактив' })[type] || 'Материал'
}

function typeColor(type) {
  return ({ doc: 'text-cyan-300', course: 'text-fuchsia-300', guide: 'text-emerald-300', article: 'text-amber-300', interactive: 'text-violet-300' })[type] || 'text-slate-400'
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(dateString))
}

function formatViews(views) {
  return new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 }).format(views)
}

function isBookmarked(resourceId) {
  return bookmarks.value.has(resourceId)
}

function toggleBookmark(resource) {
  const nextBookmarks = new Set(bookmarks.value)
  if (nextBookmarks.has(resource.id)) {
    nextBookmarks.delete(resource.id)
    notificationStore.info(`«${resource.title}» удалён из сохранённых`)
  } else {
    nextBookmarks.add(resource.id)
    notificationStore.success(`«${resource.title}» сохранён`)
  }
  bookmarks.value = nextBookmarks
  localStorage.setItem('resourceBookmarks', JSON.stringify([...nextBookmarks]))
}

function openResource(resource) {
  window.open(resource.url, '_blank', 'noopener,noreferrer')
  notificationStore.info(`Открываем «${resource.title}»`, 'Материал')
}

function resetFilters() {
  searchQuery.value = ''
  activeCategory.value = 'all'
  sortBy.value = 'date'
  currentPage.value = 1
}
</script>

<style scoped>
.library-hero { background: linear-gradient(125deg, rgba(14, 23, 40, .97), rgba(15, 23, 42, .92) 54%, rgba(17, 24, 39, .96)); }
.hero-title-gradient { color: transparent; background: linear-gradient(95deg, #67e8f9, #818cf8 54%, #f0abfc); background-clip: text; }
.hero-orb { position: absolute; border-radius: 999px; opacity: .16; }
.hero-orb--one { right: 12%; top: -13rem; width: 28rem; height: 28rem; background: radial-gradient(circle, #22d3ee, transparent 68%); }
.hero-orb--two { bottom: -16rem; left: 24%; width: 25rem; height: 25rem; background: radial-gradient(circle, #8b5cf6, transparent 68%); }
.hero-lines { background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px); background-size: 38px 38px; mask-image: linear-gradient(90deg, black, transparent 78%); }
.hero-metric { transition: transform 170ms ease, border-color 170ms ease, background-color 170ms ease; }
.hero-metric:hover { transform: translateY(-2px); border-color: rgba(103,232,249,.17); background: rgba(255,255,255,.045); }

.sticky-toolbar { top: .75rem; }
.search-control svg,
.sort-control svg,
.bookmark-button svg,
.open-resource svg,
.resource-card svg,
.page-button svg { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
.category-scroll { scrollbar-width: none; }
.category-scroll::-webkit-scrollbar { display: none; }
.category-pill--idle { border-color: rgba(255,255,255,.07); background: rgba(255,255,255,.025); color: rgb(100 116 139); }
.category-pill--idle:hover { border-color: rgba(255,255,255,.13); background: rgba(255,255,255,.05); color: rgb(226 232 240); }
.category-pill--active { border-color: rgba(103,232,249,.28); background: linear-gradient(110deg, rgba(34,211,238,.16), rgba(99,102,241,.15)); color: rgb(207 250 254); box-shadow: inset 0 1px 0 rgba(255,255,255,.05); }

.resources-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr)); }
.resource-card { content-visibility: auto; contain-intrinsic-size: 420px; animation: card-in 420ms cubic-bezier(.2,.8,.2,1) both; transition: transform 190ms ease, border-color 190ms ease, box-shadow 190ms ease; }
.resource-card:hover { transform: translateY(-5px); border-color: color-mix(in srgb, var(--cover-accent) 34%, transparent); box-shadow: 0 24px 60px rgba(2,6,23,.32); }
.resource-cover { background: linear-gradient(135deg, color-mix(in srgb, var(--cover-accent) 88%, #0f172a), color-mix(in srgb, var(--cover-secondary) 78%, #111827)); }
.cover-grid { background-image: linear-gradient(rgba(255,255,255,.32) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.32) 1px, transparent 1px); background-size: 26px 26px; transform: perspective(420px) rotateX(58deg) scale(1.4) translateY(26%); }
.cover-halo { background: radial-gradient(circle, rgba(255,255,255,.34), transparent 68%); }
.cover-monogram { text-shadow: 0 12px 35px rgba(15,23,42,.3); transition: transform 450ms cubic-bezier(.2,.8,.2,1), text-shadow 450ms ease; }
.resource-card:hover .cover-monogram { transform: translateY(-3px) scale(1.055); text-shadow: 0 20px 45px rgba(15,23,42,.38); }
.cover-sheen { background: linear-gradient(115deg, transparent 28%, rgba(255,255,255,.2), transparent 66%); transform: translateX(-120%); transition: transform 700ms ease; }
.resource-card:hover .cover-sheen { transform: translateX(120%); }
.bookmark-button--active { border-color: rgba(255,255,255,.35); background: rgba(255,255,255,.92); color: #0f172a; }
.bookmark-button--active svg { fill: currentColor; }
.open-resource:hover { border-color: color-mix(in srgb, var(--cover-accent) 32%, transparent); background: linear-gradient(110deg, color-mix(in srgb, var(--cover-accent) 14%, transparent), color-mix(in srgb, var(--cover-secondary) 11%, transparent)); color: white; }

.page-button { display: flex; height: 2.65rem; min-width: 2.65rem; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,.075); border-radius: .8rem; background: rgba(255,255,255,.03); color: rgb(100 116 139); transition: color 150ms ease, border-color 150ms ease, background-color 150ms ease, transform 150ms ease; }
.page-button:hover:not(:disabled) { transform: translateY(-1px); border-color: rgba(103,232,249,.22); background: rgba(255,255,255,.06); color: white; }
.page-button:disabled { cursor: not-allowed; opacity: .35; }
.page-button--active { border-color: rgba(103,232,249,.35); background: linear-gradient(145deg, rgba(34,211,238,.2), rgba(99,102,241,.2)); color: rgb(207 250 254); }
.page-button svg { width: 1rem; height: 1rem; }

@keyframes card-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 639px) {
  .sticky-toolbar { position: relative; top: auto; }
  .resource-cover { height: 10rem; }
}

@media (prefers-reduced-motion: reduce) {
  .resource-card { animation: none; }
  .resource-card,
  .cover-monogram,
  .cover-sheen,
  .hero-metric { transition-duration: 1ms !important; }
}
</style>
