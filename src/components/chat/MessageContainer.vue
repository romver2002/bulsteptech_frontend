<template>
  <div class="message-container flex flex-col h-full rounded-2xl overflow-hidden relative">
    <div class="channel-header border-b border-white/10 px-6 py-4 flex items-center bg-black/20 backdrop-blur-md relative z-10 shadow-sm">
      <div class="channel-icon mr-3 w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </div>
      <h2 class="channel-name font-bold text-white tracking-wide text-lg">{{ currentChannel.name }}</h2>
      <div class="channel-description ml-4 text-sm text-gray-400 font-medium hidden md:block border-l border-white/10 pl-4">
        {{ currentChannel.description || 'Канал для общения' }}
      </div>
      <div class="flex-grow"></div>
      <div class="channel-actions flex items-center space-x-2">
        <button
          type="button"
          class="action-button p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
          :class="searchOpen ? 'bg-indigo-500/15 text-indigo-300 border-indigo-400/20' : ''"
          :aria-pressed="searchOpen"
          aria-label="Поиск по сообщениям"
          @click="searchOpen = !searchOpen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button
          type="button"
          class="action-button p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
          :class="notificationsEnabled ? 'text-emerald-300' : 'text-amber-300 bg-amber-500/10'"
          :aria-pressed="notificationsEnabled"
          :aria-label="notificationsEnabled ? 'Отключить уведомления канала' : 'Включить уведомления канала'"
          @click="toggleNotifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button
          type="button"
          class="action-button p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
          :class="showChannelInfo ? 'bg-indigo-500/15 text-indigo-300 border-indigo-400/20' : ''"
          :aria-pressed="showChannelInfo"
          aria-label="Информация о канале"
          @click="showChannelInfo = !showChannelInfo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>

    <transition name="chat-toolbar">
      <div v-if="searchOpen" class="border-b border-white/10 bg-black/15 px-4 py-3">
        <label class="mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-2 focus-within:border-indigo-400/40">
          <span class="text-sm text-gray-400">Найти</span>
          <input v-model.trim="searchQuery" type="search" class="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600" placeholder="Имя или текст сообщения" autofocus>
          <button v-if="searchQuery" type="button" class="rounded-md px-2 text-gray-400 hover:bg-white/10 hover:text-white" aria-label="Очистить поиск" @click="searchQuery = ''">×</button>
        </label>
      </div>
    </transition>

    <transition name="chat-toolbar">
      <div v-if="showChannelInfo" class="border-b border-indigo-400/15 bg-indigo-500/10 px-6 py-3 text-sm text-indigo-100">
        <strong>#{{ currentChannel.name }}</strong>
        <span class="ml-2 text-indigo-200/70">{{ currentChannel.description || 'Учебный канал группы' }} · {{ messages.length }} сообщений загружено</span>
      </div>
    </transition>
    
    <div ref="messagesWrapper" class="messages-wrapper flex-grow overflow-y-auto p-6 scroll-smooth custom-scrollbar relative">
      <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent pointer-events-none"></div>
      <MessageList 
        :messages="visibleMessages"
        :loading="loading" 
        :has-more-messages="!searchQuery && hasMoreMessages"
        @load-more="loadMoreMessages"
        @toggle-reaction="handleToggleReaction"
        @open-attachment="handleOpenAttachment"
      />
    </div>
    
    <div class="input-wrapper mt-auto p-4 pt-2">
      <div v-if="isReadOnly" class="flex items-center gap-3 rounded-2xl border border-amber-400/15 bg-amber-500/5 p-4">
        <div class="grid h-10 w-10 flex-none place-items-center rounded-xl bg-amber-500/10 text-amber-300">
          <svg class="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <div>
          <strong class="block text-sm text-amber-100">Канал открыт только для чтения</strong>
          <span class="mt-1 block text-xs text-amber-200/50">Публиковать объявления может преподаватель.</span>
        </div>
      </div>
      <ChatInput
        v-else
        :channel-id="currentChannel.id" 
        :placeholder="getInputPlaceholder" 
        @send-message="handleSendMessage" 
      />
    </div>
    
    <div
      v-if="showAttachmentModal"
      class="attachment-modal fixed inset-0 flex items-center justify-center z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attachment-title"
      @click.self="closeAttachmentModal"
    >
      <div class="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-md" @click="closeAttachmentModal"></div>
      <div class="modal-content z-50 max-w-5xl w-full mx-4 max-h-[90vh] glass-card rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        <div class="modal-header border-b border-white/10 p-4 flex justify-between items-center bg-white/5">
          <h3 id="attachment-title" class="text-white font-bold tracking-wide">{{ currentAttachment.name }}</h3>
          <button type="button" aria-label="Закрыть просмотр" @click="closeAttachmentModal" class="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body p-6 flex items-center justify-center overflow-auto custom-scrollbar flex-grow bg-black/20">
          <img 
            v-if="isImage(currentAttachment)"
            :src="currentAttachment.url" 
            :alt="currentAttachment.name"
            decoding="async"
            class="max-w-full max-h-[calc(90vh-10rem)] object-contain rounded-lg shadow-xl"
          >
          <div v-else class="file-preview p-12 text-center w-full max-w-lg mx-auto">
            <div class="w-32 h-32 mx-auto bg-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 border border-indigo-500/30 shadow-glow">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-2xl text-white font-bold mb-2">{{ currentAttachment.name }}</p>
            <p class="text-indigo-300 font-medium mb-8 text-lg">{{ formatFileSize(currentAttachment.size) }}</p>
            <a 
              :href="currentAttachment.url" 
              download 
              class="download-button glass-button px-8 py-3 rounded-xl inline-flex items-center text-white font-bold group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Скачать файл
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useChannelStore } from '../../stores/channels';
import { useUserStore } from '../../stores/user';
import { useNotificationStore } from '../../stores/notification';
import MessageList from './MessageList.vue';
import ChatInput from './ChatInput.vue';

