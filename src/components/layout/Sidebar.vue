<template>
  <button
    v-if="isMobile && !isOpen"
    type="button"
    class="mobile-nav-trigger"
    aria-label="Открыть навигацию"
    @click="isOpen = true"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  </button>

  <Transition name="sidebar-backdrop">
    <button
      v-if="isMobile && isOpen"
      type="button"
      class="sidebar-backdrop"
      aria-label="Закрыть навигацию"
      @click="isOpen = false"
    />
  </Transition>

  <aside
    class="sidebar"
    :class="{ 'sidebar--mobile': isMobile, 'sidebar--open': isOpen }"
    aria-label="Основная навигация"
  >
    <div class="sidebar__header">
      <div>
        <p class="sidebar__eyebrow">Рабочее пространство</p>
        <div class="sidebar__course">
          <span class="sidebar__course-mark">V3</span>
          <div>
            <strong>Frontend Pro</strong>
            <span>Поток · Лето 2026</span>
          </div>
        </div>
      </div>
      <button
        v-if="isMobile"
        type="button"
        class="icon-button"
        aria-label="Закрыть меню"
        @click="isOpen = false"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
    </div>

    <nav class="sidebar__nav">
      <section v-for="group in navigationGroups" :key="group.id" class="nav-group">
        <p class="nav-group__label">{{ group.label }}</p>
        <div class="nav-group__items">
          <button
            v-for="channel in group.channels"
            :key="channel.id"
            type="button"
            class="nav-item"
            :class="{ 'nav-item--active': currentChannelId === channel.id }"
            :aria-current="currentChannelId === channel.id ? 'page' : undefined"
            @click="selectChannel(channel.id)"
          >
            <span class="nav-item__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path v-if="channel.icon === 'home'" d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />
                <path v-else-if="channel.icon === 'play'" d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5zM10 9l5 3-5 3z" />
                <path v-else-if="channel.icon === 'calendar'" d="M6 4v3m12-3v3M4.5 9h15M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm3 7h3m2 0h3m-8 3h3" />
                <path v-else-if="channel.icon === 'tasks'" d="M9 6h11M9 12h11M9 18h11M4 6.1l1.2 1.2L7.5 5M4 12.1l1.2 1.2L7.5 11M4 18.1l1.2 1.2L7.5 17" />
                <path v-else-if="channel.icon === 'library'" d="M5 4h5v16H5zM10 4h5v16h-5zM15.5 5.2l3.4-1 4 14.6-3.4 1z" />
                <path v-else-if="channel.icon === 'trend' || channel.icon === 'chart'" d="M4 19V5m0 14h16M7 15l4-4 3 2 5-6" />
                <path v-else-if="channel.icon === 'sparkles'" d="m12 3 1.4 4.1L17.5 9l-4.1 1.9L12 15l-1.4-4.1L6.5 9l4.1-1.9zM18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
                <path v-else-if="channel.icon === 'users'" d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm6-1a3 3 0 1 0 0-6m-6 9c-3.3 0-6 1.8-6 4v2h12v-2c0-2.2-2.7-4-6-4Zm7-1c2.8 0 5 1.5 5 3.4V19h-4" />
                <path v-else-if="channel.icon === 'quiz'" d="M7 4h10a2 2 0 0 1 2 2v14H5V6a2 2 0 0 1 2-2Zm3 5a2 2 0 1 1 3.4 1.4c-.9.8-1.4 1.1-1.4 2.1M12 16h.01" />
                <path v-else-if="channel.icon === 'attendance'" d="M8 4h8v3H8zM6 6H5a1 1 0 0 0-1 1v13h16V7a1 1 0 0 0-1-1h-1M8 12l2.2 2.2L16 9" />
                <path v-else-if="channel.icon === 'report'" d="M7 3h7l4 4v14H7zM14 3v5h4M10 12h5m-5 4h5" />
                <path v-else-if="channel.icon === 'megaphone'" d="M4 11v3h3l8 4V7l-8 4zm11-2c2 1 2 6 0 7M7 14l1 5h3" />
                <path v-else-if="channel.icon === 'help'" d="M9.5 9a2.7 2.7 0 1 1 4.4 2.1c-1.2.9-1.9 1.3-1.9 2.9M12 18h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                <path v-else d="M5 5h14v11H9l-4 3z" />
              </svg>
            </span>
            <span class="nav-item__copy">
              <strong>{{ channel.name }}</strong>
              <small>{{ channel.description }}</small>
            </span>
            <span v-if="currentChannelId === channel.id" class="nav-item__active-dot" />
          </button>
        </div>
      </section>
    </nav>

    <button type="button" class="sidebar__profile" @click="openProfile">
      <span class="avatar">{{ userInitials }}</span>
      <span class="sidebar__profile-copy">
        <strong>{{ userStore.username }}</strong>
        <small>{{ userStore.isTeacher ? 'Преподаватель' : 'Студент' }}</small>
      </span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
    </button>
  </aside>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useChannelStore } from '../../stores/channels'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const channelStore = useChannelStore()

