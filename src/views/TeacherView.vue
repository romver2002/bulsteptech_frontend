<template>
  <AppLayout>
    <main class="teacher-view">
      <OverviewPanel v-if="currentChannel?.id === 'overview'" role="teacher" />
      <StreamView v-else-if="currentChannel?.id === 'lecture'" />
      <ResourcesView v-else-if="currentChannel?.id === 'resources'" />
      <AssignmentBoard v-else-if="currentChannel?.id === 'assignments'" />
      <PerformanceAnalytics v-else-if="currentChannel?.id === 'student-progress'" />

      <section v-else-if="currentChannel?.id === 'schedule'" class="workspace-panel">
        <header class="panel-heading">
          <div><span class="eyebrow">Планирование</span><h1>Расписание</h1><p>Соберите понятный ритм курса и держите ближайшие занятия под рукой.</p></div>
          <button class="primary-button" type="button" @click="showScheduleForm = !showScheduleForm">{{ showScheduleForm ? 'Закрыть' : 'Добавить занятие' }}</button>
        </header>
        <form v-if="showScheduleForm" class="entry-form" @submit.prevent="addScheduleItem">
          <input v-model.trim="scheduleDraft.title" required placeholder="Название занятия" />
          <input v-model="scheduleDraft.date" required type="date" />
          <input v-model.trim="scheduleDraft.time" required type="time" />
          <button class="primary-button" type="submit">Сохранить</button>
        </form>
        <div v-if="scheduleItems.length" class="item-list">
          <article v-for="item in scheduleItems" :key="item.id" class="list-card">
            <div><strong>{{ item.title }}</strong><span>{{ formatDate(item.date) }} · {{ item.time }}</span></div>
            <button class="text-button danger" type="button" @click="removeScheduleItem(item.id)">Удалить</button>
          </article>
        </div>
        <div v-else class="empty-state">Пока нет запланированных занятий. Добавьте первое — оно появится здесь.</div>
      </section>

      <section v-else-if="currentChannel?.id === 'student-management'" class="workspace-panel">
        <header class="panel-heading"><div><span class="eyebrow">Курс</span><h1>Студенты</h1><p>Управляйте доступом, прогрессом и вниманием к группе.</p></div><button class="primary-button" type="button" @click="notify('Приглашение подготовлено — осталось выбрать адресата.', 'info')">Пригласить</button></header>
        <div class="metric-grid"><article><strong>48</strong><span>активных студентов</span></article><article><strong>86%</strong><span>средний прогресс</span></article><article><strong>6</strong><span>требуют внимания</span></article></div>
        <div class="item-list"><article v-for="student in students" :key="student.name" class="list-card"><div class="person"><span>{{ student.initials }}</span><strong>{{ student.name }}<small>{{ student.progress }}% выполнено</small></strong></div><button class="text-button" type="button" @click="student.active = !student.active">{{ student.active ? 'Ограничить доступ' : 'Вернуть доступ' }}</button></article></div>
      </section>

      <section v-else-if="currentChannel?.id === 'tests'" class="workspace-panel">
        <header class="panel-heading"><div><span class="eyebrow">Контроль знаний</span><h1>Тесты и квизы</h1><p>Публикуйте проверки в нужный момент и сразу видьте отклик.</p></div><button class="primary-button" type="button" @click="createCheck">Создать тест</button></header>
        <div class="item-list"><article v-for="check in checks" :key="check.id" class="list-card"><div><strong>{{ check.title }}</strong><span>{{ check.responses }} ответов · {{ check.published ? 'опубликован' : 'черновик' }}</span></div><button class="text-button" type="button" @click="check.published = !check.published">{{ check.published ? 'Снять с публикации' : 'Опубликовать' }}</button></article></div>
      </section>

      <section v-else-if="currentChannel?.id === 'attendance'" class="workspace-panel">
        <header class="panel-heading"><div><span class="eyebrow">Посещаемость</span><h1>Пульс группы</h1><p>Краткий срез по последнему занятию.</p></div><button class="primary-button" type="button" @click="notify('Отчёт по посещаемости обновлён.', 'success')">Обновить</button></header>
        <div class="metric-grid"><article><strong>42</strong><span>были на занятии</span></article><article><strong>88%</strong><span>посещаемость</span></article><article><strong>4</strong><span>пропустили подряд</span></article></div>
      </section>

      <section v-else-if="currentChannel?.id === 'reports'" class="workspace-panel">
        <header class="panel-heading"><div><span class="eyebrow">Аналитика</span><h1>Отчёты</h1><p>Экспортируйте актуальную сводку по курсу.</p></div><button class="primary-button" type="button" @click="downloadReport">Скачать CSV</button></header>
        <div class="metric-grid"><article><strong>91%</strong><span>выполняют задания вовремя</span></article><article><strong>4.7</strong><span>средняя оценка</span></article><article><strong>+12%</strong><span>рост вовлечённости</span></article></div>
      </section>

      <section v-else-if="isCommunicationChannel" class="message-workspace"><MessageContainer /></section>
      <section v-else class="workspace-panel empty-state">Выберите раздел в боковом меню, чтобы продолжить работу с курсом.</section>
    </main>
  </AppLayout>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import OverviewPanel from '../components/dashboard/OverviewPanel.vue'
import { useChannelStore } from '../stores/channels'
import { useNotificationStore } from '../stores/notification'

