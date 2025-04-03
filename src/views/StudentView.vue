<template>
  <AppLayout>
    <div class="p-4">
      <div v-if="currentChannel">
        <h2 class="text-xl font-bold mb-4"># {{ currentChannel.name }}</h2>
        
        <!-- Компонент трансляции для канала #лекция -->
        <StreamView v-if="currentChannel.id === 'lecture'" />
        
        <!-- Контент для других каналов -->
        <div v-else class="bg-discord-secondary p-4 rounded-lg">
          <div v-for="message in channelMessages" :key="message.id" class="mb-4">
            <div class="flex items-start">
              <div class="bg-gray-700 w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center">
                {{ message.username.charAt(0).toUpperCase() }}
              </div>
              <div class="ml-3">
                <div class="flex items-center">
                  <span class="font-medium">{{ message.username }}</span>
                  <span class="ml-2 text-xs text-discord-text-gray">{{ formatTime(message.timestamp) }}</span>
                </div>
                <p class="text-discord-text-light">{{ message.content }}</p>
              </div>
            </div>
          </div>
          
          <!-- Форма отправки сообщения -->
          <div class="mt-4">
            <div class="flex">
              <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                type="text"
                class="flex-1 px-3 py-2 bg-discord-primary border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-discord-accent"
                placeholder="Отправить сообщение..."
                :disabled="currentChannel.isReadOnly && !isTeacher"
              />
              <button
                @click="sendMessage"
                class="bg-discord-accent px-4 py-2 rounded-r-md hover:bg-opacity-90"
                :disabled="currentChannel.isReadOnly && !isTeacher"
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
import { ref, computed } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import StreamView from '../components/stream/StreamView.vue'
import { useUserStore } from '../stores/user'
import { useChannelStore } from '../stores/channels'

const userStore = useUserStore()
const channelStore = useChannelStore()

const newMessage = ref('')

// Получаем данные из хранилищ
const isTeacher = computed(() => userStore.isTeacher)
const username = computed(() => userStore.username)
const currentChannel = computed(() => channelStore.currentChannel)
const channelMessages = computed(() => channelStore.channelMessages)

// Отправка сообщения
const sendMessage = () => {
  if (!newMessage.value.trim()) return
  if (currentChannel.value.isReadOnly && !isTeacher.value) return
  
  channelStore.addMessage({
    username: username.value,
    content: newMessage.value
  })
  
  newMessage.value = ''
}

// Форматирование времени
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>
