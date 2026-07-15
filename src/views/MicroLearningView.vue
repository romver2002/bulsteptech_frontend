<template>
  <AppLayout>
    <main class="micro-page">
      <section class="micro-hero">
        <div class="hero-copy">
          <div class="eyebrow-row">
            <span class="eyebrow">Focus sprint</span>
            <span class="fresh-badge"><i></i> 5–12 минут</span>
          </div>
          <h1>Микроуроки для <span>быстрого прогресса</span></h1>
          <p>
            Короткая теория, один практический фокус и проверка знаний. Идеально, чтобы сохранить учебный ритм даже в плотный день.
          </p>
          <div class="hero-actions">
            <button type="button" class="primary-button" @click="continueLearning">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z" /></svg>
              Продолжить обучение
            </button>
            <button type="button" class="quiet-button" @click="activeTab = 'completed'">
              История занятий
            </button>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="lesson-orbit orbit-large"></div>
          <div class="lesson-orbit orbit-small"></div>
          <div class="energy-card">
            <span>Сегодня</span>
            <strong>{{ todayProgress }}%</strong>
            <small>учебного фокуса</small>
            <div class="energy-line"><i :style="{ width: todayProgress + '%' }"></i></div>
          </div>
          <div class="floating-chip chip-one"><i></i> Серия {{ learningStreak }} дней</div>
          <div class="floating-chip chip-two">+120 XP</div>
        </div>
      </section>

      <section class="metric-row" aria-label="Статистика микрообучения">
        <article v-for="metric in metrics" :key="metric.label">
          <div class="metric-icon" :class="'tone-' + metric.tone">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="metric.icon" /></svg>
          </div>
          <div>
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
            <small>{{ metric.note }}</small>
          </div>
        </article>
      </section>

      <section class="learning-library" aria-labelledby="library-title">
        <header class="library-heading">
          <div>
            <span class="eyebrow">Learning path</span>
            <h2 id="library-title">Ваши микроуроки</h2>
          </div>
          <div class="tab-list" role="tablist" aria-label="Фильтр уроков">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.id"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
              <span>{{ tab.count }}</span>
            </button>
          </div>
        </header>

        <div v-if="filteredModules.length" class="module-grid">
          <article
            v-for="(module, index) in filteredModules"
            :key="module.id"
            class="module-card"
            :style="{ '--delay': index * 45 + 'ms' }"
          >
            <div class="module-top">
              <div class="module-icon" :class="'tone-' + module.tone">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="module.icon" /></svg>
              </div>
              <div class="module-tags">
                <span>{{ module.level }}</span>
                <span>{{ module.estimatedTime }} мин</span>
              </div>
            </div>

            <div class="module-copy">
              <span class="module-number">Спринт {{ String(module.order).padStart(2, '0') }}</span>
              <h3>{{ module.title }}</h3>
              <p>{{ module.description }}</p>
            </div>

            <div class="module-progress">
              <div>
                <span>{{ module.progress === 100 ? 'Завершено' : module.progress ? 'В процессе' : 'Не начато' }}</span>
                <strong>{{ module.progress }}%</strong>
              </div>
              <div class="progress-track"><i :style="{ width: module.progress + '%' }"></i></div>
            </div>

            <button type="button" class="module-action" @click="openModule(module)">
              <span>{{ module.progress === 100 ? 'Повторить' : module.progress ? 'Продолжить' : 'Начать урок' }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </button>
          </article>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5V4Zm4 4h6M9 12h6M9 16h4" /></svg>
          </div>
          <h3>Завершённых уроков пока нет</h3>
          <p>Первый короткий спринт займёт меньше десяти минут.</p>
          <button type="button" class="primary-button" @click="activeTab = 'all'">Выбрать урок</button>
        </div>
      </section>

      <div v-if="selectedQuiz" class="quiz-modal" role="dialog" aria-modal="true" :aria-labelledby="'quiz-' + selectedModule.id" @click.self="closeQuiz">
        <div class="quiz-dialog">
          <header class="quiz-header">
            <div>
              <span class="eyebrow">Практический спринт</span>
              <h2 :id="'quiz-' + selectedModule.id">{{ selectedModule.title }}</h2>
            </div>
            <button type="button" class="close-button" aria-label="Закрыть урок" @click="closeQuiz">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </header>
          <InteractiveQuiz :key="selectedModule.id" :quiz="selectedQuiz" @complete="completeQuiz" />
        </div>
      </div>
    </main>
  </AppLayout>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { useNotificationStore } from '../stores/notification'

const InteractiveQuiz = defineAsyncComponent(() => import('../components/learning/InteractiveQuiz.vue'))
const notificationStore = useNotificationStore()

const STORAGE_KEY = 'bulsteptech.microProgress'
const activeTab = ref('all')
const selectedModule = ref(null)
const selectedQuiz = ref(null)

const savedProgress = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
})()

