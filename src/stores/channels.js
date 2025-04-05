import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useChannelStore = defineStore('channel', () => {
  // State
  const currentChannelId = ref('lecture');
  const channels = ref([
    // Образовательные каналы (УПРАВЛЕНИЕ ОБУЧЕНИЕМ)
    { id: 'lecture', name: 'Лекция', group: 'education' },
    { id: 'student-management', name: 'Управление студентами', group: 'education' },
    { id: 'assignments', name: 'Задания', group: 'education' },
    { id: 'tests', name: 'Тесты и опросы', group: 'education' },
    { id: 'resources', name: 'Ресурсы', group: 'education' },
    
    // Аналитика
    { id: 'student-progress', name: 'Прогресс студентов', group: 'analytics' },
    { id: 'attendance', name: 'Посещаемость', group: 'analytics' },
    { id: 'reports', name: 'Отчеты', group: 'analytics' },
    
    // Системные каналы
    { id: 'general', name: 'Общий', group: 'system' },
    { id: 'announcements', name: 'Объявления', group: 'system' },
    { id: 'help', name: 'Помощь', group: 'system' },
    { id: 'feedback', name: 'Обратная связь', group: 'system' },
    { id: 'chat', name: 'Чат', group: 'system' },
    { id: 'profile', name: 'Профиль', group: 'system' }
  ]);

  // Getters
  const currentChannel = computed(() => {
    return channels.value.find(channel => channel.id === currentChannelId.value);
  });

  // Actions
  function setCurrentChannel(channelId) {
    currentChannelId.value = channelId;
  }

  return {
    currentChannelId,
    channels,
    currentChannel,
    setCurrentChannel
  };
});
