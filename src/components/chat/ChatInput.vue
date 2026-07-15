<template>
  <div class="chat-input-container mt-2">
    <div v-if="uploading" class="upload-progress flex items-center p-3 mb-2 glass-card rounded-xl border border-white/10 animate-fade-in" role="status" aria-live="polite">
      <div class="loading-spinner w-4 h-4 mr-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm font-medium text-indigo-300">Загрузка файла: {{ uploadProgress }}%</span>
      <button type="button" @click="cancelUpload" class="ml-auto text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors">Отмена</button>
    </div>

    <div v-if="attachments.length > 0" class="attachments-preview mb-3 flex flex-wrap gap-3">
      <div 
        v-for="(file, index) in attachments" 
        :key="index" 
        class="attachment-item relative bg-black/40 border border-white/10 rounded-xl p-3 flex items-center animate-fade-in group"
      >
        <div class="file-icon p-2 bg-white/5 rounded-lg mr-3">
          <svg v-if="isImage(file)" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="file-info truncate max-w-[150px]">
          <div class="file-name text-xs font-bold text-white truncate">{{ file.name }}</div>
          <div class="file-size text-[10px] text-gray-500 font-medium uppercase mt-0.5">{{ formatFileSize(file.size) }}</div>
        </div>
        <button
          type="button"
          @click="removeAttachment(index)" 
          class="remove-attachment absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-lg transform scale-75 group-hover:scale-100 focus:scale-100 transition-all hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          :aria-label="`Удалить вложение ${file.name}`"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="input-row flex items-center relative">
      <div class="absolute left-3 z-10 flex items-center">
        <button
          type="button"
          @click="openFileInput"
          class="action-button p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
          aria-label="Прикрепить файл"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
      </div>
      
      <div class="relative flex-grow">
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
          class="message-input w-full py-4 pl-14 pr-32 glass-input rounded-2xl text-white placeholder-gray-500 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          :placeholder="placeholder"
          aria-label="Текст сообщения"
          :rows="1"
          @keydown.enter="handleEnterKey"
          @input="adjustTextareaHeight"
          @paste="handlePaste"
        ></textarea>

        <div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <button
            ref="emojiToggleButton"
            type="button"
            @click="toggleEmojiPicker"
            class="action-button p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10 relative z-10"
            aria-label="Открыть панель эмодзи"
            :aria-controls="emojiPickerId"
            :aria-expanded="showEmojiPicker"
          >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
          <button
            type="button"
            @click="sendMessage"
            :disabled="!canSendMessage"
            class="send-button p-2 rounded-xl flex items-center justify-center transition-all z-10"
            :class="canSendMessage ? 'glass-button group text-white' : 'bg-white/5 text-gray-500 opacity-50 cursor-not-allowed'"
            aria-label="Отправить сообщение"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform transition-transform" :class="canSendMessage ? 'group-hover:translate-x-1 group-hover:-translate-y-1' : ''" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Панель эмодзи -->
    <div 
      v-if="showEmojiPicker" 
      :id="emojiPickerId"
      ref="emojiPicker"
      class="emoji-picker absolute bottom-full right-4 mb-2 glass-card border border-white/10 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in origin-bottom-right"
      role="dialog"
      aria-label="Выбор эмодзи"
      tabindex="-1"
      @keydown.esc.stop="closeEmojiPicker(true)"
    >
      <div class="picker-header flex justify-between items-center mb-3 pb-2 border-b border-white/10">
        <h3 class="text-sm font-bold text-white">Эмодзи</h3>
        <button type="button" @click="closeEmojiPicker(true)" class="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1 rounded-lg" aria-label="Закрыть панель эмодзи">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="emoji-categories flex border-b border-white/5 pb-2 mb-3 overflow-x-auto custom-scrollbar">
        <button 
          v-for="(category, index) in emojiCategories" 
          :key="index"
          type="button"
          @click="setEmojiCategory(category.id)"
          class="p-1.5 rounded-lg mx-0.5 transition-all flex-shrink-0"
          :class="currentEmojiCategory === category.id ? 'bg-indigo-500/20 shadow-sm border border-indigo-500/30' : 'hover:bg-white/10 border border-transparent'"
          :aria-label="`Категория ${category.label}`"
          :aria-pressed="currentEmojiCategory === category.id"
        >
          <span class="text-lg leading-none block" aria-hidden="true">{{ category.icon }}</span>
        </button>
      </div>

      <div class="emoji-grid grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-1 custom-scrollbar">
        <button 
          v-for="emoji in filteredEmojis" 
          :key="emoji"
          type="button"
          @click="insertEmoji(emoji)"
          class="emoji-button flex justify-center items-center text-2xl p-1.5 hover:bg-white/10 rounded-xl transition-transform hover:scale-110"
          :aria-label="`Вставить эмодзи ${emoji}`"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted, useId } from 'vue';

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
const emojiPicker = ref(null);
const emojiToggleButton = ref(null);
const emojiPickerId = `chat-emoji-picker-${useId()}`;