const StreamView = defineAsyncComponent(() => import('./StreamView.vue'))
const ResourcesView = defineAsyncComponent(() => import('../components/resources/ResourcesView.vue'))
const AssignmentBoard = defineAsyncComponent(() => import('../components/assignments/AssignmentBoard.vue'))
const PerformanceAnalytics = defineAsyncComponent(() => import('../components/analytics/PerformanceAnalytics.vue'))
const MessageContainer = defineAsyncComponent(() => import('../components/chat/MessageContainer.vue'))

const channelStore = useChannelStore()
const notificationStore = useNotificationStore()
const currentChannel = computed(() => channelStore.currentChannel)
const isCommunicationChannel = computed(() => ['general', 'announcements', 'help'].includes(currentChannel.value?.id))
const today = new Date().toISOString().slice(0, 10)
const scheduleDraft = ref({ title: '', date: today, time: '19:00' })
const showScheduleForm = ref(false)
const storageKey = 'bulsteptech.teacher.schedule'

function loadSchedule() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

const scheduleItems = ref(loadSchedule())
const students = ref([
  { name: 'Анна Смирнова', initials: 'АС', progress: 94, active: true },
  { name: 'Максим Волков', initials: 'МВ', progress: 81, active: true },
  { name: 'Елена Орлова', initials: 'ЕО', progress: 68, active: true }
])
const checks = ref([
  { id: 1, title: 'JavaScript: основы', responses: 35, published: true },
  { id: 2, title: 'Vue 3: компоненты', responses: 0, published: false }
])

function persistSchedule() { localStorage.setItem(storageKey, JSON.stringify(scheduleItems.value)) }
function notify(message, type = 'success') {
  const method = notificationStore[type] || notificationStore.info
  method(message)
}
function addScheduleItem() {
  scheduleItems.value.push({ id: Date.now(), ...scheduleDraft.value })
  scheduleItems.value.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  persistSchedule(); showScheduleForm.value = false; scheduleDraft.value = { title: '', date: today, time: '19:00' }
  notify('Занятие добавлено в расписание.')
}
function removeScheduleItem(id) { scheduleItems.value = scheduleItems.value.filter(item => item.id !== id); persistSchedule(); notify('Занятие удалено.', 'info') }
function formatDate(date) { return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`)) }
function createCheck() { checks.value.unshift({ id: Date.now(), title: `Новый тест ${checks.value.length + 1}`, responses: 0, published: false }); notify('Черновик теста создан.') }
function downloadReport() {
  const url = URL.createObjectURL(new Blob(['Показатель,Значение\nПосещаемость,88%\nСредняя оценка,4.7\n'], { type: 'text/csv;charset=utf-8' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: 'course-report.csv' }); link.click(); URL.revokeObjectURL(url)
  notify('Отчёт подготовлен к скачиванию.')
}
</script>

<style scoped>
.teacher-view { min-height: 100%; }.workspace-panel { max-width: 1180px; margin: 0 auto; padding: clamp(1.25rem, 3vw, 2.5rem); }.panel-heading { display: flex; gap: 1.25rem; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }.panel-heading h1 { margin: .25rem 0 .5rem; font-size: clamp(1.7rem, 3vw, 2.45rem); }.panel-heading p { max-width: 600px; margin: 0; color: var(--text-muted); }.eyebrow { color: var(--accent-primary); font-size: .73rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }.primary-button, .text-button { border: 0; cursor: pointer; font: inherit; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }.primary-button { flex: 0 0 auto; padding: .78rem 1rem; border-radius: .8rem; color: #fff; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); box-shadow: 0 10px 24px color-mix(in srgb, var(--accent-primary) 28%, transparent); }.primary-button:hover { transform: translateY(-2px); }.entry-form { display: grid; grid-template-columns: minmax(180px, 1fr) auto auto auto; gap: .75rem; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 1rem; background: var(--bg-card); }.entry-form input { min-width: 0; padding: .75rem .85rem; border: 1px solid var(--border-color); border-radius: .7rem; color: var(--text-primary); background: var(--bg-secondary); }.item-list { display: grid; gap: .75rem; }.list-card { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.1rem; border: 1px solid var(--border-color); border-radius: 1rem; background: var(--bg-card); }.list-card strong { display: block; }.list-card span, .list-card small { display: block; margin-top: .25rem; color: var(--text-muted); }.text-button { padding: .45rem .65rem; border-radius: .55rem; color: var(--accent-primary); background: color-mix(in srgb, var(--accent-primary) 11%, transparent); }.text-button:hover { background: color-mix(in srgb, var(--accent-primary) 18%, transparent); }.danger { color: #fb7185; }.metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }.metric-grid article { padding: 1.2rem; border: 1px solid var(--border-color); border-radius: 1rem; background: var(--bg-card); }.metric-grid strong { display: block; font-size: 1.65rem; }.metric-grid span { color: var(--text-muted); }.person { display: flex; gap: .75rem; align-items: center; }.person > span { display: grid; width: 2.25rem; height: 2.25rem; margin: 0; place-items: center; border-radius: 50%; color: #fff; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); font-size: .75rem; font-weight: 800; }.empty-state { padding: 2.25rem; border: 1px dashed var(--border-color); border-radius: 1rem; color: var(--text-muted); text-align: center; }.message-workspace { min-height: calc(100vh - 6rem); } @media (max-width: 720px) { .panel-heading, .list-card { align-items: stretch; flex-direction: column; }.entry-form, .metric-grid { grid-template-columns: 1fr; }.primary-button { width: 100%; } }
</style>
