<template>
  <div class="participants-list bg-gray-800 rounded-md flex flex-col h-full">
    <div class="participants-header border-b border-gray-700 p-3 flex justify-between items-center">
      <h3 class="font-semibold text-white">Участники ({{ participants.length }})</h3>
      <div class="flex space-x-2">
        <button class="text-gray-400 hover:text-white">
          <i class="fas fa-search"></i>
        </button>
        <button class="text-gray-400 hover:text-white" @click="$emit('toggle-participants')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div class="participants-search px-3 py-2">
      <div class="relative">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Поиск участников..." 
          class="w-full bg-gray-700 text-white rounded-md p-2 pl-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
    </div>
    
    <div class="participants-groups flex-grow overflow-y-auto p-2">
      <!-- Преподаватель -->
      <div v-if="instructor" class="participants-group mb-4">
        <h4 class="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Преподаватель</h4>
        <div class="space-y-1">
          <div class="participant-item flex items-center p-2 rounded-md hover:bg-gray-700 group">
            <div class="relative mr-3">
              <img :src="instructor.avatar" alt="Avatar" class="w-8 h-8 rounded-full">
              <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-800"></div>
            </div>
            <div class="flex-grow">
              <div class="flex items-center">
                <span class="font-medium text-white">{{ instructor.username }}</span>
                <span v-if="instructor.status" class="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-blue-600 text-white">{{ instructor.status }}</span>
              </div>
              <div class="text-xs text-gray-400">
                {{ instructor.isSpeaking ? 'Говорит...' : (instructor.isMicrophoneOn ? 'Микрофон включен' : 'Микрофон выключен') }}
              </div>
            </div>
            <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button v-if="isTeacher" class="text-gray-400 hover:text-white" title="Заглушить">
                <i :class="['fas', instructor.isMicrophoneOn ? 'fa-microphone-slash' : 'fa-microphone']"></i>
              </button>
              <button class="text-gray-400 hover:text-white" @click="pinParticipant(instructor.id)" title="Закрепить видео">
                <i class="fas fa-thumbtack"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Студенты с поднятой рукой -->
      <div v-if="hasRaisedHands" class="participants-group mb-4">
        <h4 class="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Поднятые руки</h4>
        <div class="space-y-1">
          <div 
            v-for="participant in filteredRaisedHands" 
            :key="participant.id" 
            class="participant-item flex items-center p-2 rounded-md hover:bg-gray-700 group"
          >
            <div class="relative mr-3">
              <img :src="participant.avatar" alt="Avatar" class="w-8 h-8 rounded-full">
              <div 
                class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-gray-800"
                :class="participant.isMicrophoneOn ? 'bg-green-500' : 'bg-red-500'"
              ></div>
            </div>
            <div class="flex-grow">
              <div class="flex items-center">
                <span class="font-medium text-white">{{ participant.username }}</span>
                <i class="fas fa-hand-paper text-yellow-500 ml-2"></i>
              </div>
              <div class="text-xs text-gray-400">
                {{ participant.isSpeaking ? 'Говорит...' : (participant.isMicrophoneOn ? 'Микрофон включен' : 'Микрофон выключен') }}
              </div>
            </div>
            <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button v-if="isTeacher" class="text-gray-400 hover:text-white" @click="toggleParticipantMicrophone(participant.id)" title="Заглушить">
                <i :class="['fas', participant.isMicrophoneOn ? 'fa-microphone-slash' : 'fa-microphone']"></i>
              </button>
              <button class="text-gray-400 hover:text-white" @click="pinParticipant(participant.id)" title="Закрепить видео">
                <i class="fas fa-thumbtack"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Остальные студенты -->
      <div class="participants-group">
        <h4 class="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Студенты ({{ filteredStudents.length }})</h4>
        <div class="space-y-1">
          <div 
            v-for="participant in filteredStudents" 
            :key="participant.id" 
            class="participant-item flex items-center p-2 rounded-md hover:bg-gray-700 group"
          >
            <div class="relative mr-3">
              <img :src="participant.avatar" alt="Avatar" class="w-8 h-8 rounded-full">
              <div 
                class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-gray-800"
                :class="participant.isMicrophoneOn ? 'bg-green-500' : 'bg-red-500'"
              ></div>
            </div>
            <div class="flex-grow">
              <div class="font-medium text-white">{{ participant.username }}</div>
              <div class="text-xs text-gray-400">
                {{ participant.isSpeaking ? 'Говорит...' : (participant.isMicrophoneOn ? 'Микрофон включен' : 'Микрофон выключен') }}
              </div>
            </div>
            <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button v-if="isTeacher" class="text-gray-400 hover:text-white" @click="toggleParticipantMicrophone(participant.id)" title="Заглушить">
                <i :class="['fas', participant.isMicrophoneOn ? 'fa-microphone-slash' : 'fa-microphone']"></i>
              </button>
              <button class="text-gray-400 hover:text-white" @click="pinParticipant(participant.id)" title="Закрепить видео">
                <i class="fas fa-thumbtack"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '../../stores/user';

const props = defineProps({
  participants: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['toggle-participants', 'toggle-microphone', 'pin-participant']);

const userStore = useUserStore();
const searchQuery = ref('');

// Computed свойства
const isTeacher = computed(() => userStore.role === 'teacher');

const instructor = computed(() => {
  return props.participants.find(p => p.role === 'teacher');
});

const filteredParticipants = computed(() => {
  if (!searchQuery.value.trim()) return props.participants;
  
  const query = searchQuery.value.toLowerCase();
  return props.participants.filter(p => 
    p.username.toLowerCase().includes(query)
  );
});

const filteredRaisedHands = computed(() => {
  return filteredParticipants.value
    .filter(p => p.role === 'student' && p.isHandRaised);
});

const filteredStudents = computed(() => {
  return filteredParticipants.value
    .filter(p => p.role === 'student' && !p.isHandRaised);
});

const hasRaisedHands = computed(() => filteredRaisedHands.value.length > 0);

// Методы
const toggleParticipantMicrophone = (participantId) => {
  emit('toggle-microphone', participantId);
};

const pinParticipant = (participantId) => {
  emit('pin-participant', participantId);
};
</script>

<style scoped>
.participants-list {
  width: 100%;
  height: 100%;
}

.participants-groups {
  max-height: calc(100vh - 220px);
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}

.participants-groups::-webkit-scrollbar {
  width: 6px;
}

.participants-groups::-webkit-scrollbar-track {
  background: #2d3748;
}

.participants-groups::-webkit-scrollbar-thumb {
  background-color: #4a5568;
  border-radius: 3px;
}

.transition-opacity {
  transition: opacity 0.2s ease;
}

@media (max-width: 768px) {
  .participants-groups {
    max-height: 300px;
  }
}
</style>
