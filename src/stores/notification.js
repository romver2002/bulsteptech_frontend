import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([]);
  let nextId = 1;

  function addNotification({ title = '', message, type = 'info', timeout = 3000 }) {
    const id = nextId++;
    
    notifications.value.push({
      id,
      title,
      message,
      type,
      timeout
    });
    
    return id;
  }

  function removeNotification(id) {
    notifications.value = notifications.value.filter(notification => notification.id !== id);
  }

  function success(message, title = '') {
    return addNotification({ title, message, type: 'success' });
  }

  function error(message, title = '') {
    return addNotification({ title, message, type: 'error', timeout: 5000 });
  }

  function warning(message, title = '') {
    return addNotification({ title, message, type: 'warning', timeout: 4000 });
  }

  function info(message, title = '') {
    return addNotification({ title, message, type: 'info' });
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  };
});
