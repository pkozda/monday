<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="hypothesis-assistant-drawer"
      role="presentation"
    >
      <button
        type="button"
        class="hypothesis-assistant-drawer__backdrop"
        :aria-label="t('hypothesesPage.assistant.close')"
        @click="close"
      />
      <aside
        class="hypothesis-assistant-drawer__panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="subtitleId"
      >
        <header class="hypothesis-assistant-drawer__header">
          <div class="hypothesis-assistant-drawer__heading">
            <h2 :id="titleId" class="hypothesis-assistant-drawer__title">
              {{ t('hypothesesPage.assistant.title') }}
            </h2>
            <p :id="subtitleId" class="hypothesis-assistant-drawer__subtitle">
              {{ t('hypothesesPage.assistant.subtitle') }}
            </p>
          </div>
          <div class="hypothesis-assistant-drawer__actions">
            <button
              v-if="canClear"
              type="button"
              class="hypothesis-assistant-drawer__clear"
              :disabled="clearDisabled"
              @click="onClear"
            >
              {{ t('hypothesesPage.assistant.clear') }}
            </button>
            <button
              type="button"
              class="hypothesis-assistant-drawer__close"
              :aria-label="t('hypothesesPage.assistant.close')"
              @click="close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </header>

        <HypothesisAssistantChat
          ref="chatRef"
          :active="open"
          :hypotheses="hypotheses"
          :journal-entries="journalEntries"
          @history-updated="onHistoryUpdated"
        />
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import HypothesisAssistantChat from '@/components/hypotheses/HypothesisAssistantChat.vue'
import type { HealthEntry, Hypothesis } from '@/models/types'

defineProps<{
  hypotheses: Hypothesis[]
  journalEntries: HealthEntry[]
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  'history-updated': [count: number]
}>()

const { t } = useI18n()

const titleId = `hypothesis-assistant-title-${crypto.randomUUID()}`
const subtitleId = `hypothesis-assistant-subtitle-${crypto.randomUUID()}`

const chatRef = ref<InstanceType<typeof HypothesisAssistantChat> | null>(null)
const localMessageCount = ref(0)

const canClear = computed(() => localMessageCount.value > 0)
const clearDisabled = computed(() => chatRef.value?.loading ?? false)

function close() {
  open.value = false
}

function onClear() {
  chatRef.value?.clearConversation()
}

function onHistoryUpdated(count: number) {
  localMessageCount.value = count
  emit('history-updated', count)
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

watch(
  () => open.value,
  async (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
      await nextTick()
      chatRef.value?.focusInput()
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.hypothesis-assistant-drawer {
  position: fixed;
  inset: 0;
  z-index: 240;
  display: flex;
  justify-content: flex-end;
}

.hypothesis-assistant-drawer__backdrop {
  position: absolute;
  inset: 0;
  border: none;
  padding: 0;
  margin: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  cursor: pointer;
}

.hypothesis-assistant-drawer__panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: min(24rem, 100vw);
  max-width: 100%;
  height: 100%;
  background: var(--bg-surface);
  border-left: 1px solid var(--border);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
  animation: hypothesis-assistant-slide-in 0.22s ease-out;
}

@keyframes hypothesis-assistant-slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.hypothesis-assistant-drawer__header {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
}

.hypothesis-assistant-drawer__heading {
  min-width: 0;
}

.hypothesis-assistant-drawer__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.hypothesis-assistant-drawer__subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--text-muted);
}

.hypothesis-assistant-drawer__actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
}

.hypothesis-assistant-drawer__clear {
  padding: 0.3rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.hypothesis-assistant-drawer__clear:hover:not(:disabled) {
  border-color: var(--accent-strong);
  color: var(--text-primary);
}

.hypothesis-assistant-drawer__clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hypothesis-assistant-drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
  font-family: inherit;
}

.hypothesis-assistant-drawer__close:hover {
  background: color-mix(in srgb, var(--bg-muted) 80%, transparent);
  color: var(--text-primary);
}

@media (max-width: 480px) {
  .hypothesis-assistant-drawer__panel {
    width: 100%;
    border-left: none;
  }
}
</style>
