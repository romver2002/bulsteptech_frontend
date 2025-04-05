<template>
  <div class="message-list">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="loading-spinner mr-2"></div>
      <span class="text-discord-text-gray">Загрузка сообщений...</span>
    </div>
    
    <div v-else-if="messages.length === 0" class="empty-messages py-10 text-center">
      <div class="text-5xl mb-3">💬</div>
      <h3 class="text-lg font-medium mb-2">Нет сообщений</h3>
      <p class="text-discord-text-gray text-sm">Начните общение прямо сейчас!</p>
    </div>
    
    <div v-else class="messages-container space-y-4">
      <div v-for="(group, index) in messageGroups" :key="index" class="message-group">
        <div class="message-date-divider flex items-center justify-center my-4" v-if="group.showDivider">
          <div class="line flex-grow h-px bg-discord-dark-hover"></div>
          <div class="date-label px-2 text-xs text-discord-text-gray">{{ formatDateDivider(group.date) }}</div>
          <div class="line flex-grow h-px bg-discord-dark-hover"></div>
        </div>
        
        <div v-for="message in group.messages" :key="message.id" class="message-wrapper">
          <div class="message" :class="{ 'system-message': message.type === 'system' }">
            <!-- Системное сообщение -->
            <div v-if="message.type === 'system'" class="system-message flex items-center justify-center py-1">
              <span class="text-xs text-discord-text-gray bg-discord-dark rounded-full px-3 py-1">
                {{ message.content }}
              </span>
            </div>
            
            <!-- Обычное сообщение -->
            <div v-else class="user-message flex">
              <!-- Аватар пользователя (показываем только для первого сообщения в группе) -->
              <div v-if="message.showAvatar" class="avatar-container mt-1 mr-3">
                <div v-if="message.avatar" class="avatar w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img :src="message.avatar" :alt="message.username" class="w-full h-full object-cover">
                </div>
                <div v-else class="avatar-placeholder w-10 h-10 rounded-full bg-discord-accent flex items-center justify-center text-white font-medium flex-shrink-0">
                  {{ message.username ? message.username.charAt(0).toUpperCase() : 'U' }}
                </div>
              </div>
              <div v-else class="avatar-spacer w-10 mr-3"></div>
              
              <div class="message-content flex-1 min-w-0">
                <!-- Имя пользователя и время (показываем только для первого сообщения) -->
                <div v-if="message.showHeader" class="message-header flex items-baseline">
                  <div class="username font-medium" :class="message.roleColor || 'text-white'">
                    {{ message.username }}
                  </div>
                  
                  <div v-if="message.role" class="user-role ml-2 px-1.5 py-0.5 text-xs rounded" :class="getRoleBadgeClass(message.role)">
                    {{ getRoleLabel(message.role) }}
                  </div>
                  
                  <div class="message-time ml-2 text-xs text-discord-text-gray">
                    {{ formatTime(message.timestamp) }}
                  </div>
                </div>
                
                <!-- Текст сообщения -->
                <div class="message-text break-words text-discord-text-light" :class="{'mt-0.5': message.showHeader}">
                  {{ message.content }}
                </div>
                
                <!-- Вложения -->
                <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments mt-2 space-y-2">
                  <div v-for="(attachment, idx) in message.attachments" :key="idx" class="attachment">
                    <div v-if="isImage(attachment.url)" class="image-attachment">
                      <img 
                        :src="attachment.url" 
                        :alt="attachment.name" 
                        class="max-w-full rounded-md max-h-60 cursor-pointer hover:opacity-90"
                        @click="openAttachment(attachment)"
                      >
                    </div>
                    <div v-else class="file-attachment bg-discord-dark rounded-md p-2 flex items-center">
                      <div class="file-icon mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-discord-text-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div class="file-info">
                        <div class="file-name text-sm font-medium text-white">{{ attachment.name }}</div>
                        <div class="file-size text-xs text-discord-text-gray">{{ formatFileSize(attachment.size) }}</div>
                      </div>
                      <a 
                        :href="attachment.url" 
                        download 
                        class="download-button ml-auto text-discord-accent hover:underline text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Скачать
                      </a>
                    </div>
                  </div>
                </div>
                
                <!-- Реакции -->
                <div v-if="message.reactions && message.reactions.length > 0" class="message-reactions flex flex-wrap mt-2 gap-1">
                  <button 
                    v-for="reaction in message.reactions" 
                    :key="reaction.emoji"
                    class="reaction-button flex items-center bg-discord-dark hover:bg-discord-dark-hover rounded-md px-1.5 py-0.5 text-xs transition-colors"
                    :class="{ 'border border-discord-accent border-opacity-50': hasUserReacted(message.id, reaction.emoji) }"
                    @click="toggleReaction(message.id, reaction.emoji)"
                  >
                    <span class="emoji mr-1">{{ reaction.emoji }}</span>
                    <span class="count text-discord-text-gray">{{ reaction.count }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div 
      v-if="hasMoreMessages" 
      class="load-more-container flex justify-center py-4"
    >
      <button 
        @click="loadMoreMessages" 
        class="load-more-button px-4 py-2 rounded-md bg-discord-dark hover:bg-discord-dark-hover text-discord-text-light text-sm"
        :disabled="loadingMore"
      >
        <div v-if="loadingMore" class="flex items-center">
          <div class="loading-spinner mr-2 w-4 h-4"></div>
          <span>Загрузка...</span>
        </div>
        <span v-else>Загрузить предыдущие сообщения</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watchEffect } from 'vue';
