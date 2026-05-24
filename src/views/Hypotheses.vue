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
          :disabled="loading || isRegenerating || journalEntries.length === 0"
          :title="
            journalEntries.length === 0
              ? t('hypothesesPage.regenerateTitleEmpty')
              : t('hypothesesPage.regenerateTitle')
          "
          @click="onRegenerateInsights"
        >
          {{
            isRegenerating
              ? t('hypothesesPage.regenerating')
              : t('hypothesesPage.regenerate')
          }}
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

    <div v-if="loading" class="page-loading">{{ t('hypothesesPage.loading') }}</div>

    <div
      v-else-if="isRegenerating && hypotheses.length === 0 && diagnosisReports.length === 0"
      class="page-loading"
    >
      {{ t('hypothesesPage.regenerating') }}
    </div>

    <template v-else-if="!isRegenerating || hypotheses.length > 0 || diagnosisReports.length > 0">
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
          :refreshing="diagnosesRefreshing"
          :diagnosis-mode="diagnosisMode"
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import HypothesisCard from '@/components/HypothesisCard.vue'
import DiagnosisPanel from '@/components/DiagnosisPanel.vue'
import { getHypotheses } from '@/api/mockApi'
import { getDiagnosisReports } from '@/api/diagnosisApi'
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

const { t } = useI18n()
const { active: aiActive } = useAiInsights()
const { isRunning: isRegenerating } = useInsightsRegeneration()
const regenerationMessages = useInsightsRegenerationMessages()
import { consolidateHypothesesForDisplay } from '@/services/hypothesisDisplay'
import { areasMatch } from '@/services/bodyAreaDetection'
import { getHealthEntries } from '@/api/healthApi'
import { getPatientProfile } from '@/api/patientApi'
import type {
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
const loading = ref(false)
const diagnosesRefreshing = ref(false)
const activeTab = ref<TabId>('diagnoses')
const hypotheses = ref<Hypothesis[]>([])
const diagnosisReports = ref<DiagnosisReport[]>([])
const journalEntries = ref<HealthEntry[]>([])
const patient = ref<PatientProfile | null>(null)
const regenerateMessage = ref('')
const regenerateMessageType = ref<'success' | 'error' | 'info'>('success')
const regenerateSlowHint = ref(false)
const diagnosisMode = ref<'rule' | 'ai'>('rule')

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

async function loadInsights(options: { silent?: boolean } = {}) {
  const silent = options.silent === true
  if (silent) {
    diagnosesRefreshing.value = true
  }

  try {
    const [hyps, entries, profile] = await Promise.all([
      getHypotheses(),
      getHealthEntries(),
      getPatientProfile(),
    ])
    const displayHyps = consolidateHypothesesForDisplay(hyps)
    hypotheses.value = displayHyps
    journalEntries.value = entries
    patient.value = profile
    diagnosisReports.value = await getDiagnosisReports()
    diagnosisMode.value = shouldUseAiInsights() ? 'ai' : 'rule'

    setInsightsCache({
      hypotheses: displayHyps,
      journalEntries: entries,
      diagnosisReports: diagnosisReports.value,
      patient: profile,
    })
  } finally {
    if (silent) {
      diagnosesRefreshing.value = false
    }
  }
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
  regenerateSlowHint.value = false
  regenerateMessage.value = ''
}

function applyRegeneratedDetail(detail: InsightsRegeneratedDetail) {
  applyCache(detail.snapshot)
  diagnosisMode.value = detail.snapshot.aiInsightsEnabled ? 'ai' : 'rule'
  regenerateSlowHint.value = false
  regenerateMessageType.value =
    detail.result.hypothesisCount > 0 ? 'success' : 'info'
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
      void loadInsights({ silent: true })
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

  const cached = getInsightsCache()
  const [entries] = await Promise.all([getHealthEntries()])
  if (cached && isInsightsCacheValid(cached, entries)) {
    applyCache(cached)
    diagnosisMode.value = cached.aiInsightsEnabled ? 'ai' : 'rule'
    void loadInsights({ silent: true })
  } else {
    invalidateInsightsCache()
    loading.value = true
    try {
      await loadInsights()
    } finally {
      loading.value = false
    }
  }

  const tab = route.query.tab
  if (tab === 'hypotheses' || tab === 'diagnoses') {
    activeTab.value = tab
  } else if (diagnosisReports.value.length === 0 && hypotheses.value.length > 0) {
    activeTab.value = 'hypotheses'
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

  if (
    hypotheses.value.length > 0 &&
    !window.confirm(t('hypothesesPage.regenerateConfirm'))
  ) {
    return
  }

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
</style>
