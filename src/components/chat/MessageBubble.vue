<template>
  <div class="message-bubble" :class="{'own-message': isOwnMessage}">
    <!-- Системное сообщение -->
    <div v-if="message.type === 'system'" class="system-message text-center my-3">
      <span class="text-xs text-discord-text-gray bg-discord-dark rounded-full px-3 py-1">
        {{ message.content }}
      </span>
    </div>
    
    <!-- Обычное сообщение -->
    <div v-else class="flex items-start mb-4" :class="{'justify-end': isOwnMessage}">
      <!-- Аватар пользователя (не показываем для собственных сообщений) -->
      <div v-if="!isOwnMessage" class="flex-shrink-0 mr-3">
        <div class="w-10 h-10 rounded-full bg-discord-secondary flex items-center justify-center">
          {{ message.username.charAt(0).toUpperCase() }}
        </div>
      </div>
      
      <!-- Тело сообщения -->
      <div :class="{'bg-discord-primary': !isOwnMessage, 'bg-discord-accent': isOwnMessage}"
           class="rounded-lg p-3 max-w-[80%] break-words shadow-sm">
        
        <!-- Заголовок сообщения: имя и время -->
        <div class="flex items-baseline justify-between mb-1">
          <span v-if="!isOwnMessage" class="font-medium text-sm">{{ message.username }}</span>
          <span v-else class="font-medium text-sm">Вы</span>
          <span class="text-xs opacity-70 ml-2">{{ formatTime(message.timestamp) }}</span>
        </div>
        
        <!-- Текст сообщения с форматированием -->
        <div class="message-content" v-html="formatMessage(message.content)"></div>
        
        <!-- Реакции (если есть) -->
        <div v-if="message.reactions && message.reactions.length" class="flex flex-wrap gap-1 mt-2">
          <div 
            v-for="reaction in message.reactions" 
            :key="reaction.emoji"
            @click="$emit('toggle-reaction', message.id, reaction.emoji)"
            class="reaction-button flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-discord-dark hover:bg-discord-dark-hover"
          >
            <span>{{ reaction.emoji }}</span>
            <span class="text-xs">{{ reaction.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../../stores/user';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['toggle-reaction']);

const userStore = useUserStore();
const currentUsername = computed(() => userStore.username || '');

const isOwnMessage = computed(() => {
  return props.message.type !== 'system' && props.message.username === currentUsername.value;
});

// Форматирование и вспомогательные функции
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatMessage = (text) => {
  if (!text) return '';
  
  // Базовое форматирование
  return text
    // Ссылки
    .replace(/https?:\/\/[^\s]+/g, '<a href="$&" target="_blank" class="text-blue-400 hover:underline">$&</a>')
    // Жирный текст
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Курсив
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Зачеркнутый текст
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    // Код
    .replace(/`(.*?)`/g, '<code class="bg-discord-dark px-1 rounded text-xs">$1</code>');
};
</script>

<style scoped>
.message-bubble {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.reaction-button {
  transition: all 0.2s ease;
}

.reaction-button:hover {
  transform: scale(1.05);
}
</style>
