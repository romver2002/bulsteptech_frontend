<template>
  <header class="topbar">
    <button type="button" class="brand" aria-label="На главную" @click="goHome">
      <span class="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32">
          <path d="M8 7h9.5a5 5 0 0 1 0 10H8z" />
          <path d="M8 17h11a4 4 0 0 1 0 8H8z" />
          <path d="M14 7v18" />
        </svg>
      </span>
      <span class="brand__copy">
        <strong>Bulstep<span>Tech</span></strong>
        <small>{{ pageContext }}</small>
      </span>
    </button>

    <div class="topbar__center" aria-label="Статус платформы">
      <span class="live-pill"><i /> Платформа онлайн</span>
      <span class="next-event"><b>Следующая лекция</b> · Чт, 18:00</span>
    </div>

    <div class="topbar__actions">
      <div ref="menuRoot" class="profile-menu">
        <button
          type="button"
          class="profile-trigger"
          :aria-expanded="isMenuOpen"
          aria-haspopup="menu"
          @click="isMenuOpen = !isMenuOpen"
        >
          <span class="profile-trigger__avatar">{{ userInitials }}</span>
          <span class="profile-trigger__copy">
            <strong>{{ userStore.username }}</strong>
            <small>{{ roleLabel }}</small>
          </span>
          <svg :class="{ 'is-open': isMenuOpen }" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5" /></svg>
        </button>

        <Transition name="menu-pop">
          <div v-if="isMenuOpen" class="profile-dropdown" role="menu">
            <div class="profile-dropdown__meta">
              <span class="profile-dropdown__avatar">{{ userInitials }}</span>
              <div>
                <strong>{{ userStore.username }}</strong>
                <small>{{ roleLabel }} · online</small>
              </div>
            </div>
            <button type="button" role="menuitem" @click="openProfile">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0" /></svg>
              Личный кабинет
            </button>
            <button type="button" role="menuitem" @click="goHome">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 10 8-6 8 6v10h-6v-6h-4v6H4z" /></svg>
              Рабочее пространство
            </button>
            <div class="profile-dropdown__divider" />
            <button type="button" class="profile-dropdown__logout" role="menuitem" @click="logout">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5m4-4 4-3-4-3m4 3H9" /></svg>
              Выйти
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
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
const isMenuOpen = ref(false)
const menuRoot = ref(null)

const userInitials = computed(() => (userStore.username || 'BT').slice(0, 2).toUpperCase())
const roleLabel = computed(() => (userStore.isTeacher ? 'Преподаватель' : 'Студент'))
const pageContext = computed(() => {
  if (route.name === 'Profile') return 'Личный кабинет'
  if (route.name === 'MicroLearning') return 'Микрообучение'
  return channelStore.currentChannel?.name || 'Рабочее пространство'
})

async function goHome() {
  isMenuOpen.value = false
  channelStore.setCurrentChannel('overview')
  await router.push({ name: userStore.isTeacher ? 'Teacher' : 'Student' })
}

async function openProfile() {
  isMenuOpen.value = false
  await router.push({ name: 'Profile' })
}

async function logout() {
  isMenuOpen.value = false
  userStore.logout()
  await router.replace({ name: 'Login' })
}

function closeMenu(event) {
  if (event.type === 'keydown' && event.key === 'Escape') isMenuOpen.value = false
  if (event.type === 'pointerdown' && menuRoot.value && !menuRoot.value.contains(event.target)) isMenuOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', closeMenu)
  document.addEventListener('keydown', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', closeMenu)
  document.removeEventListener('keydown', closeMenu)
})
</script>

