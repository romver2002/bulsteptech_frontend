<template>
  <div class="message-item mb-4">
    <!-- Системное сообщение -->
    <div v-if="message.type === 'system'" class="text-center py-2 animate-fade-in">
      <span class="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.1)]">
        {{ message.content }}
      </span>
    </div>
    
    <!-- Обычное сообщение -->
    <div v-else class="flex items-start group">
      <div class="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold border border-white/10">
        {{ userInitial }}
      </div>
      <div class="ml-4 flex-1 bg-white/5 border border-transparent group-hover:border-white/5 rounded-2xl rounded-tl-sm p-3 transition-all duration-300">
        <div class="flex items-center mb-1">
          <span class="font-bold text-white tracking-wide">{{ displayUsername }}</span>
          <span class="ml-3 text-[10px] text-gray-500 font-medium uppercase">{{ formatTime(message.timestamp) }}</span>
        </div>
        <p class="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-300">
          <template v-for="(segment, index) in messageSegments" :key="`${segment.type}-${index}`">
            <a
              v-if="segment.type === 'link'"
              :href="segment.href"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-400 underline-offset-2 hover:underline"
            >{{ segment.value }}</a>
            <strong v-else-if="segment.type === 'strong'">{{ segment.value }}</strong>
            <em v-else-if="segment.type === 'emphasis'">{{ segment.value }}</em>
            <code v-else-if="segment.type === 'code'" class="rounded bg-discord-dark px-1 text-xs">{{ segment.value }}</code>
            <span v-else>{{ segment.value }}</span>
          </template>
        </p>
        
        <!-- Вложения, если есть -->
        <div v-if="message.attachments && message.attachments.length" class="mt-3 space-y-2">
          <div v-for="(attachment, idx) in message.attachments" :key="idx" class="attachment">
            <a
              v-if="isImage(attachment)"
              :href="attachment.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block max-w-sm"
            >
              <img
                :src="attachment.url"
                :alt="attachment.name"
                loading="lazy"
                decoding="async"
                class="w-full h-auto rounded-xl shadow-md border border-white/10 hover:opacity-90 transition-opacity"
              >
            </a>
            <a
              v-else
              :href="attachment.url"
              download
              class="attachment-file bg-black/40 border border-white/10 rounded-xl p-3 flex items-center w-64 hover:bg-white/5 transition-colors cursor-pointer group/file"
            >
              <div class="p-2 bg-white/5 rounded-lg mr-3 group-hover/file:bg-indigo-500/20 transition-colors">
                <svg class="w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
              </div>
              <div class="truncate flex-1">
                <div class="text-sm font-medium text-white truncate">{{ attachment.name }}</div>
                <div class="text-xs text-gray-500">{{ formatFileSize(attachment.size) }}</div>
              </div>
            </a>
          </div>
        </div>
        
        <!-- Реакции (если есть) -->
        <div v-if="message.reactions && message.reactions.length" class="flex flex-wrap gap-2 mt-3">
          <button 
            v-for="reaction in message.reactions" 
            :key="reaction.emoji" 
            type="button"
            @click="$emit('toggle-reaction', message.id, reaction.emoji)"
            class="reaction-btn border px-2.5 py-1 rounded-full flex items-center space-x-1.5 transition-all text-sm"
            :class="hasUserReacted(reaction) ? 'bg-indigo-500/20 border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.3)]' : 'bg-black/30 border-white/10 hover:bg-white/10'"
            :aria-label="`${hasUserReacted(reaction) ? 'Убрать' : 'Добавить'} реакцию ${reaction.emoji}`"
            :aria-pressed="hasUserReacted(reaction)"
          >
            <span>{{ reaction.emoji }}</span>
            <span class="text-xs font-bold" :class="hasUserReacted(reaction) ? 'text-indigo-300' : 'text-gray-400'">{{ reaction.count }}</span>
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
const displayUsername = computed(() => props.message.username || 'Пользователь');
const userInitial = computed(() => displayUsername.value.trim().charAt(0).toUpperCase() || '?');

const messageSegments = computed(() => parseMessage(props.message.content));

// Форматирование времени
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Разбиваем ограниченный markdown на безопасные сегменты. Vue экранирует
// содержимое каждого сегмента, поэтому пользовательский HTML не исполняется.
const inlineTokenPattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|https?:\/\/[^\s<]+)/g;

function parseMessage(value) {
  const text = String(value || '');
  const segments = [];
  let cursor = 0;

  for (const match of text.matchAll(inlineTokenPattern)) {
    if (match.index > cursor) {
      segments.push({ type: 'text', value: text.slice(cursor, match.index) });
    }

    const token = match[0];
    if (token.startsWith('`')) {
      segments.push({ type: 'code', value: token.slice(1, -1) });
    } else if (token.startsWith('**')) {
      segments.push({ type: 'strong', value: token.slice(2, -2) });
    } else if (token.startsWith('*')) {
      segments.push({ type: 'emphasis', value: token.slice(1, -1) });
    } else {
      segments.push({ type: 'link', value: token, href: token });
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) {
    segments.push({ type: 'text', value: text.slice(cursor) });
  }

  return segments;
}

const hasUserReacted = (reaction) => {
  return Array.isArray(reaction?.users) && reaction.users.includes(userId.value);
};

// Определение типа файла
const isImage = (attachment) => {
  return attachment?.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)(?:\?.*)?$/i.test(attachment?.url || '');
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
