<template>
  <transition name="toast">
    <div 
      v-if="show" 
      class="notification-toast fixed z-50"
      :class="[
        positionClasses,
        typeClasses
      ]"
    >
      <div class="flex items-center p-4 rounded-lg shadow-lg max-w-sm">
        <div class="mr-3 text-xl" v-if="type === 'success'">✅</div>
        <div class="mr-3 text-xl" v-else-if="type === 'error'">❌</div>
        <div class="mr-3 text-xl" v-else-if="type === 'info'">ℹ️</div>
        <div class="mr-3 text-xl" v-else-if="type === 'warning'">⚠️</div>
        
        <div class="flex-1">
          <p class="font-semibold text-sm" v-if="title">{{ title }}</p>
          <p class="text-sm">{{ message }}</p>
        </div>
        
        <button 
          @click="closeToast" 
          class="ml-2 text-discord-text-gray hover:text-white"
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
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'].includes(value)
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

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-discord-success text-white';
    case 'error': return 'bg-discord-error text-white';
    case 'warning': return 'bg-discord-warning text-white';
    case 'info': 
    default: return 'bg-discord-accent text-white';
  }
});

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top-left': return 'top-4 left-4';
    case 'bottom-right': return 'bottom-4 right-4';
    case 'bottom-left': return 'bottom-4 left-4';
    case 'top-center': return 'top-4 left-1/2 -translate-x-1/2';
    case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2';
    case 'top-right':
    default: return 'top-4 right-4';
  }
});

const closeToast = () => {
  show.value = false;
  setTimeout(() => {
    emit('close');
  }, 300); // Подождем завершения анимации
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
});
</script>

<style scoped>
.notification-toast {
  transform-origin: top right;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
}
</style>
