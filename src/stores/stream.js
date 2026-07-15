import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useNotificationStore } from './notification';
import { useStreamMessagesStore } from './streamMessages';

export const useStreamStore = defineStore('stream', () => {
  const notificationStore = useNotificationStore();
  const streamMessagesStore = useStreamMessagesStore();

  const streamActive = ref(false);
  const isLive = ref(false);
  const isMicrophoneOn = ref(true);
  const isCameraOn = ref(true);
  const isScreenSharing = ref(false);
  const isHandRaised = ref(false);
  const pinnedParticipantId = ref(null);

  const participants = ref([
    {
      id: 1,
      name: 'Иван Петров',
      avatar: '',
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
      avatar: '',
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
      avatar: '',
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
      avatar: '',
      role: 'student',
      status: 'online',
      speaking: false,
      handRaised: false,
      videoOn: true,
      audioOn: true
    }
  ]);

  const currentStream = ref({
    id: 1,
    title: 'Введение в Vue 3 — Composition API',
    description: 'Разберём реактивность Vue 3, Composition API и практические приёмы построения компонентов.',
    instructor: {
      id: 1,
      name: 'Иван Петров',
      avatar: ''
    },
    imageSrc: '',
    poster: '',
    status: 'waiting',
    scheduledStartTime: new Date(),
    actualStartTime: null,
    endTime: null,
    viewerCount: 0,
    maxViewerCount: 0,
    duration: 0
  });

  const teacherParticipant = computed(() => participants.value.find(participant => participant.role === 'teacher'));
  const studentParticipants = computed(() => participants.value.filter(participant => participant.role === 'student'));
  const messages = computed(() => streamMessagesStore.messages);

  let viewerCountTimer = null;

  const stopViewerCountTimer = () => {
    if (viewerCountTimer !== null) {
      clearInterval(viewerCountTimer);
      viewerCountTimer = null;
    }
  };

  const startViewerCountTimer = () => {
    stopViewerCountTimer();

    viewerCountTimer = setInterval(() => {
      if (!isLive.value) return;

      const change = Math.floor(Math.random() * 5) - 2;
      const nextCount = currentStream.value.viewerCount + change;
      currentStream.value.viewerCount = Math.max(studentParticipants.value.length, nextCount);
      currentStream.value.maxViewerCount = Math.max(
        currentStream.value.maxViewerCount,
        currentStream.value.viewerCount
      );
    }, 10000);
  };

  const resumeViewerCountTimer = () => {
    if (isLive.value && viewerCountTimer === null) startViewerCountTimer();
  };

  const startStream = () => {
    if (isLive.value) {
      notificationStore.info('Трансляция уже идёт');
      return false;
    }

    streamActive.value = true;
    isLive.value = true;
    currentStream.value.status = 'live';
    currentStream.value.actualStartTime = new Date();
    currentStream.value.endTime = null;
    currentStream.value.duration = 0;
    currentStream.value.viewerCount = studentParticipants.value.length;
    currentStream.value.maxViewerCount = currentStream.value.viewerCount;

    participants.value.forEach((participant) => {
      participant.status = 'online';
    });

    startViewerCountTimer();
    notificationStore.success('Трансляция началась');
    return true;
  };

  const stopStream = () => {
    if (!isLive.value) {
      notificationStore.error('Трансляция не активна');
      return false;
    }

    streamActive.value = false;
    isLive.value = false;
    currentStream.value.status = 'ended';
    currentStream.value.endTime = new Date();

    if (currentStream.value.actualStartTime) {
      currentStream.value.duration = Math.floor(
        (currentStream.value.endTime - currentStream.value.actualStartTime) / 1000
      );
    }

    participants.value.forEach((participant) => {
      participant.speaking = false;
    });
    stopViewerCountTimer();
    streamMessagesStore.releaseObjectUrls();
    notificationStore.success('Трансляция завершена');
    return true;
  };

  const joinStream = (participantId) => {
    if (!isLive.value) {
      notificationStore.info('Эфир ещё не начался');
      return false;
    }

    const participant = participants.value.find(item => item.id === Number(participantId));
    if (participant) participant.status = 'online';

    streamActive.value = true;
    currentStream.value.viewerCount = Math.max(
      studentParticipants.value.length,
      currentStream.value.viewerCount + 1
    );
    currentStream.value.maxViewerCount = Math.max(
      currentStream.value.maxViewerCount,
      currentStream.value.viewerCount
    );
    notificationStore.success('Вы подключились к трансляции');
    return true;
  };

  const leaveStream = (participantId) => {
    const participant = participants.value.find(item => item.id === Number(participantId));
    if (participant) participant.status = 'away';

    streamActive.value = false;
    currentStream.value.viewerCount = Math.max(0, currentStream.value.viewerCount - 1);
    notificationStore.info('Вы покинули трансляцию');
  };

  const toggleMicrophone = (participantId = teacherParticipant.value?.id) => {
    const participant = participants.value.find(item => item.id === Number(participantId));
    if (!participant) return false;

    participant.audioOn = !participant.audioOn;
    isMicrophoneOn.value = participant.audioOn;
    notificationStore.info(`Микрофон ${participant.audioOn ? 'включён' : 'выключен'}`);
    return participant.audioOn;
  };

  const toggleCamera = (participantId = teacherParticipant.value?.id) => {
    const participant = participants.value.find(item => item.id === Number(participantId));
    if (!participant) return false;

    participant.videoOn = !participant.videoOn;
    isCameraOn.value = participant.videoOn;
    notificationStore.info(`Камера ${participant.videoOn ? 'включена' : 'выключена'}`);
    return participant.videoOn;
  };

  const toggleScreenSharing = () => {
    isScreenSharing.value = !isScreenSharing.value;
    notificationStore.info(`Демонстрация экрана ${isScreenSharing.value ? 'включена' : 'выключена'}`);
  };

  const toggleHandRaise = (participantId) => {
    const participant = participants.value.find(item => item.id === Number(participantId));
    if (!participant || participant.role !== 'student') return false;

    participant.handRaised = !participant.handRaised;
    isHandRaised.value = participant.handRaised;
    notificationStore.info(`Вы ${participant.handRaised ? 'подняли' : 'опустили'} руку`);
    return participant.handRaised;
  };

  const toggleParticipantHandRaise = (participantId) => {
    const participant = participants.value.find(item => item.id === Number(participantId));
    if (!participant) return false;
    participant.handRaised = !participant.handRaised;
    return participant.handRaised;
  };

  const toggleParticipantMicrophone = participantId => toggleMicrophone(participantId);

  const toggleParticipantCamera = (participantId) => {
    const participant = participants.value.find(item => item.id === Number(participantId));
    if (!participant) return false;
    participant.videoOn = !participant.videoOn;
    return participant.videoOn;
  };

  const pinParticipant = (participantId) => {
    const id = Number(participantId);
    if (!participants.value.some(participant => participant.id === id)) return null;
    pinnedParticipantId.value = pinnedParticipantId.value === id ? null : id;
    return pinnedParticipantId.value;
  };

  const setSpeakingParticipant = (participantId) => {
    const id = Number(participantId);
    participants.value.forEach((participant) => {
      participant.speaking = participant.id === id && participant.audioOn;
    });
  };

  const addMessage = payload => streamMessagesStore.sendMessage(payload);
  const addSystemMessage = content => streamMessagesStore.addSystemMessage(content);
  const toggleMessageReaction = (payload, legacyEmoji, legacyUserId) => {
    if (typeof payload === 'object' && payload !== null) {
      return streamMessagesStore.toggleReaction(payload.messageId, payload.emoji, payload.userId);
    }
    return streamMessagesStore.toggleReaction(payload, legacyEmoji, legacyUserId);
  };
  const releaseMessageObjectUrls = () => streamMessagesStore.releaseObjectUrls();

  return {
    streamActive,
    isLive,
    isMicrophoneOn,
    isCameraOn,
    isScreenSharing,
    isHandRaised,
    pinnedParticipantId,
    participants,
    currentStream,
    messages,
    teacherParticipant,
    studentParticipants,
    startStream,
    stopStream,
    joinStream,
    leaveStream,
    toggleMicrophone,
    toggleCamera,
    toggleScreenSharing,
    toggleHandRaise,
    toggleParticipantHandRaise,
    toggleParticipantMicrophone,
    toggleParticipantCamera,
    pinParticipant,
    setSpeakingParticipant,
    addMessage,
    addSystemMessage,
    toggleMessageReaction,
    releaseMessageObjectUrls,
    resumeViewerCountTimer,
    stopViewerCountTimer
  };
});