const isMobile = ref(false)
const isOpen = ref(true)

const groupMeta = {
  learning: { label: 'Обучение', order: 1 },
  growth: { label: 'Мой рост', order: 2 },
  management: { label: 'Управление', order: 2 },
  analytics: { label: 'Аналитика', order: 3 },
  communication: { label: 'Коммуникации', order: 4 }
}

const currentChannelId = computed(() => channelStore.currentChannelId)
const userInitials = computed(() => (userStore.username || 'BT').slice(0, 2).toUpperCase())
const navigationGroups = computed(() => {
  const grouped = new Map()
  channelStore.getChannelsForRole(userStore.role).forEach((channel) => {
    if (!grouped.has(channel.group)) grouped.set(channel.group, [])
    grouped.get(channel.group).push(channel)
  })

  return [...grouped.entries()]
    .map(([id, channels]) => ({ id, channels, ...groupMeta[id] }))
    .sort((a, b) => a.order - b.order)
})

function syncViewport() {
  isMobile.value = window.innerWidth < 1024
  isOpen.value = !isMobile.value
}

async function selectChannel(channelId) {
  channelStore.setCurrentChannel(channelId)
  const homeName = userStore.isTeacher ? 'Teacher' : 'Student'
  if (route.name !== homeName) await router.push({ name: homeName })
  if (isMobile.value) isOpen.value = false
}

async function openProfile() {
  if (isMobile.value) isOpen.value = false
  await router.push({ name: 'Profile' })
}

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport, { passive: true })
})

onUnmounted(() => window.removeEventListener('resize', syncViewport))
</script>

<style scoped>
.sidebar {
  position: relative;
  z-index: 40;
  display: flex;
  width: 17.5rem;
  min-width: 17.5rem;
  height: 100%;
  flex-direction: column;
  border-right: 1px solid var(--border-subtle);
  background: rgba(10, 13, 21, 0.94);
  box-shadow: 18px 0 48px rgba(0, 0, 0, 0.18);
}

