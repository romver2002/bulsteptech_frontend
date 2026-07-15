<template>
  <div class="app-shell">
    <div class="app-shell__ambient" aria-hidden="true">
      <span class="app-shell__glow app-shell__glow--violet" />
      <span class="app-shell__glow app-shell__glow--mint" />
      <span class="app-shell__grid" />
    </div>
    <TopBar />
    <div class="app-shell__body">
      <Sidebar />
      <main id="main-content" class="app-shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import TopBar from './TopBar.vue'
import Sidebar from './Sidebar.vue'
</script>

<style scoped>
.app-shell { position: relative; isolation: isolate; display: flex; width: 100%; height: 100dvh; min-height: 38rem; flex-direction: column; overflow: hidden; background: var(--bg-app); color: var(--text-primary); }
.app-shell__ambient { position: fixed; z-index: -1; inset: 0; overflow: hidden; pointer-events: none; }
.app-shell__glow { position: absolute; width: 32rem; height: 32rem; border-radius: 999px; filter: blur(1px); opacity: .55; }
.app-shell__glow--violet { top: -18rem; right: 8%; background: radial-gradient(circle, rgba(112,84,238,.18), rgba(112,84,238,0) 68%); }
.app-shell__glow--mint { bottom: -22rem; left: 20%; background: radial-gradient(circle, rgba(40,191,154,.09), rgba(40,191,154,0) 70%); }
.app-shell__grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.014) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.014) 1px, transparent 1px); background-size: 40px 40px; mask-image: linear-gradient(to bottom, rgba(0,0,0,.55), transparent 82%); }
.app-shell__body { position: relative; display: flex; min-height: 0; flex: 1; }
.app-shell__content { min-width: 0; flex: 1; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
@media (max-width: 640px) { .app-shell { min-height: 100dvh; } }
</style>
