<template>
  <div class="page dashboard">
    <PageHeader
      eyebrow="Health overview"
      title="Dashboard"
      subtitle="Your health overview — patient profile, statistics, and trends"
    />

    <div v-if="loading" class="page-loading">Loading dashboard…</div>

    <template v-else>
      <section class="page-section dashboard-section">
        <PatientProfileCard
          :profile="patient"
          :journal-entries="journalEntries"
          :tracking-since="stats?.trackingSince ?? null"
          :days-tracked="stats?.daysTracked ?? 0"
          :recommendations="recommendations"
          :nearest-appointment="nearestAppointment"
          @updated="onPatientUpdated"
          @journal-imported="onJournalImported"
        />
      </section>

      <section class="page-section dashboard-section">
        <SectionHeader
          title="Overview"
          subtitle="Key metrics from your health journal"
          class="page-section-title"
        />
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

      <section class="page-section dashboard-section charts-row">
        <div class="chart-panel page-panel">
          <SectionHeader
            title="Severity trend"
            class="page-section-title"
            :subtitle="severityTrendSubtitle"
          />
          <SeverityLineChart
            :points="stats?.severityTrend ?? []"
            :empty-text="severityTrendEmptyText"
          />
        </div>
        <div class="chart-panel page-panel">
          <SectionHeader
            title="Entry classification"
            class="page-section-title"
            subtitle="How journal entries were categorized from your descriptions"
          />
          <DonutChart :segments="stats?.urgencyBreakdown ?? []" />
        </div>
      </section>

      <section class="page-section dashboard-section charts-row">
        <div class="chart-panel page-panel">
          <SectionHeader
            title="Entries by type"
            class="page-section-title"
            subtitle="Symptoms, medications, visits, and more"
          />
          <BarChart :segments="stats?.entriesByType ?? []" />
        </div>
        <div class="chart-panel page-panel">
          <SectionHeader
            title="Hypothesis confidence"
            class="page-section-title"
            subtitle="Distribution of active hypotheses"
          />
          <DonutChart
            :segments="stats?.hypothesesByConfidence ?? []"
            empty-text="No hypotheses yet"
          />
        </div>
      </section>

      <section class="page-section dashboard-section">
        <SectionHeader
          title="Tracked conditions"
          class="page-section-title"
          subtitle="Body areas you have logged in your journal"
        />
        <div v-if="!stats?.conditions.length" class="page-empty">
          <span class="page-empty__title">No conditions yet</span>
          <p>Add an entry in the Journal to start tracking body areas.</p>
          <router-link to="/journal" class="link-cta">Go to Journal</router-link>
        </div>
        <div v-else class="conditions-table-wrap page-panel page-panel--compact">
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

      <section class="page-section dashboard-section">
        <SectionHeader
          title="Current clinical model"
          subtitle="Synthesized from your health journal"
          class="page-section-title"
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

    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { format, parseISO } from 'date-fns'
import PageHeader from '@/components/PageHeader.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import MedicalCard from '@/components/MedicalCard.vue'
import PatientProfileCard from '@/components/dashboard/PatientProfileCard.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import BarChart from '@/components/dashboard/BarChart.vue'
import DonutChart from '@/components/dashboard/DonutChart.vue'
import SeverityLineChart from '@/components/dashboard/SeverityLineChart.vue'
import { getClinicalModel } from '@/api/clinicalModelApi'
import { getHypotheses, getTimeline } from '@/api/mockApi'
import { getHealthEntries } from '@/api/healthApi'
import { getAppointments } from '@/api/appointmentsApi'
import { findNearestUpcoming } from '@/services/appointmentUtils'
import { getPatientProfile } from '@/api/patientApi'
import { buildDashboardStats } from '@/services/dashboardStats'
import { getHealthRecommendations } from '@/services/healthRecommendations'
import { scheduleIdleWork } from '@/utils/scheduleIdleWork'
import type {
  ClinicalModel,
  DashboardStats,
  HealthEntry,
  DoctorAppointment,
  PatientProfile,
} from '@/models/types'

const loading = ref(true)
const patient = ref<PatientProfile | null>(null)
const stats = ref<DashboardStats | null>(null)
const clinicalModel = ref<ClinicalModel | null>(null)
const journalEntries = ref<HealthEntry[]>([])
const nearestAppointment = ref<DoctorAppointment | null>(null)

const avgSeverityLabel = computed(() => {
  const avg = stats.value?.averageSeverity
  return avg !== null && avg !== undefined ? `${avg} / 10` : '—'
})

const severityTrendSubtitle = computed(() => {
  const base =
    'By event date (when symptoms happened), not when you logged the entry.'
  const info = stats.value?.severityTrendInfo
  if (!info) return base
  if (info.urgencyEstimatedCount > 0 && info.explicitCount === 0) {
    return `${base} Estimated from entry urgency until you add 1–10 ratings.`
  }
  if (info.urgencyEstimatedCount > 0) {
    return `${base} Some points use urgency when no rating was logged.`
  }
  if (info.textInferredCount > 0 && info.explicitCount === 0) {
    return `${base} Parsed from pain scores in your notes (e.g. 7/10).`
  }
  return base
})

const severityTrendEmptyText = computed(() => {
  const total = stats.value?.totalJournalEntries ?? 0
  if (total === 0) {
    return 'Add journal entries to see severity trends.'
  }
  return `You have ${total} journal ${total === 1 ? 'entry' : 'entries'}, but none have a severity rating or text we can read (e.g. "pain 7/10"). Use the severity slider when logging.`
})

const recommendations = computed(() =>
  getHealthRecommendations(patient.value, stats.value)
)

function loadDeferredClinicalModel(entries: HealthEntry[]): void {
  scheduleIdleWork(() => {
    void getClinicalModel(entries).then((model) => {
      clinicalModel.value = model
    })
  })
}

onMounted(async () => {
  try {
    const entries = await getHealthEntries()
    const [profile, timeline, hyps, appts] = await Promise.all([
      getPatientProfile(),
      getTimeline(),
      getHypotheses(entries),
      getAppointments(),
    ])
    patient.value = profile
    journalEntries.value = entries
    stats.value = buildDashboardStats(profile, entries, timeline, hyps)
    nearestAppointment.value = findNearestUpcoming(appts)
    loadDeferredClinicalModel(entries)
  } finally {
    loading.value = false
  }
})

async function refreshStats() {
  if (!patient.value) return
  const entries = await getHealthEntries()
  const [timeline, hyps, appts] = await Promise.all([
    getTimeline(),
    getHypotheses(entries),
    getAppointments(),
  ])
  journalEntries.value = entries
  stats.value = buildDashboardStats(
    patient.value,
    entries,
    timeline,
    hyps
  )
  nearestAppointment.value = findNearestUpcoming(appts)
  loadDeferredClinicalModel(entries)
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
.dashboard :deep(.page-section) {
  margin-bottom: 2.35rem;
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
  gap: 1.75rem;
}

.chart-panel :deep(.section-header) {
  margin-bottom: 0;
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

.clinical-model-hint {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  color: var(--text-faint);
}
</style>
