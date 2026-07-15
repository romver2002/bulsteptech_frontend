<template>
  <aside class="participants-panel" aria-label="Участники трансляции">
    <header class="participants-header">
      <div>
        <p class="eyebrow">Аудитория</p>
        <h3>Участники <span>{{ participants.length }}</span></h3>
      </div>
      <button
        type="button"
        class="icon-button"
        aria-label="Закрыть список участников"
        title="Закрыть"
        @click="emit('toggle-participants')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </header>

    <div class="search-wrap">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </svg>
      <label class="sr-only" for="participant-search">Поиск участников</label>
      <input
        id="participant-search"
        v-model.trim="searchQuery"
        type="search"
        autocomplete="off"
        placeholder="Найти участника"
      />
      <button
        v-if="searchQuery"
        type="button"
        class="clear-search"
        aria-label="Очистить поиск"
        title="Очистить"
        @click="searchQuery = ''"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 7l10 10M17 7 7 17" />
        </svg>
      </button>
    </div>

    <div class="participants-scroll">
      <section v-if="instructor" class="participant-group">
        <h4>Преподаватель</h4>
        <article
          class="participant-card"
          :class="{ speaking: instructor.speaking, pinned: isPinned(instructor.id) }"
        >
          <div class="avatar-shell" :class="{ speaking: instructor.speaking }">
            <span>{{ initials(instructor.name) }}</span>
            <img
              v-if="instructor.avatar"
              :src="instructor.avatar"
              :alt="`Аватар: ${instructor.name}`"
              @error="hideBrokenAvatar"
            />
            <i :class="['presence-dot', instructor.audioOn ? 'online' : 'muted']"></i>
          </div>

          <div class="participant-copy">
            <div class="participant-name-row">
              <strong>{{ instructor.name }}</strong>
              <span class="role-badge">Ведущий</span>
            </div>
            <p>{{ participantStatus(instructor) }}</p>
          </div>

          <div class="participant-actions">
            <button
              v-if="isTeacher"
              type="button"
              class="participant-action"
              :class="{ danger: instructor.audioOn }"
              :aria-label="microphoneLabel(instructor)"
              :title="microphoneLabel(instructor)"
              @click="toggleParticipantMicrophone(instructor.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 5.1 2.14M15 9V6a3 3 0 0 0-4.2-2.75M5 10v1a7 7 0 0 0 11.75 5.12M19 10v1a7 7 0 0 1-.38 2.28M12 18v3M8 21h8M3 3l18 18" />
              </svg>
            </button>
            <button
              type="button"
              class="participant-action"
              :class="{ active: isPinned(instructor.id) }"
              :aria-pressed="isPinned(instructor.id)"
              :aria-label="pinLabel(instructor)"
              :title="pinLabel(instructor)"
              @click="pinParticipant(instructor.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14 4 6 6-3 1-4 4-1 5-2-2-4 4-1-1 4-4-2-2 5-1 4-4 1-3Z" />
              </svg>
            </button>
          </div>
        </article>
      </section>

      <section v-if="filteredRaisedHands.length" class="participant-group raised-group">
        <h4>Хотят выступить <span>{{ filteredRaisedHands.length }}</span></h4>
        <article
          v-for="participant in filteredRaisedHands"
          :key="participant.id"
          class="participant-card"
          :class="{ speaking: participant.speaking, pinned: isPinned(participant.id) }"
        >
          <div class="avatar-shell" :class="{ speaking: participant.speaking }">
            <span>{{ initials(participant.name) }}</span>
            <img
              v-if="participant.avatar"
              :src="participant.avatar"
              :alt="`Аватар: ${participant.name}`"
              @error="hideBrokenAvatar"
            />
            <i :class="['presence-dot', participant.audioOn ? 'online' : 'muted']"></i>
          </div>

          <div class="participant-copy">
            <div class="participant-name-row">
              <strong>{{ participant.name }}</strong>
              <svg class="raised-hand" viewBox="0 0 24 24" aria-label="Поднята рука">
                <path d="M7 11V6a1.5 1.5 0 0 1 3 0v4-6a1.5 1.5 0 0 1 3 0v6-5a1.5 1.5 0 0 1 3 0v6-3a1.5 1.5 0 0 1 3 0v5c0 5-3 8-8 8h-1c-3 0-5-2-6-4l-2-4a1.7 1.7 0 0 1 3-1l2 3" />
              </svg>
            </div>
            <p>{{ participantStatus(participant) }}</p>
          </div>

          <div class="participant-actions">
            <button
              v-if="isTeacher"
              type="button"
              class="participant-action"
              :class="{ danger: participant.audioOn }"
              :aria-label="microphoneLabel(participant)"
              :title="microphoneLabel(participant)"
              @click="toggleParticipantMicrophone(participant.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 5.1 2.14M15 9V6a3 3 0 0 0-4.2-2.75M5 10v1a7 7 0 0 0 11.75 5.12M19 10v1a7 7 0 0 1-.38 2.28M12 18v3M8 21h8M3 3l18 18" />
              </svg>
            </button>
            <button
              type="button"
              class="participant-action"
              :class="{ active: isPinned(participant.id) }"
              :aria-pressed="isPinned(participant.id)"
              :aria-label="pinLabel(participant)"
              :title="pinLabel(participant)"
              @click="pinParticipant(participant.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14 4 6 6-3 1-4 4-1 5-2-2-4 4-1-1 4-4-2-2 5-1 4-4 1-3Z" />
              </svg>
            </button>
          </div>
        </article>
      </section>

      <section v-if="filteredStudents.length" class="participant-group">
        <h4>Студенты <span>{{ filteredStudents.length }}</span></h4>
        <article
          v-for="participant in filteredStudents"
          :key="participant.id"
          class="participant-card"
          :class="{ speaking: participant.speaking, pinned: isPinned(participant.id) }"
        >
          <div class="avatar-shell" :class="{ speaking: participant.speaking }">
            <span>{{ initials(participant.name) }}</span>
            <img
              v-if="participant.avatar"
              :src="participant.avatar"
              :alt="`Аватар: ${participant.name}`"
              @error="hideBrokenAvatar"
            />
            <i :class="['presence-dot', participant.audioOn ? 'online' : 'muted']"></i>
          </div>

          <div class="participant-copy">
            <strong>{{ participant.name }}</strong>
            <p>{{ participantStatus(participant) }}</p>
          </div>

          <div class="participant-actions">
            <button
              v-if="isTeacher"
              type="button"
              class="participant-action"
              :class="{ danger: participant.audioOn }"
              :aria-label="microphoneLabel(participant)"
              :title="microphoneLabel(participant)"
              @click="toggleParticipantMicrophone(participant.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 5.1 2.14M15 9V6a3 3 0 0 0-4.2-2.75M5 10v1a7 7 0 0 0 11.75 5.12M19 10v1a7 7 0 0 1-.38 2.28M12 18v3M8 21h8M3 3l18 18" />
              </svg>
            </button>
            <button
              type="button"
              class="participant-action"
              :class="{ active: isPinned(participant.id) }"
              :aria-pressed="isPinned(participant.id)"
              :aria-label="pinLabel(participant)"
              :title="pinLabel(participant)"
              @click="pinParticipant(participant.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14 4 6 6-3 1-4 4-1 5-2-2-4 4-1-1 4-4-2-2 5-1 4-4 1-3Z" />
              </svg>
            </button>
          </div>
        </article>
      </section>

      <div v-if="!hasSearchResults" class="empty-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4M8.5 11h5" />
        </svg>
        <strong>Никого не нашли</strong>
        <p>Проверьте имя или очистите поиск.</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useUserStore } from '../../stores/user';