const baseModules = [
  {
    id: 'vue-reactivity',
    order: 1,
    title: 'Реактивность Vue 3',
    description: 'Поймите ref, reactive и computed на одном компактном практическом примере.',
    estimatedTime: 8,
    level: 'База',
    progress: 66,
    tone: 'violet',
    icon: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z'
  },
  {
    id: 'pinia-flow',
    order: 2,
    title: 'Чистый поток данных с Pinia',
    description: 'Разложите состояние, getters и actions так, чтобы интерфейс оставался предсказуемым.',
    estimatedTime: 10,
    level: 'Практика',
    progress: 0,
    tone: 'mint',
    icon: 'M5 7h11M5 12h14M5 17h9M18 5l2 2-2 2M16 15l2 2-2 2'
  },
  {
    id: 'css-layout',
    order: 3,
    title: 'Адаптивная сетка без боли',
    description: 'Выберите Grid или Flexbox осознанно и соберите устойчивый карточный layout.',
    estimatedTime: 7,
    level: 'База',
    progress: 50,
    tone: 'blue',
    icon: 'M4 4h7v7H4V4Zm9 0h7v4h-7V4Zm0 6h7v10h-7V10ZM4 13h7v7H4v-7Z'
  },
  {
    id: 'router-guards',
    order: 4,
    title: 'Ролевые маршруты Vue Router',
    description: 'Настройте guard так, чтобы студент и преподаватель всегда попадали в нужный контекст.',
    estimatedTime: 12,
    level: 'Продвинутый',
    progress: 100,
    tone: 'amber',
    icon: 'M5 6h11M13 3l3 3-3 3M19 18H8M11 15l-3 3 3 3'
  }
]

const modules = ref(baseModules.map((module) => ({
  ...module,
  ...(savedProgress[module.id] || {})
})))

const quizzes = {
  'vue-reactivity': {
    title: 'Реактивность Vue 3',
    questions: [
      {
        question: 'Что создаёт реактивную ссылку на примитивное значение?',
        options: ['ref()', 'computed()', 'watch()', 'provide()'],
        correctAnswer: 0,
        explanation: 'ref() оборачивает значение и предоставляет его через свойство value.'
      },
      {
        question: 'Когда лучше использовать computed?',
        options: ['Для производного кэшируемого значения', 'Для запроса к API', 'Для маршрута', 'Для CSS-анимации'],
        correctAnswer: 0,
        explanation: 'Computed пересчитывается только при изменении своих реактивных зависимостей.'
      }
    ]
  },
  'pinia-flow': {
    title: 'Поток данных Pinia',
    questions: [
      {
        question: 'Где размещать операцию, которая изменяет несколько полей store?',
        options: ['В action', 'В getter', 'В template', 'В router meta'],
        correctAnswer: 0,
        explanation: 'Action объединяет изменение состояния в понятную бизнес-операцию.'
      },
      {
        question: 'Getter в Pinia ближе всего к…',
        options: ['computed', 'watchEffect', 'emit', 'middleware'],
        correctAnswer: 0
      }
    ]
  },
  'css-layout': {
    title: 'Адаптивные сетки',
    questions: [
      {
        question: 'Какой инструмент лучше для двумерной сетки карточек?',
        options: ['CSS Grid', 'Float', 'Position absolute', 'Inline-block'],
        correctAnswer: 0
      },
      {
        question: 'Что делает minmax(0, 1fr) устойчивым в grid?',
        options: ['Разрешает колонке сжиматься', 'Фиксирует ширину', 'Отключает gap', 'Скрывает overflow'],
        correctAnswer: 0
      }
    ]
  },
  'router-guards': {
    title: 'Ролевые маршруты',
    questions: [
      {
        question: 'Где централизованно проверять доступ к маршрутам?',
        options: ['В beforeEach guard', 'В каждом CSS-файле', 'В localStorage event', 'В transition'],
        correctAnswer: 0
      },
      {
        question: 'Что важно сделать при недоступной роли?',
        options: ['Вернуть безопасный маршрут', 'Оставить пустой экран', 'Удалить пользователя', 'Перезагрузить бесконечно'],
        correctAnswer: 0
      }
    ]
  }
}

