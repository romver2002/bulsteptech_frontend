<template>
  <div class="channel-chat flex flex-col h-full bg-discord-secondary rounded-lg overflow-hidden">
    <!-- Заголовок канала -->
    <div class="channel-header px-4 py-3 border-b border-gray-700 flex items-center">
      <div class="text-discord-text-gray mr-2">#</div>
      <h3 class="font-medium">{{ channel.name }}</h3>
      <div class="ml-2 text-xs text-discord-text-gray">{{ channel.description || 'Обсуждение' }}</div>
    </div>
    
    <!-- Сообщения чата -->
    <div ref="messagesContainer" class="messages-container flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="messages.length === 0" class="text-center p-4 text-discord-text-gray">
        <div class="text-4xl mb-2">💬</div>
        <div class="text-lg font-medium">Будьте первым, кто напишет в этот канал!</div>
      </div>
      
      <message-bubble 
        v-for="message in messages" 
        :key="message.id" 
        :message="message"
        @toggle-reaction="handleToggleReaction"
      />
      
      <!-- Индикатор, что кто-то печатает -->
      <div v-if="typingUsers.length > 0" class="typing-indicator text-xs text-discord-text-gray">
        <span>{{ typingText }}</span>
        <span class="dots"><span>.</span><span>.</span><span>.</span></span>
      </div>
    </div>
    
    <!-- Форма отправки сообщения -->
    <div class="message-form p-4 border-t border-gray-700">
      <div class="relative">
        <div class="flex">
          <!-- Кнопка для загрузки файлов -->
          <button @click="triggerFileInput" class="p-2 text-discord-text-gray hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input ref="fileInput" type="file" class="hidden" @change="handleFileSelected" multiple />
          
          <!-- Поле ввода сообщения -->
          <textarea
            v-model="newMessage"
            @keydown.enter.prevent="handleEnterKey"
            @input="handleTyping"
            placeholder="Написать сообщение..."
            rows="1"
            ref="messageInput"
            class="flex-1 px-4 py-2 bg-discord-dark rounded-md resize-none text-discord-text-light focus:outline-none focus:ring-1 focus:ring-discord-accent"
            :disabled="channel.isReadOnly && !isTeacher"
          ></textarea>
          
          <!-- Кнопка эмодзи -->
          <button @click="showEmojiPicker = !showEmojiPicker" class="p-2 text-discord-text-gray hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <!-- Кнопка отправки -->
          <button 
            @click="sendMessage" 
            :disabled="!canSendMessage || (channel.isReadOnly && !isTeacher)"
            class="p-2 text-discord-text-gray hover:text-white disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        <!-- Выбор эмодзи -->
        <div v-if="showEmojiPicker" class="emoji-picker absolute bottom-full right-0 mb-2 bg-discord-dark rounded-lg shadow-lg p-2">
          <div class="grid grid-cols-8 gap-1">
            <button 
              v-for="emoji in commonEmojis" 
              :key="emoji"
              @click="insertEmoji(emoji)"
              class="text-xl p-1 hover:bg-discord-secondary rounded"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Превью выбранных файлов -->
      <div v-if="selectedFiles.length > 0" class="selected-files mt-2 flex flex-wrap gap-2">
        <div v-for="(file, index) in selectedFiles" :key="index" class="file-preview bg-discord-dark rounded p-2 flex items-center">
          <div class="truncate max-w-[100px] text-xs">{{ file.name }}</div>
          <button @click="removeFile(index)" class="ml-2 text-discord-text-gray hover:text-discord-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../../stores/user';
import MessageBubble from './MessageBubble.vue';

const props = defineProps({
  channel: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      name: '',
      description: '',
      isReadOnly: false
    })
  },
  messages: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['send-message', 'toggle-reaction']);

// Сторы
const userStore = useUserStore();

// Refs для DOM-элементов
const messagesContainer = ref(null);
const messageInput = ref(null);
const fileInput = ref(null);

// Состояния компонента
const newMessage = ref('');
const selectedFiles = ref([]);
const typingUsers = ref([]);
const typingTimeout = ref(null);
const showEmojiPicker = ref(false);

// Популярные эмодзи
const commonEmojis = [
  '😀', '😂', '😊', '❤️', '
