<template>
  <button
    :class="[
      'animated-button transition-all transform',
      variantClasses,
      sizeClasses,
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <div class="flex items-center justify-center">
      <!-- Индикатор загрузки -->
      <svg 
        v-if="loading" 
        class="animate-spin -ml-1 mr-2 h-4 w-4" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      
      <!-- Иконка -->
      <span v-if="icon && !loading" class="mr-2">{{ icon }}</span>
      
      <!-- Текст кнопки -->
      <slot>Button</slot>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary': return 'bg-discord-accent hover:bg-discord-accent-hover text-white';
    case 'secondary': return 'bg-discord-secondary hover:bg-discord-dark text-white';
    case 'success': return 'bg-discord-success hover:bg-discord-success/90 text-white';
    case 'danger': return 'bg-discord-error hover:bg-discord-error/90 text-white';
    case 'warning': return 'bg-discord-warning hover:bg-discord-warning/90 text-white';
    case 'info': return 'bg-discord-accent/70 hover:bg-discord-accent/80 text-white';
    case 'dark': return 'bg-discord-dark hover:bg-discord-dark-hover text-white';
    default: return 'bg-discord-accent hover:bg-discord-accent-hover text-white';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-xs px-2 py-1 rounded-md';
    case 'lg': return 'text-lg px-6 py-3 rounded-md';
    case 'md':
    default: return 'text-sm px-4 py-2 rounded-md';
  }
});
</script>

<style scoped>
.animated-button {
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}

.animated-button:active:not(:disabled) {
  transform: scale(0.95);
}

.animated-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.animated-button:focus:not(:active)::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0) translate(-50%, -50%);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20) translate(-50%, -50%);
    opacity: 0;
  }
}
</style>
