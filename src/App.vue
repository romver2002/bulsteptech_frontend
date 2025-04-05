<template>
  <div class="app">
    <!-- Контейнер для уведомлений -->
    <notifications-container />
    
    <!-- Анимированный переход между страницами -->
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import NotificationsContainer from './components/ui/NotificationsContainer.vue';
import { useChannelStore } from './stores/channels';
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
