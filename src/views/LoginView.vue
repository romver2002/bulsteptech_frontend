<template>
  <main class="login-page relative min-h-[100dvh] overflow-hidden bg-[#060a12] text-white">
    <div class="login-mesh pointer-events-none absolute inset-0" aria-hidden="true" />
    <div class="pointer-events-none absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-cyan-400/[0.08]" aria-hidden="true" />
    <div class="pointer-events-none absolute -bottom-64 right-[15%] h-[38rem] w-[38rem] rounded-full bg-fuchsia-500/[0.07]" aria-hidden="true" />

    <div class="relative z-10 mx-auto grid min-h-[100dvh] max-w-[1500px] lg:grid-cols-[1.1fr_.9fr]">
      <section class="relative hidden min-h-full flex-col justify-between border-r border-white/[0.06] px-10 py-9 lg:flex xl:px-16 xl:py-12">
        <div class="flex items-center">
          <span class="login-logo flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black tracking-[-0.08em] shadow-xl shadow-indigo-950/50">BT</span>
          <div class="ml-3">
            <p class="text-lg font-extrabold tracking-tight">БулСтеп<span class="text-cyan-300">Тех</span></p>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">learning operating system</p>
          </div>
        </div>

        <div class="my-12 max-w-3xl">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
            <span class="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.95)]" />
            Учебное пространство нового поколения
          </div>
          <h1 class="max-w-3xl text-5xl font-black leading-[.98] tracking-[-0.05em] text-white xl:text-7xl">
            Знания превращаются
            <span class="hero-gradient block">в скорость.</span>
          </h1>
          <p class="mt-7 max-w-xl text-base leading-relaxed text-slate-400 xl:text-lg">
            Лекции, практика, аналитика и живая коммуникация в одном быстром пространстве — без лишнего шума.
          </p>

          <div class="mt-10 grid max-w-xl grid-cols-3 gap-3">
            <div v-for="stat in stats" :key="stat.label" class="metric-card rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <p class="text-2xl font-black tracking-tight text-white">{{ stat.value }}</p>
              <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <div class="learning-card relative h-52 max-w-2xl overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#0e1627]/85 p-5 shadow-2xl shadow-black/30 xl:h-60">
          <div class="learning-glow absolute -right-20 -top-28 h-72 w-72 rounded-full" aria-hidden="true" />
          <div class="relative z-10 flex items-start justify-between">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300/70">Live learning pulse</p>
              <p class="mt-2 text-lg font-bold">Vue 3 · Архитектура интерфейсов</p>
            </div>
            <span class="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> live
            </span>
          </div>
          <div class="relative z-10 mt-8 grid grid-cols-[1fr_auto] items-end gap-6">
            <div>
              <div class="flex h-20 items-end gap-1.5" aria-label="График активности">
                <span v-for="(height, index) in activityBars" :key="index" class="activity-bar flex-1 rounded-t-md" :style="{ height: `${height}%`, animationDelay: `${index * 70}ms` }" />
              </div>
              <div class="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-600"><span>09:00</span><span>сейчас</span></div>
            </div>
            <div class="flex -space-x-2 pb-1">
              <span v-for="person in ['АП', 'МК', 'ДС']" :key="person" class="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#111a2a] bg-gradient-to-br from-cyan-400 to-indigo-600 text-[10px] font-black">{{ person }}</span>
              <span class="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#111a2a] bg-slate-800 text-[10px] font-black text-slate-300">+24</span>
            </div>
          </div>
        </div>
      </section>

      <section class="flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-20">
        <div class="w-full max-w-md">
          <div class="mb-10 flex items-center lg:hidden">
            <span class="login-logo flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-black tracking-[-0.08em]">BT</span>
            <p class="ml-3 text-lg font-extrabold">БулСтеп<span class="text-cyan-300">Тех</span></p>
          </div>

          <div class="mb-8">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300/80">Добро пожаловать</p>
            <h2 class="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Начнём движение</h2>
            <p class="mt-3 text-sm leading-relaxed text-slate-500">Выберите роль и войдите в своё учебное пространство.</p>
          </div>

          <form class="space-y-6" novalidate @submit.prevent="login">
            <fieldset>
              <legend class="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Кем вы входите?</legend>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="role in roles"
                  :key="role.id"
                  type="button"
                  class="role-card relative overflow-hidden rounded-2xl border p-4 text-left"
                  :class="selectedRole === role.id ? 'role-card--active' : 'role-card--idle'"
                  :aria-pressed="selectedRole === role.id"
                  @click="selectedRole = role.id"
                >
                  <span class="mb-5 flex h-10 w-10 items-center justify-center rounded-xl" :class="selectedRole === role.id ? 'bg-cyan-300 text-slate-950' : 'bg-white/[0.055] text-slate-400'">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path :d="role.icon" /></svg>
                  </span>
                  <span class="block text-sm font-bold text-white">{{ role.label }}</span>
                  <span class="mt-1 block text-[11px] text-slate-500">{{ role.description }}</span>
                  <span v-if="selectedRole === role.id" class="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-300 text-slate-950">
                    <svg class="h-3 w-3" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6" /></svg>
                  </span>
                </button>
              </div>
            </fieldset>

            <div>
              <label for="username" class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Ваше имя</label>
              <div class="input-shell flex items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4">
                <svg class="h-5 w-5 flex-none text-slate-600" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm7 8a7 7 0 00-14 0" /></svg>
                <input
                  id="username"
                  v-model="username"
                  class="h-14 min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-white outline-none placeholder:text-slate-700"
                  autocomplete="username"
                  placeholder="Например, Алексей"
                  :aria-invalid="Boolean(error)"
                  :aria-describedby="error ? 'login-error' : undefined"
                  @input="error = ''"
                >
              </div>
              <transition name="error-message">
                <p v-if="error" id="login-error" class="mt-2 flex items-center gap-2 text-xs font-semibold text-rose-300" role="alert">
                  <span class="h-1.5 w-1.5 rounded-full bg-rose-400" />{{ error }}
                </p>
              </transition>
            </div>

            <button
              type="submit"
              class="submit-button group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl text-sm font-black text-white shadow-xl shadow-indigo-950/40 transition active:scale-[.99] disabled:cursor-wait disabled:opacity-70"
              :disabled="loading"
            >
              <span class="submit-shine absolute inset-0" aria-hidden="true" />
              <span class="relative flex items-center gap-2">
                <svg v-if="loading" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 11-4-7.5" /></svg>
                <template v-else>
                  Войти как {{ selectedRole === 'teacher' ? 'преподаватель' : 'студент' }}
                  <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5l5 5-5 5" /></svg>
                </template>
              </span>
            </button>
          </form>

          <p class="mt-7 text-center text-[11px] leading-relaxed text-slate-600">
            Демонстрационный вход · пароль не требуется<br>
            Роль управляет доступными разделами интерфейса
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const username = ref('')
const selectedRole = ref('student')
const error = ref('')
const loading = ref(false)

