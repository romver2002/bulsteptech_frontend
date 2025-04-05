<template>
  <div class="top-bar h-12 bg-discord-dark border-b border-black flex items-center px-4">
    <div class="flex items-center">
      <img src="/assets/logo.svg" alt="Logo" class="h-8 w-8 mr-2" onerror="this.src='/logo.svg'; this.onerror=null;" />
      <h1 class="text-white font-semibold text-lg md:block hidden">{{ $t('app.platformName') }}</h1>
      <h1 class="text-white font-semibold text-lg md:hidden">BT</h1>
    </div>
    
    <div class="ml-auto flex items-center gap-2 md:gap-4">
      <!-- Переключатель языка -->
      <LanguageSwitcher />
      
      <!-- Выпадающее меню на мобильных устройствах -->
      <div class="relative" ref="dropdownContainer">
        <button 
          @click="toggleMenu" 
          class="text-discord-text-light hover:text-white flex items-center"
        >
          <span class="hidden md:inline-block">{{ $t('common.hello') }}, {{ userStore.username }}!</span>
          <span class="md:hidden inline-block">
            <div class="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center text-white">
              {{ userInitials }}
            </div>
          </span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 ml-1" 
            :class="{ 'transform rotate-180': isMenuOpen }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div 
          v-if="isMenuOpen"
          class="absolute right-0 mt-2 w-48 bg-discord-dark border border-gray-700 rounded-md shadow-lg z-50"
        >
          <div class="py-1">
            <div class="md:hidden px-4 py-2 text-sm text-discord-text-light border-b border-gray-700">
              {{ userStore.username }}
            </div>
            <div class="px-4 py-2 text-sm text-discord-text-light border-b border-gray-700">
              {{ $t('auth.role') }}: {{ userStore.isTeacher ? $t('auth.teacher') : $t('auth.student') }}
            </div>
            <router-link to="/profile" class="block px-4 py-2 text-sm text-discord-text-light hover:bg-discord-secondary">
              {{ $t('common.profile') }}
            </router-link>
            <div class="border-t border-gray-700">
              <button 
                @click="logout" 
                class="block w-full text-left px-4 py-2 text-sm text-discord-error hover:bg-discord-secondary"
              >
                {{ $t('common.logout') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '../ui/LanguageSwitcher.vue';

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();
const isMenuOpen = ref(false);
const dropdownContainer = ref(null);

const userInitials = computed(() => {
  const username = userStore.username || '';
  return username.substring(0, 2).toUpperCase();
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const logout = () => {
  userStore.logout();
  router.push('/login');
};

// Закрытие выпадающего меню при клике вне его области
const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    isMenuOpen.value = false;
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
svg {
  transition: transform 0.2s ease;
}
</style>
