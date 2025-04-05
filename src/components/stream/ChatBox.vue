<template>
  <div class="chat-box bg-gray-800 rounded-md flex flex-col h-full">
    <div class="chat-header border-b border-gray-700 p-3 flex justify-between items-center">
      <h3 class="font-semibold text-white">Чат трансляции</h3>
      <div class="flex space-x-2">
        <button class="text-gray-400 hover:text-white">
          <i class="fas fa-search"></i>
        </button>
        <button class="text-gray-400 hover:text-white" @click="$emit('toggle-sidebar')">
          <i class="fas fa-arrows-alt-h"></i>
        </button>
      </div>
    </div>
    
    <div class="chat-messages flex-grow overflow-y-auto p-3" ref="messagesContainer">
      <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
        Пока нет сообщений в чате
      </div>
      
      <template v-else>
        <div v-for="message in messages" :key="message.id" class="mb-4">
          <div :class="['message', {'message-own': message.userId === currentUserId}]">
            <div class="message-header flex items-center mb-1">
              <img :src="message.avatar" alt="Avatar" class="w-6 h-6 rounded-full mr-2">
              <div class="message-sender font-medium" :class="{'text-green-400': message.role === 'teacher'}">
                {{ message.username }}
              </div>
              <div class="message-time text-xs text-gray-500 ml-2">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
            
            <div class="message-content py-1 px-3 bg-gray-700 rounded-md text-white">
              {{ message.content }}
            </div>
            
            <div class="message-actions flex mt-1 space-x-2">
              <div class="reactions flex space-x-1">
                <button 
                  v-for="emoji in availableReactions" 
                  :key="emoji"
                  class="reaction-btn text-xs px-1 py-0.5 rounded hover:bg-gray-600"
                  :class="{'bg-gray-600': hasReacted(message.id, emoji)}"
                  @click="handleReaction(message.id, emoji)"
                >
                  {{ emoji }} {{ getReactionCount(message.id, emoji) }}
                </button>
              </div>
              <button 
                class="text-xs text-gray-400 hover:text-white"
                @click="replyToMessage(message.id, message.username)"
              >
                Ответить
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <div class="chat-input border-t border-gray-700 p-3">
      <div v-if="replyingTo" class="reply-info bg-gray-700 rounded p-2 mb-2 flex justify-between items-center">
        <div class="text-sm text-gray-400">
          Ответ для <span class="text-white">{{ replyingToName }}</span>
        </div>
        <button class="text-gray-500 hover:text-white" @click="cancelReply">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="flex items-center space-x-2">
        <button class="text-gray-400 hover:text-white p-2">
          <i class="fas fa-paperclip"></i>
        </button>
        
        <input 
          type="text" 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          placeholder="Введите сообщение..." 
          class="bg-gray-700 text-white rounded-md flex-grow p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button 
          @click="sendMessage" 
          class="bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 focus:outline-none"
          :disabled="!newMessage.trim()"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useUserStore } from '../../stores/user';

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['send-message', 'toggle-reaction', 'toggle-sidebar']);

const userStore = useUserStore();
const messagesContainer = ref(null);
const newMessage = ref('');
const replyingTo = ref(null);
const replyingToName = ref('');

const currentUserId = computed(() => userStore.id || 1);

const availableReactions = ['👍', '❤️', '😂', '😮', '👏', '🤔'];

// Прокрутка чата вниз при появлении новых сообщений
watch(() => props.messages.length, async () => {
  await nextTick();
  scrollToBottom();
});

// Методы
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const sendMessage = () => {
  if (newMessage.value.trim()) {
    emit('send-message', newMessage.value);
    newMessage.value = '';
    replyingTo.value = null;
    replyingToName.value = '';
  }
};

const handleReaction = (messageId, emoji) => {
  emit('toggle-reaction', messageId, emoji);
};

const replyToMessage = (messageId, username) => {
  replyingTo.value = messageId;
  replyingToName.value = username;
};

const cancelReply = () => {
  replyingTo.value = null;
  replyingToName.value = '';
};

const hasReacted = (messageId, emoji) => {
  const message = props.messages.find(m => m.id === messageId);
  if (!message || !message.reactions) return false;
  
  return message.reactions.some(r => r.emoji === emoji && r.userId === currentUserId);
};

const getReactionCount = (messageId, emoji) => {
  const message = props.messages.find(m => m.id === messageId);
  if (!message || !message.reactions) return 0;
  
  return message.reactions.filter(r => r.emoji === emoji).length;
};
</script>

<style scoped>
.chat-messages {
  max-height: calc(100vh - 300px);
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #2d3748;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: #4a5568;
  border-radius: 3px;
}

.message-own .message-content {
  background-color: #2b6cb0;
}

@media (max-width: 768px) {
  .chat-messages {
    max-height: 300px;
  }
}
</style>
