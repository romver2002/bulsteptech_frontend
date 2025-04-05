<template>
  <div class="achievements-container bg-discord-secondary p-4 rounded-lg">
    <h3 class="text-lg font-semibold mb-4">Достижения</h3>
    
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id" 
        class="achievement-card p-3 rounded-lg"
        :class="achievement.unlocked ? 'bg-discord-primary' : 'bg-discord-dark opacity-70'"
      >
        <div class="flex flex-col items-center text-center">
          <div 
            class="achievement-icon w-16 h-16 rounded-full flex items-center justify-center mb-2"
            :class="achievement.unlocked ? getTypeClass(achievement.type) : 'bg-discord-secondary'"
          >
            <span class="text-2xl">{{ achievement.icon }}</span>
          </div>
          <h4 class="font-medium mb-1">{{ achievement.name }}</h4>
          <p class="text-xs text-discord-text-gray">{{ achievement.description }}</p>
          
          <div v-if="!achievement.unlocked && achievement.progress" class="w-full mt-2">
            <div class="w-full bg-discord-dark rounded-full h-2">
              <div 
                class="h-2 rounded-full bg-discord-accent"
                :style="`width: ${(achievement.progress.current / achievement.progress.total) * 100}%`"
              ></div>
            </div>
            <div class="text-xs text-discord-text-gray mt-1">
              {{ achievement.progress.current }} / {{ achievement.progress.total }}
            </div>
          </div>
          
          <div v-if="achievement.unlocked" class="text-xs text-discord-success mt-2">
            Получено {{ formatDate(achievement.unlockedAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../../stores/user';

const props = defineProps({
  studentId: {
    type: [Number, String],
    required: true
  }
});

const userStore = useUserStore();

// В реальном приложении эти данные будут загружаться из API
const achievements = computed(() => [
  {
    id: 1,
    name: 'Первые шаги',
    description: 'Завершите первый урок',
    icon: '🚀',
    type: 'progress',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    name: 'Эксперт по CSS',
    description: 'Завершите все уроки по CSS',
    icon: '🎨',
    type: 'mastery',
    unlocked: false,
    progress: {
      current: 3,
      total: 5
    }
  },
  {
    id: 3,
    name: 'Мастер Vue',
    description: 'Создайте 3 компонента Vue',
    icon: '⚡',
    type: 'mastery',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 4,
    name: 'Помощник',
    description: 'Ответьте на 10 вопросов других студентов',
    icon: '👋',
    type: 'social',
    unlocked: false,
    progress: {
      current: 4,
      total: 10
    }
  },
  {
    id: 5,
    name: 'Ежедневное обучение',
    description: 'Заходите в приложение 7 дней подряд',
    icon: '🔥',
    type: 'consistency',
    unlocked: false,
    progress: {
      current: 3,
      total: 7
    }
  },
  {
    id: 6,
    name: 'Первая трансляция',
    description: 'Примите участие в прямой трансляции',
    icon: '📺',
    type: 'engagement',
    unlocked: true,
    unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
]);

const getTypeClass = (type) => {
  switch (type) {
    case 'progress': return 'bg-discord-success';
    case 'mastery': return 'bg-discord-accent';
    case 'social': return 'bg-discord-warning';
    case 'consistency': return 'bg-discord-error';
    case 'engagement': return 'bg-discord-primary';
    default: return 'bg-discord-secondary';
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};
</script>

<style scoped>
.achievement-card {
  transition: all 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-5px);
}

.achievement-icon {
  transition: all 0.3s ease;
}

.achievement-card:hover .achievement-icon {
  transform: scale(1.1);
}
</style>
