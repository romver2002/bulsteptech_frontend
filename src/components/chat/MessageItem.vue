<template>
  <div class="message-item mb-4">
    <!-- Системное сообщение -->
    <div v-if="message.type === 'system'" class="text-center py-2">
      <span class="text-xs text-discord-text-gray bg-discord-primary px-3 py-1 rounded-full">
        {{ message.content }}
      </span>
    </div>
    
    <!-- Обычное сообщение -->
    <div v-else class="flex items-start">
      <div class="bg-gray-700 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center">
        {{ message.username.charAt(0).toUpperCase() }}
      </div>
      <div class="ml-3 flex-1">
        <div class="flex items-center">
          <span class="font-medium">{{ message.username }}</span>
          <span class="ml-2 text-xs text-discord-text-gray">{{ formatTime(message.timestamp) }}</span>
        </div>
        <p class="text-discord-text-light" v-html="formatMessage(message.content)"></p>
        
        <!-- Вложения, если есть -->
        <div v-if="message.attachments && message.attachments.length" class="mt-2 space-y-2">
          <div v-for="(attachment, idx) in message.attachments" :key="idx" class="attachment">
            <img 
              v-if="isImage(attachment.url)" 
              :src="attachment.url" 
              :alt="attachment.name" 
              class="max-w-full max-h-52 rounded-md cursor-pointer hover:opacity-90"
            >
            <div 
              v-else
              class="attachment-file bg-discord-dark rounded-md p-2 flex items-center"
            >
              <svg class="w-5 h-5 text-discord-text-gray mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <div>
                <div class="text-sm text-white">{{ attachment.name }}</div>
                <div class="text-xs text-discord-text-gray">{{ formatFileSize(attachment.size) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Реакции (если есть) -->
        <div v-if="message.reactions && message.reactions.length" class="flex flex-wrap gap-1 mt-2">
          <button 
            v-for="reaction in message.reactions" 
            :key="reaction.emoji" 
            @click="$emit('toggle-reaction', message.id, reaction.emoji)"
            class="reaction-btn bg-discord-primary hover:bg-discord-dark px-2 py-0.5 rounded-full flex items-center space-x-1"
            :class="{'bg-discord-accent/20': reaction.users.includes(userId)}"
          >
            <span>{{ reaction.emoji }}</span>
            <span class="text-xs text-discord-text-gray">{{ reaction.count }}</span>
          </button>
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

defineEmits(['toggle-reaction']);

const userStore = useUserStore();
const userId = computed(() => userStore.id || 1);

// Форматирование времени
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Форматирование сообщения с поддержкой простого markdown
const formatMessage = (text) => {
  if (!text) return '';
  
  return text
    // Ссылки
    .replace(/https?:\/\/[^\s]+/g, '<a href="$&" target="_blank" class="text-blue-400 hover:underline">$&</a>')
    // Жирный текст
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Курсив
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Код
    .replace(/`(.*?)`/g, '<code class="bg-discord-dark px-1 rounded text-xs">$1</code>');
};

// Определение типа файла
const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

// Форматирование размера файла
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
</script>

<style scoped>
.reaction-btn {
  transition: all 0.2s ease;
}
.reaction-btn:hover {
  transform: scale(1.05);
}
</style>