// Stores
const channelStore = useChannelStore();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

// Refs для данных
const messages = ref([]);
const loading = ref(true);
const hasMoreMessages = ref(true);
const messagesWrapper = ref(null);
const searchOpen = ref(false);
const searchQuery = ref('');
const notificationsEnabled = ref(localStorage.getItem('bulsteptech.chatNotifications') !== 'false');
const showChannelInfo = ref(false);
const createdObjectUrls = new Set();

// Refs для модального окна с вложением
const showAttachmentModal = ref(false);
const currentAttachment = ref({});

// Computed properties
const currentChannel = computed(() => channelStore.currentChannel || { id: '', name: '', description: '' });
const isReadOnly = computed(() => Boolean(currentChannel.value.isReadOnly && userStore.role !== 'teacher'));
const visibleMessages = computed(() => {
  const query = searchQuery.value.toLocaleLowerCase('ru-RU');
  if (!query) return messages.value;
  return messages.value.filter(message => `${message.username || ''} ${message.content || ''}`.toLocaleLowerCase('ru-RU').includes(query));
});

function revokeCreatedObjectUrls() {
  createdObjectUrls.forEach(url => URL.revokeObjectURL(url));
  createdObjectUrls.clear();
}

const getInputPlaceholder = computed(() => {
  return `Сообщение в канал #${currentChannel.value.name}`;
});

// Lifecycle hooks
onMounted(async () => {
  document.addEventListener('keydown', handleModalKeydown);
  await loadMessages();
  
  // Прокрутка вниз после загрузки сообщений
  nextTick(() => {
    scrollToBottom();
  });
});

// Следим за изменением канала
watch(() => currentChannel.value.id, async () => {
  // Сбрасываем состояние и загружаем новые сообщения при смене канала
  // (object URL'ы не освобождаем здесь — сообщения живут в store и переживают
  //  смену канала; освобождение в onUnmounted)
  messages.value = [];
  loading.value = true;
  hasMoreMessages.value = true;
  
  await loadMessages();
  
  nextTick(() => {
    scrollToBottom();
  });
});

// Загрузка сообщений
async function loadMessages() {
  loading.value = true;
  messages.value = [...channelStore.channelMessages];
  hasMoreMessages.value = false;
  loading.value = false;
}

// Загрузка дополнительных сообщений
async function loadMoreMessages() {
  hasMoreMessages.value = false;
}

// Обработка отправки сообщения
function handleSendMessage(messageData) {
  if (isReadOnly.value) return;
  // Вложения -> object URL (освобождаются в onUnmounted)
  const attachments = messageData.attachments.map(file => {
    const url = URL.createObjectURL(file);
    createdObjectUrls.add(url);
    return {
      id: `attach-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: file.name,
      url,
      size: file.size,
      type: file.type,
      isObjectUrl: true
    };
  });

  // Пишем в store (источник истины) — сообщение переживает смену канала
  channelStore.addMessage({
    username: userStore.username,
    content: messageData.content,
    attachments
  });
  messages.value = [...channelStore.channelMessages];

  // Прокручиваем чат вниз
  nextTick(() => {
    scrollToBottom();
  });
}

// Обработка реакций к сообщению
function handleToggleReaction({ messageId, emoji }) {
  // Реакции проводим через store, чтобы они сохранялись между каналами
  channelStore.toggleReaction({ messageId, emoji, userId: userStore.id });
  messages.value = [...channelStore.channelMessages];
}

// Открытие вложения
function handleOpenAttachment(attachment) {
  currentAttachment.value = attachment;
  showAttachmentModal.value = true;
}

// Закрытие модального окна с вложением
function closeAttachmentModal() {
  showAttachmentModal.value = false;
  currentAttachment.value = {};
}

function handleModalKeydown(event) {
  if (event.key === 'Escape' && showAttachmentModal.value) closeAttachmentModal();
}

// Прокрутка чата вниз
function scrollToBottom() {
  if (messagesWrapper.value) {
    messagesWrapper.value.scrollTop = messagesWrapper.value.scrollHeight;
  }
}

// Проверка типа файла
function isImage(attachment) {
  return attachment?.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)(?:\?.*)?$/i.test(attachment?.url || '');
}

function toggleNotifications() {
  notificationsEnabled.value = !notificationsEnabled.value;
  localStorage.setItem('bulsteptech.chatNotifications', String(notificationsEnabled.value));
  notificationStore.info(notificationsEnabled.value ? 'Уведомления канала включены' : 'Уведомления канала отключены');
}

// Форматирование размера файла
function formatFileSize(bytes) {
  if (!bytes) return 'Неизвестно';
  
  const units = ['Б', 'КБ', 'МБ', 'ГБ'];
  let i = 0;
  let size = bytes;
  
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  
  return `${size.toFixed(1)} ${units[i]}`;
}

onUnmounted(() => {
  document.removeEventListener('keydown', handleModalKeydown);
  revokeCreatedObjectUrls();
});
</script>

<style scoped>
.messages-wrapper {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.messages-wrapper::-webkit-scrollbar {
  width: 8px;
}

.messages-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.messages-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.messages-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.chat-toolbar-enter-active,
.chat-toolbar-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.chat-toolbar-enter-from,
.chat-toolbar-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
