<template>
  <div class="stream-view flex flex-col h-full">
    <!-- Основная область трансляции -->
    <div v-if="!streamActive" class="flex flex-col items-center justify-center p-8 bg-discord-dark rounded-md h-64 md:h-80">
      <div v-if="isTeacher" class="text-center">
        <h3 class="text-xl font-semibold mb-2">{{ currentStream.title }}</h3>
        <p class="text-discord-text-gray mb-4">{{ currentStream.description }}</p>
        <button 
          @click="handleStartStream" 
          class="bg-discord-accent hover:bg-discord-accent-hover text-white px-6 py-3 rounded-md font-medium flex items-center"
        >
          <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="currentColor"/>
          </svg>
          Начать трансляцию
        </button>
      </div>
      <div v-else class="text-center">
        <h3 class="text-xl font-semibold mb-2">{{ currentStream.title }}</h3>
        <p class="text-discord-text-gray mb-4">Трансляция еще не началась</p>
        <div class="text-discord-text-light">
          <div class="animate-pulse inline-flex items-center">
            <svg class="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor"/>
            </svg>
            Ожидание начала...
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="stream-container flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
      <!-- Видео-область -->
      <div class="flex-1 flex flex-col">
        <!-- Основное видео -->
        <div class="main-video-container relative bg-discord-dark rounded-md overflow-hidden mb-4">
          <img 
            :src="currentStream.imageSrc" 
            :alt="currentStream.title" 
            class="w-full h-auto max-h-[calc(100vh-200px)]"
          />
          
          <!-- Информация о трансляции -->
          <div class="absolute top-0 left-0 right-0 bg-black/60 p-2 flex justify-between items-center">
            <div class="flex items-center">
              <div class="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
              <span class="text-xs text-white">LIVE</span>
              <span class="mx-2 text-white">•</span>
              <span class="text-xs text-white">{{ currentStream.viewerCount }} зрителей</span>
            </div>
            
            <div class="flex items-center">
              <span class="text-xs text-white">{{ formatDuration(streamDuration) }}</span>
            </div>
          </div>
          
          <!-- Название трансляции -->
          <div class="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
            <h3 class="text-white font-medium">{{ currentStream.title }}</h3>
            <div class="flex items-center text-xs text-discord-text-light">
              <span>{{ currentStream.instructor.name }}</span>
            </div>
          </div>
        </div>
        
        <!-- Элементы управления -->
        <div class="stream-controls bg-discord-secondary p-3 rounded-md flex justify-between mb-4">
          <div class="flex items-center space-x-3">
            <button @click="toggleMicrophone" class="control-btn rounded-full p-2.5" :class="isMicrophoneOn ? 'bg-discord-dark hover:bg-discord-dark-hover' : 'bg-discord-error hover:bg-discord-error/80'">
              <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
                <line v-if="!isMicrophoneOn" x1="2" y1="2" x2="22" y2="22" stroke-width="2"></line>
              </svg>
            </button>
            
            <button @click="toggleCamera" class="control-btn rounded-full p-2.5" :class="isCameraOn ? 'bg-discord-dark hover:bg-discord-dark-hover' : 'bg-discord-error hover:bg-discord-error/80'">
              <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                <line v-if="!isCameraOn" x1="2" y1="2" x2="22" y2="22" stroke-width="2"></line>
              </svg>
            </button>
            
            <button @click="toggleScreenSharing" class="control-btn rounded-full p-2.5" :class="isScreenSharing ? 'bg-discord-accent hover:bg-discord-accent-hover' : 'bg-discord-dark hover:bg-discord-dark-hover'">
              <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </button>
            
            <button @click="toggleHandRaise" class="control-btn rounded-full p-2.5" :class="isHandRaised ? 'bg-discord-accent hover:bg-discord-accent-hover' : 'bg-discord-dark hover:bg-discord-dark-hover'">
              <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            </button>
            
            <button @click="toggleMenu" class="control-btn bg-discord-dark hover:bg-discord-dark-hover rounded-full p-2.5">
              <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
          </div>
          
          <div class="flex items-center space-x-3">
            <button @click="toggleParticipantsList" class="control-btn bg-discord-dark hover:bg-discord-dark-hover rounded-full p-2.5">
              <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span class="ml-1 text-sm">{{ participants.length }}</span>
            </button>
            
            <button v-if="isTeacher" @click="endStream" class="bg-discord-error hover:bg-discord-error-hover text-white font-medium py-2 px-4 rounded-md flex items-center">
              Завершить
            </button>
            <button v-else @click="leaveStream" class="bg-discord-error hover:bg-discord-error-hover text-white font-medium py-2 px-4 rounded-md flex items-center">
              Покинуть
            </button>
          </div>
        </div>
      </div>
      
      <!-- Чат -->
      <ChatBox 
        :messages="messages" 
        @send-message="handleSendMessage"
        @toggle-sidebar="toggleSidebar"
        @toggle-reaction="handleToggleReaction"
        :class="{'hidden lg:flex': isSidebarCollapsed}"
      />
      
      <!-- Список участников -->
      <ParticipantsList 
        :participants="participants" 
        :show="showParticipantsList"
        @toggle="toggleParticipantsList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../../stores/user';
