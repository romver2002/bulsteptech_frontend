<template>
  <div
    class="notifications-container pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
    aria-label="Уведомления"
    aria-live="polite"
    aria-relevant="additions removals"
  >
    <notification-toast
      v-for="notification in notificationStore.notifications"
      :key="notification.id"
      :title="notification.title"
      :message="notification.message"
      :type="notification.type"
      :timeout="notification.timeout"
      @close="notificationStore.removeNotification(notification.id)"
    />
  </div>
</template>

<script setup>
import { useNotificationStore } from '../../stores/notification';
import NotificationToast from './NotificationToast.vue';

const notificationStore = useNotificationStore();
</script>