const tabs = computed(() => [
  { id: 'all', name: 'Все', count: modules.value.length },
  { id: 'in-progress', name: 'В процессе', count: modules.value.filter((module) => module.progress > 0 && module.progress < 100).length },
  { id: 'completed', name: 'Завершены', count: modules.value.filter((module) => module.progress === 100).length }
])

const filteredModules = computed(() => {
  if (activeTab.value === 'in-progress') {
    return modules.value.filter((module) => module.progress > 0 && module.progress < 100)
  }
  if (activeTab.value === 'completed') {
    return modules.value.filter((module) => module.progress === 100)
  }
  return modules.value
})

const completedCount = computed(() => modules.value.filter((module) => module.progress === 100).length)
const averageProgress = computed(() => Math.round(
  modules.value.reduce((total, module) => total + module.progress, 0) / modules.value.length
))
const todayProgress = computed(() => Math.min(100, Math.max(24, averageProgress.value)))
const learningStreak = computed(() => 12 + completedCount.value)
const metrics = computed(() => [
  { label: 'Средний прогресс', value: averageProgress.value + '%', note: '+9% за неделю', tone: 'violet', icon: 'M4 19V9m6 10V5m6 14v-7m4 7H2' },
  { label: 'Завершено', value: completedCount.value + ' / ' + modules.value.length, note: 'микроуроков', tone: 'mint', icon: 'M5 12l4 4L19 6' },
  { label: 'Учебная серия', value: learningStreak.value + ' дней', note: 'личный рекорд', tone: 'amber', icon: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z' }
])

const persistProgress = () => {
  const payload = Object.fromEntries(modules.value.map((module) => [
    module.id,
    { progress: module.progress, completedAt: module.completedAt, score: module.score }
  ]))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

const openModule = (module) => {
  selectedModule.value = module
  selectedQuiz.value = quizzes[module.id]
}

const continueLearning = () => {
  const nextModule = modules.value.find((module) => module.progress > 0 && module.progress < 100)
    || modules.value.find((module) => module.progress < 100)
    || modules.value[0]
  openModule(nextModule)
}

const closeQuiz = () => {
  selectedQuiz.value = null
  selectedModule.value = null
}

const completeQuiz = (result) => {
  const module = modules.value.find((item) => item.id === selectedModule.value.id)
  if (module) {
    module.progress = 100
    module.score = result.score
    module.completedAt = new Date().toISOString()
    persistProgress()
  }
  notificationStore.success('Спринт завершён: ' + result.score + ' из ' + result.total)
  closeQuiz()
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && selectedQuiz.value) closeQuiz()
}

onMounted(() => document.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => document.removeEventListener('keydown', handleEscape))
</script>

<style scoped>
.micro-page {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: clamp(20px, 3vw, 42px);
  color: var(--text-primary);
}

.micro-hero {
  position: relative;
  display: grid;
  min-height: 420px;
  grid-template-columns: minmax(0, 1.15fr) minmax(330px, 0.85fr);
  align-items: center;
  gap: clamp(28px, 5vw, 80px);
  overflow: hidden;
  padding: clamp(32px, 5vw, 70px);
  border: 1px solid rgba(157, 141, 255, 0.16);
  border-radius: 28px;
  background:
    radial-gradient(circle at 72% 22%, rgba(124, 58, 237, 0.19), transparent 29%),
    radial-gradient(circle at 88% 90%, rgba(14, 165, 233, 0.11), transparent 30%),
    linear-gradient(135deg, #171625, #101725 58%, #0c1718);
  box-shadow: var(--shadow-panel);
}

.micro-hero::after {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image: linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: linear-gradient(90deg, black, transparent);
  content: '';
  pointer-events: none;
}

.hero-copy,
.hero-visual {
  position: relative;
  z-index: 1;
}

.eyebrow-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.eyebrow {
  color: #a99aff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.fresh-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 8px;
  border: 1px solid rgba(83, 210, 165, 0.2);
  border-radius: 999px;
  color: #8be2c1;
  background: rgba(6, 78, 59, 0.14);
  font-size: 9px;
  font-weight: 750;
}

.fresh-badge i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #53d2a5;
  box-shadow: 0 0 8px rgba(83, 210, 165, 0.7);
}

.hero-copy h1 {
  max-width: 760px;
  margin: 15px 0;
  font-size: clamp(34px, 5vw, 66px);
  font-weight: 810;
  letter-spacing: -0.065em;
  line-height: 0.98;
}

.hero-copy h1 span {
  color: transparent;
  background: linear-gradient(100deg, #b3a7ff, #6ed9b4);
  background-clip: text;
}

.hero-copy > p {
  max-width: 660px;
  margin: 0;
  color: #9299a9;
  font-size: 14px;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
}

.primary-button,
.quiet-button,
.module-action {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border-radius: 13px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 750;
  transition: transform 160ms ease, border-color 160ms ease, background-color 160ms ease, box-shadow 160ms ease;
}

.primary-button {
  padding: 0 18px;
  border: 1px solid rgba(196, 181, 253, 0.28);
  color: #fff;
  background: linear-gradient(135deg, #765ee6, #5841c2);
  box-shadow: 0 14px 32px rgba(69, 48, 167, 0.3);
}

.primary-button svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
}

.quiet-button {
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #bbc1ce;
  background: rgba(255, 255, 255, 0.035);
}

.primary-button:hover,
.quiet-button:hover,
.module-action:hover {
  transform: translateY(-2px);
}

.hero-visual {
  display: grid;
  min-height: 300px;
  place-items: center;
}

.lesson-orbit {
  position: absolute;
  border: 1px solid rgba(169, 154, 255, 0.18);
  border-radius: 50%;
}

.orbit-large {
  width: 330px;
  height: 330px;
  border-style: dashed;
  animation: orbit-spin 34s linear infinite;
}

.orbit-small {
  width: 238px;
  height: 238px;
}

.energy-card {
  position: relative;
  z-index: 2;
  display: flex;
  width: 210px;
  height: 210px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px solid rgba(196, 181, 253, 0.23);
  border-radius: 62px;
  background: linear-gradient(145deg, rgba(118, 94, 230, 0.6), rgba(30, 64, 175, 0.5));
  box-shadow: 0 34px 80px rgba(30, 27, 75, 0.45), inset 0 1px rgba(255, 255, 255, 0.23);
  transform: rotate(4deg);
}

.energy-card span,
.energy-card small {
  color: #d6d3e4;
  font-size: 10px;
  font-weight: 700;
}

.energy-card strong {
  margin: 4px 0;
  color: #fff;
  font-size: 50px;
  letter-spacing: -0.06em;
}

.energy-line {
  width: 112px;
  height: 5px;
  margin-top: 14px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.32);
}

.energy-line i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #a78bfa, #6ee7b7);
}

