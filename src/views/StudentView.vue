<template>
  <AppLayout>
    <div :class="['overview', 'resources'].includes(currentChannel?.id) ? '' : 'p-4'">
      <div v-if="currentChannel">
        <h2 v-if="!['overview', 'resources'].includes(currentChannel.id)" class="text-xl font-bold mb-4"># {{ currentChannel.name }}</h2>
        
        <OverviewPanel v-if="currentChannel.id === 'overview'" role="student" />

        <!-- Компонент трансляции для канала #лекция -->
        <StreamView v-else-if="currentChannel.id === 'lecture'" />
        
        <!-- Компонент системы достижений для канала #достижения -->
        <AchievementSystem 
          v-else-if="currentChannel.id === 'achievements'" 
          :student-id="userStore.id" 
        />
        
        <!-- Расписание для студента -->
        <div v-else-if="currentChannel.id === 'schedule'" class="glass-card p-6 rounded-2xl animate-fade-in border border-white/5">
          <h3 class="text-xl font-bold mb-6 text-white flex items-center">
            <span class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3">📅</span>
            Расписание занятий
          </h3>
          
          <div class="overflow-x-auto rounded-xl border border-white/5">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white/5 border-b border-white/10">
                  <th class="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Дата</th>
                  <th class="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Время</th>
                  <th class="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Тема</th>
                  <th class="px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Преподаватель</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr 
                  v-for="(item, index) in upcomingClasses" 
                  :key="index"
                  class="hover:bg-white/5 transition-colors group"
                >
                  <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-white">{{ item.date }}</td>
                  <td class="px-5 py-4 whitespace-nowrap text-sm text-indigo-300 font-semibold">{{ item.time }}</td>
                  <td class="px-5 py-4 text-sm font-medium text-white">{{ item.title }}</td>
                  <td class="px-5 py-4 whitespace-nowrap text-sm text-gray-300 flex items-center">
                    <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white mr-2">
                      {{ item.teacher.substring(0,2) }}
                    </div>
                    {{ item.teacher }}
                  </td>
                </tr>
                <tr v-if="upcomingClasses.length === 0">
                  <td colspan="4" class="px-5 py-12 text-center text-gray-500 font-medium">
                    <div class="text-4xl mb-3">📅</div>
                    Нет запланированных занятий
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Личный прогресс для студента -->
        <div v-else-if="currentChannel.id === 'progress'" class="space-y-6 animate-fade-in">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors"></div>
              <div class="flex items-center justify-between relative z-10">
                <div>
                  <div class="text-discord-text-gray text-sm mb-2 font-medium uppercase tracking-wider">Прогресс курса</div>
                  <div class="text-4xl font-extrabold text-white">67%</div>
                </div>
                <div class="rounded-2xl bg-indigo-500/20 p-4 border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="w-full bg-black/40 rounded-full h-3 mt-5 shadow-inner border border-white/5">
                <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style="width: 67%"></div>
              </div>
            </div>
            
            <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors"></div>
              <div class="flex items-center justify-between relative z-10">
                <div>
                  <div class="text-discord-text-gray text-sm mb-2 font-medium uppercase tracking-wider">Выполнено заданий</div>
                  <div class="text-4xl font-extrabold text-white">12/20</div>
                </div>
                <div class="rounded-2xl bg-emerald-500/20 p-4 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div class="w-full bg-black/40 rounded-full h-3 mt-5 shadow-inner border border-white/5">
                <div class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style="width: 60%"></div>
              </div>
            </div>
            
            <div class="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-colors"></div>
              <div class="flex items-center justify-between relative z-10">
                <div>
                  <div class="text-discord-text-gray text-sm mb-2 font-medium uppercase tracking-wider">Достижения</div>
                  <div class="text-4xl font-extrabold text-white">3/10</div>
                </div>
                <div class="rounded-2xl bg-amber-500/20 p-4 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div class="w-full bg-black/40 rounded-full h-3 mt-5 shadow-inner border border-white/5">
                <div class="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style="width: 30%"></div>
              </div>
            </div>
          </div>
          
          <!-- Последние активности -->
          <div class="glass-card p-6 rounded-2xl border border-white/5">
            <h3 class="text-xl font-bold mb-6 text-white flex items-center">
              <span class="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center mr-3">⚡</span>
              Последние активности
            </h3>
            
            <div class="space-y-4">
              <div v-for="(activity, index) in recentActivities" :key="index" class="p-4 bg-white/5 border border-transparent hover:border-white/10 rounded-xl transition-all hover:bg-white/10 group">
                <div class="flex items-center">
                  <div class="rounded-xl w-12 h-12 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform" :class="getActivityIconClass(activity.type)">
                    <span class="text-2xl">{{ getActivityIcon(activity.type) }}</span>
                  </div>
                  <div class="ml-4">
                    <p class="font-bold text-white">{{ activity.title }}</p>
                    <p class="text-sm text-indigo-300 font-medium mt-1">{{ activity.date }}</p>
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
        <div v-else-if="currentChannel.id === 'chat' || currentChannel.id === 'general' || currentChannel.id === 'announcements' || currentChannel.id === 'help' || currentChannel.id === 'feedback'" class="glass-card p-2 rounded-2xl h-[calc(100vh-140px)] border border-white/5">
          <MessageContainer />
        </div>
        
        <!-- Компонент ресурсов для канала #ресурсы -->
        <ResourcesView v-else-if="currentChannel.id === 'resources'" />
        
        <div v-else class="glass-card p-4 rounded-2xl border border-white/5 h-[calc(100vh-140px)] flex flex-col">
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
          <div class="mt-auto pt-4 relative">
            <!-- Кнопки для действий -->
            <div class="flex items-center mb-3">
              <button 
                ref="emojiToggleButton"
                type="button"
                class="text-discord-text-gray hover:text-white p-2 mr-2 bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                @click="toggleEmojiPicker"
                aria-label="Открыть панель эмодзи"
                aria-controls="student-emoji-picker"
                :aria-expanded="showEmojiPicker"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <!-- Кнопка для загрузки файла -->
              <button 
                type="button"
                class="text-discord-text-gray hover:text-white p-2 mr-2 bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
                @click="openFileInput"
                aria-label="Прикрепить файл"
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
              <div
                v-if="showEmojiPicker"
                id="student-emoji-picker"
                ref="emojiPicker"
                class="emoji-picker absolute bottom-full left-0 mb-2 glass-card p-3 rounded-xl shadow-xl z-20 border border-white/10 animate-fade-in"
                role="dialog"
                aria-label="Выбор эмодзи"
                tabindex="-1"
                @keydown.esc.stop="closeEmojiPicker(true)"
              >
                <div class="grid grid-cols-8 gap-2">
                  <button 
                    v-for="emoji in emojis" 
                    :key="emoji" 
                    type="button"
                    @click="insertEmoji(emoji)"
                    class="text-2xl p-2 hover:bg-white/10 rounded-lg transition-transform hover:scale-110"
                    :aria-label="`Вставить эмодзи ${emoji}`"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Превью выбранных файлов -->
            <div v-if="selectedFiles.length > 0" class="selected-files mb-3 flex flex-wrap gap-3">
              <div v-for="(file, index) in selectedFiles" :key="index" class="file-preview bg-black/40 border border-white/10 rounded-xl p-3 flex items-center">
                <div class="truncate max-w-[150px] text-xs font-medium">{{ file.name }}</div>
                <button type="button" @click="removeFile(index)" class="ml-3 text-discord-text-gray hover:text-rose-400 bg-white/5 p-1 rounded-md transition-colors" :aria-label="`Удалить вложение ${file.name}`">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="relative flex-1">
                <input
                  ref="messageInput"
                  v-model="newMessage"
                  @keyup.enter="sendMessage"
                  @input="handleTyping"
                  type="text"
                  class="w-full pl-5 pr-4 py-3.5 glass-input rounded-2xl text-white placeholder-gray-500 shadow-inner"
                  placeholder="Написать сообщение..."
                  aria-label="Текст сообщения"
                  :disabled="currentChannel.isReadOnly && !isTeacher"
                />
              </div>
              <button
                type="button"
                @click="sendMessage"
                class="glass-button p-3.5 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                :disabled="currentChannel.isReadOnly && !isTeacher || (!newMessage.trim() && selectedFiles.length === 0)"
                aria-label="Отправить сообщение"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            
            <div v-if="currentChannel.isReadOnly && !isTeacher" class="mt-2 text-xs text-rose-400 font-medium">
              Этот канал доступен только для чтения
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import MessageItem from '../components/chat/MessageItem.vue'
import { useUserStore } from '../stores/user'
import { useChannelStore } from '../stores/channels'
import OverviewPanel from '../components/dashboard/OverviewPanel.vue'

