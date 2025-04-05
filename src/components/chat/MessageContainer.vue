<template>
  <div class="message-container flex flex-col h-full">
    <div class="channel-header border-b border-discord-dark-hover px-4 py-3 flex items-center">
      <div class="channel-icon mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-discord-text-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </div>
      <h2 class="channel-name font-medium text-white">{{ currentChannel.name }}</h2>
      <div class="channel-description ml-2 text-sm text-discord-text-gray hidden md:block">
        {{ currentChannel.description || 'Канал для общения' }}
      </div>
      <div class="flex-grow"></div>
      <div class="channel-actions flex items-center space-x-2">
        <button class="action-button p-2 rounded-md text-discord-text-gray hover:text-discord-text-light hover:bg-discord-dark-hover">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button class="action-button p-2 rounded-md text-discord-text-gray hover:text-discord-text-light hover:bg-discord-dark-hover">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button class="action-button p-2 rounded-md text-discord-text-gray hover:text-discord-text-light hover:bg-discord-dark-hover">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="messages-wrapper flex-grow overflow-y-auto p-4">
      <MessageList 
        :messages="messages" 
        :loading="loading" 
        :has-more-messages="hasMoreMessages" 
        @load-more="loadMoreMessages"
        @toggle-reaction="handleToggleReaction"
        @open-attachment="handleOpenAttachment"
      />
    </div>
    
    <div class="input-wrapper mt-auto">
      <ChatInput 
        :channel-id="currentChannel.id" 
        :placeholder="getInputPlaceholder" 
        @send-message="handleSendMessage" 
      />
    </div>
    
    <div v-if="showAttachmentModal" class="attachment-modal fixed inset-0 flex items-center justify-center z-30">
      <div class="modal-overlay fixed inset-0 bg-black opacity-70" @click="closeAttachmentModal"></div>
      <div class="modal-content z-40 max-w-4xl max-h-[90vh]">
        <div class="modal-header bg-discord-dark p-4 flex justify-between items-center rounded-t-md">
          <h3 class="text-white font-medium">{{ currentAttachment.name }}</h3>
          <button @click="closeAttachmentModal" class="text-discord-text-gray hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body bg-discord-dark-secondary p-4 flex items-center justify-center overflow-auto rounded-b-md">
          <img 
            v-if="isImage(currentAttachment.url)" 
            :src="currentAttachment.url" 
            :alt="currentAttachment.name"
            class="max-w-full max-h-[calc(90vh-8rem)]"
          >
          <div v-else class="file-preview bg-discord-dark p-8 rounded-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-discord-text-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-white mb-2">{{ currentAttachment.name }}</p>
            <p class="text-discord-text-gray mb-4">{{ formatFileSize(currentAttachment.size) }}</p>
            <a 
              :href="currentAttachment.url" 
              download 
              class="download-button bg-discord-accent hover:bg-discord-accent-hover text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
import MessageList from './MessageList.vue';
import ChatInput from './ChatInput.vue';

// Stores
const channelStore = useChannelStore();
const userStore = useUserStore();

// Refs для данных
const messages = ref([]);
const loading = ref(true);
const hasMoreMessages = ref(true);
const loadingMore = ref(false);
const page = ref(1);
const messagesPerPage = 25;

// Refs для модального окна с вложением
const showAttachmentModal = ref(false);
const currentAttachment = ref({});

// Computed properties
const currentChannel = computed(() => channelStore.currentChannel || { id: '', name: '', description: '' });

const getInputPlaceholder = computed(() => {
  return `Сообщение в канал #${currentChannel.value.name}`;
});

// Lifecycle hooks
onMounted(async () => {
  await loadMessages();
  
  // Прокрутка вниз после загрузки сообщений
  nextTick(() => {
    scrollToBottom();
  });
});