.floating-chip {
  position: absolute;
  z-index: 3;
  padding: 9px 11px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  color: #d8deea;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(14px);
  font-size: 10px;
  font-weight: 750;
  box-shadow: 0 15px 35px rgba(2, 6, 23, 0.28);
}

.chip-one {
  top: 12%;
  left: 2%;
}

.chip-one i {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: #fbbf24;
}

.chip-two {
  right: 2%;
  bottom: 14%;
  color: #8be2c1;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 14px 0;
}

.metric-row article {
  display: flex;
  min-height: 108px;
  align-items: center;
  gap: 14px;
  padding: 17px;
  border: 1px solid var(--border-subtle);
  border-radius: 19px;
  background: rgba(255, 255, 255, 0.025);
}

.metric-icon,
.module-icon {
  display: grid;
  flex: none;
  place-items: center;
}

.metric-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
}

.metric-icon svg,
.module-icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tone-violet { color: #b0a2ff; background: rgba(124, 92, 230, 0.12); }
.tone-mint { color: #72dcb6; background: rgba(83, 210, 165, 0.1); }
.tone-amber { color: #efc987; background: rgba(232, 187, 113, 0.11); }
.tone-blue { color: #88bdf4; background: rgba(86, 153, 232, 0.11); }

.metric-row span,
.metric-row strong,
.metric-row small {
  display: block;
}

.metric-row span {
  color: var(--text-muted);
  font-size: 10px;
}

.metric-row strong {
  margin-top: 3px;
  font-size: 22px;
  letter-spacing: -0.04em;
}

.metric-row small {
  margin-top: 2px;
  color: #697181;
  font-size: 9px;
}

.learning-library {
  padding: clamp(22px, 3vw, 34px);
  border: 1px solid var(--border-subtle);
  border-radius: 24px;
  background: rgba(10, 13, 21, 0.6);
}

.library-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.library-heading h2 {
  margin: 5px 0 0;
  font-size: clamp(22px, 3vw, 32px);
  letter-spacing: -0.04em;
}

.tab-list {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--border-subtle);
  border-radius: 13px;
  background: rgba(2, 6, 23, 0.3);
}

.tab-list button {
  min-height: 35px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  color: #7d8595;
  background: transparent;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
}

.tab-list button.active {
  color: #fff;
  background: rgba(124, 92, 230, 0.21);
}

.tab-list button span {
  margin-left: 4px;
  color: #636c7c;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.module-card {
  display: flex;
  min-height: 330px;
  flex-direction: column;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.065);
  border-radius: 19px;
  background:
    radial-gradient(circle at 95% 0, rgba(124, 92, 230, 0.08), transparent 28%),
    rgba(255, 255, 255, 0.024);
  animation: card-in 360ms both;
  animation-delay: var(--delay);
  transition: border-color 170ms ease, background-color 170ms ease, transform 170ms ease;
}

.module-card:hover {
  border-color: rgba(169, 154, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.038);
  transform: translateY(-3px);
}

.module-top,
.module-progress > div:first-child,
.module-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.module-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
}

.module-tags {
  display: flex;
  gap: 6px;
}

.module-tags span {
  padding: 4px 7px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 7px;
  color: #747c8c;
  background: rgba(255, 255, 255, 0.025);
  font-size: 8px;
  font-weight: 700;
}

.module-copy {
  margin: 23px 0 18px;
}

.module-number {
  color: #8776df;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.module-copy h3 {
  margin: 7px 0;
  font-size: 20px;
  letter-spacing: -0.035em;
}

.module-copy p {
  margin: 0;
  color: #858d9d;
  font-size: 11px;
  line-height: 1.65;
}

.module-progress {
  margin-top: auto;
}

.module-progress span,
.module-progress strong {
  color: #727b8c;
  font-size: 9px;
  font-weight: 700;
}

.module-progress strong {
  color: #a99aff;
  font-variant-numeric: tabular-nums;
}

.progress-track {
  height: 5px;
  margin-top: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.55);
}

