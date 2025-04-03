<template>
  <div class="bg-discord-primary p-4 rounded-lg">
    <div class="mb-4 flex justify-between items-center">
      <h3 class="text-lg font-semibold">Трансляция</h3>
      
      <!-- Индикатор статуса трансляции -->
      <div 
        :class="[
          'px-2 py-1 rounded text-sm',
          streamActive ? 'bg-discord-success' : 'bg-discord-error'
        ]"
      >
        {{ streamActive ? 'В эфире' : 'Не активна' }}
      </div>
    </div>
    
    <!-- Кнопки управления трансляцией (для преподавателя) -->
    <div v-if="isTeacher" class="mb-4">
      <button
        @click="toggleStream"
        :class="[
          'px-4 py-2 rounded font-medium',
          streamActive ? 'bg-discord-error' : 'bg-discord-success'
        ]"
      >
        {{ streamActive ? 'Завершить трансляцию' : 'Начать трансляцию' }}
      </button>
    </div>
    
    <!-- Кнопка для входа в трансляцию (для студента) -->
    <div v-else class="mb-4">
      <button
        @click="joinStream"
        :disabled="!streamActive"
        class="px-4 py-2 rounded font-medium bg-discord-accent disabled:opacity-50"
      >
        {{ streamActive ? 'Войти в трансляцию' : 'Трансляция не началась' }}
      </button>
    </div>
    
    <!-- Видеоплеер (заглушка) -->
    <div v-if="streamActive && (isTeacher || isJoined)" class="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
      <div v-if="speakingUserId" class="text-center">
        <div class="text-2xl mb-2">🎤 Говорит: {{ speakingUsername }}</div>
        <img src="https://via.placeholder.com/800x450" alt="Stream Placeholder" class="rounded-lg mx-auto" />
      </div>
      <div v-else class="text-center">
        <div class="text-xl mb-2">Трансляция активна</div>
        <img src="https://via.placeholder.com/800x450" alt="Stream Placeholder" class="rounded-lg mx-auto" />
      </div>
    </div>
    
    <!-- Кнопка "Поднять руку" (для студента) -->
    <div v-if="!isTeacher && streamActive && isJoined" class="mb-4">
      <button
        @click="toggleHandRaised"
        :class="[
          'px-4 py-2 rounded font-medium',
          handRaised ? 'bg-discord-warning' : 'bg-discord-accent'
        ]"
      >
        {{ handRaised ? 'Опустить руку ✋' : 'Поднять руку ✋' }}
      </button>
      
      <!-- Индикатор, что студенту дали слово -->
      <div v-if="isSpeaking" class="mt-2 text-discord-success">
        Вам дали слово! Можете говорить 🎤
      </div>
    </div>
    
    <!-- Список студентов с поднятой рукой (для преподавателя) -->
    <div v-if="isTeacher && usersWithRaisedHands.length > 0" class="mb-4">
      <h4 class="text-discord-text-gray mb-2">Студенты с поднятой рукой:</h4>
      <div class="space-y-2">
        <div
          v-for="user in usersWithRaisedHands"
          :key="user.id"
          class="flex justify-between items-center bg-discord-secondary p-2 rounded"
        >
          <span>{{ user.username }} ✋</span>
          <button
            @click="allowToSpeak(user.id)"
            class="px-2 py-1 bg-discord-accent rounded text-sm"
          >
            Дать слово
          </button>
        </div>
      </div>
    </div>
    
    <!-- Чат трансляции -->
    <div class="mt-4">
      <h4 class="text-discord-text-gray mb-2">Чат трансляции</h4>
      <div class="bg-discord-secondary rounded-lg p-2 h-40 overflow-y-auto mb-2">
        <div
          v-for="message in channelMessages"
          :key="message.id"
          class="mb-2"
        >
          <span class="font-semibold">{{ message.username }}:</span>
          <span class="ml-1">{{ message.content }}</span>
        </div>
      </div>
      
      <!-- Поле ввода для чата -->
      <div class="flex">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          class="flex-1 px-3 py-2 bg-discord-primary border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-discord-accent"
          placeholder="Отправить сообщение..."
        />
        <button
          @click="sendMessage"
          class="bg-discord-accent px-4 py-2 rounded-r-md hover:bg-opacity-90"
        >
          Отправить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { useChannelStore } from '../../stores/channels'
import { useParticipantStore } from '../../stores/participants'

const userStore = useUserStore()
const channelStore = useChannelStore()
const participantStore = useParticipantStore()

const newMessage = ref('')
const isJoined = ref(false)

// Получаем данные из хранилищ
const isTeacher = computed(() => userStore.isTeacher)
const username = computed(() => userStore.username)
const streamActive = computed(() => participantStore.streamActive)
const usersWithRaisedHands = computed(() => participantStore.usersWithRaisedHands)
const channelMessages = computed(() => channelStore.channelMessages)
const speakingUserId = computed(() => participantStore.speakingUser)

// Вычисляем имя говорящего пользователя
const speakingUsername = computed(() => {
  if (!speakingUserId.value) return null
  const user = participantStore.users.find(u => u.id === speakingUserId.value)
  return user ? user.username : 'Unknown'
})

// Для студента - проверяем, поднята ли рука
const currentUser = computed(() => {
  return participantStore.users.find(u => u.username === username.value) || {}
})

const handRaised = computed(() => {
  return currentUser.value.handRaised || false
})

// Проверяем, говорит ли текущий пользователь
const isSpeaking = computed(() => {
  return speakingUserId.value === currentUser.value.id
})

// Методы
const toggleStream = () => {
  participantStore.toggleStreamStatus()
}

const joinStream = () => {
  if (streamActive.value) {
    isJoined.value = true
  }
}

const toggleHandRaised = () => {
  participantStore.toggleUserHand(currentUser.value.id)
}

const allowToSpeak = (userId) => {
  participantStore.allowUserToSpeak(userId)
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  channelStore.addMessage({
    channelId: 'lecture',
    username: username.value,
    content: newMessage.value
  })
  
  newMessage.value = ''
}
</script>
