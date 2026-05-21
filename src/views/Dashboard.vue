<template>
  <div class="dashboard">
    <SectionHeader
      title="Dashboard"
      subtitle="Your health overview — patient profile, statistics, and trends"
    />

    <div v-if="loading" class="loading">Loading dashboard…</div>

    <template v-else>
      <section class="dashboard-section">
        <PatientProfileCard
          :profile="patient"
          :tracking-since="stats?.trackingSince ?? null"
          :days-tracked="stats?.daysTracked ?? 0"
          @updated="onPatientUpdated"
          @journal-imported="onJournalImported"
        />
      </section>

      <section class="dashboard-section">
        <HealthRecommendationsCard :recommendations="recommendations" />
      </section>

      <section class="dashboard-section">
        <SectionHeader title="Overview" subtitle="Key metrics from your health journal" />
        <div class="stats-grid">
          <StatCard
            variant="journal"
            label="Journal entries"
            :value="stats?.totalJournalEntries ?? 0"
            hint="All time"
          />
          <StatCard
            variant="activity"
            label="Last 30 days"
            :value="stats?.entriesLast30Days ?? 0"
            hint="Recent activity"
          />
          <StatCard
            variant="conditions"
            label="Tracked conditions"
            :value="stats?.conditions.length ?? 0"
            hint="Body areas / issues"
          />
          <StatCard
            variant="severity"
            label="Avg severity"
            :value="avgSeverityLabel"
            hint="When reported (1–10)"
          />
          <StatCard
            variant="timeline"
            label="Timeline events"
            :value="stats?.totalTimelineEvents ?? 0"
          />
          <StatCard
            variant="hypotheses"
            label="Hypotheses"
            :value="stats?.totalHypotheses ?? 0"
          />
          <StatCard
            variant="attention"
            label="Needs attention"
            :value="stats?.attentionRequired ?? 0"
            hint="Urgent or emergency flags"
            :alert="(stats?.attentionRequired ?? 0) > 0"
          />
        </div>
      </section>

      <section class="dashboard-section charts-row">
        <div class="chart-panel">
          <SectionHeader
            title="Severity trend"
            subtitle="Self-reported severity over time"
          />
          <SeverityLineChart :points="stats?.severityTrend ?? []" />
        </div>
        <div class="chart-panel">
          <SectionHeader
            title="Entry classification"
            subtitle="How journal entries were categorized from your descriptions"
          />
          <DonutChart :segments="stats?.urgencyBreakdown ?? []" />
        </div>
      </section>

      <section class="dashboard-section charts-row">
        <div class="chart-panel">
          <SectionHeader
            title="Entries by type"
            subtitle="Symptoms, medications, visits, and more"
          />
          <BarChart :segments="stats?.entriesByType ?? []" />
        </div>
        <div class="chart-panel">
          <SectionHeader
            title="Hypothesis confidence"
            subtitle="Distribution of active hypotheses"
          />
          <DonutChart
            :segments="stats?.hypothesesByConfidence ?? []"
            empty-text="No hypotheses yet"
          />
        </div>
      </section>

      <section class="dashboard-section">
        <SectionHeader
          title="Tracked conditions"
          subtitle="Body areas you have logged in your journal"
        />
        <div v-if="!stats?.conditions.length" class="empty-state">
          <p>No conditions tracked yet. Add an entry in the Journal.</p>
          <router-link to="/journal" class="link-cta">Go to Journal</router-link>
        </div>
        <div v-else class="conditions-table-wrap">
          <table class="conditions-table">
            <thead>
              <tr>
                <th>Condition / area</th>
                <th>Entries</th>
                <th>Last update</th>
                <th>Latest classification</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in stats.conditions" :key="c.name">
                <td class="condition-name">{{ c.name }}</td>
                <td>{{ c.entryCount }}</td>
                <td>{{ formatDate(c.lastEntryDate) }}</td>
                <td>
                  <span class="urgency-pill" :class="`urgency--${c.latestUrgency}`">
                    {{ c.latestClassification }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="dashboard-section">
        <SectionHeader
          title="Current clinical model"
          subtitle="Synthesized from your health journal"
        />
        <MedicalCard
          v-if="clinicalModel"
          :title="clinicalModel.title"
          :summary="clinicalModel.summary"
          :factors="clinicalModel.factors"
        />
        <p v-if="clinicalModel && !clinicalModel.factors.length" class="clinical-model-hint">
          Log symptoms and visits in the Journal to populate condition-specific factors.
        </p>
      </section>

      <section class="dashboard-section">
        <SectionHeader
          title="Possible conditions"
          subtitle="Medical disease names inferred from your journal — ranked by likelihood %"
        />
        <DiagnosisPanel
          :reports="diagnosisReports"
          :show-disclaimer="true"
        />
      </section>

      <section class="dashboard-section hypotheses-section">
        <div class="hypotheses-section-header">
          <SectionHeader
            title="Active hypotheses"
            subtitle="Generated from your journal entries and health data"
          />
          <button
            type="button"
            class="btn-generate"
            :disabled="generatingHypothesis || !hasJournalData"
            @click="onGenerateHypothesis"
          >
            {{ generatingHypothesis ? 'Analyzing your data…' : 'Generate hypothesis' }}
          </button>
        </div>

        <p v-if="!hasJournalData" class="hypotheses-hint">
          Add journal entries first so the system can analyze your health data.
        </p>
        <p
          v-if="hypothesisMessage"
          class="hypotheses-feedback"
          :class="hypothesisMessageType"
        >
          {{ hypothesisMessage }}
        </p>

        <div v-if="hypotheses.length > 0" class="hypotheses-preview">
          <HypothesisCard
            v-for="hypothesis in hypotheses.slice(0, 5)"
            :key="hypothesis.id"
            :hypothesis="hypothesis"
            :journal-entries="journalEntries"
            :patient="patient"
          />
        </div>
        <div v-else class="empty-state">
          <p>No hypotheses yet. Click generate to analyze your records.</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { format, parseISO } from 'date-fns'
import SectionHeader from '@/components/SectionHeader.vue'
import MedicalCard from '@/components/MedicalCard.vue'
import HypothesisCard from '@/components/HypothesisCard.vue'
import DiagnosisPanel from '@/components/DiagnosisPanel.vue'
import PatientProfileCard from '@/components/dashboard/PatientProfileCard.vue'
import HealthRecommendationsCard from '@/components/dashboard/HealthRecommendationsCard.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import BarChart from '@/components/dashboard/BarChart.vue'
import DonutChart from '@/components/dashboard/DonutChart.vue'
import SeverityLineChart from '@/components/dashboard/SeverityLineChart.vue'
import { getClinicalModel } from '@/api/clinicalModelApi'
import { getHypotheses, getTimeline } from '@/api/mockApi'
import { tryGenerateHypothesis } from '@/api/hypothesisApi'
import { buildDiagnosisReports } from '@/services/diagnosisGenerator'
import { getHealthEntries } from '@/api/healthApi'
import { getPatientProfile } from '@/api/patientApi'
import { buildDashboardStats } from '@/services/dashboardStats'
import { getHealthRecommendations } from '@/services/healthRecommendations'
import type {
  ClinicalModel,
  DashboardStats,
  HealthEntry,
  DiagnosisReport,
  Hypothesis,
  PatientProfile,
} from '@/models/types'

const loading = ref(true)
const patient = ref<PatientProfile | null>(null)
const stats = ref<DashboardStats | null>(null)
const clinicalModel = ref<ClinicalModel | null>(null)
const hypotheses = ref<Hypothesis[]>([])
const diagnosisReports = ref<DiagnosisReport[]>([])
const journalEntryCount = ref(0)
const journalEntries = ref<HealthEntry[]>([])
const generatingHypothesis = ref(false)
const hypothesisMessage = ref('')
const hypothesisMessageType = ref<'success' | 'error' | 'info'>('success')

const hasJournalData = computed(() => journalEntryCount.value > 0)

const avgSeverityLabel = computed(() => {
  const avg = stats.value?.averageSeverity
  return avg !== null && avg !== undefined ? `${avg} / 10` : '—'
})

const recommendations = computed(() =>
  getHealthRecommendations(patient.value, stats.value)
)

onMounted(async () => {
  try {
    const [profile, entries, timeline, model, hyps] = await Promise.all([
      getPatientProfile(),
      getHealthEntries(),
      getTimeline(),
      getClinicalModel(),
      getHypotheses(),
    ])
    patient.value = profile
    clinicalModel.value = model
    hypotheses.value = hyps
    diagnosisReports.value = buildDiagnosisReports(hyps, entries)
    journalEntries.value = entries
    journalEntryCount.value = entries.length
    stats.value = buildDashboardStats(profile, entries, timeline, hyps)
  } finally {
    loading.value = false
  }
})

async function refreshStats() {
  if (!patient.value) return
  const [entries, timeline, hyps, model] = await Promise.all([
    getHealthEntries(),
    getTimeline(),
    getHypotheses(),
    getClinicalModel(),
  ])
  hypotheses.value = hyps
  diagnosisReports.value = buildDiagnosisReports(hyps, entries)
  clinicalModel.value = model
  journalEntries.value = entries
  journalEntryCount.value = entries.length
  stats.value = buildDashboardStats(
    patient.value,
    entries,
    timeline,
    hyps
  )
}

async function onGenerateHypothesis() {
  hypothesisMessage.value = ''
  generatingHypothesis.value = true
  try {
    const result = await tryGenerateHypothesis()
    await refreshStats()

    if (result.status === 'created' && result.hypothesis) {
      hypothesisMessageType.value = 'success'
      hypothesisMessage.value = `New hypothesis created: “${result.hypothesis.title}” (${result.hypothesis.confidence}).`
    } else if (result.status === 'updated' && result.hypothesis) {
      hypothesisMessageType.value = 'success'
      hypothesisMessage.value = `Hypothesis updated: “${result.hypothesis.title}” now reflects your latest journal records.`
    } else {
      hypothesisMessageType.value = 'info'
      hypothesisMessage.value = result.message
    }
  } catch (e) {
    hypothesisMessageType.value = 'error'
    hypothesisMessage.value =
      e instanceof Error ? e.message : 'Could not generate a hypothesis.'
  } finally {
    generatingHypothesis.value = false
  }
}

async function onPatientUpdated(updated: PatientProfile) {
  patient.value = updated
  await refreshStats()
}

async function onJournalImported() {
  await refreshStats()
}

function formatDate(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy')
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-section {
  margin-bottom: 2.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* Full-width last card when 7 items sit alone on a 2-column row */
  .stats-grid > :nth-child(7):last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 420px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid > :nth-child(7):last-child {
    grid-column: auto;
  }
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.chart-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem 1.5rem 1.5rem;
}

.chart-panel :deep(.section-header) {
  margin-bottom: 1rem;
}

.chart-panel :deep(.section-title) {
  font-size: 1.1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
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

.conditions-table-wrap {
  overflow-x: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.conditions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.conditions-table th,
.conditions-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.conditions-table th {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.condition-name {
  font-weight: 500;
  color: var(--text-primary);
}

.urgency-pill {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: var(--bg-muted);
  color: var(--text-muted);
}

.urgency--monitor {
  background: var(--urgency-monitor-bg);
  color: var(--urgency-monitor-text);
}

.urgency--urgent {
  background: var(--urgency-urgent-bg);
  color: var(--urgency-urgent-text);
}

.urgency--emergency {
  background: var(--urgency-emergency-bg);
  color: var(--urgency-emergency-text);
}

.urgency--routine {
  background: var(--urgency-routine-bg);
  color: var(--urgency-routine-text);
}

.hypotheses-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.hypotheses-section-header :deep(.section-header) {
  margin-bottom: 0;
  flex: 1;
  min-width: 200px;
}

.btn-generate {
  background: var(--accent-strong);
  color: #fff;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-generate:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-generate:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.hypotheses-hint {
  font-size: 0.875rem;
  color: var(--text-faint);
  margin: 0 0 1rem;
}

.hypotheses-feedback {
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.hypotheses-feedback.success {
  background: var(--success-bg);
  border: 1px solid var(--success-border);
  color: var(--success-text);
}

.hypotheses-feedback.error {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  color: var(--error-text);
}

.hypotheses-feedback.info {
  background: var(--hint-bg);
  border: 1px solid var(--hint-border);
  color: var(--text-secondary);
}

.hypotheses-preview {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.clinical-model-hint {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  color: var(--text-faint);
}
</style>
