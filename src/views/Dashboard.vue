<template>
  <div class="page dashboard">
    <PageHeader
      :eyebrow="t('dashboard.eyebrow')"
      :title="t('dashboard.title')"
      :subtitle="t('dashboard.subtitle')"
    />

    <div v-if="loading" class="page-loading">{{ t('dashboard.loading') }}</div>

    <template v-else>
      <section class="page-section dashboard-section">
        <PatientProfileCard
          :profile="patient"
          :journal-entries="journalEntries"
          :tracking-since="stats?.trackingSince ?? null"
          :days-tracked="stats?.daysTracked ?? 0"
          :recommendations="recommendations"
          :nearest-appointment="nearestAppointment"
          :show-appointment-doctor-notes="Boolean(clinicalModel && journalEntries.length)"
          :appointment-doctor-notes-disabled="clinicalModelRefreshing"
          :appointment-doctor-notes-loading="clinicalDoctorNotesLoading"
          :appointment-doctor-notes-view="clinicalDoctorNotesSurface === 'appointment'"
          :appointment-doctor-notes-content="clinicalDoctorNotesContent"
          v-model:appointment-doctor-notes-specialty="clinicalDoctorSpecialty"
          :appointment-doctor-notes-title="t('doctorNotes.clinicalTitle')"
          :appointment-doctor-notes-intro="t('doctorNotes.clinicalIntro')"
          :appointment-doctor-notes-generating-label="t('doctorNotes.clinicalGenerating')"
          @updated="onPatientUpdated"
          @journal-imported="onJournalImported"
          @appointment-doctor-notes="openClinicalDoctorNotesFromAppointment"
          @appointment-doctor-notes-back="onAppointmentDoctorNotesBack"
          @appointment-modal-close="onAppointmentModalClose"
          @appointment-doctor-notes-specialty-change="onClinicalDoctorSpecialtyChange"
        />
      </section>

      <section class="page-section dashboard-section">
        <SectionHeader
          :title="t('dashboard.overviewTitle')"
          :subtitle="t('dashboard.overviewSubtitle')"
          class="page-section-title"
        />
        <div class="stats-grid">
          <StatCard
            variant="journal"
            :label="t('dashboard.stats.journalEntries')"
            :value="stats?.totalJournalEntries ?? 0"
            :hint="t('dashboard.stats.allTime')"
            :detail="statDetails.journal"
          />
          <StatCard
            variant="activity"
            :label="t('dashboard.stats.last30Days')"
            :value="stats?.entriesLast30Days ?? 0"
            :hint="t('dashboard.stats.recentActivity')"
            :detail="statDetails.activity"
          />
          <StatCard
            variant="tracking"
            :label="t('dashboard.stats.daysTracked')"
            :value="stats?.daysTracked ?? 0"
            :hint="t('dashboard.stats.daysTrackedHint')"
            :detail="statDetails.tracking"
          />
          <StatCard
            variant="conditions"
            :label="t('dashboard.stats.trackedConditions')"
            :value="stats?.conditions.length ?? 0"
            :hint="t('dashboard.stats.bodyAreasHint')"
            :detail="statDetails.conditions"
          />
          <StatCard
            variant="severity"
            :label="t('dashboard.stats.avgSeverity')"
            :value="avgSeverityLabel"
            :hint="t('dashboard.stats.severityHint')"
            :detail="statDetails.severity"
          />
          <StatCard
            variant="timeline"
            :label="t('dashboard.stats.timelineEvents')"
            :value="stats?.totalTimelineEvents ?? 0"
            :hint="t('dashboard.stats.timelineEventsHint')"
            :detail="statDetails.timeline"
          />
          <StatCard
            variant="hypotheses"
            :label="t('dashboard.stats.hypotheses')"
            :value="stats?.totalHypotheses ?? 0"
            :hint="t('dashboard.stats.hypothesesHint')"
            :detail="statDetails.hypotheses"
          />
          <AttentionStatCard
            v-if="attentionLinks.length > 0"
            :label="t('dashboard.stats.needsAttention')"
            :value="attentionLinks.length"
            :hint="t('dashboard.stats.attentionHint')"
            :detail="statDetails.attention"
            :links="attentionLinks"
          />
          <StatCard
            v-else
            variant="attention"
            :label="t('dashboard.stats.needsAttention')"
            :value="stats?.attentionRequired ?? 0"
            :hint="t('dashboard.stats.attentionHint')"
            :detail="statDetails.attentionEmpty"
          />
        </div>
      </section>

      <section class="page-section dashboard-section charts-row">
        <div class="chart-panel page-panel">
          <SectionHeader
            :title="t('dashboard.severityTrendTitle')"
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
            :title="t('dashboard.classificationTitle')"
            class="page-section-title"
            :subtitle="t('dashboard.classificationSubtitle')"
          />
          <DonutChart :segments="stats?.urgencyBreakdown ?? []" />
        </div>
      </section>

      <section class="page-section dashboard-section charts-row">
        <div class="chart-panel page-panel">
          <SectionHeader
            :title="t('dashboard.entriesByTypeTitle')"
            class="page-section-title"
            :subtitle="t('dashboard.entriesByTypeSubtitle')"
          />
          <BarChart :segments="entriesByTypeChart" />
        </div>
        <div class="chart-panel page-panel">
          <SectionHeader
            :title="t('dashboard.hypothesisConfidenceTitle')"
            class="page-section-title"
            :subtitle="t('dashboard.hypothesisConfidenceSubtitle')"
          />
          <DonutChart
            :segments="hypothesesConfidenceChart"
            :empty-text="t('dashboard.noHypothesesYet')"
          />
        </div>
      </section>

      <section class="page-section dashboard-section">
        <SectionHeader
          :title="t('dashboard.conditionsTitle')"
          class="page-section-title"
          :subtitle="t('dashboard.conditionsSubtitle')"
        />
        <div v-if="!stats?.conditions.length" class="page-empty">
          <span class="page-empty__title">{{ t('dashboard.noConditionsTitle') }}</span>
          <p>{{ t('dashboard.noConditionsText') }}</p>
          <router-link to="/journal" class="link-cta">{{ t('common.goToJournal') }}</router-link>
        </div>
        <div v-else class="conditions-table-wrap page-panel page-panel--compact">
          <table class="conditions-table">
            <thead>
              <tr>
                <th>{{ t('dashboard.table.condition') }}</th>
                <th>{{ t('dashboard.table.entries') }}</th>
                <th>{{ t('dashboard.table.lastUpdate') }}</th>
                <th>{{ t('dashboard.table.classification') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in stats.conditions" :key="c.name">
                <td class="condition-name">{{ c.name }}</td>
                <td>{{ c.entryCount }}</td>
                <td>{{ formatDate(c.lastEntryDate) }}</td>
                <td>
                  <span class="urgency-pill" :class="`urgency--${c.latestUrgency}`">
                    {{ localizeClassificationLabel(c.latestClassification, t) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="page-section dashboard-section clinical-model-section">
        <SectionHeader
          :title="t('dashboard.clinicalModelTitle')"
          class="page-section-title"
        />
        <MedicalCard
          v-if="clinicalModel"
          :title="clinicalModel.title"
          :subtitle="t('dashboard.clinicalModelSubtitle')"
          :summary="clinicalModel.summary"
          :factors="clinicalModel.factors"
          :ai-generated="clinicalModel.aiGenerated"
        >
          <template #headerActions>
            <button
              type="button"
              class="btn-clinical-doctor-notes"
              :disabled="
                clinicalDoctorNotesLoading ||
                journalEntries.length === 0 ||
                clinicalModelRefreshing
              "
              @click="openClinicalDoctorNotes"
            >
              {{ t('dashboard.generateDoctorNotes') }}
            </button>
          </template>
        </MedicalCard>
        <DoctorNotesModal
          v-model:specialty="clinicalDoctorSpecialty"
          :open="clinicalDoctorNotesSurface === 'dashboard'"
          :content="clinicalDoctorNotesContent"
          :loading="clinicalDoctorNotesLoading"
          show-specialty-selector
          :title="t('doctorNotes.clinicalTitle')"
          :intro="t('doctorNotes.clinicalIntro')"
          :generating-label="t('doctorNotes.clinicalGenerating')"
          @close="closeClinicalDoctorNotes"
          @specialty-change="onClinicalDoctorSpecialtyChange"
        />
        <p v-if="clinicalModelRefreshing" class="clinical-model-hint">
          {{ t('dashboard.clinicalModelRefreshing') }}
        </p>
        <p v-if="clinicalModel && !clinicalModel.factors.length" class="clinical-model-hint">
          {{ t('dashboard.clinicalModelHint') }}
        </p>
      </section>

    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { format, parseISO } from 'date-fns'
import { dateFnsLocaleFor } from '@/utils/dateLocale'
import { localizeClassificationLabel } from '@/services/localizeClinical'
import type { AppLocale } from '@/i18n'
import type { ChartSegment } from '@/models/types'

const { t, locale } = useI18n()
import PageHeader from '@/components/PageHeader.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import MedicalCard from '@/components/MedicalCard.vue'
import DoctorNotesModal from '@/components/DoctorNotesModal.vue'
import {
  generateClinicalDoctorNotesAsync,
  type DoctorSpecialtyId,
} from '@/services/clinicalDoctorNotes'
import {
  inferDefaultDoctorSpecialty,
  inferDoctorSpecialtyFromAppointment,
} from '@/services/doctorSpecialty'
import PatientProfileCard from '@/components/dashboard/PatientProfileCard.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import AttentionStatCard from '@/components/dashboard/AttentionStatCard.vue'
import BarChart from '@/components/dashboard/BarChart.vue'
import DonutChart from '@/components/dashboard/DonutChart.vue'
import SeverityLineChart from '@/components/dashboard/SeverityLineChart.vue'
import { buildLocalizedClinicalModelAsync } from '@/services/clinicalModelWithAi'
import { shouldUseAiInsights } from '@/services/llm/config'
import { getHypotheses, getTimeline } from '@/api/mockApi'
import { getHealthEntries } from '@/api/healthApi'
import { getAppointments } from '@/api/appointmentsApi'
import { findNearestUpcoming } from '@/services/appointmentUtils'
import { getPatientProfile } from '@/api/patientApi'
import { buildDashboardStats } from '@/services/dashboardStats'
import { getHealthRecommendations } from '@/services/healthRecommendations'
import { attentionJournalLinks } from '@/utils/journalLinks'
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
const clinicalModelRefreshing = ref(false)
let clinicalModelRequestId = 0
const journalEntries = ref<HealthEntry[]>([])
const nearestAppointment = ref<DoctorAppointment | null>(null)
const clinicalDoctorNotesSurface = ref<'dashboard' | 'appointment' | null>(null)
const clinicalDoctorNotesContent = ref('')
const clinicalDoctorNotesLoading = ref(false)
const clinicalDoctorSpecialty = ref<DoctorSpecialtyId>('primary_care')
let clinicalDoctorNotesRequestId = 0

const avgSeverityLabel = computed(() => {
  const avg = stats.value?.averageSeverity
  return avg !== null && avg !== undefined ? `${avg} / 10` : '—'
})

function localizeChartSegments(
  segments: ChartSegment[],
  labelPrefix: string
): ChartSegment[] {
  return segments.map((s) => ({
    ...s,
    label: s.key ? t(`${labelPrefix}.${s.key}`) : s.label,
  }))
}

const entriesByTypeChart = computed(() =>
  localizeChartSegments(stats.value?.entriesByType ?? [], 'chartEntryTypes')
)

const hypothesesConfidenceChart = computed(() =>
  localizeChartSegments(
    stats.value?.hypothesesByConfidence ?? [],
    'confidenceHypothesis'
  )
)

const severityTrendSubtitle = computed(() => {
  const base = t('dashboard.severityTrendBase')
  const info = stats.value?.severityTrendInfo
  if (!info) return base
  if (info.urgencyEstimatedCount > 0 && info.explicitCount === 0) {
    return `${base} ${t('dashboard.severityTrendEstimated')}`
  }
  if (info.urgencyEstimatedCount > 0) {
    return `${base} ${t('dashboard.severityTrendSomeUrgency')}`
  }
  if (info.textInferredCount > 0 && info.explicitCount === 0) {
    return `${base} ${t('dashboard.severityTrendParsed')}`
  }
  return base
})

const severityTrendEmptyText = computed(() => {
  const total = stats.value?.totalJournalEntries ?? 0
  if (total === 0) {
    return t('dashboard.severityTrendEmpty')
  }
  return t('dashboard.severityTrendEmptyDetail', {
    count: total,
    entries: t(total === 1 ? 'dashboard.entryOne' : 'dashboard.entryMany'),
  })
})

const attentionLinks = computed(() => attentionJournalLinks(journalEntries.value))

const statDetails = computed(() => {
  const s = stats.value
  const days = s?.daysTracked ?? 0
  const dateLocale = dateFnsLocaleFor(locale.value as AppLocale)
  let trackingSinceLabel = ''
  if (s?.trackingSince) {
    try {
      trackingSinceLabel = format(parseISO(s.trackingSince), 'MMM d, yyyy', {
        locale: dateLocale,
      })
    } catch {
      trackingSinceLabel = s.trackingSince
    }
  }
  const conditionNames =
    s?.conditions
      .slice(0, 3)
      .map((c) => c.name)
      .join(', ') ?? ''

  return {
    journal: t('dashboard.stats.journalEntriesDetail', { days }),
    activity: t('dashboard.stats.last30DaysDetail'),
    tracking: trackingSinceLabel
      ? t('dashboard.stats.daysTrackedDetail', { date: trackingSinceLabel })
      : t('dashboard.stats.daysTrackedEmpty'),
    conditions: conditionNames
      ? t('dashboard.stats.trackedConditionsDetail', { areas: conditionNames })
      : t('dashboard.stats.trackedConditionsEmpty'),
    severity:
      s?.averageSeverity != null
        ? t('dashboard.stats.avgSeverityDetail', { avg: s.averageSeverity })
        : t('dashboard.stats.avgSeverityEmpty'),
    timeline: t('dashboard.stats.timelineEventsDetail'),
    hypotheses: t('dashboard.stats.hypothesesDetail'),
    attention: t('dashboard.stats.attentionDetail'),
    attentionEmpty: t('dashboard.stats.attentionEmptyDetail'),
  }
})

const recommendations = computed(() =>
  getHealthRecommendations(patient.value, stats.value, journalEntries.value)
)

async function loadClinicalDoctorNotes() {
  if (!clinicalModel.value || journalEntries.value.length === 0) return

  const requestId = ++clinicalDoctorNotesRequestId
  clinicalDoctorNotesLoading.value = true

  try {
    const notes = await generateClinicalDoctorNotesAsync(
      clinicalModel.value,
      patient.value,
      journalEntries.value,
      clinicalDoctorSpecialty.value,
      t,
      dateFnsLocaleFor(locale.value as AppLocale),
      locale.value as AppLocale
    )
    if (requestId === clinicalDoctorNotesRequestId) {
      clinicalDoctorNotesContent.value = notes
    }
  } finally {
    if (requestId === clinicalDoctorNotesRequestId) {
      clinicalDoctorNotesLoading.value = false
    }
  }
}

function closeClinicalDoctorNotes() {
  if (clinicalDoctorNotesSurface.value === 'dashboard') {
    clinicalDoctorNotesSurface.value = null
  }
}

function onAppointmentDoctorNotesBack() {
  if (clinicalDoctorNotesSurface.value === 'appointment') {
    clinicalDoctorNotesSurface.value = null
  }
}

function onAppointmentModalClose() {
  if (clinicalDoctorNotesSurface.value === 'appointment') {
    clinicalDoctorNotesSurface.value = null
  }
}

async function openClinicalDoctorNotes() {
  if (!clinicalModel.value || journalEntries.value.length === 0) return
  clinicalDoctorSpecialty.value = inferDefaultDoctorSpecialty(
    journalEntries.value,
    stats.value?.conditions ?? []
  )
  clinicalDoctorNotesSurface.value = 'dashboard'
  clinicalDoctorNotesContent.value = ''
  await loadClinicalDoctorNotes()
}

async function openClinicalDoctorNotesFromAppointment() {
  if (
    !clinicalModel.value ||
    !nearestAppointment.value ||
    journalEntries.value.length === 0
  ) {
    return
  }
  clinicalDoctorSpecialty.value = inferDoctorSpecialtyFromAppointment(
    nearestAppointment.value,
    journalEntries.value,
    stats.value?.conditions ?? []
  )
  clinicalDoctorNotesSurface.value = 'appointment'
  clinicalDoctorNotesContent.value = ''
  await loadClinicalDoctorNotes()
}

function onClinicalDoctorSpecialtyChange() {
  if (!clinicalDoctorNotesSurface.value) return
  void loadClinicalDoctorNotes()
}

async function applyClinicalModel(entries: HealthEntry[]): Promise<void> {
  const requestId = ++clinicalModelRequestId
  const dateLocale = dateFnsLocaleFor(locale.value as AppLocale)
  const appLocale = locale.value as AppLocale

  if (shouldUseAiInsights() && entries.length > 0) {
    clinicalModelRefreshing.value = true
  }

  try {
    const model = await buildLocalizedClinicalModelAsync(
      entries,
      t,
      dateLocale,
      appLocale
    )
    if (requestId === clinicalModelRequestId) {
      clinicalModel.value = model
    }
  } finally {
    if (requestId === clinicalModelRequestId) {
      clinicalModelRefreshing.value = false
    }
  }
}

function loadDeferredClinicalModel(entries: HealthEntry[]): void {
  scheduleIdleWork(() => {
    void applyClinicalModel(entries)
  })
}

watch(locale, () => {
  if (journalEntries.value.length > 0) {
    void applyClinicalModel(journalEntries.value)
  }
})

function onAiInsightsChanged(): void {
  if (journalEntries.value.length > 0) {
    void applyClinicalModel(journalEntries.value)
  }
}

function onInsightsRegenerated(): void {
  if (journalEntries.value.length > 0) {
    void applyClinicalModel(journalEntries.value)
  }
}

onMounted(async () => {
  window.addEventListener('monday-ai-insights-changed', onAiInsightsChanged)
  window.addEventListener(
    'monday-insights-regenerated',
    onInsightsRegenerated as EventListener
  )
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

onUnmounted(() => {
  window.removeEventListener('monday-ai-insights-changed', onAiInsightsChanged)
  window.removeEventListener(
    'monday-insights-regenerated',
    onInsightsRegenerated as EventListener
  )
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
  return format(parseISO(iso), 'PP', {
    locale: dateFnsLocaleFor(locale.value as AppLocale),
  })
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
  align-items: stretch;
}

.stats-grid > * {
  min-height: 100%;
}

@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .stats-grid {
    grid-template-columns: 1fr;
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

.btn-clinical-doctor-notes {
  padding: 0.55rem 1rem;
  border: 1px solid color-mix(in srgb, var(--accent-strong) 40%, var(--border));
  border-radius: 8px;
  background: color-mix(in srgb, var(--accent-strong) 12%, var(--bg-surface));
  color: var(--accent-strong);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.btn-clinical-doctor-notes:hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent-strong) 20%, var(--bg-surface));
  border-color: var(--accent-strong);
}

.btn-clinical-doctor-notes:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

</style>