import { useStreamStore } from '../../stores/stream';
import { useNotificationStore } from '../../stores/notification';
import VideoPanel from './VideoPanel.vue';
import ChatBox from './ChatBox.vue';
import ParticipantsList from './ParticipantsList.vue';

// Доступ к хранилищам
const userStore = useUserStore();
const streamStore = useStreamStore();
const notificationStore = useNotificationStore();

// Состояния компонента
const showReactions = ref(false);
const showParticipantsList = ref(false);
const isSidebarCollapsed = ref(false);
const streamDuration = ref(0);
let durationTimer = null;

// Делаем реактивные ссылки на состояния из store
const streamActive = computed(() => streamStore.streamActive);
const isLive = computed(() => streamStore.isLive);
const isMicrophoneOn = computed(() => streamStore.isMicrophoneOn);
const isCameraOn = computed(() => streamStore.isCameraOn);
const isScreenSharing = computed(() => streamStore.isScreenSharing);
const isHandRaised = computed(() => streamStore.isHandRaised);
const participants = computed(() => streamStore.participants);
const messages = computed(() => streamStore.messages);
const currentStream = computed(() => streamStore.currentStream);

// Computed-свойства
const isTeacher = computed(() => userStore.role === 'teacher');

// Реакции
const reactions = [
  { emoji: '👍', name: 'thumbs_up' },
  { emoji: '👏', name: 'clap' },
  { emoji: '🎉', name: 'party' },
  { emoji: '❤️', name: 'heart' },
  { emoji: '🔥', name: 'fire' },
  { emoji: '😂', name: 'laugh' }
];

// Методы для взаимодействия с трансляцией
const handleStartStream = () => {
  streamStore.startStream();
  startDurationTimer();
  notificationStore.success('Трансляция успешно начата');
};

const endStream = () => {
  if (confirm('Вы уверены, что хотите завершить трансляцию для всех участников?')) {
    streamStore.stopStream();
    stopDurationTimer();
    notificationStore.success('Трансляция завершена');
  }
};

const leaveStream = () => {
  if (confirm('Вы уверены, что хотите покинуть трансляцию?')) {
    streamStore.streamActive = false;
    notificationStore.info('Вы покинули трансляцию');
  }
};

// Методы для управления устройствами
const toggleMicrophone = () => {
  streamStore.toggleMicrophone();
};

const toggleCamera = () => {
  streamStore.toggleCamera();
};

const toggleScreenSharing = () => {
  streamStore.toggleScreenSharing();
};

// Интерактивные функции
const toggleHandRaise = () => {
  streamStore.toggleHandRaise();
};

const toggleReactions = () => {
  showReactions.value = !showReactions.value;
};

const sendReaction = (emoji) => {
  showReactions.value = false;
  streamStore.addSystemMessage(`${userStore.username} отправил реакцию ${emoji}`);
  notificationStore.success(`Реакция ${emoji} отправлена`);
};

// Управление интерфейсом
const toggleParticipantsList = () => {
  showParticipantsList.value = !showParticipantsList.value;
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const toggleMenu = () => {
  showReactions.value = !showReactions.value;
};

// Методы для работы с таймером трансляции
const startDurationTimer = () => {
  streamDuration.value = 0;
  durationTimer = setInterval(() => {
    streamDuration.value++;
  }, 1000);
};

const stopDurationTimer = () => {
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}ч`);
  parts.push(`${minutes.toString().padStart(2, '0')}м`);
  parts.push(`${secs.toString().padStart(2, '0')}с`);
  
  return parts.join(':');
};

// Обработка отправки сообщения в чат
const handleSendMessage = (message) => {
  streamStore.addMessage({
    username: userStore.username,
    content: message,
    timestamp: new Date(),
    userId: userStore.id
  });
};

// Обработка реакций в чате
const handleToggleReaction = (messageId, emoji) => {
  streamStore.toggleMessageReaction({
    messageId,
    emoji,
    userId: userStore.id
  });
};

// Жизненный цикл компонента
onMounted(() => {
  // Если уже идет трансляция, запускаем таймер
  if (streamActive.value) {
    startDurationTimer();
  }
  
  // Закрытие панелей при клике вне
  document.addEventListener('click', (e) => {
    if (showReactions.value && !e.target.closest('.control-btn')) {
      showReactions.value = false;
    }
  });
  
  // Эмуляция случайных событий для демонстрации
  setInterval(() => {
    // Случайно меняем говорящего участника
    const speakingIndex = Math.floor(Math.random() * participants.value.length);
    const updatedParticipants = [...participants.value];
    updatedParticipants.forEach((p, idx) => {
      p.speaking = idx === speakingIndex;
    });
  }, 5000);
});

onUnmounted(() => {
  stopDurationTimer();
});
</script>

<style scoped>
.control-btn {
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.control-btn:hover {
  transform: scale(1.05);
}

.control-btn:active {
  transform: scale(0.95);
}

.stream-view {
  min-height: 500px;
}

.stream-container {
  height: calc(100vh - 180px);
}

.main-video-container {
  min-height: 300px;
  background-color: #202225;
}

@media (max-width: 768px) {
  .stream-container {
    height: auto;
  }
  
  .main-video-container {
    min-height: 200px;
  }
}
</style>
