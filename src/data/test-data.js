// Тестовые данные для компонентов микрообучения

export const sampleTest = {
  id: 'test-1',
  title: 'Основы JavaScript',
  description: 'Базовый тест на знание основ JavaScript для начинающих разработчиков',
  timeLimit: 5, // в минутах
  questions: [
    {
      id: 'q1',
      type: 'single',
      question: 'Какой оператор используется для сравнения значения и типа в JavaScript?',
      answers: [
        { text: '==', correct: false },
        { text: '===', correct: true },
        { text: '>=', correct: false },
        { text: '!=', correct: false }
      ],
      explanation: 'Оператор === (строгое равенство) сравнивает значение и тип данных, в то время как == сравнивает только значения, выполняя преобразование типов при необходимости.'
    },
    {
      id: 'q2',
      type: 'multiple',
      question: 'Выберите методы для работы с массивами в JavaScript:',
      answers: [
        { text: 'map()', correct: true },
        { text: 'reduce()', correct: true },
        { text: 'compile()', correct: false },
        { text: 'filter()', correct: true },
        { text: 'execute()', correct: false }
      ],
      explanation: 'map(), reduce() и filter() - это встроенные методы массивов в JavaScript, которые используются для преобразования, агрегации и фильтрации элементов массива соответственно.'
    },
    {
      id: 'q3',
      type: 'text',
      question: 'Как объявить константу в JavaScript? Напишите пример объявления константы с именем MAX_SIZE и значением 100.',
      correctAnswer: 'const MAX_SIZE = 100;',
      alternateAnswers: ['const MAX_SIZE=100;', 'const MAX_SIZE = 100'],
      explanation: 'Для объявления констант в JavaScript используется ключевое слово const. В отличие от переменных, объявленных через let или var, константы нельзя переназначить после инициализации.'
    },
    {
      id: 'q4',
      type: 'single',
      question: 'Какой метод используется для добавления элемента в конец массива?',
      answers: [
        { text: 'push()', correct: true },
        { text: 'pop()', correct: false },
        { text: 'shift()', correct: false },
        { text: 'unshift()', correct: false }
      ],
      explanation: 'Метод push() добавляет один или более элементов в конец массива и возвращает новую длину массива. В то время как pop() удаляет последний элемент, shift() удаляет первый элемент, а unshift() добавляет элементы в начало массива.'
    },
    {
      id: 'q5',
      type: 'single',
      question: 'Что делает оператор "typeof" в JavaScript?',
      answers: [
        { text: 'Проверяет, существует ли переменная', correct: false },
        { text: 'Возвращает тип переменной или выражения', correct: true },
        { text: 'Преобразует переменную в строку', correct: false },
        { text: 'Проверяет, является ли переменная объектом', correct: false }
      ],
      explanation: 'Оператор typeof возвращает строку, указывающую тип операнда. Например, typeof 42 вернет "number", typeof "hello" вернет "string", а typeof undefined вернет "undefined".'
    }
  ],
  feedback: {
    excellent: 'Отличная работа! Вы отлично понимаете основы JavaScript.',
    good: 'Хороший результат! Вы понимаете большинство концепций JavaScript, но есть еще небольшие пробелы в знаниях.',
    average: 'Неплохо, но вам стоит еще поработать над основами JavaScript.',
    poor: 'Вам необходимо больше практики и изучения основных концепций JavaScript.'
  }
};

export const sampleStreamData = {
  id: 'stream-1',
  title: 'Введение в React Hooks',
  description: 'Изучение основных хуков React и их применение в реальных проектах',
  instructor: {
    id: 1,
    name: 'Анна Иванова',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    role: 'teacher'
  },
  status: 'scheduled',
  scheduledFor: '2023-12-15T18:00:00',
  duration: 90, // в минутах
  viewersCount: 42,
  maxViewers: 75,
  materials: [
    {
      id: 'material-1',
      title: 'Презентация по React Hooks',
      type: 'pdf',
      url: '/assets/materials/react-hooks-presentation.pdf'
    },
    {
      id: 'material-2',
      title: 'Примеры кода',
      type: 'github',
      url: 'https://github.com/example/react-hooks-examples'
    }
  ],
  chat: {
    id: 'chat-1',
    messages: [
      {
        id: 'msg-1',
        userId: 1,
        username: 'Анна Иванова',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        role: 'teacher',
        content: 'Здравствуйте! Мы начинаем трансляцию через 5 минут. Подготовьте, пожалуйста, вопросы по материалам предыдущего занятия.',
        timestamp: '2023-12-15T17:55:00',
        reactions: []
      },
      {
        id: 'msg-2',
        userId: 2,
        username: 'Михаил Петров',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        role: 'student',
        content: 'Добрый день! У меня есть вопрос по useEffect и зависимостям. Рассмотрим сегодня?',
        timestamp: '2023-12-15T17:56:30',
        reactions: [
          { emoji: '👍', userId: 3 },
          { emoji: '👍', userId: 4 }
        ]
      }
    ]
  },
  participants: [
    {
      id: 1,
      username: 'Анна Иванова',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      role: 'teacher',
      isMicrophoneOn: true,
      isCameraOn: true,
      isScreenSharing: false,
      isHandRaised: false,
      isSpeaking: false
    },
    {
      id: 2,
      username: 'Михаил Петров',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      role: 'student',
      isMicrophoneOn: false,
      isCameraOn: false,
      isScreenSharing: false,
      isHandRaised: true,
      isSpeaking: false
    },
    {
      id: 3,
      username: 'Елена Смирнова',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      role: 'student',
      isMicrophoneOn: false,
      isCameraOn: false,
      isScreenSharing: false,
      isHandRaised: false,
      isSpeaking: false
    },
    {
      id: 4,
      username: 'Александр Козлов',
      avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
      role: 'student',
      isMicrophoneOn: true,
      isCameraOn: true,
      isScreenSharing: false,
      isHandRaised: false,
      isSpeaking: false
    }
  ]
};

export const sampleLearningContent = {
  id: 'course-1',
  title: 'Полный курс по JavaScript',
  description: 'Изучите JavaScript от основ до продвинутых тем',
  author: 'Иван Петров',
  thumbnail: 'https://via.placeholder.com/600x400?text=JavaScript+Course',
  rating: 4.8,
  studentsCount: 2430,
  lastUpdated: '2023-10-15',
  modules: [
    {
      id: 'module-1',
      title: 'Основы JavaScript',
      lessons: [
        {
          id: 'lesson-1',
          title: 'Введение в JavaScript',
          duration: '15:30',
          completed: true,
          type: 'video'
        },
        {
          id: 'lesson-2',
          title: 'Переменные и типы данных',
          duration: '22:45',
          completed: true,
          type: 'video'
        },
        {
          id: 'lesson-3',
          title: 'Операторы и выражения',
          duration: '18:20',
          completed: false,
          type: 'video'
        },
        {
          id: 'lesson-4',
          title: 'Тест: Основы JavaScript',
          type: 'test',
          testId: 'test-1',
          completed: false
        }
      ]
    },
    {
      id: 'module-2',
      title: 'Функции и объекты',
      lessons: [
        {
          id: 'lesson-5',
          title: 'Функции в JavaScript',
          duration: '25:10',
          completed: false,
          type: 'video'
        },
        {
          id: 'lesson-6',
          title: 'Объекты и массивы',
          duration: '28:35',
          completed: false,
          type: 'video'
        },
        {
          id: 'lesson-7',
          title: 'Практическое задание: Работа с объектами',
          type: 'assignment',
          assignmentId: 'assignment-1',
          completed: false
        }
      ]
    }
  ]
}; 