<template>
  <div class="sidebar bg-discord-secondary flex flex-col h-full" :class="[isMobile ? (isOpen ? 'w-64' : 'w-0') : 'w-64']">
    <div class="p-4 font-semibold text-white flex justify-between items-center">
      <div>{{ $t('sidebar.channels') }}</div>
      <button v-if="isMobile && isOpen" @click="toggleSidebar" class="text-discord-text-gray hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    
    <!-- Показываем разделы в соответствии с группами каналов -->
    <div class="px-3 py-2">
      <div class="mb-2">
        <div class="text-xs font-semibold text-discord-text-gray px-2 flex items-center mb-1">
          <span>УПРАВЛЕНИЕ ОБУЧЕНИЕМ</span>
        </div>
        <div class="space-y-0.5">
          <div 
            v-for="channel in filteredEducationChannels" 
            :key="channel.id"
            @click="handleChannelAction(channel.id)"
            class="channel-item flex items-center px-2 py-1 rounded cursor-pointer"
            :class="{'bg-discord-dark-hover': currentChannel?.id === channel.id}"
          >
            <span class="mr-2">{{ getChannelIcon(channel.id) }}</span>
            <span class="truncate">{{ channel.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- Секция АНАЛИТИКА только для преподавателей -->
      <div v-if="userStore.isTeacher" class="mb-2">
        <div class="text-xs font-semibold text-discord-text-gray px-2 flex items-center mb-1">
          <span>АНАЛИТИКА</span>
        </div>
        <div class="space-y-0.5">
          <div 
            v-for="channel in analyticsChannels" 
            :key="channel.id"
            @click="handleChannelAction(channel.id)"
            class="channel-item flex items-center px-2 py-1 rounded cursor-pointer"
            :class="{'bg-discord-dark-hover': currentChannel?.id === channel.id}"
          >
            <span class="mr-2">{{ getChannelIcon(channel.id) }}</span>
            <span class="truncate">{{ channel.name }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="user-controls p-3 bg-discord-dark flex items-center">
      <div class="avatar w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center text-white font-bold">
        {{ userInitials }}
      </div>
      <div class="ml-2 flex-1">
        <div class="text-sm text-white font-medium">{{ userStore.username }}</div>
        <div class="text-xs flex items-center">
          <span class="px-1.5 py-0.5 bg-discord-accent rounded-sm text-white text-xs mr-1">
            {{ userStore.isTeacher ? $t('auth.teacher') : $t('auth.student') }}
          </span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Кнопка для открытия меню на мобильных устройствах -->
  <div v-if="isMobile && !isOpen" 
       class="mobile-sidebar-toggle fixed top-16 left-4 z-50 bg-discord-accent rounded-full p-2 shadow-lg"
       @click="toggleSidebar">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../../stores/user';
import { useChannelStore } from '../../stores/channels';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const channelStore = useChannelStore();
const { t } = useI18n();
const router = useRouter();

// Состояние боковой панели
const isOpen = ref(false);
const isMobile = ref(false);

// Обработка изменения размера окна
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    isOpen.value = true;
  } else {
    isOpen.value = false;
  }
};

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};

// Получаем каналы из стора
const channels = computed(() => channelStore.channels);

const currentChannel = computed({
  get: () => channelStore.currentChannelId,
  set: (value) => channelStore.setCurrentChannel(value)
});

const selectChannel = (channelId) => {
  handleChannelAction(channelId);
};

const userInitials = computed(() => {
  const username = userStore.username || '';
  return username.substring(0, 2).toUpperCase();
});

const handleChannelAction = (channelId) => {
  if (channelId === 'profile') {
    router.push('/profile');
  } else if (channelId === 'resources') {
    router.push('/resources');
  } else {
    channelStore.setCurrentChannel(channelId);
  }
  
  // Если на мобильном, закрываем сайдбар
  if (window.innerWidth < 768) {
    isOpen.value = false;
  }
};

// Computed свойства для разделения каналов по группам
const educationChannels = computed(() => {
  return channels.value.filter(channel => channel.group === 'education');
});

const analyticsChannels = computed(() => {
  return channels.value.filter(channel => channel.group === 'analytics');
});

// Добавление функции getChannelIcon
const getChannelIcon = (channelId) => {
  if (channelId === 'lecture') return '📝';
  if (channelId === 'student-management') return '👥';
  if (channelId === 'assignments') return '📚';
  if (channelId === 'tests') return '📊';
  if (channelId === 'resources') return '📂';
  if (channelId === 'student-progress') return '📈';
  if (channelId === 'attendance') return '📅';
  if (channelId === 'reports') return '📑';
  return '💬';
};

// Добавляем новую computed функцию для фильтрации каналов
const filteredEducationChannels = computed(() => {
  // Если пользователь преподаватель - показываем все каналы
  if (userStore.isTeacher) {
    return educationChannels.value;
  }
  
  // Для студентов фильтруем каналы - не показываем "Управление студентами" и "Тесты и опросы"
  return educationChannels.value.filter(channel => 
    channel.id !== 'student-management' && channel.id !== 'tests'
  );
});

// Жизненный цикл компонента
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.sidebar {
  transition: width 0.3s ease;
  overflow: hidden;
}

.mobile-sidebar-toggle {
  transition: all 0.3s ease;
}

.channels-list {
  max-height: 300px;
  overflow-y: auto;
}

.channels-list::-webkit-scrollbar {
  width: 4px;
}

.channels-list::-webkit-scrollbar-track {
  background: transparent;
}

.channels-list::-webkit-scrollbar-thumb {
  background-color: rgba(114, 118, 125, 0.3);
  border-radius: 2px;
}
</style>
