<template>
  <div class="relative" ref="dropdown">
    <button 
      @click="toggleDropdown"
      class="language-trigger"
      :aria-expanded="isOpen"
      aria-label="Выбрать язык"
    >
      <span class="text-base xl:mr-1.5">{{ currentLocaleFlag }}</span>
      <span class="hidden text-xs font-semibold text-slate-300 xl:inline">{{ currentLocaleName }}</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="ml-1 hidden h-4 w-4 text-slate-500 transition-transform xl:block"
        :class="{ 'transform rotate-180': isOpen }"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <transition name="language-menu">
      <div
        v-if="isOpen"
        class="absolute right-0 top-full z-50 mt-3 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/98 p-2 shadow-2xl shadow-black/50"
      >
        <button
          v-for="locale in availableLocales"
          :key="locale.code"
          @click="changeLocale(locale.code)"
          class="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          :class="locale.code === currentLocale ? 'bg-cyan-400/10 text-cyan-200' : ''"
        >
          <span class="text-lg mr-2">{{ locale.flag }}</span>
          <span>{{ locale.name }}</span>
          <span v-if="locale.code === currentLocale" class="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,.8)]" />
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { availableLocales, setLocale } from '../../i18n';

const i18n = useI18n();
const isOpen = ref(false);
const dropdown = ref(null);

const currentLocale = computed(() => i18n.locale.value);

const currentLocaleFlag = computed(() => {
  const locale = availableLocales.find(locale => locale.code === currentLocale.value);
  return locale ? locale.flag : '🌐';
});

const currentLocaleName = computed(() => {
  const locale = availableLocales.find(locale => locale.code === currentLocale.value);
  return locale ? locale.name : 'Language';
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const changeLocale = (localeCode) => {
  setLocale(localeCode);
  isOpen.value = false;
};

// Обработка клика вне компонента для закрытия выпадающего меню
const handleClickOutside = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.language-trigger {
  display: flex;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, .075);
  border-radius: .9rem;
  background: rgba(255, 255, 255, .035);
  padding: 0 .7rem;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.language-trigger:hover {
  border-color: rgba(34, 211, 238, .18);
  background: rgba(255, 255, 255, .065);
}

.language-trigger:active { transform: scale(.98); }
.language-trigger:focus-visible { outline: 2px solid rgba(34, 211, 238, .7); outline-offset: 2px; }

.language-menu-enter-active,
.language-menu-leave-active { transition: opacity 150ms ease, transform 150ms ease; transform-origin: top right; }
.language-menu-enter-from,
.language-menu-leave-to { opacity: 0; transform: translateY(-6px) scale(.98); }
</style>
