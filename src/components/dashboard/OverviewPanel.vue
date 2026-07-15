<template>
  <section class="overview-panel page-shell page-shell--wide">
    <header class="overview-heading">
      <div>
        <p class="page-eyebrow">{{ isTeacher ? 'Центр управления' : 'Ваш учебный ритм' }}</p>
        <h1 class="overview-title">
          {{ greeting }}, <span>{{ firstName }}</span>
        </h1>
        <p class="page-description">
          {{ isTeacher ? 'Группа движется стабильно. Ниже — главное, что требует внимания сегодня.' : 'Продолжайте с того места, где остановились. Всё важное уже собрано здесь.' }}
        </p>
      </div>
      <div class="overview-date">
        <span>{{ today.weekday }}</span>
        <strong>{{ today.day }}</strong>
        <small>{{ today.month }}</small>
      </div>
    </header>

    <div class="overview-grid">
      <article class="focus-card">
        <div class="focus-card__mesh" aria-hidden="true" />
        <div class="focus-card__orb" aria-hidden="true" />
        <div class="focus-card__topline">
          <span class="live-label"><i /> Следующая лекция</span>
          <span>Четверг · 18:00</span>
        </div>
        <div class="focus-card__content">
          <p>Frontend Pro · Модуль 4</p>
          <h2>Архитектура Vue-приложений</h2>
          <span>Композиция модулей, маршрутизация и быстрые интерфейсы под нагрузкой.</span>
        </div>
        <div class="focus-card__footer">
          <button type="button" class="focus-action" @click="openChannel('lecture')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7l8 5-8 5z" /></svg>
            {{ isTeacher ? 'Открыть аудиторию' : 'Перейти к лекции' }}
          </button>
          <div class="participant-stack" aria-label="27 участников">
            <span>АП</span><span>МК</span><span>ДС</span><b>+24</b>
          </div>
        </div>
      </article>

      <aside class="pulse-card premium-card">
        <div class="section-heading">
          <div><p class="page-eyebrow">Пульс недели</p><h2>{{ isTeacher ? 'Динамика группы' : 'Личный прогресс' }}</h2></div>
          <span class="trend-badge">+{{ isTeacher ? '8' : '12' }}%</span>
        </div>
        <div class="pulse-chart" aria-label="График прогресса">
          <span v-for="(bar, index) in pulseBars" :key="index" :style="{ height: `${bar}%` }" :class="{ 'is-current': index === pulseBars.length - 1 }" />
        </div>
        <div class="pulse-legend"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>
      </aside>
    </div>

    <div class="stat-grid">
      <article v-for="stat in stats" :key="stat.label" class="stat-tile premium-card premium-card--interactive">
        <div class="stat-tile__icon" :class="`stat-tile__icon--${stat.tone}`">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="stat.icon" /></svg>
        </div>
        <div><p>{{ stat.label }}</p><strong>{{ stat.value }}</strong><span>{{ stat.note }}</span></div>
      </article>
    </div>

    <div class="lower-grid">
      <section class="quick-card premium-card">
        <div class="section-heading">
          <div><p class="page-eyebrow">Быстрый старт</p><h2>Куда дальше</h2></div>
          <span class="section-hint">Все действия работают</span>
        </div>
        <div class="quick-grid">
          <button v-for="action in quickActions" :key="action.label" type="button" class="quick-action" @click="runAction(action)">
            <span :class="`quick-action__icon--${action.tone}`" class="quick-action__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="action.icon" /></svg>
            </span>
            <span><strong>{{ action.label }}</strong><small>{{ action.note }}</small></span>
            <svg class="quick-action__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </button>
        </div>
      </section>

      <section class="agenda-card premium-card">
        <div class="section-heading">
          <div><p class="page-eyebrow">Сегодня</p><h2>{{ isTeacher ? 'Рабочий план' : 'Ваш план' }}</h2></div>
          <button type="button" class="text-button" @click="openChannel('schedule')">Расписание</button>
        </div>
        <div class="agenda-list">
          <button v-for="item in agenda" :key="item.time" type="button" class="agenda-item" @click="openChannel(item.channel)">
            <span class="agenda-time">{{ item.time }}</span>
            <span class="agenda-marker" :class="`agenda-marker--${item.tone}`" />
            <span class="agenda-copy"><strong>{{ item.title }}</strong><small>{{ item.note }}</small></span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChannelStore } from '../../stores/channels'
