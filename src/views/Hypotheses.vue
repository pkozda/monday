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
          :disabled="loading || regenerating || journalEntries.length === 0"
          :title="
            journalEntries.length === 0
              ? t('hypothesesPage.regenerateTitleEmpty')
              : t('hypothesesPage.regenerateTitle')
          "
          @click="onRegenerateInsights"
        >
          {{
            regenerating
              ? t('hypothesesPage.regenerating')
              : t('hypothesesPage.regenerate')
          }}
        </button>
      </template>
    </PageHeader>

    <div
      v-if="regenerateMessage"
      class="page-banner regenerate-feedback"
      :class="`page-banner--${regenerateBannerVariant}`"
      role="status"
    >
      {{ regenerateMessage }}
    </div>

    <div v-if="loading" class="page-loading">{{ t('hypothesesPage.loading') }}</div>

    <template v-else>
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
        <DiagnosisPanel :reports="diagnosisReports" />
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
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
import PageHeader from '@/components/PageHeader.vue'
import HypothesisCard from '@/components/HypothesisCard.vue'
import DiagnosisPanel from '@/components/DiagnosisPanel.vue'
import { regenerateAllHypothesesFromJournal } from '@/api/hypothesisApi'
import { getHypotheses } from '@/api/mockApi'
import { buildDiagnosisReports } from '@/services/diagnosisGenerator'
import { getHealthEntries } from '@/api/healthApi'
import { getPatientProfile } from '@/api/patientApi'
import type {
  DiagnosisReport,
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
const loading = ref(true)
const activeTab = ref<TabId>('diagnoses')
const hypotheses = ref<Hypothesis[]>([])
const diagnosisReports = ref<DiagnosisReport[]>([])
const journalEntries = ref<HealthEntry[]>([])
const patient = ref<PatientProfile | null>(null)
const regenerating = ref(false)
const regenerateMessage = ref('')
const regenerateMessageType = ref<'success' | 'error' | 'info'>('success')

async function loadInsights() {
  const [hyps, entries, profile] = await Promise.all([
    getHypotheses(),
    getHealthEntries(),
    getPatientProfile(),
  ])
  hypotheses.value = hyps
  journalEntries.value = entries
  patient.value = profile
  diagnosisReports.value = buildDiagnosisReports(hyps, entries)
}

const regenerateBannerVariant = computed(() => {
  const t = regenerateMessageType.value
  if (t === 'success') return 'success'
  if (t === 'error') return 'error'
  return 'info'
})

onMounted(async () => {
  try {
    await loadInsights()

    const tab = route.query.tab
    if (tab === 'hypotheses' || tab === 'diagnoses') {
      activeTab.value = tab
    } else if (diagnosisReports.value.length === 0 && hypotheses.value.length > 0) {
      activeTab.value = 'hypotheses'
    }
  } finally {
    loading.value = false
  }
})

async function onRegenerateInsights() {
  if (
    hypotheses.value.length > 0 &&
    !window.confirm(t('hypothesesPage.regenerateConfirm'))
  ) {
    return
  }

  regenerateMessage.value = ''
  regenerating.value = true
  try {
    const result = await regenerateAllHypothesesFromJournal()
    await loadInsights()
    regenerateMessageType.value =
      result.hypothesisCount > 0 ? 'success' : 'info'
    regenerateMessage.value = formatRegenerateMessage(result)
    if (result.hypothesisCount > 0 && diagnosisReports.value.length > 0) {
      activeTab.value = 'diagnoses'
    }
  } catch (e) {
    regenerateMessageType.value = 'error'
    regenerateMessage.value =
      e instanceof Error ? e.message : t('hypothesesPage.regenerateFailed')
  } finally {
    regenerating.value = false
  }
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
