<template>
  <div class="micro-test bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 overflow-hidden transition-all duration-300">
    <div class="test-header mb-6">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ test.title }}</h3>
        <div class="test-indicators flex items-center space-x-3">
          <div class="timer flex items-center text-gray-500 dark:text-gray-400">
            <i class="fas fa-clock mr-1"></i>
            <span>{{ formatTime(timeRemaining) }}</span>
          </div>
          <div class="progress text-sm text-gray-500 dark:text-gray-400">
            {{ currentQuestionIndex + 1 }} из {{ test.questions.length }}
          </div>
        </div>
      </div>
      <div class="progress-bar bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
    
    <div v-if="!testCompleted" class="question-container">
      <div class="question mb-4">
        <h4 class="text-gray-900 dark:text-white font-medium mb-3">{{ currentQuestion.question }}</h4>
        
        <img 
          v-if="currentQuestion.image" 
          :src="currentQuestion.image" 
          :alt="currentQuestion.question"
          class="rounded-lg mb-4 max-h-60 object-contain"
        />
        
        <div v-if="currentQuestion.code" class="code-snippet mb-4">
          <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{{ currentQuestion.code }}</code>
          </pre>
        </div>
      </div>
      
      <div class="answers">
        <template v-if="currentQuestion.type === 'single'">
          <div
            v-for="(answer, index) in currentQuestion.answers"
            :key="index"
            class="answer-item mb-3"
          >
            <label
              :for="`answer-${index}`"
              class="flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200"
              :class="{
                'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500': !answered,
                'border-red-500 bg-red-50 dark:bg-red-900/10': answered && isWrong(index) && userAnswers[currentQuestionIndex] === index,
                'border-green-500 bg-green-50 dark:bg-green-900/10': answered && isCorrect(index),
                'border-blue-500 bg-blue-50 dark:bg-blue-900/10': !answered && userAnswers[currentQuestionIndex] === index
              }"
            >
              <input
                type="radio"
                :id="`answer-${index}`"
                :name="`question-${currentQuestionIndex}`"
                :value="index"
                v-model="userAnswers[currentQuestionIndex]"
                :disabled="answered"
                class="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <div class="answer-content flex-grow">
                <div class="answer-text text-gray-900 dark:text-white">{{ answer.text }}</div>
              </div>
              <div v-if="answered" class="answer-indicator ml-2">
                <i 
                  v-if="isCorrect(index)" 
                  class="fas fa-check text-green-600 dark:text-green-400"
                ></i>
                <i
                  v-else-if="isWrong(index) && userAnswers[currentQuestionIndex] === index"
                  class="fas fa-times text-red-600 dark:text-red-400"
                ></i>
              </div>
            </label>
          </div>
        </template>
        
        <template v-else-if="currentQuestion.type === 'multiple'">
          <div
            v-for="(answer, index) in currentQuestion.answers"
            :key="index"
            class="answer-item mb-3"
          >
            <label
              :for="`answer-${index}`"
              class="flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200"
              :class="{
                'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500': !answered,
                'border-red-500 bg-red-50 dark:bg-red-900/10': answered && isWrong(index) && multipleAnswers[index],
                'border-green-500 bg-green-50 dark:bg-green-900/10': answered && isCorrect(index),
                'border-blue-500 bg-blue-50 dark:bg-blue-900/10': !answered && multipleAnswers[index]
              }"
            >
              <input
                type="checkbox"
                :id="`answer-${index}`"
                :value="index"
                v-model="multipleAnswers"
                :disabled="answered"
                class="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <div class="answer-content flex-grow">
                <div class="answer-text text-gray-900 dark:text-white">{{ answer.text }}</div>
              </div>
              <div v-if="answered" class="answer-indicator ml-2">
                <i 
                  v-if="isCorrect(index)" 
                  class="fas fa-check text-green-600 dark:text-green-400"
                ></i>
                <i
                  v-else-if="isWrong(index) && multipleAnswers.includes(index)"
                  class="fas fa-times text-red-600 dark:text-red-400"
                ></i>
              </div>
            </label>
          </div>
        </template>
        
        <template v-else-if="currentQuestion.type === 'text'">
          <div class="answer-item mb-3">
            <textarea
              v-model="textAnswer"
              :disabled="answered"
              rows="4"
              class="w-full p-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-gray-300 dark:border-gray-600': !answered,
                'border-green-500 bg-green-50 dark:bg-green-900/10': answered && isTextCorrect,
                'border-red-500 bg-red-50 dark:bg-red-900/10': answered && !isTextCorrect
              }"
              placeholder="Введите ваш ответ здесь..."
            ></textarea>
            <div v-if="answered" class="mt-3 p-3 rounded-lg" :class="isTextCorrect ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'">
              <div class="text-sm font-medium mb-1" :class="isTextCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                {{ isTextCorrect ? 'Правильно!' : 'Неправильно!' }}
              </div>
              <div class="text-gray-700 dark:text-gray-300">
                <strong>Ожидаемый ответ:</strong> {{ currentQuestion.correctAnswer }}
              </div>
            </div>
          </div>
        </template>
      </div>
      
      <div class="feedback mt-4" v-if="answered">
        <div class="p-4 rounded-lg" :class="currentAnswerCorrect ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'">
          <h5 class="font-medium mb-2" :class="currentAnswerCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
            {{ currentAnswerCorrect ? 'Правильно!' : 'Неправильно!' }}
          </h5>
          <div class="text-gray-700 dark:text-gray-300" v-html="currentQuestion.explanation"></div>
        </div>
      </div>
      
      <div class="test-actions mt-6 flex justify-between">
        <button
          @click="previousQuestion"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
          :class="{ 'opacity-50 cursor-not-allowed': currentQuestionIndex === 0 }"
          :disabled="currentQuestionIndex === 0"
        >
          <i class="fas fa-arrow-left mr-2"></i>Назад
        </button>
        
        <button
          v-if="!answered"
          @click="checkAnswer"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          :disabled="!canSubmit"
        >
          Проверить
        </button>
        <button
          v-else
          @click="nextQuestion"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          {{ isLastQuestion ? 'Завершить тест' : 'Следующий вопрос' }}
        </button>
      </div>
    </div>
    
    <div v-else class="test-results">
      <div class="text-center mb-6">
        <div class="result-score mb-4">
          <div class="text-5xl font-bold mb-2" :class="percentageScore >= 80 ? 'text-green-600 dark:text-green-400' : percentageScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'">
            {{ correctAnswersCount }} / {{ test.questions.length }}
          </div>
          <div class="text-lg text-gray-600 dark:text-gray-400">
            {{ percentageScore }}% правильных ответов
          </div>
        </div>
        
        <div class="result-message mb-4">
          <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ resultMessage }}
          </h4>
          <p class="text-gray-600 dark:text-gray-400">
            {{ test.feedback[resultLevel] || 'Спасибо за прохождение теста!' }}
          </p>
        </div>
      </div>
      
      <div class="test-summary mb-6">
        <h5 class="font-medium text-gray-900 dark:text-white mb-3">Сводка по вопросам:</h5>
        <div class="grid grid-cols-6 gap-2 max-w-md mx-auto">
          <div
            v-for="(_, index) in test.questions"
            :key="index"
            @click="showQuestionDetails(index)"
            class="question-indicator w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer"
            :class="getQuestionStatusClass(index)"
          >
            {{ index + 1 }}
          </div>
        </div>
      </div>
      
      <div class="test-actions flex justify-center space-x-4">
        <button
          @click="reviewTest"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
        >
          <i class="fas fa-search mr-2"></i>Просмотреть ответы
        </button>
        <button
          @click="restartTest"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <i class="fas fa-redo mr-2"></i>Пройти еще раз
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useNotificationStore } from '../../stores/notification';