import { useUserStore } from '../../stores/user';

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasMoreMessages: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['load-more', 'toggle-reaction', 'open-attachment']);

const userStore = useUserStore();
const loadingMore = ref(false);

// Группировка сообщений по дате и автору
const messageGroups = computed(() => {
  const groups = [];
  let currentGroup = null;
  let currentDate = null;
  let currentAuthor = null;
  
  props.messages.forEach((message, index) => {
    const messageDate = new Date(message.timestamp);
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    // Показываем разделитель даты, если это первое сообщение или дата изменилась
    const showDivider = !currentDate || messageDay.getTime() !== currentDate.getTime();
    
    // Проверяем, нужно ли показывать аватар и имя (новый автор или прошло больше 5 минут)
    const isSameAuthor = currentAuthor === message.username && message.type !== 'system';
    const isCloseTimestamp = currentGroup && index > 0 && 
      (new Date(message.timestamp) - new Date(props.messages[index-1].timestamp)) < 5 * 60 * 1000; // 5 минут
      
    const showAvatar = !isSameAuthor || !isCloseTimestamp || showDivider;
    const showHeader = showAvatar;
    
    // Если нужен разделитель или новый автор, создаем новую группу
    if (showDivider || !currentGroup) {
      currentGroup = {
        date: messageDay,
        showDivider,
        messages: []
      };
      groups.push(currentGroup);
      currentDate = messageDay;
    }
    
    // Устанавливаем стиль для роли пользователя
    let roleColor = '';
    if (message.role === 'teacher') {
      roleColor = 'text-discord-success';
    } else if (message.role === 'admin') {
      roleColor = 'text-discord-error';
    }
    
    currentGroup.messages.push({
      ...message,
      showAvatar,
      showHeader,
      roleColor
    });
    
    if (message.type !== 'system') {
      currentAuthor = message.username;
    }
  });
  
  return groups;
});

// Проверяем, реагировал ли текущий пользователь на сообщение
const hasUserReacted = (messageId, emoji) => {
  const message = props.messages.find(m => m.id === messageId);
  if (!message || !message.reactions) return false;
  
  const reaction = message.reactions.find(r => r.emoji === emoji);
  if (!reaction || !reaction.users) return false;
  
  return reaction.users.includes(userStore.id);
};

// Переключение реакции
const toggleReaction = (messageId, emoji) => {
  emit('toggle-reaction', { messageId, emoji });
};

// Загрузка предыдущих сообщений
const loadMoreMessages = async () => {
  loadingMore.value = true;
  await emit('load-more');
  loadingMore.value = false;
};

// Открытие вложения
const openAttachment = (attachment) => {
  emit('open-attachment', attachment);
};

// Форматирование даты для разделителя
const formatDateDivider = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.getTime() === today.getTime()) {
    return 'Сегодня';
  }
  
  if (date.getTime() === yesterday.getTime()) {
    return 'Вчера';
  }
  
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Форматирование времени
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

// Проверка типа файла
const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};

// Форматирование размера файла
const formatFileSize = (bytes) => {
  if (!bytes) return 'Неизвестно';
  
  const units = ['Б', 'КБ', 'МБ', 'ГБ'];
  let i = 0;
  let size = bytes;
  
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  
  return `${size.toFixed(1)} ${units[i]}`;
};

// Получение метки для роли
const getRoleLabel = (role) => {
  switch (role) {
    case 'teacher': return 'Преподаватель';
    case 'admin': return 'Администратор';
    case 'student': return 'Студент';
    default: return role;
  }
};

// Получение класса для бейджа роли
const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'teacher': return 'bg-discord-success bg-opacity-20 text-discord-success';
    case 'admin': return 'bg-discord-error bg-opacity-20 text-discord-error';
    case 'student': return 'bg-discord-accent bg-opacity-20 text-discord-accent';
    default: return 'bg-discord-text-gray bg-opacity-20 text-discord-text-gray';
  }
};
</script>

<style scoped>
.message-list {
  width: 100%;
  height: 100%;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top-color: #5865f2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-message {
  transition: background-color 0.1s ease;
  margin-left: -8px;
  margin-right: -8px;
  padding: 2px 8px;
  border-radius: 4px;
}

.user-message:hover {
  background-color: rgba(32, 34, 37, 0.3);
}

.system-message {
  margin: 8px 0;
}

.reaction-button {
  cursor: pointer;
}
</style> 