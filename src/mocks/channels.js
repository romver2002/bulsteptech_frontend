// Моковые данные каналов
export const channels = [
  { id: 'general', name: 'общение', type: 'text', isReadOnly: false },
  { id: 'questions', name: 'вопросы', type: 'text', isReadOnly: false },
  { id: 'announcements', name: 'объявления', type: 'text', isReadOnly: true },
  { id: 'resources', name: 'ресурсы', type: 'text', isReadOnly: false },
  { id: 'checkpoint', name: 'чекпоинт', type: 'text', isReadOnly: false },
  { id: 'schedule', name: 'расписание', type: 'text', isReadOnly: false },
  { id: 'lecture', name: 'лекция', type: 'stream', isReadOnly: false }
]

// Моковые сообщения для каналов
export const messages = [
  {
    id: 1,
    channelId: 'general',
    username: 'teacher',
    content: 'Всем привет! Добро пожаловать на платформу БулСтепТех.',
    timestamp: '2023-09-01T10:00:00Z'
  },
  {
    id: 2,
    channelId: 'general',
    username: 'student1',
    content: 'Здравствуйте! Рад быть здесь.',
    timestamp: '2023-09-01T10:05:00Z'
  },
  {
    id: 3,
    channelId: 'questions',
    username: 'student2',
    content: 'Когда будет следующая лекция?',
    timestamp: '2023-09-01T11:00:00Z'
  }
]