const props = defineProps({
  test: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['test-completed', 'test-started']);

const notificationStore = useNotificationStore();

// Состояние компонента
const currentQuestionIndex = ref(0);
const userAnswers = ref([]);
const multipleAnswers = ref([]);
const textAnswer = ref('');
const answered = ref(false);
const testCompleted = ref(false);
const testStarted = ref(false);
const timeRemaining = ref(0);
const timer = ref(null);
const isTextCorrect = ref(false);
const reviewMode = ref(false);

// Вычисляемые свойства
const currentQuestion = computed(() => {
  return props.test.questions[currentQuestionIndex.value];
});

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === props.test.questions.length - 1;
});

const progress = computed(() => {
  return ((currentQuestionIndex.value + 1) / props.test.questions.length) * 100;
});

const canSubmit = computed(() => {
  if (currentQuestion.value.type === 'single') {
    return userAnswers.value[currentQuestionIndex.value] !== undefined;
  } else if (currentQuestion.value.type === 'multiple') {
    return multipleAnswers.value.length > 0;
  } else if (currentQuestion.value.type === 'text') {
    return textAnswer.value.trim() !== '';
  }
  return false;
});

const currentAnswerCorrect = computed(() => {
  if (currentQuestion.value.type === 'single') {
    return isCorrect(userAnswers.value[currentQuestionIndex.value]);
  } else if (currentQuestion.value.type === 'multiple') {
    // Проверяем, что все выбранные ответы правильные и все правильные ответы выбраны
    const allSelectedAreCorrect = multipleAnswers.value.every(index => 
      currentQuestion.value.answers[index].correct
    );
    
    const allCorrectAreSelected = currentQuestion.value.answers
      .map((answer, index) => ({ index, correct: answer.correct }))
      .filter(item => item.correct)
      .every(item => multipleAnswers.value.includes(item.index));
    
    return allSelectedAreCorrect && allCorrectAreSelected;
  } else if (currentQuestion.value.type === 'text') {
    return isTextCorrect.value;
  }
  return false;
});

