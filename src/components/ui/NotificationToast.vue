<template>
  <transition name="toast">
    <div 
      v-if="show" 
      class="notification-toast pointer-events-auto w-full overflow-hidden rounded-lg"
      :class="typeClasses"
      :role="type === 'error' ? 'alert' : 'status'"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <div class="flex w-full items-center rounded-lg p-4 shadow-lg">
        <div v-if="type === 'success'" class="mr-3 text-xl" aria-hidden="true">✅</div>
        <div v-else-if="type === 'error'" class="mr-3 text-xl" aria-hidden="true">❌</div>
        <div v-else-if="type === 'info'" class="mr-3 text-xl" aria-hidden="true">ℹ️</div>
        <div v-else-if="type === 'warning'" class="mr-3 text-xl" aria-hidden="true">⚠️</div>
        
        <div class="flex-1">
          <p class="font-semibold text-sm" v-if="title">{{ title }}</p>
          <p class="text-sm">{{ message }}</p>
        </div>
        
        <button 
          type="button"
          @click="closeToast" 
          class="ml-2 rounded-md p-1 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="Закрыть уведомление"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  timeout: {
    type: Number,
    default: 3000
  },
  autoClose: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const show = ref(true);
let timeoutId = null;
let closeDelayId = null;

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-discord-success text-white';
    case 'error': return 'bg-discord-error text-white';
    case 'warning': return 'bg-discord-warning text-white';
    case 'info': 
    default: return 'bg-discord-accent text-white';
  }
});

const closeToast = () => {
  if (!show.value) return;

  show.value = false;
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  closeDelayId = setTimeout(() => {
    emit('close');
  }, 300);
};

onMounted(() => {
  if (props.autoClose && props.timeout > 0) {
    timeoutId = setTimeout(closeToast, props.timeout);
  }
});

onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  if (closeDelayId) {
    clearTimeout(closeDelayId);
  }
});
</script>

<style scoped>
.notification-toast {
  transform-origin: top right;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
