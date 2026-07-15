<template>
  <section class="stream-page">
    <div class="stream-stage">
      <div class="stream-topline"><span :class="['live-indicator', { active: streamStore.isLive }]">{{ streamStore.isLive ? 'В ЭФИРЕ' : 'ГОТОВО К ЭФИРУ' }}</span><span>{{ streamStore.currentStream.viewerCount }} зрителей</span></div>
      <div class="video-placeholder">
        <div class="play-orbit">{{ streamStore.isLive ? 'LIVE' : '▶' }}</div>
        <h1>{{ streamStore.currentStream.title }}</h1>
        <p>{{ streamStore.isLive ? 'Трансляция идёт. Управляйте эфиром и общайтесь с группой.' : 'Проверьте настройки перед началом занятия.' }}</p>
      </div>
      <div class="stream-controls">
        <button type="button" @click="streamStore.toggleMicrophone()">{{ streamStore.isMicrophoneOn ? 'Микрофон включён' : 'Микрофон выключен' }}</button>
        <button type="button" @click="streamStore.toggleCamera()">{{ streamStore.isCameraOn ? 'Камера включена' : 'Камера выключена' }}</button>
        <button type="button" @click="streamStore.toggleScreenSharing()">{{ streamStore.isScreenSharing ? 'Остановить показ' : 'Показать экран' }}</button>
        <button :class="streamStore.isLive ? 'end-button' : 'start-button'" type="button" @click="toggleLive">{{ streamStore.isLive ? 'Завершить эфир' : 'Начать эфир' }}</button>
      </div>
    </div>
    <aside class="stream-sidebar">
      <div class="participants"><h2>Участники <span>{{ streamStore.participants.length }}</span></h2><div v-for="person in streamStore.participants" :key="person.id" class="participant"><span>{{ initials(person.name) }}</span><div><strong>{{ person.name }}</strong><small>{{ person.role === 'teacher' ? 'Преподаватель' : person.handRaised ? 'Поднята рука' : 'В сети' }}</small></div><i :class="{ speaking: person.speaking }"></i></div></div>
      <div class="stream-chat"><MessageContainer /></div>
    </aside>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import MessageContainer from '../components/chat/MessageContainer.vue'
import { useStreamStore } from '../stores/stream'

const streamStore = useStreamStore()
onMounted(() => streamStore.resumeViewerCountTimer())
onUnmounted(() => streamStore.stopViewerCountTimer())
function toggleLive() { streamStore.isLive ? streamStore.stopStream() : streamStore.startStream() }
function initials(name) { return String(name || 'Участник').split(' ').map(part => part[0]).slice(0, 2).join('') }
</script>

<style scoped>
.stream-page { display: grid; min-height: calc(100vh - 4.5rem); grid-template-columns: minmax(0, 1fr) minmax(300px, 370px); background: var(--bg-primary); }.stream-stage { display: flex; min-width: 0; flex-direction: column; padding: clamp(1rem, 2.4vw, 2rem); }.stream-topline { display: flex; justify-content: space-between; align-items: center; margin-bottom: .8rem; color: var(--text-muted); font-size: .85rem; }.live-indicator { padding: .35rem .55rem; border-radius: .45rem; color: var(--text-muted); background: var(--bg-card); font-size: .7rem; font-weight: 800; letter-spacing: .08em; }.live-indicator.active { color: #fff; background: #ef4444; box-shadow: 0 0 24px #ef444466; }.video-placeholder { display: grid; flex: 1; min-height: 360px; place-content: center; padding: 2rem; border: 1px solid var(--border-color); border-radius: 1.35rem; color: white; text-align: center; background: radial-gradient(circle at 50% 35%, #5557ff 0, #202863 28%, #10162d 70%); overflow: hidden; }.play-orbit { display: grid; width: 5rem; height: 5rem; margin: 0 auto 1.2rem; place-items: center; border: 1px solid #ffffff55; border-radius: 50%; background: #ffffff1a; box-shadow: 0 0 0 15px #ffffff0c, 0 0 0 30px #ffffff08; font-weight: 800; }.video-placeholder h1 { margin: 0; font-size: clamp(1.4rem, 3vw, 2.2rem); }.video-placeholder p { max-width: 460px; margin: .8rem auto 0; color: #d5d9ff; }.stream-controls { display: flex; flex-wrap: wrap; gap: .65rem; padding-top: 1rem; }.stream-controls button { padding: .7rem .85rem; border: 1px solid var(--border-color); border-radius: .75rem; color: var(--text-primary); background: var(--bg-card); cursor: pointer; }.stream-controls .start-button { border-color: transparent; color: #fff; background: linear-gradient(135deg, #4f46e5, #8b5cf6); }.stream-controls .end-button { border-color: transparent; color: #fff; background: #e11d48; }.stream-sidebar { display: flex; min-height: 0; flex-direction: column; border-left: 1px solid var(--border-color); background: var(--bg-secondary); }.participants { padding: 1.2rem; }.participants h2 { margin: 0 0 .9rem; font-size: 1rem; }.participants h2 span { color: var(--text-muted); font-weight: 500; }.participant { display: flex; gap: .65rem; align-items: center; padding: .45rem 0; }.participant > span { display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: 50%; color: #fff; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); font-size: .68rem; font-weight: 800; }.participant strong, .participant small { display: block; }.participant small { margin-top: .15rem; color: var(--text-muted); font-size: .72rem; }.participant i { width: .45rem; height: .45rem; margin-left: auto; border-radius: 50%; background: #64748b; }.participant i.speaking { background: #22c55e; box-shadow: 0 0 0 4px #22c55e22; }.stream-chat { min-height: 300px; flex: 1; border-top: 1px solid var(--border-color); } @media (max-width: 960px) { .stream-page { grid-template-columns: 1fr; }.stream-sidebar { border-top: 1px solid var(--border-color); border-left: 0; }.stream-chat { min-height: 420px; } }
</style>
