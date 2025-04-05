<div v-if="isStreamActive" class="stream-active-layout flex h-full">
  <div class="video-area flex-grow flex flex-col overflow-hidden">
    <!-- ... existing code ... -->
  </div>
  
  <div class="chat-sidebar w-96 flex flex-col border-l border-discord-dark-hover h-full bg-discord-dark-secondary">
    <MessageContainer />
  </div>
</div>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useUserStore } from '../stores/user';
import { useStreamStore } from '../stores/stream';
import MessageContainer from '../components/chat/MessageContainer.vue'; // Добавляем импорт MessageContainer

// ... existing code ...

</script>
// ... existing code ... 