<template>
  <div class="notifications-container">
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