<style scoped>
.topbar { position: relative; z-index: 50; display: grid; min-height: 4.5rem; grid-template-columns: minmax(14rem,1fr) auto minmax(14rem,1fr); align-items: center; gap: 1rem; padding: .7rem 1rem .7rem 1.15rem; border-bottom: 1px solid var(--border-subtle); background: rgba(8, 11, 18, .94); box-shadow: 0 14px 40px rgba(0,0,0,.16); }
.brand { display: inline-flex; width: max-content; align-items: center; gap: .72rem; border: 0; background: transparent; text-align: left; }
.brand__mark { position: relative; display: grid; width: 2.55rem; height: 2.55rem; place-items: center; overflow: hidden; border: 1px solid rgba(159,143,255,.3); border-radius: .85rem; background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.22), transparent 32%), linear-gradient(145deg,#7058dd,#4933b1); box-shadow: 0 9px 28px rgba(92,66,210,.28), inset 0 1px 0 rgba(255,255,255,.2); }
.brand__mark::after { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,.2) 48%, transparent 62%); content: ''; transform: translateX(-120%); transition: transform .5s ease; }
.brand:hover .brand__mark::after { transform: translateX(120%); }
.brand__mark svg { width: 1.65rem; height: 1.65rem; fill: none; stroke: white; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2.2; }
.brand__copy strong, .brand__copy small { display: block; }
.brand__copy strong { color: #f8f7ff; font-size: 1.02rem; font-weight: 790; letter-spacing: -.035em; }
.brand__copy strong span { color: #9b8cff; }
.brand__copy small { margin-top: .08rem; color: var(--text-muted); font-size: .68rem; }
.topbar__center { display: flex; align-items: center; gap: .75rem; color: var(--text-muted); font-size: .7rem; }
.live-pill { display: inline-flex; align-items: center; gap: .45rem; padding: .4rem .65rem; border: 1px solid rgba(66,201,150,.15); border-radius: 999px; background: rgba(47,177,128,.07); color: #86deb8; font-weight: 650; }
.live-pill i { width: .37rem; height: .37rem; border-radius: 999px; background: #4cdda4; box-shadow: 0 0 9px rgba(76,221,164,.7); }
.next-event { padding-left: .75rem; border-left: 1px solid var(--border-subtle); }
.next-event b { color: var(--text-secondary); font-weight: 600; }
.topbar__actions { display: flex; justify-content: flex-end; align-items: center; gap: .65rem; }
.profile-menu { position: relative; }
.profile-trigger { display: grid; min-width: 12rem; grid-template-columns: 2.25rem minmax(0,1fr) 1rem; align-items: center; gap: .62rem; padding: .34rem .48rem; border: 1px solid var(--border-subtle); border-radius: .9rem; background: rgba(255,255,255,.035); text-align: left; transition: border-color .18s ease, background-color .18s ease; }
.profile-trigger:hover { border-color: rgba(147,128,255,.27); background: rgba(255,255,255,.055); }
.profile-trigger__avatar, .profile-dropdown__avatar { display: grid; place-items: center; background: linear-gradient(145deg,#6f58dd,#9b7df3); color: white; font-weight: 800; box-shadow: inset 0 1px 0 rgba(255,255,255,.22); }
.profile-trigger__avatar { width: 2.25rem; height: 2.25rem; border-radius: .72rem; font-size: .68rem; }
.profile-trigger__copy { min-width: 0; }
.profile-trigger__copy strong, .profile-trigger__copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.profile-trigger__copy strong { color: var(--text-primary); font-size: .75rem; }
.profile-trigger__copy small { margin-top: .08rem; color: var(--text-muted); font-size: .63rem; }
.profile-trigger > svg { width: .95rem; height: .95rem; fill: none; stroke: var(--text-muted); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; transition: transform .18s ease; }
.profile-trigger > svg.is-open { transform: rotate(180deg); }
.profile-dropdown { position: absolute; top: calc(100% + .65rem); right: 0; width: 15.5rem; padding: .48rem; border: 1px solid rgba(255,255,255,.09); border-radius: 1rem; background: rgba(14,17,27,.98); box-shadow: 0 24px 60px rgba(0,0,0,.44), inset 0 1px 0 rgba(255,255,255,.04); }
.profile-dropdown__meta { display: flex; align-items: center; gap: .7rem; margin-bottom: .35rem; padding: .65rem; border-radius: .72rem; background: rgba(255,255,255,.035); }
.profile-dropdown__avatar { width: 2.35rem; height: 2.35rem; border-radius: .72rem; font-size: .7rem; }
.profile-dropdown__meta strong, .profile-dropdown__meta small { display: block; }
.profile-dropdown__meta strong { color: var(--text-primary); font-size: .78rem; }
.profile-dropdown__meta small { margin-top: .12rem; color: var(--text-muted); font-size: .65rem; }
.profile-dropdown button { display: flex; width: 100%; align-items: center; gap: .65rem; padding: .62rem .7rem; border: 0; border-radius: .65rem; background: transparent; color: var(--text-secondary); font-size: .73rem; text-align: left; transition: background-color .16s ease, color .16s ease; }
.profile-dropdown button:hover { background: rgba(255,255,255,.05); color: var(--text-primary); }
.profile-dropdown button svg { width: 1rem; height: 1rem; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
.profile-dropdown__divider { height: 1px; margin: .3rem .2rem; background: var(--border-subtle); }
.profile-dropdown .profile-dropdown__logout { color: #f59aaa; }
.profile-dropdown .profile-dropdown__logout:hover { background: rgba(244,91,116,.09); color: #ffb0bd; }
.menu-pop-enter-active, .menu-pop-leave-active { transition: opacity .16s ease, transform .16s ease; transform-origin: top right; }
.menu-pop-enter-from, .menu-pop-leave-to { opacity: 0; transform: translateY(-.35rem) scale(.97); }

@media (max-width: 1023px) {
  .topbar { grid-template-columns: 1fr auto; padding-left: 4rem; }
  .topbar__center { display: none; }
}
@media (max-width: 640px) {
  .topbar { min-height: 4.25rem; padding-right: .7rem; }
  .brand__copy small, .profile-trigger__copy { display: none; }
  .profile-trigger { min-width: 0; grid-template-columns: 2.25rem .8rem; gap: .35rem; }
  .topbar__actions { gap: .35rem; }
}
@media (prefers-reduced-motion: reduce) {
  .brand__mark::after, .profile-trigger > svg, .menu-pop-enter-active, .menu-pop-leave-active { transition: none; }
}
</style>