const StreamView = defineAsyncComponent(() => import('../components/stream/StreamView.vue'))
const AchievementSystem = defineAsyncComponent(() => import('../components/gamification/AchievementSystem.vue'))
const AssignmentBoard = defineAsyncComponent(() => import('../components/assignments/AssignmentBoard.vue'))
const MessageContainer = defineAsyncComponent(() => import('../components/chat/MessageContainer.vue'))
const ResourcesView = defineAsyncComponent(() => import('../components/resources/ResourcesView.vue'))

const userStore = useUserStore()
const channelStore = useChannelStore()

const messagesContainer = ref(null)
const fileInput = ref(null)
const messageInput = ref(null)
const emojiPicker = ref(null)
const emojiToggleButton = ref(null)
const newMessage = ref('')
const showEmojiPicker = ref(false)
const isTyping = ref(false)
const typingTimeout = ref(null)
const selectedFiles = ref([])
const createdObjectUrls = new Set()

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
  if ((!newMessage.value.trim() && selectedFiles.value.length === 0) ||
      (currentChannel.value.isReadOnly && !isTeacher.value)) return
  
  const attachments = selectedFiles.value.map((file, index) => ({
    id: Date.now() + index,
    name: file.name,
    size: file.size,
    type: file.type,
    url: createTrackedObjectUrl(file)
  }))
  
  channelStore.addMessage({
    username: username.value,
    content: newMessage.value,
    attachments
  })
  
  newMessage.value = ''
  selectedFiles.value = []
  closeEmojiPicker()
  scrollToBottom()
}

