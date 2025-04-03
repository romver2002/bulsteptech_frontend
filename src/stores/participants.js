import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { users as initialUsers } from '../mocks/users'

export const useParticipantStore = defineStore('participants', () => {
  const users = ref(initialUsers)
  const streamActive = ref(false)
  const speakingUser = ref(null)
  
  const onlineUsers = computed(() => 
    users.value.filter(user => user.status !== 'offline')
  )
  
  const usersWithRaisedHands = computed(() => 
    users.value.filter(user => user.handRaised)
  )
  
  function toggleUserHand(userId, value = null) {
    const user = users.value.find(u => u.id === userId)
    if (user) {
      user.handRaised = value !== null ? value : !user.handRaised
    }
  }
  
  function toggleStreamStatus() {
    streamActive.value = !streamActive.value
  }
  
  function allowUserToSpeak(userId) {
    speakingUser.value = userId
  }
  
  function muteUser() {
    speakingUser.value = null
  }
  
  return {
    users,
    onlineUsers,
    usersWithRaisedHands,
    streamActive,
    speakingUser,
    toggleUserHand,
    toggleStreamStatus,
    allowUserToSpeak,
    muteUser
  }
})
