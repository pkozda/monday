<template>
  <div id="app">
    <div class="app-bg" aria-hidden="true" :style="bgStyle" />

    <AppHeader />
    <main class="app-main">
      <router-view />
    </main>

    <ToastStack />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInsightsRegenerationMessages } from '@/composables/useInsightsRegenerationMessages'
import { runInsightsRegeneration } from '@/services/insightsRegeneration'
import { pushToast } from '@/composables/useNotifications'
import AppHeader from '@/components/nav/AppHeader.vue'
import ToastStack from '@/components/notifications/ToastStack.vue'

const { t } = useI18n()
import backgroundUrl from '@assets/background.png'

const bgStyle = computed(() => ({
  '--app-bg-image': `url(${backgroundUrl})`,
}))

const regenerationMessages = useInsightsRegenerationMessages()

function handleTranslationSkipped() {
  pushToast({
    kind: 'warning',
    title: t('translation.skippedTitle'),
    message: t('translation.skippedMessage'),
    durationMs: 10_000,
  })
}

function handleGlobalInsightsRegeneration() {
  void runInsightsRegeneration({
    messages: regenerationMessages,
    onCleared: () => {
      window.dispatchEvent(new CustomEvent('monday-insights-cleared'))
    },
    onSlow: () => {
      window.dispatchEvent(new CustomEvent('monday-insights-regeneration-slow'))
    },
  })
}

onMounted(() => {
  window.addEventListener('monday-ai-insights-changed', handleGlobalInsightsRegeneration)
  window.addEventListener('monday-translation-skipped', handleTranslationSkipped)
})

onUnmounted(() => {
  window.removeEventListener('monday-ai-insights-changed', handleGlobalInsightsRegeneration)
  window.removeEventListener('monday-translation-skipped', handleTranslationSkipped)
})
</script>

<style>
@import '@/styles/themes.css';
@import '@/styles/page-layout.css';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg-page);
  color: var(--text-primary);
  line-height: 1.5;
  transition: color 0.2s;
  min-height: 100vh;
}

#app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: linear-gradient(var(--bg-overlay), var(--bg-overlay)),
    var(--app-bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.3s ease;
}

.app-main {
  position: relative;
  z-index: 1;
  flex: 1;
}

.app-main {
  padding: 2rem 0;
}

</style>