const stats = [
  { value: '98%', label: 'вовлечённость' },
  { value: '24/7', label: 'доступ' },
  { value: '1.8×', label: 'быстрее' }
]

const activityBars = [28, 42, 36, 58, 45, 72, 64, 86, 74, 92, 78, 96, 84, 100]

const roles = [
  {
    id: 'student',
    label: 'Студент',
    description: 'Учиться и расти',
    icon: 'M12 4L3 9l9 5 9-5-9-5zm-6.5 7.2V16L12 20l6.5-4v-4.8'
  },
  {
    id: 'teacher',
    label: 'Преподаватель',
    description: 'Создавать и вести',
    icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0M18 7h4m-2-2v4'
  }
]

async function login() {
  const normalizedName = username.value.trim()
  if (!normalizedName) {
    error.value = 'Введите имя, чтобы продолжить'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await new Promise((resolve) => window.setTimeout(resolve, 280))
    userStore.login(normalizedName, selectedRole.value)
    notificationStore.success(`Рады видеть вас, ${normalizedName}`, 'Вход выполнен')
    const redirect = typeof route.query.redirect === 'string'
      && route.query.redirect.startsWith('/')
      && !route.query.redirect.startsWith('//')
      ? route.query.redirect
      : null
    await router.replace(redirect || { name: selectedRole.value === 'teacher' ? 'Teacher' : 'Student' })
  } catch (loginError) {
    error.value = loginError.message || 'Не удалось выполнить вход'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-mesh {
  background-image:
    linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(circle at 45% 45%, black, transparent 76%);
}

.login-logo { background: linear-gradient(145deg, #22d3ee, #6366f1 54%, #d946ef); }
.hero-gradient { color: transparent; background: linear-gradient(100deg, #67e8f9 4%, #818cf8 46%, #f0abfc 88%); background-clip: text; }

.learning-glow { background: radial-gradient(circle, rgba(34,211,238,.28), transparent 68%); }
.activity-bar { background: linear-gradient(to top, rgba(99,102,241,.48), rgba(103,232,249,.95)); transform-origin: bottom; animation: bar-rise 700ms cubic-bezier(.2,.8,.2,1) both; }

.metric-card { transition: transform 180ms ease, border-color 180ms ease, background-color 180ms ease; }
.metric-card:hover { transform: translateY(-3px); border-color: rgba(103,232,249,.17); background: rgba(255,255,255,.05); }

.role-card { min-height: 8.75rem; transition: transform 170ms ease, border-color 170ms ease, background-color 170ms ease, box-shadow 170ms ease; }
.role-card svg,
.input-shell svg,
.submit-button svg { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.9; }
.role-card--idle { border-color: rgba(255,255,255,.075); background: rgba(255,255,255,.025); }
.role-card--idle:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.14); background: rgba(255,255,255,.045); }
.role-card--active { transform: translateY(-2px); border-color: rgba(103,232,249,.42); background: linear-gradient(145deg, rgba(34,211,238,.1), rgba(99,102,241,.1)); box-shadow: 0 18px 50px rgba(15,23,42,.35), inset 0 1px 0 rgba(255,255,255,.05); }
.role-card:focus-visible { outline: 2px solid rgba(103,232,249,.8); outline-offset: 2px; }

.input-shell { transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease; }
.input-shell:focus-within { border-color: rgba(103,232,249,.46); background: rgba(255,255,255,.05); box-shadow: 0 0 0 4px rgba(34,211,238,.07); }

.submit-button { background: linear-gradient(105deg, #0891b2, #4f46e5 52%, #c026d3); }
.submit-button::after { content: ''; position: absolute; inset: 1px; border-radius: .93rem; border-top: 1px solid rgba(255,255,255,.22); pointer-events: none; }
.submit-shine { background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.22), transparent 70%); transform: translateX(-110%); transition: transform 650ms ease; }
.submit-button:hover .submit-shine { transform: translateX(110%); }

.error-message-enter-active,
.error-message-leave-active { transition: opacity 140ms ease, transform 140ms ease; }
.error-message-enter-from,
.error-message-leave-to { opacity: 0; transform: translateY(-4px); }

@keyframes bar-rise { from { transform: scaleY(.08); opacity: .2; } to { transform: scaleY(1); opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .activity-bar { animation: none; }
  .metric-card,
  .role-card,
  .submit-shine,
  .error-message-enter-active,
  .error-message-leave-active { transition-duration: 1ms !important; }
}
</style>
