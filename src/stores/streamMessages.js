import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStreamMessagesStore = defineStore('streamMessages', () => {
  // Сообщения чата трансляции
  const messages = ref([
    {
      id: 1,
      userId: 1,
      user: {
        name: 'Иван Петров',
        avatar: 'https://i.pravatar.cc/150?img=3',
        role: 'teacher'
      },
      content: 'Добрый день всем! Сегодня мы рассмотрим основы Vue 3 и научимся создавать компоненты с Composition API.',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 минут назад
      reactions: []
    },
    {
      id: 2,
      userId: 2,
      user: {
        name: 'Алексей Иванов',
        avatar: 'https://i.pravatar.cc/150?img=4',
        role: 'student'
      },
      content: 'Добрый день! Очень жду сегодняшнюю лекцию',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 минут назад
      reactions: [
        { emoji: '👍', count: 2, users: [1, 3] }
      ]
    },
    {
      id: 3,
      userId: 3,
      user: {
        name: 'Мария Сидорова',
        avatar: 'https://i.pravatar.cc/150?img=5',
        role: 'student'
      },
      content: 'У меня есть вопрос по домашнему заданию, можно будет задать в конце лекции?',
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 минуты назад
      reactions: []
    }
  ]);
  
  // Отправка сообщения в чат
  const sendMessage = (content, userId = 1, userName = 'Иван Петров', userAvatar = 'https://i.pravatar.cc/150?img=3', userRole = 'teacher') => {
    if (!content.trim()) {
      return;
    }
    
    const newMessage = {
      id: Date.now(),
      userId,
      user: {
        name: userName,
        avatar: userAvatar,
        role: userRole
      },
      content,
      timestamp: new Date(),
      reactions: []
    };
    
    messages.value.push(newMessage);
    return newMessage;
  };
  
  // Добавление/удаление реакции
  const toggleReaction = (messageId, emoji, userId = 1) => {
    const message = messages.value.find(m => m.id === messageId);
    if (!message) return;
    
    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    
    if (reactionIndex === -1) {
      // Добавляем новую реакцию
      message.reactions.push({
        emoji,
        count: 1,
        users: [userId]
      });
    } else {
      const reaction = message.reactions[reactionIndex];
      const userIndex = reaction.users.indexOf(userId);
      
      if (userIndex === -1) {
        // Пользователь еще не реагировал - добавляем реакцию
        reaction.users.push(userId);
        reaction.count++;
      } else {
        // Пользователь уже реагировал - убираем реакцию
        reaction.users.splice(userIndex, 1);
        reaction.count--;
        
        // Если больше нет реакций, удаляем весь объект реакции
        if (reaction.count === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      }
    }
  };
  
  // Получение реакции пользователя
  const getUserReaction = (messageId, userId) => {
    const message = messages.value.find(m => m.id === messageId);
    if (!message) return null;
    
    for (const reaction of message.reactions) {
      if (reaction.users.includes(userId)) {
        return reaction.emoji;
      }
    }
    
    return null;
  };
  
  return {
    messages,
    sendMessage,
    toggleReaction,
    getUserReaction
  };
}); 