const props = defineProps({
  participants: {
    type: Array,
    default: () => []
  },
  pinnedParticipantId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['toggle-participants', 'toggle-microphone', 'pin-participant']);
const userStore = useUserStore();
const searchQuery = ref('');

const isTeacher = computed(() => userStore.role === 'teacher');
const normalizedQuery = computed(() => searchQuery.value.toLocaleLowerCase('ru-RU'));
const filteredParticipants = computed(() => {
  if (!normalizedQuery.value) return props.participants;
  return props.participants.filter(participant =>
    String(participant.name || '').toLocaleLowerCase('ru-RU').includes(normalizedQuery.value)
  );
});
const instructor = computed(() => filteredParticipants.value.find(participant => participant.role === 'teacher'));
const filteredRaisedHands = computed(() => filteredParticipants.value.filter(
  participant => participant.role === 'student' && participant.handRaised
));
const filteredStudents = computed(() => filteredParticipants.value.filter(
  participant => participant.role === 'student' && !participant.handRaised
));
const hasSearchResults = computed(() => filteredParticipants.value.length > 0);

const initials = (name = '') => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0])
  .join('')
  .toUpperCase() || 'У';

const participantStatus = (participant) => {
  if (participant.speaking) return 'Говорит сейчас';
  if (!participant.audioOn) return 'Микрофон выключен';
  if (participant.status === 'away') return 'Отошёл';
  return 'В сети';
};

const microphoneLabel = participant => participant.audioOn
  ? `Выключить микрофон: ${participant.name}`
  : `Включить микрофон: ${participant.name}`;
const isPinned = participantId => props.pinnedParticipantId === participantId;
const pinLabel = participant => isPinned(participant.id)
  ? `Открепить: ${participant.name}`
  : `Закрепить: ${participant.name}`;

const hideBrokenAvatar = (event) => {
  event.currentTarget.hidden = true;
};
const toggleParticipantMicrophone = participantId => emit('toggle-microphone', participantId);
const pinParticipant = participantId => emit('pin-participant', participantId);
</script>

<style scoped>
.participants-panel {
  display: flex;
  width: min(100%, 340px);
  min-width: 300px;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 20px;
  background:
    radial-gradient(circle at 90% 0, rgba(124, 58, 237, 0.16), transparent 34%),
    rgba(15, 23, 42, 0.92);
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.28);
  backdrop-filter: blur(18px);
}

.participants-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.eyebrow {
  margin: 0 0 2px;
  color: #a78bfa;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.participants-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 750;
}

