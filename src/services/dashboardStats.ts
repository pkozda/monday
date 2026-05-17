import { differenceInDays, format, parseISO, subDays } from 'date-fns'
import { getEntryClassificationLabel } from '@/services/healthAnalysis'
import type {
  ChartSegment,
  ConditionSummary,
  DashboardStats,
  HealthEntry,
  HealthEntryType,
  Hypothesis,
  HypothesisConfidence,
  PatientProfile,
  SeverityPoint,
  TimelineEvent,
} from '@/models/types'

const ENTRY_TYPE_LABELS: Record<HealthEntryType, string> = {
  symptom: 'Symptoms',
  medication: 'Medication',
  change: 'Changes',
  doctor_visit: 'Doctor visits',
  imaging: 'Tests / imaging',
  other: 'Other notes',
}

const ENTRY_TYPE_COLORS: Record<HealthEntryType, string> = {
  symptom: '#ffb74d',
  medication: '#81c784',
  change: '#64b5f6',
  doctor_visit: '#ba68c8',
  imaging: '#4dd0e1',
  other: '#90a4ae',
}

const CONFIDENCE_COLORS: Record<HypothesisConfidence, string> = {
  Exploratory: '#90a4ae',
  Supported: '#64b5f6',
  'Strongly Supported': '#81c784',
}

function countByType(entries: HealthEntry[]): ChartSegment[] {
  const counts = new Map<HealthEntryType, number>()
  for (const entry of entries) {
    counts.set(entry.entryType, (counts.get(entry.entryType) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([type, value]) => ({
      label: ENTRY_TYPE_LABELS[type],
      value,
      color: ENTRY_TYPE_COLORS[type],
    }))
    .sort((a, b) => b.value - a.value)
}

const CLASSIFICATION_CHART_COLORS = [
  '#42a5f5',
  '#26a69a',
  '#ab47bc',
  '#ffa726',
  '#5c6bc0',
  '#66bb6a',
  '#ef5350',
  '#90a4ae',
]

function countByClassification(entries: HealthEntry[]): ChartSegment[] {
  const counts = new Map<string, number>()
  for (const entry of entries) {
    const label = getEntryClassificationLabel(entry)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, value], index) => ({
      label,
      value,
      color:
        CLASSIFICATION_CHART_COLORS[index % CLASSIFICATION_CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
}

function buildConditions(entries: HealthEntry[]): ConditionSummary[] {
  const map = new Map<string, HealthEntry[]>()
  for (const entry of entries) {
    const key = entry.conditionArea.trim()
    const list = map.get(key) ?? []
    list.push(entry)
    map.set(key, list)
  }

  return [...map.entries()]
    .map(([name, list]) => {
      const sorted = [...list].sort(
        (a, b) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      )
      return {
        name,
        entryCount: list.length,
        lastEntryDate: sorted[0].eventDate,
        latestUrgency: sorted[0].analysis.urgency,
        latestClassification: getEntryClassificationLabel(sorted[0]),
      }
    })
    .sort((a, b) => b.entryCount - a.entryCount)
}

function buildSeverityTrend(entries: HealthEntry[]): SeverityPoint[] {
  return entries
    .filter((e) => e.severity !== undefined)
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )
    .slice(-12)
    .map((e) => ({
      date: e.eventDate,
      severity: e.severity!,
      label: format(parseISO(e.eventDate), 'MMM d'),
    }))
}

function countHypotheses(hypotheses: Hypothesis[]): ChartSegment[] {
  const counts: Record<HypothesisConfidence, number> = {
    Exploratory: 0,
    Supported: 0,
    'Strongly Supported': 0,
  }
  for (const h of hypotheses) {
    counts[h.confidence] += 1
  }
  return (Object.keys(counts) as HypothesisConfidence[])
    .map((confidence) => ({
      label: confidence,
      value: counts[confidence],
      color: CONFIDENCE_COLORS[confidence],
    }))
    .filter((s) => s.value > 0)
}

export function buildDashboardStats(
  _patient: PatientProfile,
  entries: HealthEntry[],
  timeline: TimelineEvent[],
  hypotheses: Hypothesis[]
): DashboardStats {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  const sortedDates = entries
    .map((e) => e.eventDate)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const trackingSince = sortedDates[0] ?? null
  const daysTracked = trackingSince
    ? Math.max(1, differenceInDays(now, parseISO(trackingSince)) + 1)
    : 0

  const entriesLast30Days = entries.filter(
    (e) => parseISO(e.eventDate) >= thirtyDaysAgo
  ).length

  const withSeverity = entries.filter((e) => e.severity !== undefined)
  const averageSeverity =
    withSeverity.length > 0
      ? Math.round(
          (withSeverity.reduce((sum, e) => sum + e.severity!, 0) /
            withSeverity.length) *
            10
        ) / 10
      : null

  const attentionRequired = entries.filter((e) =>
    ['urgent', 'emergency'].includes(e.analysis.urgency)
  ).length

  return {
    trackingSince,
    daysTracked,
    totalJournalEntries: entries.length,
    totalTimelineEvents: timeline.length,
    totalHypotheses: hypotheses.length,
    entriesLast30Days,
    attentionRequired,
    averageSeverity,
    conditions: buildConditions(entries),
    entriesByType: countByType(entries),
    urgencyBreakdown: countByClassification(entries),
    severityTrend: buildSeverityTrend(entries),
    hypothesesByConfidence: countHypotheses(hypotheses),
  }
}
