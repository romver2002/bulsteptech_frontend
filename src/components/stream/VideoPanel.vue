<template>
  <div class="video-area relative bg-discord-dark flex-1 overflow-hidden">
    <!-- Главное видео (преподаватель или презентация) -->
    <div class="main-video-container h-full flex items-center justify-center">
      <div v-if="streamActive" class="relative w-full h-full">
        <!-- Вместо видео используем постер -->
        <img 
          class="w-full h-full object-cover" 
          src="/assets/stream-poster.png"
          alt="Stream poster"
        />
        
        <!-- Индикатор живой трансляции -->
        <div v-if="isLive" class="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded-md flex items-center">
          <span class="animate-pulse mr-2 h-2 w-2 bg-white rounded-full"></span>
          LIVE
        </div>
        
        <!-- Информация о преподавателе -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div class="flex items-center">
            <div class="relative">
              <img src="/assets/teacher-avatar.png" alt="instructor" class="w-12 h-12 rounded-full border-2 border-discord-accent">
              <div class="absolute bottom-0 right-0 bg-discord-success w-3 h-3 rounded-full border-2 border-discord-dark"></div>
            </div>
            <div class="ml-3">
              <h3 class="text-white font-semibold text-lg">{{ currentStream.instructor.name }}</h3>
              <p class="text-gray-300 text-sm">{{ currentStream.title }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Плейсхолдер при отсутствии трансляции -->
      <div v-else class="flex flex-col items-center text-center px-6">
        <!-- Заменяем отсутствующий SVG на встроенный SVG-код -->
        <div class="w-48 h-48 mb-6 opacity-60">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-full h-full text-discord-text-gray">
            <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="3" fill="none" />
            <line x1="30" y1="30" x2="70" y2="70" stroke="currentColor" stroke-width="3" />
            <line x1="30" y1="70" x2="70" y2="30" stroke="currentColor" stroke-width="3" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Трансляция не начата</h2>
        <p class="text-discord-text-gray mb-6 max-w-md">Преподаватель ещё не начал трансляцию. Вы получите уведомление, когда занятие начнётся.</p>
        <img 
          src="/assets/stream-placeholder.png" 
          alt="Stream placeholder"
          class="w-full max-w-md rounded-lg mb-6"
        />
        <button v-if="isTeacher" @click="startStream" class="bg-discord-accent hover:bg-discord-accent-hover text-white font-medium py-2 px-6 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
          </svg>
          Начать трансляцию
        </button>
      </div>
    </div>
    
    <!-- Сетка участников (малые видео) -->
    <div v-if="streamActive && participants.length > 1" class="participants-grid absolute right-4 top-4 w-48 flex flex-col gap-2">
      <div 
        v-for="(participant, index) in visibleParticipants" 
        :key="participant.id"
        class="participant-tile relative bg-discord-dark rounded-md overflow-hidden transition-all duration-300"
        :class="{'border-2 border-discord-accent': participant.speaking}"
      >
        <!-- Вместо видео используем изображение-заглушку -->
        <img 
          class="w-full h-full object-cover" 
          src="/assets/teacher-avatar.png" 
          alt="Участник"
        />
        
        <!-- Иконки состояния микрофона и камеры -->
        <div class="absolute bottom-1 left-1 flex gap-1">
          <div v-if="participant.micMuted" class="bg-discord-error rounded-full p-1">
            <svg class="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 11a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 0 1-3-3V5a3 3 0 0 1 6 0v6a3 3 0 0 1-3 3z" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="2" y1="2" x2="22" y2="22" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div v-if="participant.videoOff" class="bg-discord-error rounded-full p-1">
            <svg class="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18.336 5.405l-2.998 1.865M5.664 5.405l2.998 1.865M14.839 7.679L8 7.679M9.161 16.321L16 16.321" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 2H11C7.13401 2 4 5.13401 4 9V15C4 18.866 7.13401 22 11 22H13C16.866 22 20 18.866 20 15V9C20 5.13401 16.866 2 13 2Z" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="2" y1="2" x2="22" y2="22" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        <!-- Имя участника -->
        <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-white p-1 truncate">
          {{ participant.name }}
        </div>
      </div>
      
      <!-- Индикатор дополнительных участников -->
      <div v-if="hiddenParticipantsCount > 0" @click="showAllParticipants = !showAllParticipants" class="cursor-pointer bg-discord-secondary rounded-md p-2 text-center text-sm text-white">
        +{{ hiddenParticipantsCount }} ещё
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '../../stores/user';
import { useStreamStore } from '../../stores/stream';

const props = defineProps({
  streamActive: {
    type: Boolean,
    default: false
  },
  isLive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['start-stream']);

// Доступ к хранилищам
const userStore = useUserStore();
const streamStore = useStreamStore();

// Состояния компонента
const mainVideo = ref(null);
const showAllParticipants = ref(false);

// Computed-свойства
const isTeacher = computed(() => userStore.role === 'teacher');

const currentStream = computed(() => streamStore.currentStream || {
  id: 1,
  title: 'Введение в Vue 3 - Практические примеры',
  instructor: {
    id: 1,
    name: 'Иван Петров',
    avatar: '/assets/teacher-avatar.png'
  },
  poster: '/assets/stream-poster.png',
  status: 'live',
  startedAt: new Date(),
  viewerCount: 28
});

const participants = computed(() => streamStore.participants || []);

const visibleParticipants = computed(() => {
  if (showAllParticipants.value) {
    return participants.value.filter(p => p.id !== 1).slice(0, 4);
  } else {
    return participants.value.filter(p => p.id !== 1).slice(0, 2);
  }
});

const hiddenParticipantsCount = computed(() => {
  return Math.max(0, participants.value.length - 3 - (showAllParticipants.value ? 4 : 2));
});

// Методы
const startStream = () => {
  emit('start-stream');
};

// Жизненный цикл
onMounted(() => {
  // Для совместимости с компонентом, оставляем этот код, но видео заменено на изображение
  if (props.streamActive && mainVideo.value) {
    console.log('Эмуляция загрузки видео');
  }
});

watch(() => props.streamActive, (isActive) => {
  if (isActive && mainVideo.value) {
    console.log('Эмуляция загрузки видео при изменении состояния');
  }
});
</script>

<style scoped>
.participant-tile {
  aspect-ratio: 16/9;
  transition: border-color 0.3s ease, transform 0.2s ease;
}

.participant-tile:hover {
  transform: scale(1.05);
  z-index: 10;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