const correctAnswersCount = computed(() => {
  let count = 0;
  
  for (let i = 0; i < props.test.questions.length; i++) {
    const question = props.test.questions[i];
    
    if (question.type === 'single') {
      const answer = userAnswers.value[i];
      if (answer !== undefined && question.answers[answer].correct) {
        count++;
      }
    } else if (question.type === 'multiple') {
      // Для вопросов с множественным выбором мы должны проверять ответы при переходе к следующему вопросу
      // Это сложнее, поэтому мы можем использовать метку для отслеживания правильности
      if (question.answered && question.isCorrect) {
        count++;
      }
    } else if (question.type === 'text') {
      if (question.answered && question.isCorrect) {
        count++;
      }
    }
  }
  
  return count;
});

const percentageScore = computed(() => {
  if (props.test.questions.length === 0) return 0;
  return Math.round((correctAnswersCount.value / props.test.questions.length) * 100);
});

const resultLevel = computed(() => {
  if (percentageScore.value >= 90) return 'excellent';
  if (percentageScore.value >= 75) return 'good';
  if (percentageScore.value >= 60) return 'average';
  return 'poor';
});

const resultMessage = computed(() => {
  if (percentageScore.value >= 90) return 'Отлично!';
  if (percentageScore.value >= 75) return 'Хороший результат!';
  if (percentageScore.value >= 60) return 'Неплохо, но есть ошибки';
  return 'Требуется дополнительное изучение';
});

// Методы
const startTest = () => {
  testStarted.value = true;
  emit('test-started');
  
  // Инициализируем ответы
  userAnswers.value = new Array(props.test.questions.length);
  
  // Устанавливаем время, если указано
  if (props.test.timeLimit) {
    timeRemaining.value = props.test.timeLimit * 60; // в секундах
    startTimer();
  }
  
  // Уведомляем пользователя
  notificationStore.info(`Тест "${props.test.title}" начат. Удачи!`);
};

const startTimer = () => {
  timer.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      completeTest();
      notificationStore.warning('Время теста истекло!');
    }
  }, 1000);
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const isCorrect = (answerIndex) => {
  if (!currentQuestion.value.answers[answerIndex]) return false;
  return currentQuestion.value.answers[answerIndex].correct;
};

const isWrong = (answerIndex) => {
  if (!currentQuestion.value.answers[answerIndex]) return false;
  return !currentQuestion.value.answers[answerIndex].correct;
};

const checkAnswer = () => {
  answered.value = true;
  
  if (currentQuestion.value.type === 'text') {
    // Для текстовых ответов сравниваем с правильным ответом
    const correctAnswer = currentQuestion.value.correctAnswer.toLowerCase().trim();
    const userInput = textAnswer.value.toLowerCase().trim();
    
    isTextCorrect.value = userInput === correctAnswer || 
                           (currentQuestion.value.alternateAnswers && 
                           currentQuestion.value.alternateAnswers.map(a => a.toLowerCase().trim()).includes(userInput));
                           
    // Сохраняем состояние вопроса
    currentQuestion.value.answered = true;
    currentQuestion.value.isCorrect = isTextCorrect.value;
  } else if (currentQuestion.value.type === 'multiple') {
    // Сохраняем состояние вопроса с множественным выбором
    currentQuestion.value.answered = true;
    currentQuestion.value.isCorrect = currentAnswerCorrect.value;
  }
  
  // Показать уведомление
  if (currentAnswerCorrect.value) {
    notificationStore.success('Правильный ответ!');
  } else {
    notificationStore.error('Неправильный ответ');
  }
};

