<template>
  <div class="hypothesis-assistant">
    <p v-if="!llmConfigured" class="hypothesis-assistant__notice">
      {{ t('aiInsights.unavailable') }}
    </p>
    <p v-else-if="!aiActive" class="hypothesis-assistant__notice">
      {{ t('hypothesesPage.assistant.aiOff') }}
    </p>
    <p v-else-if="journalEntries.length === 0" class="hypothesis-assistant__notice">
      {{ t('hypothesesPage.assistant.needJournal') }}
    </p>

    <div
      ref="messagesEl"
      class="hypothesis-assistant__messages"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      <div v-if="!messages.length" class="hypothesis-assistant__empty">
        <p>{{ t('hypothesesPage.assistant.emptyHint') }}</p>
        <div class="hypothesis-assistant__starters">
          <button
            v-for="prompt in starterPrompts"
            :key="prompt"
            type="button"
            class="hypothesis-assistant__starter"
            :disabled="!aiActive || journalEntries.length === 0 || loading"
            @click="sendMessage(prompt)"
          >
            {{ prompt }}
          </button>
        </div>
      </div>

      <article
        v-for="message in messages"
        :key="message.id"
        class="hypothesis-assistant__message"
        :class="`hypothesis-assistant__message--${message.role}`"
      >
        <p class="hypothesis-assistant__message-label">
          {{
            message.role === 'user'
              ? t('hypothesesPage.assistant.you')
              : t('hypothesesPage.assistant.assistant')
          }}
        </p>
        <div class="hypothesis-assistant__bubble">{{ message.content }}</div>
      </article>

      <article
        v-if="loading"
        class="hypothesis-assistant__message hypothesis-assistant__message--assistant"
        aria-busy="true"
      >
        <p class="hypothesis-assistant__message-label">
          {{ t('hypothesesPage.assistant.assistant') }}
        </p>
        <div class="hypothesis-assistant__bubble hypothesis-assistant__bubble--typing">
          <span class="hypothesis-assistant__typing" aria-hidden="true" />
          {{ t('hypothesesPage.assistant.thinking') }}
        </div>
      </article>
    </div>

    <p v-if="error" class="hypothesis-assistant__error" role="alert">
      {{ error }}
    </p>

    <form class="hypothesis-assistant__composer" @submit.prevent="onSubmit">
      <label class="visually-hidden" for="hypothesis-assistant-input">
        {{ t('hypothesesPage.assistant.inputLabel') }}
      </label>
      <textarea
        id="hypothesis-assistant-input"
        ref="inputEl"
        v-model="draft"
        class="hypothesis-assistant__input"
        rows="2"
        :placeholder="t('hypothesesPage.assistant.placeholder')"
        :disabled="!aiActive || journalEntries.length === 0 || loading || !llmConfigured"
        @keydown="onInputKeydown"
      />
      <button
        type="submit"
        class="hypothesis-assistant__send"
        :disabled="!canSend"
        :aria-label="t('hypothesesPage.assistant.send')"
      >
        {{ t('hypothesesPage.assistant.send') }}
      </button>
    </form>

    <p class="hypothesis-assistant__disclaimer">
      {{ t('hypothesesPage.assistant.disclaimer') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHypothesisAssistantChat } from '@/composables/useHypothesisAssistantChat'
import type { HealthEntry, Hypothesis } from '@/models/types'

const props = defineProps<{
  active?: boolean
  hypotheses: Hypothesis[]
  journalEntries: HealthEntry[]
}>()

const emit = defineEmits<{
  'history-updated': [count: number]
}>()

const { t, tm } = useI18n()

const hypothesesRef = toRef(props, 'hypotheses')
const journalRef = toRef(props, 'journalEntries')

const {
  messages,
  draft,
  loading,
  error,
  llmConfigured,
  aiActive,
  canSend,
  loadHistory,
  sendMessage,
  clearConversation,
} = useHypothesisAssistantChat(
  () => hypothesesRef.value,
  () => journalRef.value
)

const messagesEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)

const messageCount = computed(() => messages.value.length)

const starterPrompts = computed(() => {
  const raw = tm('hypothesesPage.assistant.starters')
  return Array.isArray(raw) ? raw.map(String) : []
})