.participants-header h3 span,
.participant-group h4 span {
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.icon-button,
.clear-search,
.participant-action {
  display: inline-grid;
  place-items: center;
  border: 0;
  color: #94a3b8;
  cursor: pointer;
}

.icon-button {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: rgba(148, 163, 184, 0.08);
  transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.icon-button:hover {
  color: #fff;
  background: rgba(148, 163, 184, 0.16);
  transform: rotate(4deg);
}

.icon-button svg,
.clear-search svg,
.participant-action svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.search-wrap {
  position: relative;
  margin: 14px 14px 10px;
}

.search-wrap > svg {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 13px;
  width: 17px;
  height: 17px;
  color: #64748b;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  transform: translateY(-50%);
  pointer-events: none;
}

.search-wrap input {
  width: 100%;
  height: 42px;
  padding: 0 40px 0 40px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 13px;
  outline: none;
  color: #f8fafc;
  background: rgba(2, 6, 23, 0.42);
  transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
}

.search-wrap input::placeholder {
  color: #64748b;
}

.search-wrap input:focus {
  border-color: rgba(139, 92, 246, 0.72);
  background: rgba(2, 6, 23, 0.66);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.14);
}

.clear-search {
  position: absolute;
  top: 50%;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: transparent;
  transform: translateY(-50%);
}

.clear-search:hover {
  color: #fff;
  background: rgba(148, 163, 184, 0.1);
}

.participants-scroll {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 4px 10px 14px;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
}

.participants-scroll::-webkit-scrollbar {
  width: 6px;
}

.participants-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.3);
}

.participant-group + .participant-group {
  margin-top: 18px;
}

.participant-group h4 {
  margin: 0 8px 7px;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.raised-group h4 {
  color: #fbbf24;
}

.participant-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 62px;
  padding: 9px 8px;
  border: 1px solid transparent;
  border-radius: 14px;
  transition: border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.participant-card:hover,
.participant-card:focus-within {
  border-color: rgba(148, 163, 184, 0.12);
  background: rgba(148, 163, 184, 0.07);
  transform: translateX(2px);
}

.participant-card.speaking {
  border-color: rgba(52, 211, 153, 0.24);
  background: rgba(16, 185, 129, 0.08);
}

.participant-card.pinned {
  border-color: rgba(167, 139, 250, 0.3);
  background: rgba(124, 58, 237, 0.09);
}

.avatar-shell {
  position: relative;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 2px solid rgba(148, 163, 184, 0.12);
  border-radius: 13px;
  color: #ddd6fe;
  background: linear-gradient(135deg, #4c1d95, #1d4ed8);
  font-size: 12px;
  font-weight: 800;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.avatar-shell.speaking {
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.13);
}

.avatar-shell img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 11px;
  object-fit: cover;
}

.presence-dot {
  position: absolute;
  z-index: 2;
  right: -2px;
  bottom: -2px;
  width: 10px;
  height: 10px;
  border: 2px solid #0f172a;
  border-radius: 999px;
}

.presence-dot.online {
  background: #34d399;
}

.presence-dot.muted {
  background: #fb7185;
}

.participant-copy {
  min-width: 0;
}

.participant-copy strong {
  display: block;
  overflow: hidden;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.participant-copy p {
  margin: 3px 0 0;
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.participant-card.speaking .participant-copy p {
  color: #6ee7b7;
}

.participant-name-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.participant-name-row strong {
  min-width: 0;
}

.role-badge {
  flex: none;
  padding: 2px 5px;
  border-radius: 6px;
  color: #c4b5fd;
  background: rgba(124, 58, 237, 0.2);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.raised-hand {
  width: 15px;
  height: 15px;
  flex: none;
  fill: none;
  stroke: #fbbf24;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.participant-actions {
  display: flex;
  gap: 4px;
}

.participant-action {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: rgba(148, 163, 184, 0.07);
  transition: color 150ms ease, background-color 150ms ease, transform 150ms ease;
}

.participant-action:hover {
  color: #fff;
  background: rgba(148, 163, 184, 0.16);
  transform: translateY(-1px);
}

.participant-action.danger:hover {
  color: #fecdd3;
  background: rgba(244, 63, 94, 0.16);
}

.participant-action.active {
  color: #ddd6fe;
  background: rgba(124, 58, 237, 0.24);
}

.empty-search {
  display: grid;
  min-height: 180px;
  place-items: center;
  align-content: center;
  padding: 24px;
  color: #64748b;
  text-align: center;
}

.empty-search svg {
  width: 34px;
  height: 34px;
  margin-bottom: 10px;
  fill: none;
  stroke: #7c3aed;
  stroke-width: 1.5;
}

.empty-search strong {
  color: #cbd5e1;
  font-size: 13px;
}

.empty-search p {
  margin: 4px 0 0;
  font-size: 11px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid #a78bfa;
  outline-offset: 2px;
}

@media (max-width: 1180px) {
  .participants-panel {
    width: 100%;
    min-width: 0;
    max-height: 460px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .participant-card,
  .participant-action,
  .icon-button {
    transition: none;
  }
}
</style>
