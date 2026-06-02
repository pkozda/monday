import { computed, ref } from 'vue'
import { getAppLocale } from '@/i18n'
import {
  clearHypothesisAssistantMessages,
  getHypothesisAssistantMessages,
  saveHypothesisAssistantMessages,
} from '@/api/hypothesisAssistantApi'
import { isLlmProxyConfigured, shouldUseAiInsights } from '@/services/llm/config'
import {
  sendHypothesisAssistantMessage,
  type HypothesisAssistantTurn,
} from '@/services/llm/aiHypothesisAssistant'
import { LlmError } from '@/services/llm/llmClient'
import type { HealthEntry, Hypothesis, HypothesisAssistantMessage } from '@/models/types'

export type AssistantChatMessage = HypothesisAssistantMessage

function createMessage(role: 'user' | 'assistant', content: string): AssistantChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

export function useHypothesisAssistantChat(
  getHypotheses: () => Hypothesis[],
  getJournalEntries: () => HealthEntry[]
) {
  const messages = ref<AssistantChatMessage[]>([])
  const draft = ref('')
  const loading = ref(false)
  const error = ref('')
  const historyLoaded = ref(false)
  let requestId = 0

  const llmConfigured = computed(() => isLlmProxyConfigured())
  const aiActive = computed(() => shouldUseAiInsights())
  const canSend = computed(
    () =>
      llmConfigured.value &&
      aiActive.value &&
      getJournalEntries().length > 0 &&
      draft.value.trim().length > 0 &&
      !loading.value
  )

  async function persistHistory() {
    if (!historyLoaded.value) return
    await saveHypothesisAssistantMessages(messages.value)
  }

  async function loadHistory() {
    messages.value = await getHypothesisAssistantMessages()
    historyLoaded.value = true
  }

  async function clearConversation() {
    if (loading.value) return
    messages.value = []
    error.value = ''
    draft.value = ''
    historyLoaded.value = true
    await clearHypothesisAssistantMessages()
  }

  async function sendMessage(text?: string) {
    const content = (text ?? draft.value).trim()
    if (!content || loading.value) return
    if (!llmConfigured.value || !aiActive.value) return
    if (getJournalEntries().length === 0) return

    if (!historyLoaded.value) {
      await loadHistory()
    }

    const userMsg = createMessage('user', content)
    messages.value = [...messages.value, userMsg]
    draft.value = ''
    error.value = ''
    await persistHistory()

    const history: HypothesisAssistantTurn[] = messages.value
      .slice(0, -1)
      .map((m) => ({ role: m.role, content: m.content }))

    const id = ++requestId
    loading.value = true

    try {
      const reply = await sendHypothesisAssistantMessage(
        content,
        history,
        getHypotheses(),
        getJournalEntries(),
        getAppLocale()
      )
      if (id !== requestId) return
      messages.value = [...messages.value, createMessage('assistant', reply)]
      await persistHistory()
    } catch (err) {
      if (id !== requestId) return
      if (err instanceof LlmError) {
        error.value = err.message
      } else if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Request failed.'
      }
    } finally {
      if (id === requestId) {
        loading.value = false
      }
    }
  }

  return {
    messages,
    draft,
    loading,
    error,
    historyLoaded,
    llmConfigured,
    aiActive,
    canSend,
    loadHistory,
    sendMessage,
    clearConversation,
  }
}
