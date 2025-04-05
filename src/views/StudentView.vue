<template>
  <AppLayout>
    <div class="p-4">
      <div v-if="currentChannel">
        <h2 class="text-xl font-bold mb-4"># {{ currentChannel.name }}</h2>
        
        <!-- Компонент трансляции для канала #лекция -->
        <StreamView v-if="currentChannel.id === 'lecture'" />
        
        <!-- Компонент системы достижений для канала #достижения -->
        <AchievementSystem 
          v-else-if="currentChannel.id === 'achievements'" 
          :student-id="userStore.id" 
        />
        
        <!-- Расписание для студента -->
        <div v-else-if="currentChannel.id === 'schedule'" class="bg-discord-secondary p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">Расписание занятий</h3>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-gray-700">
                  <th class="px-4 py-2">Дата</th>
                  <th class="px-4 py-2">Время</th>
                  <th class="px-4 py-2">Тема</th>
                  <th class="px-4 py-2">Преподаватель</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(item, index) in upcomingClasses" 
                  :key="index"
                  class="border-b border-gray-700"
                >
                  <td class="px-4 py-2">{{ item.date }}</td>
                  <td class="px-4 py-2">{{ item.time }}</td>
                  <td class="px-4 py-2">{{ item.title }}</td>
                  <td class="px-4 py-2">{{ item.teacher }}</td>
                </tr>
                <tr v-if="upcomingClasses.length === 0">
                  <td colspan="4" class="px-4 py-2 text-center text-discord-text-gray">
                    Нет запланированных занятий
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Личный прогресс для студента -->
        <div v-else-if="currentChannel.id === 'progress'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="stat-card bg-discord-secondary p-4 rounded-lg shadow-md">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-discord-text-gray text-sm mb-1">Прогресс курса</div>
                  <div class="text-2xl font-bold">67%</div>
                </div>
                <div class="rounded-full bg-discord-accent bg-opacity-20 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="w-full bg-discord-dark rounded-full h-2 mt-3">
                <div class="h-2 rounded-full bg-discord-accent" style="width: 67%"></div>
              </div>
            </div>
            
            <div class="stat-card bg-discord-secondary p-4 rounded-lg shadow-md">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-discord-text-gray text-sm mb-1">Выполнено заданий</div>
                  <div class="text-2xl font-bold">12/20</div>
                </div>
                <div class="rounded-full bg-discord-success bg-opacity-20 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div class="w-full bg-discord-dark rounded-full h-2 mt-3">
                <div class="h-2 rounded-full bg-discord-success" style="width: 60%"></div>
              </div>
            </div>
            
            <div class="stat-card bg-discord-secondary p-4 rounded-lg shadow-md">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-discord-text-gray text-sm mb-1">Достижения</div>
                  <div class="text-2xl font-bold">3/10</div>
                </div>
                <div class="rounded-full bg-discord-warning bg-opacity-20 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-discord-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div class="w-full bg-discord-dark rounded-full h-2 mt-3">
                <div class="h-2 rounded-full bg-discord-warning" style="width: 30%"></div>
              </div>
            </div>
          </div>
          
          <!-- Последние активности -->
          <div class="bg-discord-secondary p-4 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-4">Последние активности</h3>
            
            <div class="space-y-4">
              <div v-for="(activity, index) in recentActivities" :key="index" class="p-3 bg-discord-primary rounded-lg">
                <div class="flex items-center">
                  <div class="rounded-full w-10 h-10 flex items-center justify-center" :class="getActivityIconClass(activity.type)">
                    <span class="text-xl">{{ getActivityIcon(activity.type) }}</span>
                  </div>
                  <div class="ml-3">
                    <p class="font-medium">{{ activity.title }}</p>
                    <p class="text-sm text-discord-text-gray mt-1">{{ activity.date }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Компонент управления заданиями для канала #задания -->
        <AssignmentBoard 
          v-else-if="currentChannel.id === 'assignments' || currentChannel.id === 'homework'" 
          :is-teacher="false" 
        />
        
        <!-- Контент для других каналов -->
        <div v-else-if="currentChannel.id === 'chat' || currentChannel.id === 'general' || currentChannel.id === 'announcements' || currentChannel.id === 'help' || currentChannel.id === 'feedback'" class="bg-discord-secondary p-4 rounded-lg">
          <MessageContainer />
        </div>
        
        <!-- Компонент ресурсов для канала #ресурсы -->
        <ResourcesView v-else-if="currentChannel.id === 'resources'" />
        
        <div v-else class="bg-discord-secondary p-4 rounded-lg">
          <div ref="messagesContainer" class="messages-container max-h-[60vh] overflow-y-auto mb-4 pr-2">
            <!-- Используем компонент сообщения -->
            <message-item 
              v-for="message in channelMessages" 
              :key="message.id" 
              :message="message"
              @toggle-reaction="handleReaction"
            />
            
            <!-- Индикатор печатания -->
            <div v-if="isTyping" class="text-xs text-discord-text-gray ml-12 mb-2">
              Кто-то печатает...
            </div>
          </div>
          
          <!-- Форма отправки сообщения -->
          <div class="mt-4">
            <!-- Кнопки для действий -->
            <div class="flex items-center mb-2">
              <button 
                class="text-discord-text-gray hover:text-white p-1 mr-2"
                @click="showEmojiPicker = !showEmojiPicker"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <!-- Кнопка для загрузки файла -->
              <button 
                class="text-discord-text-gray hover:text-white p-1 mr-2"
                @click="$refs.fileInput.click()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input 
                ref="fileInput" 
                type="file" 
                class="hidden" 
                @change="handleFileSelected" 
                multiple 
              />
              
              <!-- Эмодзи-пикер -->
              <div v-if="showEmojiPicker" class="absolute bg-discord-primary p-2 rounded-lg shadow-lg z-10">
                <div class="grid grid-cols-8 gap-1">
                  <button 
                    v-for="emoji in emojis" 
                    :key="emoji" 
                    @click="insertEmoji(emoji)"
                    class="text-xl p-1 hover:bg-discord-secondary rounded"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Превью выбранных файлов -->
            <div v-if="selectedFiles.length > 0" class="selected-files mb-2 flex flex-wrap gap-2">
              <div v-for="(file, index) in selectedFiles" :key="index" class="file-preview bg-discord-dark rounded p-2 flex items-center">
                <div class="truncate max-w-[100px] text-xs">{{ file.name }}</div>
                <button @click="removeFile(index)" class="ml-2 text-discord-text-gray hover:text-discord-error">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="flex">
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                @input="handleTyping"
                type="text"
                class="flex-1 px-3 py-2 bg-discord-primary border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-discord-accent"
                placeholder="Отправить сообщение..."
                :disabled="currentChannel.isReadOnly && !isTeacher"
              />
              <button
                @click="sendMessage"
                class="bg-discord-accent px-4 py-2 rounded-r-md hover:bg-opacity-90"
                :disabled="currentChannel.isReadOnly && !isTeacher || (!newMessage.trim() && selectedFiles.length === 0)"
              >
                Отправить
              </button>
            </div>
            
            <div v-if="currentChannel.isReadOnly && !isTeacher" class="mt-2 text-sm text-discord-text-gray">
              Этот канал доступен только для чтения
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import StreamView from '../components/stream/StreamView.vue'
import MessageItem from '../components/chat/MessageItem.vue'
import AchievementSystem from '../components/gamification/AchievementSystem.vue'
import AssignmentBoard from '../components/assignments/AssignmentBoard.vue'
import { useUserStore } from '../stores/user'
import { useChannelStore } from '../stores/channels'
import MessageContainer from '../components/chat/MessageContainer.vue'
import ResourcesView from '../components/resources/ResourcesView.vue'

const userStore = useUserStore()
const channelStore = useChannelStore()

const messagesContainer = ref(null)
const fileInput = ref(null)
const newMessage = ref('')
const showEmojiPicker = ref(false)
const isTyping = ref(false)
const typingTimeout = ref(null)
const selectedFiles = ref([])

// Эмодзи для пикера
const emojis = ['😀', '😂', '😊', '❤️', '👍', '🎉', '🔥', '🤔', '😎', '😢', '😡', '🥳', '🤩', '😍', '👏', '🙏']

// Получаем данные из хранилищ
const isTeacher = computed(() => userStore.role === 'teacher')
const username = computed(() => userStore.username)
const currentChannel = computed(() => channelStore.currentChannel)
const channelMessages = computed(() => channelStore.channelMessages)

// Расписание занятий для студента
const upcomingClasses = ref([
  {
    date: '15 апреля 2023',
    time: '18:00',
    title: 'Введение в Vue 3 Composition API',
    teacher: 'Иван Петров'
  },
  {
    date: '18 апреля 2023',
    time: '18:00',
    title: 'Работа с реактивными данными',
    teacher: 'Иван Петров'
  },
  {
    date: '22 апреля 2023',
    time: '18:00',
    title: 'Создание компонентов',
    teacher: 'Иван Петров'
  }
])

// Данные о последних активностях
const recentActivities = ref([
  {
    type: 'assignment',
    title: 'Выполнено задание "Создание компонента регистрации"',
    date: '12 апреля 2023'
  },
  {
    type: 'course',
    title: 'Просмотрен урок "Введение в Composition API"',
    date: '10 апреля 2023'
  },
  {
    type: 'achievement',
    title: 'Получено достижение "Мастер Vue"',
    date: '5 апреля 2023'
  }
])

// Отправка сообщения
const sendMessage = () => {
  if ((!newMessage.value.trim() && selectedFiles.length === 0) || 
      (currentChannel.value.isReadOnly && !isTeacher.value)) return
  
  const attachments = selectedFiles.value.map((file, index) => ({
    id: Date.now() + index,
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file)
  }))
  
  channelStore.addMessage({
    username: username.value,
    content: newMessage.value,
    attachments
  })
  
  newMessage.value = ''
  selectedFiles.value = []
  showEmojiPicker.value = false
  scrollToBottom()
}