const nextQuestion = () => {
  if (isLastQuestion.value) {
    completeTest();
  } else {
    answered.value = false;
    currentQuestionIndex.value++;
    prepareQuestion();
  }
};

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    answered.value = true; // Уже ответили на предыдущий вопрос
    currentQuestionIndex.value--;
    prepareQuestion();
  }
};

const prepareQuestion = () => {
  if (currentQuestion.value.type === 'multiple') {
    // Если уже ответили на этот вопрос с множественным выбором, восстанавливаем ответы
    if (currentQuestion.value.userAnswers) {
      multipleAnswers.value = [...currentQuestion.value.userAnswers];
    } else {
      multipleAnswers.value = [];
    }
  } else if (currentQuestion.value.type === 'text') {
    // Если уже ответили на этот текстовый вопрос, восстанавливаем ответ
    if (currentQuestion.value.userAnswer) {
      textAnswer.value = currentQuestion.value.userAnswer;
    } else {
      textAnswer.value = '';
    }
  }
};

const completeTest = () => {
  clearInterval(timer.value);
  testCompleted.value = true;
  emit('test-completed', {
    score: percentageScore.value,
    correctAnswers: correctAnswersCount.value,
    totalQuestions: props.test.questions.length,
    timeSpent: props.test.timeLimit ? (props.test.timeLimit * 60) - timeRemaining.value : null
  });
  
  // Показать уведомление о результате
  notificationStore.success(`Тест завершен! Ваш результат: ${percentageScore.value}%`);
};

const reviewTest = () => {
  reviewMode.value = true;
  testCompleted.value = false;
  currentQuestionIndex.value = 0;
  answered.value = true;
};

const restartTest = () => {
  userAnswers.value = new Array(props.test.questions.length);
  testCompleted.value = false;
  currentQuestionIndex.value = 0;
  answered.value = false;
  reviewMode.value = false;
  
  // Сбрасываем состояние вопросов
  props.test.questions.forEach(q => {
    q.answered = false;
    q.isCorrect = false;
    q.userAnswers = undefined;
    q.userAnswer = undefined;
  });
  
  // Перезапускаем таймер, если указан
  if (props.test.timeLimit) {
    timeRemaining.value = props.test.timeLimit * 60;
    startTimer();
  }
  
  notificationStore.info('Тест перезапущен. Удачи!');
};

const showQuestionDetails = (index) => {
  currentQuestionIndex.value = index;
  testCompleted.value = false;
  answered.value = true;
};

const getQuestionStatusClass = (index) => {
  const question = props.test.questions[index];
  
  if (question.type === 'single') {
    const answer = userAnswers.value[index];
    if (answer !== undefined && question.answers[answer].correct) {
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    } else if (answer !== undefined) {
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    }
  } else if (question.answered) {
    return question.isCorrect 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  }
  
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
};

// Обработка изменений
watch(() => currentQuestion.value.type, () => {
  prepareQuestion();
});

watch(multipleAnswers, (newVal) => {
  // Сохраняем выбранные ответы в вопросе для восстановления при навигации
  if (currentQuestion.value.type === 'multiple') {
    currentQuestion.value.userAnswers = [...newVal];
  }
}, { deep: true });

watch(textAnswer, (newVal) => {
  // Сохраняем текстовый ответ в вопросе для восстановления при навигации
  if (currentQuestion.value.type === 'text') {
    currentQuestion.value.userAnswer = newVal;
  }
});

// Жизненный цикл
onMounted(() => {
  startTest();
});

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style scoped>
.micro-test {
  max-width: 800px;
  margin: 0 auto;
}

.code-snippet {
  font-family: 'Fira Code', monospace;
}

.question-indicator {
  transition: all 0.2s ease;
}

.question-indicator:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

@media (max-width: 640px) {
  .test-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .test-indicators {
    margin-top: 8px;
    width: 100%;
    justify-content: space-between;
  }
}
</style> 