<template>
  <div class="relative" ref="dropdown">
    <button 
      @click="toggleDropdown"
      class="flex items-center justify-center bg-discord-dark-hover p-1.5 rounded hover:bg-discord-secondary"
    >
      <span class="text-lg md:mr-1">{{ currentLocaleFlag }}</span>
      <span class="text-xs text-discord-text-light hidden md:inline">{{ currentLocaleName }}</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-4 w-4 text-discord-text-gray ml-1 hidden md:block"
        :class="{ 'transform rotate-180': isOpen }"
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div 
      v-if="isOpen"
      class="absolute right-0 top-full mt-1 w-40 bg-discord-dark border border-gray-700 rounded-md shadow-lg overflow-hidden z-50"
    >
      <div class="py-1">
        <button
          v-for="locale in availableLocales"
          :key="locale.code"
          @click="changeLocale(locale.code)"
          class="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-discord-secondary"
          :class="locale.code === currentLocale ? 'bg-discord-accent/10' : ''"
        >
          <span class="text-lg mr-2">{{ locale.flag }}</span>
          <span class="text-discord-text-light">{{ locale.name }}</span>
        </button>
      </div>
    </div>
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
button {
  transition: background-color 0.2s ease;
}

svg {
  transition: transform 0.2s ease;
}
</style> 