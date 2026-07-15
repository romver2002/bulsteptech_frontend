<template>
  <div class="message-list flex-1">
    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="loading-spinner mr-3 w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-indigo-300 font-medium tracking-wide">Синхронизация...</span>
    </div>
    
    <div v-else-if="messages.length === 0" class="empty-messages py-16 text-center animate-fade-in">
      <div class="text-6xl mb-6 drop-shadow-xl transform transition-transform hover:scale-110">💭</div>
      <h3 class="text-2xl font-bold mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Пустота...</h3>
      <p class="text-gray-400 font-medium">Станьте первым, кто нарушит тишину!</p>
    </div>
    
    <div v-else class="messages-container space-y-6">
      <div v-for="(group, index) in messageGroups" :key="index" class="message-group animate-slide-up">
        <div class="message-date-divider flex items-center justify-center my-6" v-if="group.showDivider">
          <div class="line flex-grow h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <div class="date-label px-4 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-gray-400 uppercase tracking-widest shadow-inner">{{ formatDateDivider(group.date) }}</div>
          <div class="line flex-grow h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
        
        <div v-for="message in group.messages" :key="message.id" class="message-wrapper">
          <div class="message" :class="{ 'system-message': message.type === 'system' }">
            <!-- Системное сообщение -->
            <div v-if="message.type === 'system'" class="system-message flex items-center justify-center py-2">
              <span class="text-xs text-indigo-300 font-medium bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                {{ message.content }}
              </span>
            </div>
            
            <!-- Обычное сообщение -->
            <div v-else class="user-message flex items-start group/msg p-2 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
              <!-- Аватар пользователя -->
              <div v-if="message.showAvatar" class="avatar-container mt-1 mr-4">
                <div v-if="message.avatar" class="avatar w-11 h-11 rounded-full overflow-hidden flex-shrink-0 shadow-lg border border-white/10">
                  <img :src="message.avatar" :alt="message.username" class="w-full h-full object-cover">
                </div>
                <div v-else class="avatar-placeholder w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-glow border border-white/20">
                  {{ message.username ? message.username.charAt(0).toUpperCase() : 'U' }}
                </div>
              </div>
              <div v-else class="avatar-spacer w-11 mr-4 flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-opacity">
                <span class="text-[10px] text-gray-500 font-bold uppercase">{{ formatTime(message.timestamp) }}</span>
              </div>
              
              <div class="message-content flex-1 min-w-0">
                <!-- Имя пользователя и время -->
                <div v-if="message.showHeader" class="message-header flex items-baseline mb-1">
                  <div class="username font-bold tracking-wide" :class="message.roleColor || 'text-white'">
                    {{ message.username }}
                  </div>
                  
                  <div v-if="message.role" class="user-role ml-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm" :class="getRoleBadgeClass(message.role)">
                    {{ getRoleLabel(message.role) }}
                  </div>
                  
                  <div class="message-time ml-3 text-xs text-gray-500 font-medium">
                    {{ formatTime(message.timestamp) }}
                  </div>
                </div>
                
                <!-- Текст сообщения -->
                <div class="message-text break-words text-gray-300 leading-relaxed text-[15px]" :class="{'mt-1': message.showHeader}">
                  {{ message.content }}
                </div>
                
                <!-- Вложения -->
                <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments mt-3 space-y-3">
                  <div v-for="(attachment, idx) in message.attachments" :key="idx" class="attachment">
                    <div v-if="isImage(attachment)" class="image-attachment">
                      <img 
                        :src="attachment.url" 
                        :alt="attachment.name" 
                        class="max-w-md w-full rounded-xl shadow-lg border border-white/10 cursor-pointer hover:opacity-90 hover:shadow-xl transition-all"
                        @click="openAttachment(attachment)"
                      >
                    </div>
                    <div v-else class="file-attachment bg-black/40 border border-white/10 rounded-xl p-3 flex items-center w-72 hover:bg-white/5 transition-colors cursor-pointer group/file" @click="openAttachment(attachment)">
                      <div class="p-2.5 bg-white/5 rounded-lg mr-4 group-hover/file:bg-indigo-500/20 transition-colors shadow-inner">
                        <svg class="w-6 h-6 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div class="file-info flex-1 truncate">
                        <div class="file-name text-sm font-bold text-white truncate group-hover/file:text-indigo-300 transition-colors">{{ attachment.name }}</div>
                        <div class="file-size text-xs text-gray-500 font-medium">{{ formatFileSize(attachment.size) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Реакции -->
                <div v-if="message.reactions && message.reactions.length > 0" class="message-reactions flex flex-wrap mt-3 gap-2">
                  <button 
                    v-for="reaction in message.reactions" 
                    :key="reaction.emoji"
                    class="reaction-button flex items-center rounded-full px-3 py-1 text-xs transition-all shadow-sm border"
                    :class="hasUserReacted(message.id, reaction.emoji) ? 'bg-indigo-500/20 border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.2)]' : 'bg-black/30 border-white/10 hover:bg-white/10 hover:border-white/20'"
                    @click="toggleReaction(message.id, reaction.emoji)"
                  >
                    <span class="emoji mr-1.5 text-sm">{{ reaction.emoji }}</span>
                    <span class="count font-bold" :class="hasUserReacted(message.id, reaction.emoji) ? 'text-indigo-300' : 'text-gray-400'">{{ reaction.count }}</span>
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
        class="load-more-button px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all"
        :disabled="loadingMore"
      >
        <div v-if="loadingMore" class="flex items-center">
          <div class="loading-spinner mr-3 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
      roleColor = 'text-emerald-400';
    } else if (message.role === 'admin') {
      roleColor = 'text-rose-400';
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
const isImage = (attachment) => {
  return attachment?.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)(?:\?.*)?$/i.test(attachment?.url || '');
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
    case 'teacher': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    case 'admin': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    case 'student': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
    default: return 'bg-white/10 text-gray-400 border border-white/5';
  }
};
</script>

<style scoped>
.message-list {
  width: 100%;
  height: 100%;
}

.user-message {
  transition: all 0.2s ease;
}

.reaction-button {
  cursor: pointer;
}
</style>
