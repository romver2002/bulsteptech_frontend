<template>
  <div class="quiz-container bg-discord-secondary p-5 rounded-lg">
    <div v-if="!quizCompleted">
      <!-- Заголовок и прогресс -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold">{{ quiz.title }}</h3>
        <span class="text-sm text-discord-text-gray">Вопрос {{ currentIndex + 1 }}/{{ quiz.questions.length }}</span>
      </div>
      
      <!-- Индикатор прогресса -->
      <div class="w-full bg-discord-dark h-2 rounded-full mb-6">
        <div 
          class="bg-discord-accent h-2 rounded-full transition-all duration-300" 
          :style="`width: ${(currentIndex / quiz.questions.length) * 100}%`"
        ></div>
      </div>
      
      <!-- Текущий вопрос -->
      <div class="current-question mb-6">
        <div class="question-text text-lg mb-4">{{ currentQuestion.question }}</div>
        
        <!-- Изображение вопроса, если есть -->
        <img 
          v-if="currentQuestion.image" 
          :src="currentQuestion.image" 
          alt="Question image" 
          class="mb-4 rounded-lg max-h-40 mx-auto"
        />
        
        <!-- Варианты ответов -->
        <div class="options space-y-3">
          <button 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            @click="selectAnswer(index)"
            class="option w-full text-left p-3 rounded-md transition-all duration-200"
            :class="getOptionClass(index)"
          >
            <div class="flex items-center">
              <div class="option-marker w-6 h-6 rounded-full flex items-center justify-center mr-3" 
                   :class="selectedOption === index ? 'bg-discord-accent' : 'bg-discord-dark'">
                <span class="text-sm">{{ ['A', 'B', 'C', 'D'][index] }}</span>
              </div>
              <span>{{ option }}</span>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Кнопка перехода к следующему вопросу -->
      <div class="actions flex justify-between">
        <button 
          v-if="currentIndex > 0" 
          @click="previousQuestion" 
          class="px-4 py-2 bg-discord-dark rounded-md hover:bg-discord-dark-hover"
        >
          Назад
        </button>
        <div class="flex-grow"></div>
        <button 
          @click="nextQuestion" 
          class="px-4 py-2 rounded-md"
          :class="[
            selectedOption !== null ? 'bg-discord-accent hover:bg-discord-accent-hover' : 'bg-discord-dark opacity-50 cursor-not-allowed'
          ]"
          :disabled="selectedOption === null"
        >
          {{ currentIndex === quiz.questions.length - 1 ? 'Завершить' : 'Следующий вопрос' }}
        </button>
      </div>
      
      <!-- Пояснение к ответу (если выбран ответ) -->
      <div v-if="selectedOption !== null && currentQuestion.explanation" class="mt-4 p-3 bg-discord-dark rounded-md text-sm">
        <div class="font-semibold mb-1">Пояснение:</div>
        <div>{{ currentQuestion.explanation }}</div>
      </div>
    </div>
    
    <!-- Результаты квиза -->
    <div v-else class="quiz-results">
      <div class="text-center mb-6">
        <div class="text-5xl mb-4">{{ getScoreEmoji() }}</div>
        <h3 class="text-xl font-semibold mb-2">Ваш результат: {{ correctAnswers }} из {{ quiz.questions.length }}</h3>
        <div class="w-full bg-discord-dark h-2 rounded-full mb-2">
          <div 
            class="h-2 rounded-full transition-all duration-500" 
            :style="`width: ${(correctAnswers / quiz.questions.length) * 100}%`"
            :class="getScoreColorClass()"
          ></div>
        </div>
        <p class="text-discord-text-gray">{{ getScoreMessage() }}</p>
      </div>
      
      <!-- Обзор вопросов -->
      <div class="question-review space-y-4 mb-6">
        <div v-for="(question, index) in quiz.questions" :key="index" class="p-3 rounded-md" :class="userAnswers[index] === question.correctAnswer ? 'bg-discord-success/20' : 'bg-discord-error/20'">
          <div class="flex items-start">
            <div class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-2 mt-1" :class="userAnswers[index] === question.correctAnswer ? 'bg-discord-success' : 'bg-discord-error'">
              <span v-if="userAnswers[index] === question.correctAnswer">✓</span>
              <span v-else>✗</span>
            </div>
            <div>
              <div class="font-semibold mb-1">{{ question.question }}</div>
              <div class="text-sm mb-1">
                <span>Ваш ответ: </span>
                <span :class="userAnswers[index] === question.correctAnswer ? 'text-discord-success' : 'text-discord-error'">
                  {{ question.options[userAnswers[index]] }}
                </span>
              </div>
              <div v-if="userAnswers[index] !== question.correctAnswer" class="text-sm text-discord-success">
                Правильный ответ: {{ question.options[question.correctAnswer] }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Кнопки действий -->
      <div class="flex space-x-3">
        <button @click="retakeQuiz" class="flex-1 px-4 py-2 bg-discord-dark rounded-md hover:bg-discord-dark-hover">
          Пройти снова
        </button>
        <button @click="$emit('complete', { score: correctAnswers, total: quiz.questions.length })" class="flex-1 px-4 py-2 bg-discord-accent rounded-md hover:bg-discord-accent-hover">
          Завершить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  quiz: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['complete']);