// Следим за изменением канала
watch(() => channelStore.currentChannel, async () => {
  // Сбрасываем состояние и загружаем новые сообщения при смене канала
  messages.value = [];
  loading.value = true;
  hasMoreMessages.value = true;
  page.value = 1;
  
  await loadMessages();
  
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

// Загрузка сообщений
async function loadMessages() {
  try {
    loading.value = true;
    
    // Имитация загрузки данных с сервера
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Генерируем тестовые сообщения
    const newMessages = generateTestMessages();
    messages.value = [...newMessages];
    
    // Проверяем, есть ли еще сообщения для загрузки
    hasMoreMessages.value = page.value < 3;
    
  } catch (error) {
    console.error('Ошибка при загрузке сообщений:', error);
  } finally {
    loading.value = false;
  }
}

// Загрузка дополнительных сообщений
async function loadMoreMessages() {
  try {
    if (loadingMore.value || !hasMoreMessages.value) return;
    
    loadingMore.value = true;
    
    // Имитация загрузки данных с сервера
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    page.value++;
    
    // Генерируем дополнительные тестовые сообщения
    const olderMessages = generateTestMessages(true);
    messages.value = [...olderMessages, ...messages.value];
    
    // Проверяем, есть ли еще сообщения для загрузки
    hasMoreMessages.value = page.value < 3;
    
  } catch (error) {
    console.error('Ошибка при загрузке дополнительных сообщений:', error);
  } finally {
    loadingMore.value = false;
  }
}

// Обработка отправки сообщения
function handleSendMessage(messageData) {
  // Создаем новое сообщение
  const newMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    content: messageData.content,
    username: userStore.username,
    role: userStore.role,
    timestamp: new Date().toISOString(),
    avatar: userStore.avatar,
    attachments: messageData.attachments.map(file => ({
      id: `attach-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type
    })),
    reactions: []
  };
  
  // Добавляем сообщение в список
  messages.value.push(newMessage);
  
  // Прокручиваем чат вниз
  nextTick(() => {
    scrollToBottom();
  });
}

// Обработка реакций к сообщению
function handleToggleReaction({ messageId, emoji }) {
  const messageIndex = messages.value.findIndex(m => m.id === messageId);
  if (messageIndex === -1) return;
  
  const message = messages.value[messageIndex];
  const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
  
  if (reactionIndex !== -1) {
    // Если реакция уже есть
    const reaction = message.reactions[reactionIndex];
    const userReacted = reaction.users.includes(userStore.id);
    
    if (userReacted) {
      // Удаляем пользователя из списка
      reaction.users = reaction.users.filter(id => id !== userStore.id);
      reaction.count--;
      
      // Если количество реакций стало 0, удаляем реакцию
      if (reaction.count === 0) {
        message.reactions.splice(reactionIndex, 1);
      }
    } else {
      // Добавляем пользователя в список
      reaction.users.push(userStore.id);
      reaction.count++;
    }
  } else {
    // Добавляем новую реакцию
    message.reactions.push({
      emoji,
      count: 1,
      users: [userStore.id]
    });
  }
  
  // Обновляем сообщение
  messages.value[messageIndex] = { ...message };
}

// Открытие вложения
function handleOpenAttachment(attachment) {
  currentAttachment.value = attachment;
  showAttachmentModal.value = true;
}

// Закрытие модального окна с вложением
function closeAttachmentModal() {
  showAttachmentModal.value = false;
}

// Прокрутка чата вниз
function scrollToBottom() {
  const messagesWrapper = document.querySelector('.messages-wrapper');
  if (messagesWrapper) {
    messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
  }
}

// Проверка типа файла
function isImage(url) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
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

// Генерация тестовых сообщений
function generateTestMessages(older = false) {
  const users = [
    { id: 'user1', username: 'Иванов Иван', role: 'teacher', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 'user2', username: 'Петров Пётр', role: 'student', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 'user3', username: 'Сидорова Анна', role: 'student', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 'user4', username: 'Смирнов Алексей', role: 'student', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 'user5', username: 'Козлова Елена', role: 'student', avatar: 'https://i.pravatar.cc/150?img=5' },
  ];
  
  const messagesContent = [
    'Добрый день! Сегодня мы обсудим новую тему по программированию.',
    'Всем привет! У меня есть вопрос по вчерашнему заданию.',
    'Кто-нибудь может объяснить, как работает этот алгоритм?',
    'Не могу решить задачу 3 из домашнего задания.',
    'На следующей неделе будет контрольная работа, не забудьте подготовиться!',
    'Можно ли перенести дедлайн на следующую неделю?',
    'Отличная работа на занятии сегодня!',
    'Я загрузил дополнительные материалы в раздел ресурсов.',
    'Спасибо за объяснение, теперь всё понятно!',
    'Кто хочет вместе решить задачи из практикума?',
    'Напоминаю, что завтра у нас консультация перед экзаменом.',
    'Я нашёл интересную статью по теме нашего курса.',
    'Можно ли использовать другой метод для решения этой задачи?',
    'Возникла проблема при установке среды разработки, кто-нибудь может помочь?',
    'Предлагаю создать общий проект для отработки навыков.',
  ];
  
  const systemMessages = [
    'Пользователь Иванов Иван присоединился к каналу',
    'Пользователь Петров Пётр присоединился к каналу',
    'Пользователь Сидорова Анна присоединился к каналу',
  ];
  
  // Генерируем базовую дату для сообщений
  let baseDate = new Date();
  
  // Если нужны более старые сообщения, отодвигаем дату назад
  if (older) {
    baseDate = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000 * page.value);
  }
  
  // Генерируем случайное количество сообщений (от 15 до 25)
  const count = older ? messagesPerPage : Math.floor(Math.random() * 10) + 15;
  const generatedMessages = [];
  
  // Добавляем системное сообщение, если это первая страница
  if (!older && page.value === 1) {
    generatedMessages.push({
      id: `msg-system-1`,
      type: 'system',
      content: systemMessages[Math.floor(Math.random() * systemMessages.length)],
      timestamp: new Date(baseDate.getTime() - (60 * 60 * 1000)).toISOString(),
    });
  }
  
  // Генерируем обычные сообщения
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const messageTime = new Date(baseDate.getTime() - (i * 3 * 60 * 1000));
    
    // Случайно выбираем, будет ли у сообщения вложение
    const hasAttachment = Math.random() < 0.2;
    const attachments = hasAttachment 
      ? [{
          id: `attach-${i}`,
          name: `Файл-${i}.${Math.random() < 0.7 ? 'jpg' : 'pdf'}`,
          url: `https://picsum.photos/500/300?random=${i}`,
          size: Math.floor(Math.random() * 5 * 1024 * 1024),
          type: Math.random() < 0.7 ? 'image/jpeg' : 'application/pdf'
        }]
      : [];
    
    // Случайно выбираем, будут ли у сообщения реакции
    const hasReactions = Math.random() < 0.3;
    const reactionsCount = hasReactions ? Math.floor(Math.random() * 3) + 1 : 0;
    const reactions = [];
    
    if (hasReactions) {
      const emojis = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '🙏', '👏'];
      
      for (let j = 0; j < reactionsCount; j++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const count = Math.floor(Math.random() * 3) + 1;
        
        // Создаем список пользователей, которые поставили реакцию
        const reactedUsers = [];
        for (let k = 0; k < count; k++) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          if (!reactedUsers.includes(randomUser.id)) {
            reactedUsers.push(randomUser.id);
          }
        }
        
        reactions.push({
          emoji,
          count: reactedUsers.length,
          users: reactedUsers
        });
      }
    }
    
    generatedMessages.push({
      id: `msg-${i}`,
      content: messagesContent[Math.floor(Math.random() * messagesContent.length)],
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      timestamp: messageTime.toISOString(),
      attachments,
      reactions
    });
  }
  
  return generatedMessages;
}
</script>

<style scoped>
.messages-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #202225 #2f3136;
}

.messages-wrapper::-webkit-scrollbar {
  width: 8px;
}

.messages-wrapper::-webkit-scrollbar-track {
  background: #2f3136;
  border-radius: 4px;
}

.messages-wrapper::-webkit-scrollbar-thumb {
  background-color: #202225;
  border-radius: 4px;
}

.attachment-modal {
  backdrop-filter: blur(3px);
}
</style> 