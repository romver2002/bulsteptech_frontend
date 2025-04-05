<template>
  <div 
    class="skeleton-loader" 
    :class="{ 
      'rounded-full': circle, 
      [heightClass]: true, 
      [widthClass]: true 
    }"
  ></div>
</template>

<script setup>
const props = defineProps({
  width: {
    type: String,
    default: 'full'
  },
  height: {
    type: String,
    default: '4'
  },
  circle: {
    type: Boolean,
    default: false
  }
});

const heightClass = `h-${props.height}`;
const widthClass = `w-${props.width}`;
</script>

<style scoped>
.skeleton-loader {
  background: linear-gradient(
    90deg,
    var(--color-discord-dark) 25%,
    var(--color-discord-secondary) 50%,
    var(--color-discord-dark) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
