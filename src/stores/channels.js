import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const ALL_ROLES = ['student', 'teacher']

const channelDefinitions = [
  { id: 'overview', name: 'Главная', description: 'Фокус на сегодня', group: 'learning', roles: ALL_ROLES, icon: 'home' },
  { id: 'lecture', name: 'Лекция', description: 'Живая аудитория', group: 'learning', roles: ALL_ROLES, icon: 'play' },
  { id: 'schedule', name: 'Расписание', description: 'Ближайшие занятия', group: 'learning', roles: ALL_ROLES, icon: 'calendar' },
  { id: 'assignments', name: 'Задания', description: 'Практика и дедлайны', group: 'learning', roles: ALL_ROLES, icon: 'tasks' },
  { id: 'resources', name: 'Библиотека', description: 'Материалы курса', group: 'learning', roles: ALL_ROLES, icon: 'library' },

  { id: 'progress', name: 'Мой прогресс', description: 'Личная динамика', group: 'growth', roles: ['student'], icon: 'trend' },
  { id: 'achievements', name: 'Достижения', description: 'Награды и серии', group: 'growth', roles: ['student'], icon: 'sparkles' },

  { id: 'student-management', name: 'Студенты', description: 'Группы и доступы', group: 'management', roles: ['teacher'], icon: 'users' },
  { id: 'tests', name: 'Тесты и опросы', description: 'Проверка знаний', group: 'management', roles: ['teacher'], icon: 'quiz' },
  { id: 'student-progress', name: 'Аналитика', description: 'Успеваемость группы', group: 'analytics', roles: ['teacher'], icon: 'chart' },
  { id: 'attendance', name: 'Посещаемость', description: 'Журнал занятий', group: 'analytics', roles: ['teacher'], icon: 'attendance' },
  { id: 'reports', name: 'Отчёты', description: 'Экспорт результатов', group: 'analytics', roles: ['teacher'], icon: 'report' },

  { id: 'general', name: 'Общий чат', description: 'Обсуждение курса', group: 'communication', roles: ALL_ROLES, icon: 'chat' },
  { id: 'announcements', name: 'Объявления', description: 'Важные новости', group: 'communication', roles: ALL_ROLES, icon: 'megaphone', isReadOnly: true },
  { id: 'help', name: 'Помощь', description: 'Вопросы команде', group: 'communication', roles: ALL_ROLES, icon: 'help' }
]

const initialMessages = {
  general: [
    {
      id: 1,
      username: 'Иван Петров',
      content: 'Добро пожаловать в общий чат курса! Здесь можно обсуждать задания и делиться находками.',
      timestamp: '2026-07-15T08:30:00.000Z',
      reactions: [{ emoji: '🔥', count: 2, users: [1, 2] }]
    },
    {
      id: 2,
      username: 'Анна Смирнова',
      content: 'Добавила полезную памятку по Composition API в библиотеку.',
      timestamp: '2026-07-15T08:42:00.000Z',
      reactions: [{ emoji: '👍', count: 1, users: [1] }]
    }
  ],
  announcements: [
    {
      id: 3,
      username: 'Команда курса',
      content: 'Следующая живая лекция начнётся в четверг в 18:00. Запись появится сразу после эфира.',
      timestamp: '2026-07-14T12:00:00.000Z',
      reactions: []
    }
  ],
  help: [
    {
      id: 4,
      username: 'Поддержка',
      content: 'Опишите вопрос — преподаватель или куратор ответит прямо здесь.',
      timestamp: '2026-07-15T07:15:00.000Z',
      reactions: []
    }
  ]
}

export const useChannelStore = defineStore('channel', () => {
  const savedChannel = sessionStorage.getItem('bulsteptech.currentChannel')
  const currentChannelId = ref(channelDefinitions.some(({ id }) => id === savedChannel) ? savedChannel : 'overview')
  const channels = ref(channelDefinitions)
  const messages = ref(initialMessages)

  const currentChannel = computed(() => (
    channels.value.find((channel) => channel.id === currentChannelId.value) || channels.value[0]
  ))

  const channelMessages = computed(() => messages.value[currentChannelId.value] || [])

  function getChannelsForRole(role) {
    return channels.value.filter((channel) => channel.roles.includes(role))
  }

  function ensureAccessibleChannel(role) {
    const available = getChannelsForRole(role)
    if (!available.some((channel) => channel.id === currentChannelId.value)) {
      setCurrentChannel('overview')
    }
  }

  function setCurrentChannel(channelId) {
    if (channels.value.some((channel) => channel.id === channelId)) {
      currentChannelId.value = channelId
      sessionStorage.setItem('bulsteptech.currentChannel', channelId)
    }
  }

  function addMessage(message) {
    const channelId = currentChannelId.value
    if (!messages.value[channelId]) messages.value[channelId] = []

    messages.value[channelId].push({
      id: Date.now(),
      username: message.username || 'Пользователь',
      content: message.content || '',
      attachments: message.attachments || [],
      timestamp: new Date().toISOString(),
      reactions: []
    })
  }

  function deleteMessage(messageId) {
    const channelId = currentChannelId.value
    if (!messages.value[channelId]) return
    messages.value[channelId] = messages.value[channelId].filter((message) => message.id !== messageId)
  }

  function toggleReaction({ messageId, emoji, userId }) {
    const message = channelMessages.value.find((item) => item.id === messageId)
    if (!message) return

    if (!message.reactions) message.reactions = []
    let reaction = message.reactions.find((item) => item.emoji === emoji)

    if (!reaction) {
      reaction = { emoji, count: 0, users: [] }
      message.reactions.push(reaction)
    }

    const existingIndex = reaction.users.indexOf(userId)
    if (existingIndex >= 0) {
      reaction.users.splice(existingIndex, 1)
    } else {
      reaction.users.push(userId)
    }

    reaction.count = reaction.users.length
    if (reaction.count === 0) {
      message.reactions = message.reactions.filter((item) => item.emoji !== emoji)
    }
  }

  return {
    currentChannelId,
    channels,
    messages,
    currentChannel,
    channelMessages,
    getChannelsForRole,
    ensureAccessibleChannel,
    setCurrentChannel,
    addMessage,
    deleteMessage,
    toggleReaction
  }
})