import { useUserStore } from '../../stores/user'

const props = defineProps({ role: { type: String, required: true } })
const router = useRouter()
const channelStore = useChannelStore()
const userStore = useUserStore()

const isTeacher = computed(() => props.role === 'teacher')
const firstName = computed(() => (userStore.username || 'друг').trim().split(/\s+/)[0])
const greeting = computed(() => new Date().getHours() < 12 ? 'Доброе утро' : new Date().getHours() < 18 ? 'Добрый день' : 'Добрый вечер')
const today = computed(() => {
  const now = new Date()
  return {
    weekday: new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(now),
    day: new Intl.DateTimeFormat('ru-RU', { day: '2-digit' }).format(now),
    month: new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(now)
  }
})

const pulseBars = computed(() => isTeacher.value ? [54, 68, 61, 74, 77, 86, 92] : [34, 48, 46, 62, 58, 76, 88])
const stats = computed(() => isTeacher.value ? [
  { label: 'Активных студентов', value: '24', note: '22 были сегодня', tone: 'violet', icon: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm6-1a3 3 0 100-6m-6 9v-2c0-2.2 2.7-4 6-4s6 1.8 6 4v2H3zm14 0v-1.5c0-1.9-2.2-3.5-5-3.5' },
  { label: 'Работ на проверке', value: '8', note: '3 с высоким приоритетом', tone: 'amber', icon: 'M7 4h10a2 2 0 012 2v14H5V6a2 2 0 012-2zm3 5h4m-4 4h6m-6 4h3' },
  { label: 'Средний прогресс', value: '78%', note: '+5% за неделю', tone: 'mint', icon: 'M4 19V9m6 10V5m6 14v-7m4 7H2' }
] : [
  { label: 'Прогресс курса', value: '67%', note: 'Модуль 4 из 6', tone: 'violet', icon: 'M12 3a9 9 0 109 9M12 3v9h9' },
  { label: 'Серия занятий', value: '12', note: 'дней без пропусков', tone: 'amber', icon: 'M12 3c2 4-1 5-1 8 0 2 2 3 3 3 3 0 5-2 5-5 0-2-1-5-5-8 0 3-2 4-4 6-1-3-4-3-4-6-3 2-4 5-4 8 0 5 4 9 9 9s9-4 9-9c0-5-3-8-8-11z' },
  { label: 'Средний балл', value: '8.7', note: '+0.4 за месяц', tone: 'mint', icon: 'M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9L6.2 20l1-6.1-4.4-4.3 6.1-.9L12 3z' }
])

const quickActions = computed(() => isTeacher.value ? [
  { label: 'Студенты', note: 'Группы и доступы', channel: 'student-management', tone: 'violet', icon: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm6-1a3 3 0 100-6m-6 9v-2c0-2.2 2.7-4 6-4s6 1.8 6 4v2H3' },
  { label: 'Создать проверку', note: 'Тест или опрос', channel: 'tests', tone: 'mint', icon: 'M7 4h10a2 2 0 012 2v14H5V6a2 2 0 012-2zm3 5h4m-4 4h6m-6 4h3' },
  { label: 'Аналитика', note: 'Динамика группы', channel: 'student-progress', tone: 'amber', icon: 'M4 19V9m6 10V5m6 14v-7m4 7H2' },
  { label: 'Расписание', note: 'Занятия и дедлайны', channel: 'schedule', tone: 'blue', icon: 'M5 4h14v16H5V4zm3-2v4m8-4v4M8 10h8m-8 4h5' }
] : [
  { label: 'Мои задания', note: '2 дедлайна рядом', channel: 'assignments', tone: 'violet', icon: 'M7 4h10a2 2 0 012 2v14H5V6a2 2 0 012-2zm3 5h4m-4 4h6m-6 4h3' },
  { label: 'Библиотека', note: '15 свежих материалов', channel: 'resources', tone: 'mint', icon: 'M5 4h5v16H5V4zm5 0h5v16h-5V4zm5.5 1.2l3.4-1 4 14.6-3.4 1z' },
  { label: 'Мой прогресс', note: 'Посмотреть динамику', channel: 'progress', tone: 'amber', icon: 'M4 19V9m6 10V5m6 14v-7m4 7H2' },
  { label: 'Микрообучение', note: 'Уроки по 5 минут', route: 'MicroLearning', tone: 'blue', icon: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z' }
])

const agenda = computed(() => isTeacher.value ? [
  { time: '10:00', title: 'Проверить домашние работы', note: '8 новых отправок', channel: 'assignments', tone: 'violet' },
  { time: '15:30', title: 'Подготовить опрос', note: 'Модуль 4 · Composition API', channel: 'tests', tone: 'amber' },
  { time: '18:00', title: 'Живая лекция', note: '27 участников ожидаются', channel: 'lecture', tone: 'mint' }
] : [
  { time: '12:30', title: 'Закончить практику', note: 'Реактивность и computed', channel: 'assignments', tone: 'violet' },
  { time: '16:00', title: 'Повторить материал', note: '15 минут · подборка в библиотеке', channel: 'resources', tone: 'amber' },
  { time: '18:00', title: 'Живая лекция', note: 'Архитектура Vue-приложений', channel: 'lecture', tone: 'mint' }
])

async function openChannel(channelId) {
  channelStore.setCurrentChannel(channelId)
  await router.push({ name: isTeacher.value ? 'Teacher' : 'Student' })
}

async function runAction(action) {
  if (action.route) await router.push({ name: action.route })
  else await openChannel(action.channel)
}
</script>

<style scoped>
.overview-panel { padding-top: clamp(1.2rem, 2vw, 2rem); padding-bottom: 2.5rem; }
.overview-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 1.35rem; }
.overview-title { margin: 0; color: var(--text-primary); font-size: clamp(2rem,4vw,3.4rem); font-weight: 820; letter-spacing: -.06em; line-height: 1; }
.overview-title span { color: transparent; background: linear-gradient(100deg,#aaa0ff,#72d7b7); background-clip: text; }
.overview-date { display: grid; min-width: 6.4rem; grid-template-columns: auto 1fr; align-items: center; column-gap: .55rem; padding: .7rem .85rem; border: 1px solid var(--border-subtle); border-radius: 1rem; background: rgba(255,255,255,.03); }
.overview-date span { grid-column: 1/-1; color: var(--text-muted); font-size: .6rem; font-weight: 750; letter-spacing: .1em; text-transform: uppercase; }
.overview-date strong { color: var(--text-primary); font-size: 1.65rem; line-height: 1; }
.overview-date small { align-self: end; padding-bottom: .1rem; color: var(--text-secondary); font-size: .68rem; }
.overview-grid { display: grid; grid-template-columns: minmax(0,1.6fr) minmax(18rem,.7fr); gap: 1rem; }
.focus-card { position: relative; min-height: 20rem; overflow: hidden; border: 1px solid rgba(157,141,255,.17); border-radius: 1.6rem; background: linear-gradient(130deg,#19182d,#13192a 58%,#10231f); box-shadow: var(--shadow-panel); }
.focus-card__mesh { position: absolute; inset: 0; opacity: .1; background-image: linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px); background-size: 32px 32px; mask-image: linear-gradient(90deg,black,transparent); }
.focus-card__orb { position: absolute; top: -12rem; right: -6rem; width: 27rem; height: 27rem; border-radius: 50%; background: radial-gradient(circle,rgba(105,224,187,.22),transparent 68%); }
.focus-card__topline,.focus-card__footer { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.focus-card__topline { padding: 1.3rem 1.4rem; color: #858a9b; font-size: .68rem; }
.live-label { display: inline-flex; align-items: center; gap: .45rem; color: #8be2c1; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
.live-label i { width: .4rem; height: .4rem; border-radius: 50%; background: #56dca9; box-shadow: 0 0 9px rgba(86,220,169,.7); }
.focus-card__content { position: relative; z-index: 1; max-width: 40rem; padding: 2.2rem 1.6rem 2.5rem; }
.focus-card__content p { margin: 0 0 .55rem; color: #9184ed; font-size: .7rem; font-weight: 750; letter-spacing: .1em; text-transform: uppercase; }
.focus-card__content h2 { margin: 0; max-width: 32rem; color: white; font-size: clamp(1.8rem,3vw,3rem); font-weight: 800; letter-spacing: -.055em; line-height: 1.02; }
.focus-card__content > span { display: block; max-width: 34rem; margin-top: .9rem; color: #9da2b3; font-size: .8rem; line-height: 1.6; }
.focus-card__footer { padding: 0 1.4rem 1.4rem; }
.focus-action { display: inline-flex; align-items: center; gap: .55rem; padding: .68rem .9rem; border: 1px solid rgba(190,180,255,.25); border-radius: .8rem; background: linear-gradient(135deg,#765ee6,#5841c2); color: white; font-size: .72rem; font-weight: 750; box-shadow: 0 10px 25px rgba(69,48,167,.25); transition: transform .18s ease, box-shadow .18s ease; }
.focus-action:hover { transform: translateY(-2px); box-shadow: 0 15px 32px rgba(69,48,167,.35); }
.focus-action svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 1.8; }
.participant-stack { display: flex; align-items: center; }
.participant-stack span,.participant-stack b { display: grid; width: 2rem; height: 2rem; margin-left: -.38rem; place-items: center; border: 2px solid #151927; border-radius: .65rem; background: linear-gradient(145deg,#6c58da,#9a7af1); color: white; font-size: .55rem; font-weight: 800; }
.participant-stack b { background: #242a39; color: #a8adbc; }
.pulse-card,.quick-card,.agenda-card { border-radius: 1.6rem; padding: 1.25rem; }
.section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.section-heading h2 { margin: 0; color: var(--text-primary); font-size: 1rem; font-weight: 760; letter-spacing: -.025em; }
.trend-badge { padding: .3rem .48rem; border-radius: .55rem; background: rgba(75,207,156,.1); color: #78dcb7; font-size: .62rem; font-weight: 750; }
.pulse-chart { display: flex; height: 10rem; align-items: end; gap: .45rem; margin-top: 1.5rem; padding: 0 .25rem; }
.pulse-chart span { flex: 1; min-height: .5rem; border-radius: .45rem .45rem .12rem .12rem; background: linear-gradient(to top,rgba(112,92,222,.28),rgba(145,126,244,.78)); transition: height .35s ease, filter .18s ease; }
.pulse-chart span:hover,.pulse-chart span.is-current { filter: brightness(1.28); background: linear-gradient(to top,rgba(69,193,148,.28),#64d6ab); }
.pulse-legend { display: flex; justify-content: space-between; margin-top: .55rem; padding: 0 .25rem; color: #626979; font-size: .58rem; }
.stat-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 1rem; margin-top: 1rem; }
.stat-tile { display: flex; align-items: center; gap: 1rem; min-height: 7.3rem; padding: 1rem; border-radius: 1.25rem; }
.stat-tile__icon { display: grid; width: 3rem; height: 3rem; flex: none; place-items: center; border-radius: .9rem; }
.stat-tile__icon svg,.quick-action svg,.agenda-item > svg { width: 1.2rem; height: 1.2rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.stat-tile__icon--violet,.quick-action__icon--violet { background: rgba(130,108,246,.12); color: #aa9aff; }
.stat-tile__icon--amber,.quick-action__icon--amber { background: rgba(232,187,113,.11); color: #efc987; }
.stat-tile__icon--mint,.quick-action__icon--mint { background: rgba(83,210,165,.1); color: #72dcb6; }
.quick-action__icon--blue { background: rgba(86,153,232,.11); color: #88bdf4; }
.stat-tile p,.stat-tile strong,.stat-tile span { display: block; }
.stat-tile p { margin: 0 0 .15rem; color: var(--text-muted); font-size: .68rem; }
.stat-tile strong { color: var(--text-primary); font-size: 1.55rem; letter-spacing: -.04em; }
.stat-tile span { margin-top: .12rem; color: #707787; font-size: .62rem; }
.lower-grid { display: grid; grid-template-columns: minmax(0,1.25fr) minmax(20rem,.75fr); gap: 1rem; margin-top: 1rem; }
.section-hint { color: #626979; font-size: .62rem; }
.quick-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: .55rem; margin-top: 1rem; }
.quick-action { display: grid; grid-template-columns: 2.6rem minmax(0,1fr) 1rem; align-items: center; gap: .7rem; padding: .7rem; border: 1px solid rgba(255,255,255,.055); border-radius: .9rem; background: rgba(255,255,255,.025); text-align: left; transition: border-color .18s ease,background-color .18s ease,transform .18s ease; }
.quick-action:hover { transform: translateY(-1px); border-color: rgba(160,145,255,.18); background: rgba(255,255,255,.045); }
.quick-action__icon { display: grid; width: 2.6rem; height: 2.6rem; place-items: center; border-radius: .75rem; }
.quick-action strong,.quick-action small { display: block; }
.quick-action strong { color: var(--text-primary); font-size: .72rem; }
.quick-action small { margin-top: .15rem; color: var(--text-muted); font-size: .6rem; }
.quick-action__arrow { width: .85rem !important; color: #5d6473; }
.text-button { border: 0; background: transparent; color: #9483ef; font-size: .65rem; font-weight: 700; }
.agenda-list { display: grid; margin-top: .8rem; }
.agenda-item { display: grid; grid-template-columns: 2.5rem .5rem minmax(0,1fr) 1rem; align-items: center; gap: .55rem; padding: .72rem .25rem; border: 0; border-bottom: 1px solid rgba(255,255,255,.055); background: transparent; text-align: left; }
.agenda-item:last-child { border-bottom: 0; }
.agenda-time { color: #8d94a5; font-size: .64rem; font-weight: 700; }
.agenda-marker { width: .43rem; height: .43rem; border-radius: 50%; }
.agenda-marker--violet { background:#8f79ed; box-shadow:0 0 8px rgba(143,121,237,.5); }
.agenda-marker--amber { background:#e8bb71; box-shadow:0 0 8px rgba(232,187,113,.4); }
.agenda-marker--mint { background:#53d2a5; box-shadow:0 0 8px rgba(83,210,165,.45); }
.agenda-copy strong,.agenda-copy small { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.agenda-copy strong { color:var(--text-secondary); font-size:.69rem; }
.agenda-copy small { margin-top:.13rem; color:#656c7b; font-size:.59rem; }
.agenda-item > svg { width:.8rem; color:#545b6a; }

@media (max-width: 1100px) { .overview-grid,.lower-grid { grid-template-columns:1fr; } .pulse-card { min-height:18rem; } }
@media (max-width: 720px) { .overview-heading { align-items:flex-start; } .overview-date { display:none; } .stat-grid { grid-template-columns:1fr; } .quick-grid { grid-template-columns:1fr; } .focus-card { min-height:22rem; } .focus-card__footer { align-items:flex-start; flex-direction:column; } }
@media (prefers-reduced-motion: reduce) { .focus-action,.pulse-chart span,.quick-action { transition:none; } }
</style>
