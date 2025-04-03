<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Сайдбар с каналами -->
    <div
      :class="[
        'bg-discord-secondary transition-all duration-300',
        isMobile ? 'fixed z-50 inset-y-0 left-0 w-64 transform' : 'w-1/5',
        isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
      ]"
    >
      <div class="p-4 h-full overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Каналы</h2>
        
        <div class="space-y-1">
          <div
            v-for="channel in channels"
            :key="channel.id"
            @click="switchChannel(channel.id)"
            :class="[
              'px-2 py-1 rounded cursor-pointer flex items-center',
              currentChannelId === channel.id ? 'bg-discord-primary' : 'hover:bg-discord-primary'
            ]"
          >
            <span class="text-discord-text-gray mr-2">#</span>
            <span>{{ channel.name }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Основной контент -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Верхний бар -->
      <header class="bg-discord-primary border-b border-gray-700 h-14 flex items-center justify-between px-4">
        <div class="flex items-center">
          <!-- Кнопка для мобильного меню -->
          <button
            v-if="isMobile"
            @click="sidebarOpen = !sidebarOpen"
            class="mr-3 text-discord-text-gray hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 class="font-bold text-lg">БулСтепТех</h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <span class="text-discord-text-gray">{{ username }}</span>
          <button
            @click="handleLogout"
            class="bg-discord-error hover:bg-opacity-80 px-3 py-1 rounded text-sm"
          >
            Выйти
          </button>
        </div>
      </header>
      
      <!-- Центральная часть и список участников -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Основной контент -->
        <main class="flex-1 overflow-y-auto">
          <slot></slot>
        </main>
        
        <!-- Список участников -->
        <div
          :class="[
            'bg-discord-secondary overflow-y-auto transition-all duration-300',
            isMobileOrTablet ? 'fixed z-40 inset-y-14 right-0 w-64 transform' : 'w-1/5',
            isMobileOrTablet && !participantsOpen ? 'translate-x-full' : 'translate-x-0'
          ]"
        >
          <div class="p-4">
            <h2 class="text-xl font-bold mb-4">Участники</h2>
            
            <!-- Список преподавателей -->
            <div class="mb-4">
              <h3 class="text-discord-text-gray text-sm uppercase font-semibold mb-2">Преподаватели</h3>
              <div
                v-for="user in teacherUsers"
                :key="user.id"
                class="flex items-center mb-2"
              >
                <div class="w-2 h-2 rounded-full mr-2" :class="user.status === 'online' ? 'bg-discord-success' : 'bg-discord-text-gray'"></div>
                <div class="flex-1">{{ user.username }}</div>
              </div>
            </div>
            
            <!-- Список студентов -->
            <div>
              <h3 class="text-discord-text-gray text-sm uppercase font-semibold mb-2">Студенты</h3>
              <div
                v-for="user in studentUsers"
                :key="user.id"
                class="flex items-center mb-2"
              >
                <div class="w-2 h-2 rounded-full mr-2" :class="user.status === 'online' ? 'bg-discord-success' : 'bg-discord-text-gray'"></div>
                <div class="flex-1">
                  {{ user.username }}
                  <span v-if="user.handRaised" class="ml-2">✋</span>
                  <span v-if="speakingUser === user.id" class="ml-2">🎤</span>
                </div>
                
                <!-- Кнопки управления для преподавателя -->
                <div v-if="isTeacher && currentChannelId === 'lecture' && user.handRaised" class="ml-2">
                  <button
                    @click="allowToSpeak(user.id)"
                    class="text-xs bg-discord-accent px-2 py-1 rounded"
                  >
                    Дать слово
                  </button>
                </div>
                
                <div v-if="isTeacher && speakingUser === user.id" class="ml-2">
                  <button
                    @click="muteUser()"
                    class="text-xs bg-discord-error px-2 py-1 rounded"
                  >
                    Заглушить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Мобильная кнопка для открытия списка участников -->
      <button
        v-if="isMobileOrTablet"
        @click="participantsOpen = !participantsOpen"
        class="fixed bottom-4 right-4 z-30 bg-discord-accent p-3 rounded-full shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useChannelStore } from '../../stores/channels'
import { useParticipantStore } from '../../stores/participants'

const router = useRouter()
const userStore = useUserStore()
const channelStore = useChannelStore()
const participantStore = useParticipantStore()

// Состояние UI
const sidebarOpen = ref(false)
const participantsOpen = ref(false)
const isMobile = ref(false)
const isMobileOrTablet = ref(false)

// Получаем данные из хранилищ
const username = computed(() => userStore.username)
const isTeacher = computed(() => userStore.isTeacher)
const channels = computed(() => channelStore.channels)
const currentChannelId = computed(() => channelStore.currentChannelId)

const users = computed(() => participantStore.users)
const speakingUser = computed(() => participantStore.speakingUser)

// Фильтрация пользователей по ролям
const teacherUsers = computed(() => 
  users.value.filter(user => user.role === 'teacher')
)
const studentUsers = computed(() => 
  users.value.filter(user => user.role === 'student')
)

// Методы
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const switchChannel = (channelId) => {
  channelStore.setCurrentChannel(channelId)
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

const allowToSpeak = (userId) => {
  participantStore.allowUserToSpeak(userId)
}

const muteUser = () => {
  participantStore.muteUser()
}

// Адаптивность
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  isMobileOrTablet.value = window.innerWidth < 1024
  
  if (!isMobile.value) {
    sidebarOpen.value = true
  }
  
  if (!isMobileOrTablet.value) {
    participantsOpen.value = true
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