.progress-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #765ee6, #62d3aa);
}

.module-action {
  width: 100%;
  min-height: 43px;
  margin-top: 17px;
  padding: 0 12px;
  border: 1px solid rgba(169, 154, 255, 0.14);
  color: #cbc5ef;
  background: rgba(124, 92, 230, 0.08);
}

.module-action svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
}

.empty-state {
  display: flex;
  min-height: 330px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  border-radius: 20px;
  color: #a99aff;
  background: rgba(124, 92, 230, 0.1);
}

.empty-icon svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
}

.empty-state h3 {
  margin: 15px 0 5px;
}

.empty-state p {
  margin: 0 0 18px;
  color: var(--text-muted);
  font-size: 11px;
}

.quiz-modal {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 20px;
  background: rgba(2, 4, 9, 0.82);
  backdrop-filter: blur(16px);
}

.quiz-dialog {
  width: min(100%, 820px);
  max-height: min(900px, calc(100dvh - 40px));
  overflow-y: auto;
  padding: 24px;
  border: 1px solid rgba(169, 154, 255, 0.2);
  border-radius: 22px;
  background: #111521;
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.6);
  animation: dialog-in 200ms ease both;
}

.quiz-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.quiz-header h2 {
  margin: 5px 0 0;
  font-size: 23px;
}

.close-button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 11px;
  color: #8e96a6;
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
}

.close-button svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
}

:deep(.quiz-container) {
  padding: 0;
  background: transparent;
}

:deep(.quiz-container .option) {
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 12px;
}

button:focus-visible {
  outline: 2px solid #a99aff;
  outline-offset: 2px;
}

@keyframes orbit-spin {
  to { transform: rotate(360deg); }
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(10px); }
}

@keyframes dialog-in {
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
}

@media (max-width: 980px) {
  .micro-hero {
    grid-template-columns: 1fr;
  }

  .hero-visual {
    min-height: 320px;
  }
}

@media (max-width: 720px) {
  .micro-page {
    padding: 14px;
  }

  .micro-hero {
    padding: 28px 20px;
    border-radius: 21px;
  }

  .metric-row,
  .module-grid {
    grid-template-columns: 1fr;
  }

  .library-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .tab-list {
    overflow-x: auto;
  }

  .tab-list button {
    flex: 1 0 auto;
  }

  .quiz-dialog {
    padding: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-large,
  .module-card,
  .quiz-dialog {
    animation: none;
  }

  .primary-button,
  .quiet-button,
  .module-card,
  .module-action {
    transition: none;
  }
}
</style>