function scrollToBottom() {
  const el = messagesEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

watch(
  () => props.active,
  (isActive) => {
    if (isActive) {
      void loadHistory().then(() => {
        emit('history-updated', messages.value.length)
      })
    }
  },
  { immediate: true }
)

watch(
  () => messages.value.length,
  (count) => {
    emit('history-updated', count)
  }
)

watch(
  () => [messages.value.length, loading.value] as const,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

function onSubmit() {
  void sendMessage()
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey) return
  event.preventDefault()
  if (!canSend.value) return
  void sendMessage()
}

function focusInput() {
  inputEl.value?.focus()
}

defineExpose({
  messageCount,
  loading,
  clearConversation,
  focusInput,
})
</script>

<style scoped>
.hypothesis-assistant {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 0.65rem;
  padding: 0 1rem 1rem;
}

.hypothesis-assistant__notice {
  margin: 0;
  padding: 0.55rem 0.7rem;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--text-muted);
  background: color-mix(in srgb, var(--bg-muted) 70%, var(--bg-surface));
  border-radius: 8px;
}

.hypothesis-assistant__messages {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.65rem 0.1rem;
}

.hypothesis-assistant__empty {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.5;
}

.hypothesis-assistant__starters {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.hypothesis-assistant__starter {
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 0.78rem;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}

.hypothesis-assistant__starter:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--accent-strong) 40%, var(--border));
  color: var(--text-primary);
}

.hypothesis-assistant__starter:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hypothesis-assistant__message {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  max-width: 95%;
}

.hypothesis-assistant__message--user {
  align-self: flex-end;
  align-items: flex-end;
}

.hypothesis-assistant__message--assistant {
  align-self: flex-start;
}

.hypothesis-assistant__message-label {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.hypothesis-assistant__bubble {
  margin: 0;
  padding: 0.55rem 0.75rem;
  border-radius: 12px;
  font-size: 0.86rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.hypothesis-assistant__message--user .hypothesis-assistant__bubble {
  background: color-mix(in srgb, var(--accent-strong) 14%, var(--bg-surface));
  border: 1px solid color-mix(in srgb, var(--accent-strong) 28%, var(--border));
  color: var(--text-primary);
  border-bottom-right-radius: 4px;
}

.hypothesis-assistant__message--assistant .hypothesis-assistant__bubble {
  background: color-mix(in srgb, var(--bg-muted) 50%, var(--bg-surface));
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}

.hypothesis-assistant__bubble--typing {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--text-muted);
}

.hypothesis-assistant__typing {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--accent-strong);
  animation: assistant-pulse 1s ease-in-out infinite;
}

@keyframes assistant-pulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.hypothesis-assistant__error {
  margin: 0;
  font-size: 0.82rem;
  color: var(--error-text, #c62828);
}

.hypothesis-assistant__composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  align-items: end;
  flex-shrink: 0;
}

.hypothesis-assistant__input {
  width: 100%;
  min-height: 2.5rem;
  max-height: 6rem;
  padding: 0.5rem 0.65rem;
  resize: vertical;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 0.86rem;
  line-height: 1.45;
  font-family: inherit;
  box-sizing: border-box;
}

.hypothesis-assistant__input:focus-visible {
  outline: none;
  border-color: var(--accent-strong);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-strong) 18%, transparent);
}

.hypothesis-assistant__input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.hypothesis-assistant__send {
  padding: 0.5rem 0.85rem;
  border: none;
  border-radius: 8px;
  background: var(--accent-strong);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.hypothesis-assistant__send:hover:not(:disabled) {
  background: var(--accent-hover);
}

.hypothesis-assistant__send:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hypothesis-assistant__disclaimer {
  margin: 0;
  flex-shrink: 0;
  font-size: 0.68rem;
  line-height: 1.4;
  color: var(--text-faint);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 480px) {
  .hypothesis-assistant__composer {
    grid-template-columns: 1fr;
  }

  .hypothesis-assistant__send {
    width: 100%;
  }

  .hypothesis-assistant__message {
    max-width: 100%;
  }
}
</style>
