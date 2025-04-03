import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { channels, messages as initialMessages } from '../mocks/channels'

export const useChannelStore = defineStore('channels', () => {
  const allChannels = ref(channels)
  const messages = ref(initialMessages)
  const currentChannelId = ref('general')
  
  const currentChannel = computed(() => 
    allChannels.value.find(channel => channel.id === currentChannelId.value)
  )
  
  const channelMessages = computed(() => 
    messages.value.filter(message => message.channelId === currentChannelId.value)
  )
  
  function setCurrentChannel(id) {
    currentChannelId.value = id
  }
  
  function addMessage(message) {
    const newMessage = {
      id: Date.now(),
      channelId: message.channelId || currentChannelId.value,
      username: message.username,
      content: message.content,
      timestamp: message.timestamp || new Date().toISOString()
    }
    messages.value.push(newMessage)
  }
  
  return {
    channels: allChannels,
    messages,
    currentChannelId,
    currentChannel,
    channelMessages,
    setCurrentChannel,
    addMessage
  }
})
