import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useNotificationStore } from './notification';
import { useStreamMessagesStore } from './streamMessages';

export const useStreamStore = defineStore('stream', () => {
  const notificationStore = useNotificationStore();
  const streamMessagesStore = useStreamMessagesStore();
  
  // Состояние трансляции
  const streamActive = ref(false);
  const isLive = ref(false);
  const isMicrophoneOn = ref(true);
  const isCameraOn = ref(true);
  const isScreenSharing = ref(false);
  const isHandRaised = ref(false);
  
  // Данные участников (в реальном приложении будет загружаться с сервера)
  const participants = ref([
    {
      id: 1,
      name: 'Иван Петров',
      avatar: 'https://i.pravatar.cc/150?img=3',
      role: 'teacher',
      status: 'online',
      speaking: false,
      handRaised: false,
      videoOn: true,
      audioOn: true
    },
    {
      id: 2,
      name: 'Алексей Иванов',
      avatar: 'https://i.pravatar.cc/150?img=4',
      role: 'student',
      status: 'online',
      speaking: false,
      handRaised: false,
      videoOn: false,
      audioOn: true
    },
    {
      id: 3,
      name: 'Мария Сидорова',
      avatar: 'https://i.pravatar.cc/150?img=5',
      role: 'student',
      status: 'online',
      speaking: false,
      handRaised: true,
      videoOn: true,
      audioOn: true
    },
    {
      id: 4,
      name: 'Дмитрий Кузнецов',
      avatar: 'https://i.pravatar.cc/150?img=7',
      role: 'student',
      status: 'online',
      speaking: false,
      handRaised: false,
      videoOn: true,
      audioOn: true
    }
  ]);
  
  // Текущая трансляция
  const currentStream = ref({
    id: 1,
    title: 'Введение в Vue 3 - Композиционный API',
    description: 'В этой лекции мы рассмотрим основы работы с Vue 3 и Composition API, научимся создавать реактивные компоненты и управлять состоянием приложения.',
    instructor: {
      id: 1,
      name: 'Иван Петров',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    imageSrc: 'https://via.placeholder.com/800x450?text=Vue+3+Lecture',
    poster: 'https://via.placeholder.com/800x450?text=Preview+Image',
    status: 'waiting', // waiting, live, ended
    scheduledStartTime: new Date(),
    actualStartTime: null,
    endTime: null,
    viewerCount: 0,
    maxViewerCount: 0,
    duration: 0 // в секундах
  });
  
  // Computed-свойства
  const teacherParticipant = computed(() => {
    return participants.value.find(p => p.role === 'teacher');
  });
  
  const studentParticipants = computed(() => {
    return participants.value.filter(p => p.role === 'student');
  });
  
  // Действия
  
  // Старт трансляции
  const startStream = () => {
    if (currentStream.value.status !== 'waiting') {
      notificationStore.error('Трансляция не может быть начата в текущем состоянии');
      return;
    }
    
    streamActive.value = true;
    isLive.value = true;
    currentStream.value.status = 'live';
    currentStream.value.actualStartTime = new Date();
    currentStream.value.viewerCount = participants.value.length - 1; // Исключаем преподавателя
    
    notificationStore.success('Трансляция успешно начата');
    
    // Имитация изменения количества зрителей
    startViewerCountTimer();
  };
  
  // Остановка трансляции
  const stopStream = () => {
    if (!isLive.value) {
      notificationStore.error('Трансляция не активна');
      return;
    }
    
    streamActive.value = false;
    isLive.value = false;
    currentStream.value.status = 'ended';
    currentStream.value.endTime = new Date();
    
    // Расчет длительности трансляции
    if (currentStream.value.actualStartTime) {
      const duration = Math.floor((currentStream.value.endTime - currentStream.value.actualStartTime) / 1000);
      currentStream.value.duration = duration;
    }
    
    notificationStore.success('Трансляция завершена');
    
    // Остановка таймера изменения количества зрителей
    stopViewerCountTimer();
  };
  
  // Переключение микрофона
  const toggleMicrophone = () => {
    isMicrophoneOn.value = !isMicrophoneOn.value;
    
    // Обновляем статус микрофона преподавателя
    const teacher = participants.value.find(p => p.role === 'teacher');
    if (teacher) {
      teacher.audioOn = isMicrophoneOn.value;
    }
    
    notificationStore.info(`Микрофон ${isMicrophoneOn.value ? 'включен' : 'выключен'}`);
  };
  
  // Переключение камеры
  const toggleCamera = () => {
    isCameraOn.value = !isCameraOn.value;
    
    // Обновляем статус камеры преподавателя
    const teacher = participants.value.find(p => p.role === 'teacher');
    if (teacher) {
      teacher.videoOn = isCameraOn.value;
    }
    
    notificationStore.info(`Камера ${isCameraOn.value ? 'включена' : 'выключена'}`);
  };
  
  // Переключение демонстрации экрана
  const toggleScreenSharing = () => {
    isScreenSharing.value = !isScreenSharing.value;
    notificationStore.info(`Демонстрация экрана ${isScreenSharing.value ? 'включена' : 'выключена'}`);
  };
  
  // Поднятие/опускание руки
  const toggleHandRaise = () => {
    isHandRaised.value = !isHandRaised.value;
    
    // В реальном приложении здесь был бы API-запрос к серверу
    notificationStore.info(`Вы ${isHandRaised.value ? 'подняли' : 'опустили'} руку`);
  };
  
  // Изменение статуса поднятой руки участника
  const toggleParticipantHandRaise = (participantId) => {
    const participant = participants.value.find(p => p.id === participantId);
    if (participant) {
      participant.handRaised = !participant.handRaised;
    }
  };
  
  // Переключение статуса микрофона участника
  const toggleParticipantMicrophone = (participantId) => {
    const participant = participants.value.find(p => p.id === participantId);
    if (participant) {
      participant.audioOn = !participant.audioOn;
    }
  };
  
  // Переключение статуса камеры участника
  const toggleParticipantCamera = (participantId) => {
    const participant = participants.value.find(p => p.id === participantId);
    if (participant) {
      participant.videoOn = !participant.videoOn;
    }
  };
  
  // Имитация изменения количества зрителей
  let viewerCountTimer = null;
  
  const startViewerCountTimer = () => {
    viewerCountTimer = setInterval(() => {
      // Случайное изменение количества зрителей в пределах ±2
      const change = Math.floor(Math.random() * 5) - 2;
      const newCount = currentStream.value.viewerCount + change;
      
      // Ограничиваем минимальное количество зрителей (хотя бы студенты из списка участников)
      currentStream.value.viewerCount = Math.max(studentParticipants.value.length, newCount);
      
      // Обновляем максимальное количество зрителей
      currentStream.value.maxViewerCount = Math.max(currentStream.value.maxViewerCount, currentStream.value.viewerCount);
    }, 10000); // Каждые 10 секунд
  };
  
  const stopViewerCountTimer = () => {
    if (viewerCountTimer) {
      clearInterval(viewerCountTimer);
      viewerCountTimer = null;
    }
  };
  
  return {
    // Состояние
    streamActive,
    isLive,
    isMicrophoneOn,
    isCameraOn,
    isScreenSharing,
    isHandRaised,
    participants,
    currentStream,
    
    // Computed
    teacherParticipant,
    studentParticipants,
    
    // Методы
    startStream,
    stopStream,
    toggleMicrophone,
    toggleCamera,
    toggleScreenSharing,
    toggleHandRaise,
    toggleParticipantHandRaise,
    toggleParticipantMicrophone,
    toggleParticipantCamera
  };
});