.sidebar__header { display: flex; min-height: 6.7rem; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.35rem 1.15rem 1rem; }
.sidebar__eyebrow, .nav-group__label { margin: 0 0 .7rem; color: var(--text-muted); font-size: .66rem; font-weight: 750; letter-spacing: .13em; text-transform: uppercase; }
.sidebar__course { display: flex; align-items: center; gap: .75rem; }
.sidebar__course-mark { display: grid; width: 2.35rem; height: 2.35rem; place-items: center; border: 1px solid rgba(132, 112, 255, .32); border-radius: .8rem; background: linear-gradient(145deg, rgba(126, 98, 255, .26), rgba(52, 211, 153, .09)); color: #c9c1ff; font-size: .72rem; font-weight: 850; box-shadow: inset 0 1px 0 rgba(255,255,255,.12); }
.sidebar__course strong, .sidebar__course span { display: block; }
.sidebar__course strong { color: var(--text-primary); font-size: .9rem; letter-spacing: -.01em; }
.sidebar__course div > span { margin-top: .15rem; color: var(--text-muted); font-size: .7rem; }
.sidebar__nav { flex: 1; overflow-y: auto; padding: .25rem .75rem 1rem; overscroll-behavior: contain; }
.nav-group + .nav-group { margin-top: 1.25rem; }
.nav-group__label { padding: 0 .55rem; }
.nav-group__items { display: grid; gap: .24rem; }
.nav-item { position: relative; display: grid; width: 100%; grid-template-columns: 2.25rem minmax(0,1fr) .5rem; align-items: center; gap: .65rem; padding: .66rem .65rem; border: 1px solid transparent; border-radius: .85rem; background: transparent; color: var(--text-secondary); text-align: left; transition: background-color .18s ease, border-color .18s ease, color .18s ease; }
.nav-item:hover { border-color: rgba(255,255,255,.055); background: rgba(255,255,255,.042); color: var(--text-primary); }
.nav-item--active { border-color: rgba(126, 102, 255, .24); background: linear-gradient(90deg, rgba(112, 88, 242, .18), rgba(112, 88, 242, .045)); color: #f3f1ff; box-shadow: inset 1px 0 0 rgba(154, 136, 255, .7); }
.nav-item__icon { display: grid; width: 2.2rem; height: 2.2rem; place-items: center; border: 1px solid rgba(255,255,255,.06); border-radius: .72rem; background: rgba(255,255,255,.035); }
.nav-item--active .nav-item__icon { border-color: rgba(140, 119, 255, .28); background: rgba(119, 91, 255, .16); color: #b9adff; }
.nav-item__icon svg, .sidebar__profile svg, .icon-button svg, .mobile-nav-trigger svg { width: 1.08rem; height: 1.08rem; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.nav-item__copy { min-width: 0; }
.nav-item__copy strong, .nav-item__copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nav-item__copy strong { font-size: .82rem; font-weight: 650; }
.nav-item__copy small { margin-top: .08rem; color: var(--text-muted); font-size: .66rem; font-weight: 450; }
.nav-item__active-dot { width: .33rem; height: .33rem; border-radius: 999px; background: #9d8cff; box-shadow: 0 0 10px rgba(157, 140, 255, .85); }
.sidebar__profile { display: grid; margin: .7rem; grid-template-columns: 2.45rem minmax(0,1fr) 1rem; align-items: center; gap: .7rem; padding: .7rem; border: 1px solid var(--border-subtle); border-radius: 1rem; background: rgba(255,255,255,.035); text-align: left; transition: border-color .18s ease, background-color .18s ease; }
.sidebar__profile:hover { border-color: rgba(143, 124, 255, .28); background: rgba(255,255,255,.055); }
.avatar { display: grid; width: 2.45rem; height: 2.45rem; place-items: center; border-radius: .8rem; background: linear-gradient(145deg, #7159e8, #9e7cff); color: #fff; font-size: .75rem; font-weight: 800; box-shadow: 0 8px 18px rgba(94, 72, 201, .28), inset 0 1px 0 rgba(255,255,255,.2); }
.sidebar__profile-copy { min-width: 0; }
.sidebar__profile-copy strong, .sidebar__profile-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sidebar__profile-copy strong { color: var(--text-primary); font-size: .8rem; }
.sidebar__profile-copy small { margin-top: .12rem; color: var(--text-muted); font-size: .68rem; }
.sidebar__profile > svg { color: var(--text-muted); }
.icon-button, .mobile-nav-trigger { display: grid; place-items: center; border: 1px solid var(--border-subtle); color: var(--text-secondary); }
.icon-button { width: 2.2rem; height: 2.2rem; border-radius: .7rem; background: rgba(255,255,255,.04); }
.mobile-nav-trigger { position: fixed; z-index: 70; top: 1rem; left: 1rem; width: 2.5rem; height: 2.5rem; border-radius: .8rem; background: rgba(15, 18, 29, .94); box-shadow: 0 10px 30px rgba(0,0,0,.32); }
.sidebar-backdrop { position: fixed; z-index: 35; inset: 0; border: 0; background: rgba(3, 5, 10, .68); backdrop-filter: blur(5px); }
.sidebar--mobile { position: fixed; inset: 0 auto 0 0; z-index: 60; width: min(19rem, 88vw); min-width: 0; transform: translateX(-102%); transition: transform .24s cubic-bezier(.2,.8,.2,1); }
.sidebar--mobile.sidebar--open { transform: translateX(0); }
.sidebar-backdrop-enter-active, .sidebar-backdrop-leave-active { transition: opacity .2s ease; }
.sidebar-backdrop-enter-from, .sidebar-backdrop-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .sidebar--mobile, .nav-item, .sidebar__profile, .sidebar-backdrop-enter-active, .sidebar-backdrop-leave-active { transition: none; }
}
</style>
