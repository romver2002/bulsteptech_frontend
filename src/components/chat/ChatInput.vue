<template>
  <div class="chat-input-container bg-discord-dark border-t border-discord-dark-hover">
    <div v-if="uploading" class="upload-progress flex items-center p-2 bg-discord-dark-hover">
      <div class="loading-spinner w-4 h-4 mr-2"></div>
      <span class="text-sm text-discord-text-light">Загрузка файла: {{ uploadProgress }}%</span>
      <button @click="cancelUpload" class="ml-auto text-discord-error text-sm">Отмена</button>
    </div>

    <div v-if="attachments.length > 0" class="attachments-preview p-2 flex flex-wrap gap-2">
      <div 
        v-for="(file, index) in attachments" 
        :key="index" 
        class="attachment-item relative bg-discord-dark-hover rounded-md p-2 flex items-center"
      >
        <div class="file-icon mr-2">
          <svg v-if="isImage(file)" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-discord-text-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-discord-text-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="file-info truncate max-w-xs">
          <div class="file-name text-sm font-medium text-white truncate">{{ file.name }}</div>
          <div class="file-size text-xs text-discord-text-gray">{{ formatFileSize(file.size) }}</div>
        </div>
        <button 
          @click="removeAttachment(index)" 
          class="remove-attachment absolute -top-1 -right-1 bg-discord-dark rounded-full p-0.5 text-discord-text-gray hover:text-discord-error"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="input-row flex items-center p-2">
      <button 
        @click="openFileInput" 
        class="action-button p-2 rounded-full text-discord-text-gray hover:text-discord-text-light hover:bg-discord-dark-hover"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
      
      <div class="relative flex-grow mx-2">
        <input 
          ref="fileInput"
          type="file" 
          multiple
          class="hidden" 
          @change="handleFileUpload"
        >
        
        <textarea
          ref="messageInput"
          v-model="message"
          class="message-input w-full py-2 px-3 bg-discord-dark-secondary text-discord-text-light rounded-md resize-none focus:outline-none"
          :placeholder="placeholder"
          :rows="1"
          @keydown.enter.prevent="handleEnterKey"
          @input="adjustTextareaHeight"
          @paste="handlePaste"
        ></textarea>

        <div 
          v-if="message.length === 0 && !isMobile" 
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-discord-text-gray"
        >
          Нажмите Enter для отправки
        </div>
      </div>

      <div class="action-buttons flex">
        <button 
          @click="toggleEmojiPicker" 
          class="action-button p-2 rounded-full text-discord-text-gray hover:text-discord-text-light hover:bg-discord-dark-hover relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        <button 
          @click="sendMessage" 
          :disabled="!canSendMessage"
          class="send-button ml-1 p-2 rounded-full" 
          :class="canSendMessage ? 'text-discord-accent hover:bg-discord-dark-hover' : 'text-discord-text-gray opacity-50 cursor-not-allowed'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Панель эмодзи -->
    <div 
      v-if="showEmojiPicker" 
      class="emoji-picker absolute bottom-full right-0 mb-2 bg-discord-dark border border-discord-dark-hover rounded-md shadow-lg p-2 z-10"
    >
      <div class="picker-header flex justify-between items-center mb-2 border-b border-discord-dark-hover pb-2">
        <h3 class="text-sm font-medium text-white">Эмодзи</h3>
        <button @click="toggleEmojiPicker" class="text-discord-text-gray hover:text-discord-text-light">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="emoji-categories flex border-b border-discord-dark-hover pb-1 mb-2">
        <button 
          v-for="(category, index) in emojiCategories" 
          :key="index"
          @click="setEmojiCategory(category.id)"
          class="p-1 rounded-md mx-0.5" 
          :class="currentEmojiCategory === category.id ? 'bg-discord-dark-secondary' : 'hover:bg-discord-dark-hover'"
        >
          <span class="text-lg" v-html="category.icon"></span>
        </button>
      </div>

      <div class="emoji-grid grid grid-cols-8 gap-1 max-h-48 overflow-y-auto p-1">
        <button 
          v-for="emoji in filteredEmojis" 
          :key="emoji"
          @click="insertEmoji(emoji)"
          class="emoji-button flex justify-center items-center text-xl p-1 hover:bg-discord-dark-hover rounded-md"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Написать сообщение...'
  },
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  channelId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['send-message']);

