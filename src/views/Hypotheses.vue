<template>
  <div class="page hypotheses-view">
    <PageHeader
      :eyebrow="t('hypothesesPage.eyebrow')"
      :title="t('hypothesesPage.title')"
      :subtitle="t('hypothesesPage.subtitle')"
    >
      <template #actions>
        <button
          v-if="assistantAvailable"
          type="button"
          class="btn-assistant"
          :title="t('hypothesesPage.assistant.open')"
          @click="assistantOpen = true"
        >
          <svg
            class="btn-assistant__icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {{ t('hypothesesPage.assistant.open') }}
          <span
            v-if="assistantHistoryCount > 0"
            class="btn-assistant__dot"
            :title="t('hypothesesPage.assistant.hasHistory')"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="btn-regenerate"
          :disabled="isRegenerating || journalEntries.length === 0 || !aiActive"
          :title="generateButtonTitle"
          @click="onRegenerateInsights"
        >
          {{ generateButtonLabel }}
        </button>
      </template>
    </PageHeader>

    <div
      v-if="aiActive"
      class="page-banner page-banner--info ai-banner"
      role="status"
    >
      {{ t('aiInsights.banner') }}
    </div>

    <div
      v-if="regenerateSlowHint"
      class="page-banner page-banner--info regenerate-slow-hint"
      role="status"
    >
      {{ t('hypothesesPage.regenerateSlowHint') }}
    </div>

    <div
      v-if="regenerateMessage"
      class="page-banner regenerate-feedback"
      :class="`page-banner--${regenerateBannerVariant}`"
      role="status"
    >
      {{ regenerateMessage }}
    </div>

    <HypothesisAssistantDrawer
      v-if="assistantAvailable"
      v-model:open="assistantOpen"
      :hypotheses="hypotheses"
      :journal-entries="journalEntries"
      @history-updated="assistantHistoryCount = $event"
    />

    <div
      v-if="isRegenerating && !hasGeneratedInsights"
      class="page-loading"
    >
      {{ t('hypothesesPage.regenerating') }}
    </div>

    <div
      v-else-if="!hasGeneratedInsights && !isRegenerating"
      class="page-empty page-empty--generate"
    >
      <span class="page-empty__title">{{ t('hypothesesPage.notGeneratedTitle') }}</span>
      <p>{{ t('hypothesesPage.notGeneratedText') }}</p>
      <button
        type="button"
        class="btn-regenerate btn-regenerate--cta"
        :disabled="journalEntries.length === 0 || !aiActive"
        @click="onRegenerateInsights"
      >
        {{ t('hypothesesPage.generate') }}
      </button>
      <p v-if="journalEntries.length === 0" class="page-empty__hint">
        {{ t('hypothesesPage.regenerateMessages.needEntries') }}
      </p>
    </div>

    <section
      v-else-if="hasGeneratedInsights || isRegenerating"
      class="tab-panel page-panel"
      aria-label="Hypotheses"
    >
      <div v-if="hypotheses.length === 0" class="page-empty">
        <span class="page-empty__title">{{ t('hypothesesPage.noHypothesesTitle') }}</span>
        <p>
          {{ t('hypothesesPage.noHypothesesText') }}
        </p>
        <router-link to="/" class="link-cta">{{ t('common.goToDashboard') }}</router-link>
      </div>

      <div v-else class="hypotheses-container">
        <HypothesisCard
          v-for="hypothesis in hypotheses"
          :key="hypothesis.id"
          :hypothesis="hypothesis"
          :journal-entries="journalEntries"
          :patient="patient"
        />
      </div>
    </section>

    <ConfirmDialog
      v-model:open="regenerateConfirmOpen"
      :title="t('hypothesesPage.regenerateConfirmTitle')"
      :message="t('hypothesesPage.regenerateConfirmMessage')"
      :confirm-label="t('hypothesesPage.regenerateConfirmAction')"
      :cancel-label="t('common.cancel')"
      variant="primary"
      @confirm="confirmRegenerateInsights"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import HypothesisCard from '@/components/HypothesisCard.vue'
import HypothesisAssistantDrawer from '@/components/hypotheses/HypothesisAssistantDrawer.vue'
import { countHypothesisAssistantMessages } from '@/api/hypothesisAssistantApi'
import { getHypotheses } from '@/api/mockApi'
import { useAiInsights } from '@/composables/useAiInsights'
import { useInsightsRegenerationMessages } from '@/composables/useInsightsRegenerationMessages'
import {
  getInsightsCache,
  invalidateInsightsCache,
  isInsightsCacheValid,
  setInsightsCache,
  type InsightsCacheSnapshot,
} from '@/composables/useInsightsCache'
import {
  INSIGHTS_REGENERATED_EVENT,
  runInsightsRegeneration,
  useInsightsRegeneration,
  type InsightsRegeneratedDetail,
} from '@/services/insightsRegeneration'
import { consolidateHypothesesForDisplay } from '@/services/hypothesisDisplay'
import { getHealthEntries } from '@/api/healthApi'
import { getPatientProfile } from '@/api/patientApi'
import type { HealthEntry, Hypothesis, PatientProfile } from '@/models/types'
import type { RegenerateInsightsResult } from '@/api/hypothesisApi'

const { t } = useI18n()
const { active: aiActive, available: assistantAvailable } = useAiInsights()
const { isRunning: isRegenerating } = useInsightsRegeneration()
const regenerationMessages = useInsightsRegenerationMessages()

const hypotheses = ref<Hypothesis[]>([])
const journalEntries = ref<HealthEntry[]>([])
const patient = ref<PatientProfile | null>(null)
const regenerateMessage = ref('')
const regenerateMessageType = ref<'success' | 'error' | 'info'>('success')
const regenerateSlowHint = ref(false)
const regenerateConfirmOpen = ref(false)
const assistantOpen = ref(false)
const assistantHistoryCount = ref(0)

