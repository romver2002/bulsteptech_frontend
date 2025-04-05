import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useChannelStore = defineStore('channel', () => {
  // Состояние канала
  const currentChannelId = ref('');
  const channels = ref([
    // Образовательные каналы
    { 
      id: 'lecture', 
      name: 'лекция', 
      icon: 'M12 14l9-5-9-5-9 5 9 5z', 
      category: 'education',
      description: 'Канал для проведения лекций и обсуждения учебного материала'
    },
    { 
      id: 'schedule', 
      name: 'расписание', 
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 
      category: 'education',
      description: 'Информация о расписании занятий и консультаций'
    },
    { 
      id: 'analytics', 
      name: 'аналитика', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', 
      category: 'education',
      description: 'Аналитика по успеваемости и активности студентов'
    },
    { 
      id: 'attendance', 
      name: 'посещаемость', 
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', 
      category: 'education',
      description: 'Журнал посещаемости занятий'
    },
    { 
      id: 'reports', 
      name: 'отчеты', 
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 
      category: 'education',
      description: 'Формирование и просмотр отчетов о прогрессе обучения'
    },
    { 
      id: 'student-management', 
      name: 'управление студентами', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', 
      category: 'education',
      description: 'Управление студентами и группами'
    },
    { 
      id: 'assignments', 
      name: 'задания', 
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', 
      category: 'education',
      description: 'Задания для самостоятельной работы'
    },
    { 
      id: 'tests', 
      name: 'тесты и опросы', 
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 
      category: 'education',
      description: 'Тесты для проверки знаний и опросы'
    },
    { 
      id: 'resources', 
      name: 'ресурсы', 
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', 
      category: 'education',
      description: 'Учебные материалы и дополнительные ресурсы'
    },
    
    // Системные каналы
    { 
      id: 'general', 
      name: 'общий', 
      icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', 
      category: 'system',
      description: 'Общий канал для обсуждений'
    },
    { 
      id: 'announcements', 
      name: 'объявления', 
      icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z', 
      category: 'system',
      description: 'Важные объявления и новости'
    },
    { 
      id: 'help', 
      name: 'помощь', 
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 
      category: 'system', 
      description: 'Канал для помощи и поддержки'
    },
    { 
      id: 'feedback', 
      name: 'обратная связь', 
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', 
      category: 'system',
      description: 'Отзывы и предложения по улучшению'
    },
    { 
      id: 'chat', 
      name: 'чат', 
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', 
      category: 'system',
      description: 'Свободное общение'
    },
    { 
      id: 'stream', 
      name: 'стрим', 
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', 
      category: 'system',
      description: 'Трансляции и вебинары'
    },
    { 
      id: 'profile', 
      name: 'профиль', 
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', 
      category: 'system',
      description: 'Профиль пользователя'
    }
  ]);

  // Computed properties
  const currentChannel = computed(() => {
    return channels.value.find(channel => channel.id === currentChannelId.value) || channels.value.find(channel => channel.id === 'general');
  });

  const educationChannels = computed(() => {
    return channels.value.filter(channel => channel.category === 'education');
  });

  const systemChannels = computed(() => {
    return channels.value.filter(channel => channel.category === 'system');
  });

  // Actions
  function setCurrentChannel(channelId) {
    currentChannelId.value = channelId;
  }

  function addChannel(channel) {
    channels.value.push(channel);
  }

  function removeChannel(channelId) {
    const index = channels.value.findIndex(channel => channel.id === channelId);
    if (index !== -1) {
      channels.value.splice(index, 1);
    }
  }

  function updateChannel(channelId, updatedChannel) {
    const index = channels.value.findIndex(channel => channel.id === channelId);
    if (index !== -1) {
      channels.value[index] = { ...channels.value[index], ...updatedChannel };
    }
  }

  return {
    // State
    currentChannelId,
    channels,
    
    // Computed
    currentChannel,
    educationChannels,
    systemChannels,
    
    // Actions
    setCurrentChannel,
    addChannel,
    removeChannel,
    updateChannel
  };
}); 