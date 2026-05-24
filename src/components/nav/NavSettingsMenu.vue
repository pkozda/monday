<template>
  <div ref="rootRef" class="nav-settings">
    <NavIconButton
      :aria-label="t('nav.settings')"
      :aria-expanded="open"
      :active="open"
      :title="t('nav.settings')"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
          stroke="currentColor"
          stroke-width="1.75"
        />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </NavIconButton>

    <div
      v-if="open"
      class="nav-settings__panel"
      role="dialog"
      :aria-label="t('nav.preferences')"
    >
      <header class="nav-settings__header">
        <h2 class="nav-settings__title">{{ t('nav.preferences') }}</h2>
      </header>

      <div class="nav-settings__body">
        <section class="nav-settings__section">
          <ThemeToggle layout="menu" />
        </section>

        <section class="nav-settings__section">
          <p class="nav-settings__section-label">{{ t('language.label') }}</p>
          <LanguageSwitcher layout="menu" />
        </section>

        <section v-if="aiAvailable" class="nav-settings__section">
          <AiInsightsToggle layout="menu" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AiInsightsToggle from '@/components/AiInsightsToggle.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import NavIconButton from '@/components/nav/NavIconButton.vue'
import { useAiInsights } from '@/composables/useAiInsights'

const { t } = useI18n()
const { available: aiAvailable } = useAiInsights()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function onDocumentClick(event: MouseEvent) {
  if (!open.value || !rootRef.value) return
  if (!rootRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.nav-settings {
  position: relative;
}

.nav-settings__panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: min(300px, calc(100vw - 2rem));
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  background: var(--bg-surface);
  box-shadow: 0 12px 40px var(--shadow);
  z-index: 200;
  overflow: hidden;
}

.nav-settings__header {
  padding: 0.85rem 1rem 0.65rem;
  border-bottom: 1px solid var(--border);
}

.nav-settings__title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-settings__body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0;
}

.nav-settings__section {
  padding: 0.55rem 1rem;
}

.nav-settings__section + .nav-settings__section {
  border-top: 1px solid var(--border);
}

.nav-settings__section-label {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}
</style>