function formatRegenerateMessage(result: RegenerateInsightsResult): string {
  const params = {
    hypothesisCount: result.hypothesisCount,
    journalEntryCount: result.journalEntryCount,
    areaCount: result.areas.length,
  }
  return t(`hypothesesPage.regenerateMessages.${result.messageKey}`, params)
}

const hasGeneratedInsights = computed(() =>
  hypotheses.value.some((h) => Boolean(h.aiInsight))
)

const generateButtonLabel = computed(() => {
  if (isRegenerating.value) return t('hypothesesPage.regenerating')
  return hasGeneratedInsights.value
    ? t('hypothesesPage.regenerate')
    : t('hypothesesPage.generate')
})

const generateButtonTitle = computed(() => {
  if (journalEntries.value.length === 0) {
    return t('hypothesesPage.regenerateTitleEmpty')
  }
  return hasGeneratedInsights.value
    ? t('hypothesesPage.regenerateTitle')
    : t('hypothesesPage.generateTitle')
})

const regenerateBannerVariant = computed(() => {
  const type = regenerateMessageType.value
  if (type === 'success') return 'success'
  if (type === 'error') return 'error'
  return 'info'
})

function applyCache(cached: InsightsCacheSnapshot) {
  hypotheses.value = cached.hypotheses
  journalEntries.value = cached.journalEntries
  patient.value = cached.patient
}

async function loadPageState(): Promise<void> {
  const [hyps, entries, profile] = await Promise.all([
    getHypotheses(),
    getHealthEntries(),
    getPatientProfile(),
  ])
  const displayHyps = consolidateHypothesesForDisplay(hyps)
  hypotheses.value = displayHyps
  journalEntries.value = entries
  patient.value = profile

  if (displayHyps.length > 0) {
    setInsightsCache({
      hypotheses: displayHyps,
      journalEntries: entries,
      patient: profile,
    })
  }
}

function clearInsightsDisplay() {
  hypotheses.value = []
  regenerateSlowHint.value = false
  regenerateMessage.value = ''
}

function applyRegeneratedDetail(detail: InsightsRegeneratedDetail) {
  applyCache(detail.snapshot)
  regenerateSlowHint.value = false
  regenerateMessageType.value =
    detail.result.hypothesisCount > 0 ? 'success' : 'info'
  regenerateMessage.value = formatRegenerateMessage(detail.result)
}

function onInsightsRegenerated(event: Event) {
  const detail = (event as CustomEvent<InsightsRegeneratedDetail>).detail
  if (!detail) return
  applyRegeneratedDetail(detail)
}

function startBackgroundRegeneration() {
  void runInsightsRegeneration({
    messages: regenerationMessages,
    onCleared: clearInsightsDisplay,
    onSlow: () => {
      regenerateSlowHint.value = true
    },
    onComplete: applyRegeneratedDetail,
    onError: () => {
      regenerateSlowHint.value = false
      void loadPageState()
    },
  })
}

function onInsightsCleared() {
  clearInsightsDisplay()
}

function onRegenerationSlow() {
  regenerateSlowHint.value = true
}

onMounted(async () => {
  window.addEventListener('monday-insights-cleared', onInsightsCleared)
  window.addEventListener('monday-insights-regeneration-slow', onRegenerationSlow)
  window.addEventListener(INSIGHTS_REGENERATED_EVENT, onInsightsRegenerated as EventListener)

  const entries = await getHealthEntries()
  journalEntries.value = entries

  if (assistantAvailable.value) {
    assistantHistoryCount.value = await countHypothesisAssistantMessages()
  }

  const cached = getInsightsCache()
  if (cached && isInsightsCacheValid(cached, entries) && cached.hypotheses.length > 0) {
    applyCache(cached)
  } else {
    if (cached) invalidateInsightsCache()
    await loadPageState()
  }
})

onUnmounted(() => {
  window.removeEventListener('monday-insights-cleared', onInsightsCleared)
  window.removeEventListener('monday-insights-regeneration-slow', onRegenerationSlow)
  window.removeEventListener(
    INSIGHTS_REGENERATED_EVENT,
    onInsightsRegenerated as EventListener
  )
})

function onRegenerateInsights() {
  if (isRegenerating.value) return

  if (hypotheses.value.length > 0) {
    regenerateConfirmOpen.value = true
    return
  }

  startBackgroundRegeneration()
}

function confirmRegenerateInsights() {
  startBackgroundRegeneration()
}
</script>

<style scoped>
.regenerate-feedback {
  margin: -0.5rem 0 1.25rem;
}

.btn-assistant {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  padding: 0.65rem 1rem;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  background: var(--bg-surface);
  color: var(--text-primary);
  font-family: inherit;
  white-space: nowrap;
}

.btn-assistant:hover {
  border-color: var(--accent-strong);
  color: var(--accent-strong);
}

.btn-assistant__icon {
  flex-shrink: 0;
  opacity: 0.85;
}

.btn-assistant__dot {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--accent-strong);
  box-shadow: 0 0 0 2px var(--bg-surface);
}

.btn-regenerate {
  flex-shrink: 0;
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  background: var(--accent-strong);
  color: #fff;
  font-family: inherit;
  white-space: nowrap;
}

.btn-regenerate:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-regenerate:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-regenerate--cta {
  margin-top: 0.75rem;
}

.hypotheses-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.regenerate-slow-hint {
  margin-bottom: 1rem;
}

.ai-banner {
  margin-bottom: 1rem;
}
</style>
