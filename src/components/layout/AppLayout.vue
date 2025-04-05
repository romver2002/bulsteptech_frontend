<template>
  <div class="app-container h-screen flex flex-col">
    <!-- Используем выделенный компонент TopBar -->
    <TopBar />
    
    <div class="flex flex-1 overflow-hidden relative">
      <!-- Используем выделенный компонент Sidebar -->
      <Sidebar />
      
      <!-- Main Content -->
      <div class="content-area flex-1 overflow-auto">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue';
import TopBar from './TopBar.vue';
import Sidebar from './Sidebar.vue';

// Состояние адаптивности для совместного использования
const isMobileView = ref(false);

const checkMobileView = () => {
  isMobileView.value = window.innerWidth < 768;
};

// Предоставляем состояние адаптивности для дочерних компонентов
provide('isMobileView', isMobileView);

onMounted(() => {
  checkMobileView();
  window.addEventListener('resize', checkMobileView);
});
</script>

<style scoped>
.content-area {
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .content-area {
    width: 100%;
  }
}
</style>
