import { defineStore } from 'pinia';
import { ref } from 'vue';

const DEFAULT_AVATARS = {
  teacher: '',
  student: ''
};
const MAX_STORED_MESSAGES = 500;

export const useStreamMessagesStore = defineStore('streamMessages', () => {
  const managedObjectUrls = new Set();

  const messages = ref([
    {
      id: 1,
      userId: 1,
      username: 'Иван Петров',
      avatar: DEFAULT_AVATARS.teacher,
      role: 'teacher',
      content: 'Добрый день всем! Сегодня мы рассмотрим основы Vue 3 и Composition API.',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      reactions: [],
      attachments: []
    },
    {
      id: 2,
      userId: 2,
      username: 'Алексей Иванов',
      avatar: DEFAULT_AVATARS.student,
      role: 'student',
      content: 'Добрый день! Очень жду сегодняшнюю лекцию.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      reactions: [
        { emoji: '👍', userId: 1 },
        { emoji: '👍', userId: 3 }
      ],
      attachments: []
    },
    {
      id: 3,
      userId: 3,
      username: 'Мария Сидорова',
      avatar: '',
      role: 'student',
      content: 'У меня есть вопрос по домашнему заданию. Можно будет задать его в конце лекции?',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      reactions: [],
      attachments: []
    }
  ]);

  const normalizeAttachments = (attachments = []) => attachments.map((attachment) => {
    const normalized = {
      name: attachment.name || 'Файл',
      size: Number(attachment.size) || 0,
      type: attachment.type || 'application/octet-stream',
      url: attachment.url || '',
      isObjectUrl: Boolean(attachment.isObjectUrl)
    };

    if (normalized.isObjectUrl && normalized.url) {
      managedObjectUrls.add(normalized.url);
    }

    return normalized;
  });

  const releaseAttachment = (attachment) => {
    if (!attachment?.isObjectUrl || !attachment.url || !managedObjectUrls.has(attachment.url)) return;
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(attachment.url);
    }
    managedObjectUrls.delete(attachment.url);
  };

  const trimMessageHistory = () => {
    const overflow = messages.value.length - MAX_STORED_MESSAGES;
    if (overflow <= 0) return;

    const removedMessages = messages.value.splice(0, overflow);
    removedMessages.forEach(message => message.attachments?.forEach(releaseAttachment));
  };

  const sendMessage = (payload, legacyUserId, legacyUserName, legacyUserAvatar, legacyUserRole) => {
    const data = typeof payload === 'string'
      ? {
          content: payload,
          userId: legacyUserId,
          username: legacyUserName,
          avatar: legacyUserAvatar,
          role: legacyUserRole
        }
      : (payload || {});

    const content = String(data.content || '').trim();
    const attachments = normalizeAttachments(data.attachments);

    if (!content && attachments.length === 0) return null;

    const role = data.role === 'teacher' ? 'teacher' : 'student';
    const newMessage = {
      id: `stream-message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: Number(data.userId) || (role === 'teacher' ? 1 : 2),
      username: data.username || (role === 'teacher' ? 'Преподаватель' : 'Студент'),
      avatar: data.avatar || DEFAULT_AVATARS[role],
      role,
      content,
      timestamp: new Date(),
      reactions: [],
      attachments,
      replyTo: data.replyTo || null
    };

    messages.value.push(newMessage);
    trimMessageHistory();
    return newMessage;
  };

  const addSystemMessage = (content) => {
    const normalizedContent = String(content || '').trim();
    if (!normalizedContent) return null;

    const message = {
      id: `stream-system-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: 0,
      username: 'Система',
      avatar: '',
      role: 'system',
      content: normalizedContent,
      timestamp: new Date(),
      reactions: [],
      attachments: []
    };

    messages.value.push(message);
    trimMessageHistory();
    return message;
  };

  const toggleReaction = (messageId, emoji, userId = 1) => {
    const message = messages.value.find(item => item.id === messageId);
    if (!message || !emoji) return false;

    const normalizedUserId = Number(userId) || 1;
    const reactionIndex = message.reactions.findIndex(
      reaction => reaction.emoji === emoji && reaction.userId === normalizedUserId
    );

    if (reactionIndex === -1) {
      message.reactions.push({ emoji, userId: normalizedUserId });
      return true;
    }

    message.reactions.splice(reactionIndex, 1);
    return false;
  };

  const getUserReaction = (messageId, userId) => {
    const message = messages.value.find(item => item.id === messageId);
    return message?.reactions.find(reaction => reaction.userId === Number(userId))?.emoji || null;
  };

  const releaseObjectUrls = () => {
    if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;

    managedObjectUrls.forEach(url => URL.revokeObjectURL(url));
    managedObjectUrls.clear();

    messages.value.forEach((message) => {
      message.attachments?.forEach((attachment) => {
        if (attachment.isObjectUrl) attachment.url = '';
      });
    });
  };

  return {
    messages,
    sendMessage,
    addSystemMessage,
    toggleReaction,
    getUserReaction,
    releaseObjectUrls
  };
});