const currentIndex = ref(0);
const selectedOption = ref(null);
const userAnswers = ref([]);
const quizCompleted = ref(false);

// Текущий вопрос
const currentQuestion = computed(() => props.quiz.questions[currentIndex.value]);

// Количество правильных ответов
const correctAnswers = computed(() => {
  return userAnswers.value.reduce((count, answer, index) => {
    return answer === props.quiz.questions[index].correctAnswer ? count + 1 : count;
  }, 0);
});

// Определяет класс для опции
const getOptionClass = (index) => {
  if (selectedOption.value === null) {
    return 'bg-discord-dark hover:bg-discord-dark-hover';
  }
  
  if (index === selectedOption.value) {
    return 'bg-discord-accent';
  }
  
  return 'bg-discord-dark opacity-70';
};

// Выбор ответа
const selectAnswer = (index) => {
  selectedOption.value = index;
  userAnswers.value[currentIndex.value] = index;
};

// Переход к следующему вопросу
const nextQuestion = () => {
  if (selectedOption.value === null) return;
  
  if (currentIndex.value < props.quiz.questions.length - 1) {
    currentIndex.value++;
    selectedOption.value = userAnswers.value[currentIndex.value] !== undefined 
      ? userAnswers.value[currentIndex.value] 
      : null;
  } else {
    quizCompleted.value = true;
  }
};

// Возврат к предыдущему вопросу
const previousQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    selectedOption.value = userAnswers.value[currentIndex.value];
  }
};

// Повторное прохождение квиза
const retakeQuiz = () => {
  currentIndex.value = 0;
  selectedOption.value = null;
  userAnswers.value = [];
  quizCompleted.value = false;
};

// Получение эмодзи для результата
const getScoreEmoji = () => {
  const percentage = (correctAnswers.value / props.quiz.questions.length) * 100;
  if (percentage >= 90) return '🏆';
  if (percentage >= 70) return '🎉';
  if (percentage >= 50) return '👍';
  return '💪';
};

// Получение сообщения для результата
const getScoreMessage = () => {
  const percentage = (correctAnswers.value / props.quiz.questions.length) * 100;
  if (percentage >= 90) return 'Отлично! Вы отлично справились!';
  if (percentage >= 70) return 'Хорошая работа! Вы хорошо знаете материал.';
  if (percentage >= 50) return 'Неплохо! Вы на правильном пути.';
  return 'Продолжайте практиковаться, и вы обязательно улучшите результат!';
};

// Получение цвета для полосы результата
const getScoreColorClass = () => {
  const percentage = (correctAnswers.value / props.quiz.questions.length) * 100;
  if (percentage >= 70) return 'bg-discord-success';
  if (percentage >= 50) return 'bg-discord-warning';
  return 'bg-discord-error';
};
</script>

<style scoped>
.option {
  transition: all 0.2s ease;
}

.option:hover:not(.disabled) {
  transform: translateY(-2px);
}

.question-review > div {
  transition: transform 0.2s ease;
}

.question-review > div:hover {
  transform: translateY(-2px);
}
</style>