// Основные переменные состояния
const message = ref('');
const attachments = ref([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const fileInput = ref(null);
const messageInput = ref(null);

// Emoji picker
const showEmojiPicker = ref(false);
const currentEmojiCategory = ref('smileys');

// Определение мобильного устройства
const isMobile = computed(() => window.innerWidth <= 768);

// Возможность отправить сообщение
const canSendMessage = computed(() => {
  return (message.value.trim().length > 0 || attachments.value.length > 0) && !uploading.value;
});

// Категории эмодзи
const emojiCategories = [
  { id: 'smileys', icon: '😊', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬'] },
  { id: 'people', icon: '👋', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦵', '🦶', '👂', '👃', '🧠', '🦷', '👀', '👁️', '👅', '👄'] },
  { id: 'animals', icon: '🐱', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦢', '🦉', '🦚', '🦜', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🦀', '🦞', '🦐', '🦑', '🐙', '🦈', '🐬', '🐳', '🐋', '🐊', '🐆', '🐅', '🐃', '🐂', '🐄', '🦌', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐐', '🐏', '🐑', '🦍', '🦧', '🐒'] },
  { id: 'food', icon: '🍔', emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🌰', '🥜', '🍯', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🍝', '🥘', '🥫', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾'] },
  { id: 'activity', icon: '⚽', emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴'] },
  { id: 'travel', icon: '🚗', emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲', '🛴', '🛹', '🚅', '🚄', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🚧', '⛽', '🚏', '🚦', '🚥', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️'] },
  { id: 'symbols', icon: '💯', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🪯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎'] },
  { id: 'flags', icon: '🏳️', emojis: ['🏁', '🚩', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨', '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷'] },
];

// Отфильтрованные эмодзи на основе текущей категории
const filteredEmojis = computed(() => {
  const category = emojiCategories.find(cat => cat.id === currentEmojiCategory.value);
  return category ? category.emojis : [];
});

// Установка категории эмодзи
function setEmojiCategory(categoryId) {
  currentEmojiCategory.value = categoryId;
}

// Обработка нажатия клавиши Enter
function handleEnterKey(event) {
  // Если нажат Shift+Enter, разрешаем перенос строки
  if (event.shiftKey) {
    return;
  }
  
  // Иначе отправляем сообщение
  sendMessage();
}

// Отправка сообщения
function sendMessage() {
  if (!canSendMessage.value) return;
  
  const trimmedMessage = message.value.trim();
  
  if (trimmedMessage.length > 0 || attachments.value.length > 0) {
    emit('send-message', {
      content: trimmedMessage,
      attachments: [...attachments.value],
      channelId: props.channelId
    });
    
    message.value = '';
    attachments.value = [];
    adjustTextareaHeight();
    
    // Фокус на поле ввода
    nextTick(() => {
      messageInput.value.focus();
    });
  }
}

// Открытие диалога выбора файла
function openFileInput() {
  fileInput.value.click();
}

// Обработка загрузки файла
function handleFileUpload(event) {
  const files = event.target.files;
  if (!files.length) return;
  
  Array.from(files).forEach(file => {
    // Проверка размера файла
    if (file.size > props.maxFileSize) {
      alert(`Файл "${file.name}" слишком большой. Максимальный размер: ${formatFileSize(props.maxFileSize)}`);
      return;
    }
    
    // Добавляем файл в список вложений
    attachments.value.push(file);
  });
  
  // Сбрасываем значение input[type="file"], чтобы можно было загружать тот же файл повторно
  event.target.value = '';
}

// Удаление вложения
function removeAttachment(index) {
  attachments.value.splice(index, 1);
}

// Отмена загрузки
function cancelUpload() {
  uploading.value = false;
  uploadProgress.value = 0;
  // Здесь можно добавить логику отмены загрузки на сервер
}

// Проверка, является ли файл изображением
function isImage(file) {
  return file.type.startsWith('image/');
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

// Вставка эмодзи в сообщение
function insertEmoji(emoji) {
  const textarea = messageInput.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  message.value = message.value.substring(0, start) + emoji + message.value.substring(end);
  
  nextTick(() => {
    // Перемещаем курсор после вставленного эмодзи
    textarea.selectionStart = start + emoji.length;
    textarea.selectionEnd = start + emoji.length;
    textarea.focus();
  });
}

// Переключение панели эмодзи
function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value;
}

// Обработка клика вне панели эмодзи для её закрытия
function handleClickOutside(event) {
  const emojiPicker = document.querySelector('.emoji-picker');
  const emojiButton = document.querySelector('.action-button');
  
  if (
    showEmojiPicker.value && 
    emojiPicker && 
    !emojiPicker.contains(event.target) && 
    emojiButton && 
    !emojiButton.contains(event.target)
  ) {
    showEmojiPicker.value = false;
  }
}

// Обработка вставки из буфера обмена
function handlePaste(event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  
  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      
      // Проверка размера файла
      if (file.size > props.maxFileSize) {
        alert(`Файл слишком большой. Максимальный размер: ${formatFileSize(props.maxFileSize)}`);
        continue;
      }
      
      attachments.value.push(file);
      event.preventDefault();
    }
  }
}

// Автоматическое изменение высоты textarea
function adjustTextareaHeight() {
  const textarea = messageInput.value;
  
  // Сбрасываем высоту, чтобы правильно измерить содержимое
  textarea.style.height = 'auto';
  
  // Ограничиваем максимальную высоту
  const maxHeight = 150;
  const scrollHeight = textarea.scrollHeight;
  
  textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
}

// Lifecycle hooks
onMounted(() => {
  // Настраиваем автоматическое изменение высоты textarea
  adjustTextareaHeight();
  
  // Добавляем обработчик клика для закрытия панели эмодзи
  document.addEventListener('click', handleClickOutside);
  
  // Фокус на поле ввода
  nextTick(() => {
    messageInput.value.focus();
  });
});

onUnmounted(() => {
  // Удаляем обработчик клика
  document.removeEventListener('click', handleClickOutside);
});

// Наблюдаем за изменениями сообщения для автоматической настройки высоты
watch(message, () => {
  nextTick(() => {
    adjustTextareaHeight();
  });
});
</script>

<style scoped>
.chat-input-container {
  position: relative;
  width: 100%;
}

.loading-spinner {
  border: 2px solid transparent;
  border-top-color: #5865f2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message-input {
  min-height: 40px;
  max-height: 150px;
}

.emoji-picker {
  width: 320px;
}

.emoji-grid {
  scrollbar-width: thin;
  scrollbar-color: #202225 #2f3136;
}

.emoji-grid::-webkit-scrollbar {
  width: 8px;
}

.emoji-grid::-webkit-scrollbar-track {
  background: #2f3136;
  border-radius: 4px;
}

.emoji-grid::-webkit-scrollbar-thumb {
  background-color: #202225;
  border-radius: 4px;
}
</style> 