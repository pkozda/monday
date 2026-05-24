<template>
  <div class="page hypotheses-view">
    <PageHeader
      :eyebrow="t('hypothesesPage.eyebrow')"
      :title="t('hypothesesPage.title')"
      :subtitle="t('hypothesesPage.subtitle')"
    >
      <template #actions>
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

    <template v-else-if="hasGeneratedInsights || isRegenerating">
      <div class="hypotheses-tabs page-panel page-panel--compact" role="tablist" aria-label="Hypotheses and diagnoses">
        <button
          type="button"
          role="tab"
          class="hypotheses-tab"
          :class="{ 'hypotheses-tab--active': activeTab === 'diagnoses' }"
          :aria-selected="activeTab === 'diagnoses'"
          @click="activeTab = 'diagnoses'"
        >
          {{ t('hypothesesPage.tabDiagnoses') }}
          <span v-if="diagnosisReports.length" class="tab-count">{{
            diagnosisReports.length
          }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="hypotheses-tab"
          :class="{ 'hypotheses-tab--active': activeTab === 'hypotheses' }"
          :aria-selected="activeTab === 'hypotheses'"
          @click="activeTab = 'hypotheses'"
        >
          {{ t('hypothesesPage.tabHypotheses') }}
          <span v-if="hypotheses.length" class="tab-count">{{ hypotheses.length }}</span>
        </button>
      </div>

      <div
        v-show="activeTab === 'diagnoses'"
        role="tabpanel"
        class="tab-panel page-panel"
        aria-label="Diagnoses"
      >
        <DiagnosisPanel
          :reports="diagnosisReports"
          :journal-entries="journalEntries"
          :loading="diagnosisEmptyState?.loading ?? false"
          :refreshing="diagnosesRefreshing || isRegenerating"
          :diagnosis-mode="diagnosisMode"
          :empty-title="diagnosisEmptyState?.title"
          :empty-hint="diagnosisEmptyState?.hint"
          :show-empty-action="diagnosisEmptyState?.showAction ?? false"
          :empty-action-disabled="isRegenerating || diagnosesRefreshing"
          :empty-action-label="t('diagnosis.generateAction')"
          @empty-action="generateDiagnosesOnly"
        />
      </div>

      <div
        v-show="activeTab === 'hypotheses'"
        role="tabpanel"
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
            :related-variants="relatedVariantsForHypothesis(hypothesis)"
          />
        </div>
      </div>
    </template>

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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PageHeader from '@/components/PageHeader.vue'
import HypothesisCard from '@/components/HypothesisCard.vue'
import DiagnosisPanel from '@/components/DiagnosisPanel.vue'
import { getHypotheses } from '@/api/mockApi'
import { generateDiagnosisReports } from '@/api/diagnosisApi'
import { getStoredClinicalInsights } from '@/api/diagnosisStorageApi'
import { enrichAiDiagnosisReports } from '@/services/llm/aiDiagnosisJournalSupport'
import { fillJournalLinkExplanations } from '@/services/llm/aiDiagnosisJournalLinks'
import { saveDiagnosisReports } from '@/api/diagnosisStorageApi'
import { useAiInsights } from '@/composables/useAiInsights'
import { useInsightsRegenerationMessages } from '@/composables/useInsightsRegenerationMessages'
import {
  getInsightsCache,
  invalidateInsightsCache,
  isInsightsCacheValid,
  setInsightsCache,
  type InsightsCacheSnapshot,
} from '@/composables/useInsightsCache'
import { shouldUseAiInsights } from '@/services/llm/config'
import {
  INSIGHTS_REGENERATED_EVENT,
  runInsightsRegeneration,
  useInsightsRegeneration,
  type InsightsRegeneratedDetail,
} from '@/services/insightsRegeneration'
import { consolidateHypothesesForDisplay } from '@/services/hypothesisDisplay'

const { t } = useI18n()
const { active: aiActive } = useAiInsights()
const { isRunning: isRegenerating } = useInsightsRegeneration()
const regenerationMessages = useInsightsRegenerationMessages()
import { areasMatch } from '@/services/bodyAreaDetection'
import { getHealthEntries } from '@/api/healthApi'
import { getPatientProfile } from '@/api/patientApi'
import type {
  DiagnosisGenerationOutcome,
  DiagnosisReport,
  DiagnosisVariant,
  HealthEntry,
  Hypothesis,
  PatientProfile,
} from '@/models/types'
import type { RegenerateInsightsResult } from '@/api/hypothesisApi'

function formatRegenerateMessage(result: RegenerateInsightsResult): string {
  const params = {
    hypothesisCount: result.hypothesisCount,
    journalEntryCount: result.journalEntryCount,
    areaCount: result.areas.length,
  }
  return t(`hypothesesPage.regenerateMessages.${result.messageKey}`, params)
}

type TabId = 'diagnoses' | 'hypotheses'

const route = useRoute()
const router = useRouter()
const diagnosesRefreshing = ref(false)
const activeTab = ref<TabId>('diagnoses')
const hypotheses = ref<Hypothesis[]>([])
const diagnosisReports = ref<DiagnosisReport[]>([])
const journalEntries = ref<HealthEntry[]>([])
const patient = ref<PatientProfile | null>(null)
const regenerateMessage = ref('')
const regenerateMessageType = ref<'success' | 'error' | 'info'>('success')
const regenerateSlowHint = ref(false)
const regenerateConfirmOpen = ref(false)
const diagnosisMode = ref<'rule' | 'ai'>('rule')
const diagnosisOutcome = ref<DiagnosisGenerationOutcome | null>(null)
const diagnosisOutcomeMessage = ref<string | undefined>(undefined)

interface DiagnosisEmptyState {
  loading?: boolean
  title: string
  hint?: string
  showAction?: boolean
}

const diagnosisEmptyState = computed((): DiagnosisEmptyState | null => {
  if (diagnosisReports.value.length > 0) return null

  if (diagnosesRefreshing.value || isRegenerating.value) {
    return { loading: true, title: '' }
  }

  if (!aiActive.value) {
    return {
      title: t('diagnosis.emptyAiOffTitle'),
      hint: t('diagnosis.emptyAiOffHint'),
    }
  }

  if (journalEntries.value.length === 0) {
    return {
      title: t('diagnosis.emptyNeedEntriesTitle'),
      hint: t('diagnosis.emptyNeedEntriesHint'),
    }
  }

  if (!hypotheses.value.some((h) => Boolean(h.aiInsight))) {
    return {
      title: t('diagnosis.emptyNotGeneratedTitle'),
      hint: t('diagnosis.emptyNotGeneratedHint'),
    }
  }

  switch (diagnosisOutcome.value) {
    case 'no_suggestions':
      return {
        title: t('diagnosis.emptyNoSuggestionsTitle'),
        hint: t('diagnosis.emptyNoSuggestionsHint'),
        showAction: true,
      }
    case 'needs_more_journal':
      return {
        title: t('diagnosis.emptyNeedsMoreJournalTitle'),
        hint: t('diagnosis.emptyNeedsMoreJournalHint'),
        showAction: true,
      }
    case 'failed':
      return {
        title: t('diagnosis.emptyFailedTitle'),
        hint:
          diagnosisOutcomeMessage.value?.trim() ||
          t('diagnosis.emptyFailedHint'),
        showAction: true,
      }
    default:
      return {
        title: t('diagnosis.emptyIncompleteTitle'),
        hint: t('diagnosis.emptyIncompleteHint'),
        showAction: true,
      }
  }
})

const hasGeneratedInsights = computed(
  () =>
    diagnosisReports.value.length > 0 ||
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

function relatedVariantsForHypothesis(hypothesis: Hypothesis): DiagnosisVariant[] {
  const report = diagnosisReports.value.find((r) =>
    areasMatch(r.conditionArea, hypothesis.conditionArea)
  )
  return report?.variants.slice(0, 3) ?? []
}

function applyCache(cached: InsightsCacheSnapshot) {
  hypotheses.value = cached.hypotheses
  journalEntries.value = cached.journalEntries
  diagnosisReports.value = cached.diagnosisReports
  patient.value = cached.patient
}

/** Read IndexedDB only — never calls the LLM. */
async function loadPageState(): Promise<void> {
  const [hyps, entries, profile, storedInsights] = await Promise.all([
    getHypotheses(),
    getHealthEntries(),
    getPatientProfile(),
    getStoredClinicalInsights(),
  ])
  const displayHyps = consolidateHypothesesForDisplay(hyps)
  const storedReports = storedInsights?.diagnosisReports ?? []
  hypotheses.value = displayHyps
  journalEntries.value = entries
  patient.value = profile
  diagnosisReports.value =
    storedReports.length > 0
      ? enrichAiDiagnosisReports(storedReports, entries)
      : []
  diagnosisOutcome.value = storedInsights?.diagnosisOutcome ?? null
  diagnosisOutcomeMessage.value = storedInsights?.diagnosisOutcomeMessage
  diagnosisMode.value = shouldUseAiInsights() ? 'ai' : 'rule'

  if (displayHyps.length > 0) {
    setInsightsCache({
      hypotheses: displayHyps,
      journalEntries: entries,
      diagnosisReports: storedReports,
      patient: profile,
    })
  }
}

function applyDiagnosisGeneration(
  reports: DiagnosisReport[],
  outcome: DiagnosisGenerationOutcome,
  outcomeMessage?: string
) {
  diagnosisReports.value = reports
  diagnosisOutcome.value = outcome
  diagnosisOutcomeMessage.value = outcomeMessage

  const cached = getInsightsCache()
  if (cached) {
    setInsightsCache({
      ...cached,
      diagnosisReports: reports,
    })
  }
}

async function generateDiagnosesOnly(): Promise<void> {
  if (isRegenerating.value || diagnosesRefreshing.value) return
  if (!aiActive.value) return

  diagnosesRefreshing.value = true
  try {
    const result = await generateDiagnosisReports({ forceRegenerate: true })
    applyDiagnosisGeneration(
      result.reports,
      result.outcome,
      result.outcomeMessage
    )

    if (result.reports.length > 0) {
      regenerateMessageType.value = 'success'
      regenerateMessage.value = t('diagnosis.generatedSuccess', {
        count: result.reports.length,
      })
      activeTab.value = 'diagnoses'
      return
    }

    regenerateMessageType.value =
      result.outcome === 'failed' ? 'error' : 'info'
    regenerateMessage.value = t(`diagnosis.outcomeBanner.${result.outcome}`)
  } finally {
    diagnosesRefreshing.value = false
  }
}

/** Hypotheses saved but diagnoses missing (e.g. interrupted generation). */
function reportsNeedLinkExplanations(reports: DiagnosisReport[]): boolean {
  return reports.some((r) =>
    r.variants.some(
      (v) =>
        v.aiRanked &&
        v.confirmCriteria.some(
          (c) =>
            c.status === 'met' &&
            Boolean(c.sourceEntryId) &&
            !c.linkExplanation?.trim()
        )
    )
  )
}

async function ensureJournalLinkExplanations(): Promise<void> {
  if (!aiActive.value || isRegenerating.value || diagnosesRefreshing.value) {
    return
  }
  if (!reportsNeedLinkExplanations(diagnosisReports.value)) return

  diagnosesRefreshing.value = true
  try {
    const updated = await fillJournalLinkExplanations(
      diagnosisReports.value,
      journalEntries.value
    )
    applyDiagnosisGeneration(updated, diagnosisOutcome.value ?? 'ok')
    await saveDiagnosisReports(updated, diagnosisOutcome.value ?? 'ok')
  } catch (err) {
    console.warn('[Monday] journal link explanations', err)
  } finally {
    diagnosesRefreshing.value = false
  }
}

async function backfillDiagnosesIfNeeded(): Promise<void> {
  const hasAiHypotheses = hypotheses.value.some((h) => Boolean(h.aiInsight))
  if (!hasAiHypotheses || diagnosisReports.value.length > 0) return
  if (!aiActive.value || isRegenerating.value) return
  if (
    diagnosisOutcome.value === 'no_suggestions' ||
    diagnosisOutcome.value === 'needs_more_journal'
  ) {
    return
  }

  await generateDiagnosesOnly()
}

const regenerateBannerVariant = computed(() => {
  const t = regenerateMessageType.value
  if (t === 'success') return 'success'
  if (t === 'error') return 'error'
  return 'info'
})

function clearInsightsDisplay() {
  hypotheses.value = []
  diagnosisReports.value = []
  diagnosisOutcome.value = null
  diagnosisOutcomeMessage.value = undefined
  regenerateSlowHint.value = false
  regenerateMessage.value = ''
}

function applyRegeneratedDetail(detail: InsightsRegeneratedDetail) {
  applyCache(detail.snapshot)
  applyDiagnosisGeneration(
    detail.diagnosis.reports,
    detail.diagnosis.outcome,
    detail.diagnosis.outcomeMessage
  )
  diagnosisMode.value = detail.snapshot.aiInsightsEnabled ? 'ai' : 'rule'
  regenerateSlowHint.value = false
  regenerateMessageType.value =
    detail.result.hypothesisCount > 0 && detail.diagnosis.reports.length > 0
      ? 'success'
      : detail.result.hypothesisCount > 0
        ? 'info'
        : 'info'
  regenerateMessage.value = formatRegenerateMessage(detail.result)
  if (detail.result.hypothesisCount > 0 && diagnosisReports.value.length > 0) {
    activeTab.value = 'diagnoses'
  }
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

  const cached = getInsightsCache()
  if (cached && isInsightsCacheValid(cached, entries) && cached.hypotheses.length > 0) {
    applyCache(cached)
    diagnosisMode.value = cached.aiInsightsEnabled ? 'ai' : 'rule'
  } else {
    if (cached) invalidateInsightsCache()
    await loadPageState()
  }

  const tab = route.query.tab
  if (tab === 'hypotheses' || tab === 'diagnoses') {
    activeTab.value = tab
  } else if (diagnosisReports.value.length === 0 && hypotheses.value.length > 0) {
    activeTab.value = 'hypotheses'
  }

  await backfillDiagnosesIfNeeded()
  await ensureJournalLinkExplanations()
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

watch(activeTab, (tab) => {
  router.replace({ query: { tab } })
})
</script>

<style scoped>
.regenerate-feedback {
  margin: -0.5rem 0 1.25rem;
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

.insights-toolbar {
  margin-bottom: 1.25rem;
}

.btn-regenerate {
  padding: 0.6rem 1.1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--accent);
  background: var(--accent-strong);
  color: #fff;
  font-family: inherit;
}

.btn-regenerate:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-regenerate:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.regenerate-feedback {
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.regenerate-feedback.success {
  color: var(--success-text, #2e7d32);
}

.regenerate-feedback.error {
  color: var(--error-text);
}

.regenerate-feedback.info {
  color: var(--text-muted);
}

.hypotheses-tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
  padding: 0.35rem;
  width: fit-content;
  box-shadow: none;
}

.hypotheses-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.hypotheses-tab:hover {
  color: var(--text-primary);
  background: var(--bg-muted);
}

.hypotheses-tab--active {
  background: var(--accent-strong);
  color: #fff;
}

.hypotheses-tab--active .tab-count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.tab-count {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.tab-panel {
  min-height: 120px;
}

.link-cta {
  display: inline-block;
  margin-top: 0.75rem;
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.link-cta:hover {
  text-decoration: underline;
}

.hypotheses-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.page-empty--generate {
  max-width: 32rem;
  margin: 2rem auto;
  text-align: center;
}

.page-empty--generate p {
  margin: 0.75rem 0 1.25rem;
  color: var(--text-muted);
  line-height: 1.55;
}

.page-empty__hint {
  margin-top: 1rem !important;
  font-size: 0.875rem;
}

.btn-regenerate--cta {
  margin-top: 0.25rem;
}
</style>