// Возможность отправить сообщение
const canSendMessage = computed(() => {
  return (message.value.trim().length > 0 || attachments.value.length > 0) && !uploading.value;
});

// Категории эмодзи
const emojiCategories = [
  { id: 'smileys', label: 'Смайлы', icon: '😊', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬'] },
  { id: 'people', label: 'Люди и жесты', icon: '👋', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦵', '🦶', '👂', '👃', '🧠', '🦷', '👀', '👁️', '👅', '👄'] },
  { id: 'animals', label: 'Животные', icon: '🐱', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦢', '🦉', '🦚', '🦜', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🦀', '🦞', '🦐', '🦑', '🐙', '🦈', '🐬', '🐳', '🐋', '🐊', '🐆', '🐅', '🐃', '🐂', '🐄', '🦌', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐐', '🐏', '🐑', '🦍', '🦧', '🐒'] },
  { id: 'food', label: 'Еда и напитки', icon: '🍔', emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🌰', '🥜', '🍯', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🍝', '🥘', '🥫', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾'] },
  { id: 'activity', label: 'Активности', icon: '⚽', emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴'] },
  { id: 'travel', label: 'Путешествия', icon: '🚗', emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🛺', '🚲', '🛴', '🛹', '🚅', '🚄', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🚧', '⛽', '🚏', '🚦', '🚥', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️'] },
  { id: 'symbols', label: 'Символы', icon: '💯', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🪯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎'] },
  { id: 'flags', label: 'Флаги', icon: '🏳️', emojis: ['🏁', '🚩', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿', '🇧🇯', '🇧🇲', '🇧🇹', '🇧🇴', '🇧🇦', '🇧🇼', '🇧🇷', '🇧🇳', '🇧🇬', '🇧🇫', '🇧🇮', '🇰🇭', '🇨🇲', '🇨🇦', '🇮🇨', '🇨🇻', '🇧🇶', '🇰🇾', '🇨🇫', '🇹🇩', '🇨🇱', '🇨🇳', '🇨🇽', '🇨🇨', '🇨🇴', '🇰🇲', '🇨🇬', '🇨🇩', '🇨🇰', '🇨🇷', '🇨🇮', '🇭🇷', '🇨🇺', '🇨🇼', '🇨🇾', '🇨🇿', '🇩🇰', '🇩🇯', '🇩🇲', '🇩🇴', '🇪🇨', '🇪🇬', '🇸🇻', '🇬🇶', '🇪🇷', '🇪🇪', '🇪🇹', '🇪🇺', '🇫🇰', '🇫🇴', '🇫🇯', '🇫🇮', '🇫🇷'] },
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
  event.preventDefault();
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
  fileInput.value?.click();
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
  if (!textarea) return;

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
  if (showEmojiPicker.value) {
    closeEmojiPicker(true);
    return;
  }

  showEmojiPicker.value = true;
  nextTick(() => emojiPicker.value?.focus());
}

function closeEmojiPicker(restoreFocus = false) {
  if (!showEmojiPicker.value) return;
  showEmojiPicker.value = false;

  if (restoreFocus) {
    nextTick(() => emojiToggleButton.value?.focus());
  }
}

// Обработка клика вне панели эмодзи для её закрытия
function handleClickOutside(event) {
  if (!showEmojiPicker.value) return;

  const eventPath = typeof event.composedPath === 'function' ? event.composedPath() : [];
  const clickedInsidePicker = eventPath.includes(emojiPicker.value) || emojiPicker.value?.contains(event.target);
  const clickedToggle = eventPath.includes(emojiToggleButton.value) || emojiToggleButton.value?.contains(event.target);

  if (!clickedInsidePicker && !clickedToggle) closeEmojiPicker();
}

// Обработка вставки из буфера обмена
function handlePaste(event) {
  const items = (event.clipboardData || event.originalEvent?.clipboardData)?.items;
  if (!items) return;
  
  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (!file) continue;
      
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
  if (!textarea) return;
  
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
  document.addEventListener('pointerdown', handleClickOutside);
  
  // Фокус на поле ввода
  nextTick(() => {
    messageInput.value.focus();
  });
});

onUnmounted(() => {
  // Удаляем обработчик клика
  document.removeEventListener('pointerdown', handleClickOutside);
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

.message-input {
  min-height: 56px;
  max-height: 150px;
  line-height: 1.5;
}

.emoji-picker {
  width: 320px;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
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
</style>