// Обработка файлов
const handleFileSelected = (e) => {
  const files = Array.from(e.target.files)
  selectedFiles.value = [...selectedFiles.value, ...files]
  // Очистка input для повторного выбора тех же файлов
  fileInput.value.value = ''
}

const removeFile = (index) => {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
}

// Вставка эмодзи
const insertEmoji = (emoji) => {
  newMessage.value += emoji
  showEmojiPicker.value = false
}

// Обработка индикатора печатания
const handleTyping = () => {
  isTyping.value = true
  
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  
  typingTimeout.value = setTimeout(() => {
    isTyping.value = false
  }, 2000)
}

// Обработка реакций
const handleReaction = (messageId, emoji) => {
  channelStore.toggleReaction({
    messageId,
    emoji,
    userId: userStore.id || 1
  })
}

// Вспомогательные функции для активностей
const getActivityIcon = (type) => {
  switch (type) {
    case 'assignment': return '📝'
    case 'course': return '🎓'
    case 'achievement': return '🏆'
    default: return '📌'
  }
}

const getActivityIconClass = (type) => {
  switch (type) {
    case 'assignment': return 'bg-discord-success bg-opacity-20 text-discord-success'
    case 'course': return 'bg-discord-accent bg-opacity-20 text-discord-accent'
    case 'achievement': return 'bg-discord-warning bg-opacity-20 text-discord-warning'
    default: return 'bg-discord-dark text-white'
  }
}

// Автоматическая прокрутка чата
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// При изменении сообщений прокручиваем чат вниз
watch(() => channelMessages.value, () => {
  scrollToBottom()
}, { deep: true })

// Инициализация
onMounted(() => {
  scrollToBottom()
  
  // Обработчик клика вне окна эмодзи
  document.addEventListener('click', (e) => {
    if (showEmojiPicker.value && !e.target.closest('.emoji-picker')) {
      showEmojiPicker.value = false
    }
  })
})

onUnmounted(() => {
  if (typingTimeout.value) {
  clearTimeout(typingTimeout.value)
  }
})
</script>

<style scoped>
.messages-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 100, 100, 0.2) transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: rgba(100, 100, 100, 0.2);
  border-radius: 3px;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style>
