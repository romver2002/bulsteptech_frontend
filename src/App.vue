<template>
  <div class="app">
    <!-- Контейнер для уведомлений -->
    <notifications-container />
    
    <router-view v-slot="{ Component }">
      <transition name="page">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import NotificationsContainer from './components/ui/NotificationsContainer.vue';
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active { transition-duration: 1ms; }
}
</style>