const createTrackedObjectUrl = (file) => {
  const url = URL.createObjectURL(file)
  createdObjectUrls.add(url)
  return url
}

const revokeCreatedObjectUrls = () => {
  createdObjectUrls.forEach((url) => URL.revokeObjectURL(url))
  createdObjectUrls.clear()
}

// Обработка файлов
const handleFileSelected = (e) => {
  const files = Array.from(e.target.files || [])
  selectedFiles.value = [...selectedFiles.value, ...files]
  // Очистка input для повторного выбора тех же файлов
  if (fileInput.value) fileInput.value.value = ''
}

const openFileInput = () => {
  fileInput.value?.click()
}

const removeFile = (index) => {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
}

// Вставка эмодзи
const insertEmoji = (emoji) => {
  newMessage.value += emoji
  closeEmojiPicker()
  nextTick(() => messageInput.value?.focus())
}

const toggleEmojiPicker = () => {
  if (showEmojiPicker.value) {
    closeEmojiPicker(true)
    return
  }

  showEmojiPicker.value = true
  nextTick(() => emojiPicker.value?.focus())
}

const closeEmojiPicker = (restoreFocus = false) => {
  if (!showEmojiPicker.value) return
  showEmojiPicker.value = false

  if (restoreFocus) {
    nextTick(() => emojiToggleButton.value?.focus())
  }
}

const handleEmojiPickerOutside = (event) => {
  if (!showEmojiPicker.value) return

  const eventPath = typeof event.composedPath === 'function' ? event.composedPath() : []
  const clickedInsidePicker = eventPath.includes(emojiPicker.value) || emojiPicker.value?.contains(event.target)
  const clickedToggle = eventPath.includes(emojiToggleButton.value) || emojiToggleButton.value?.contains(event.target)

  if (!clickedInsidePicker && !clickedToggle) closeEmojiPicker()
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
    case 'assignment': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
    case 'course': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
    case 'achievement': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
    default: return 'bg-gray-800 text-white border border-gray-700'
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
  document.addEventListener('pointerdown', handleEmojiPickerOutside)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleEmojiPickerOutside)
  revokeCreatedObjectUrls()

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
