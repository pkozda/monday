import { differenceInDays, format, parseISO, subDays } from 'date-fns'
import { getEntryClassificationLabel } from '@/services/healthAnalysis'
import { resolveEntrySeverity } from '@/services/entrySeverity'
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
  SeverityTrendInfo,
  TimelineEvent,
} from '@/models/types'

const ENTRY_TYPE_LABELS: Record<HealthEntryType, string> = {
  symptom: 'Symptoms',
  medication: 'Medication',
  change: 'Changes',
  doctor_visit: 'Doctor visits',
  imaging: 'Imaging',
  lab_test: 'Lab results',
  surgery: 'Surgery',
  other: 'Other notes',
}

const ENTRY_TYPE_COLORS: Record<HealthEntryType, string> = {
  symptom: '#ffb74d',
  medication: '#81c784',
  change: '#64b5f6',
  doctor_visit: '#ba68c8',
  imaging: '#4dd0e1',
  lab_test: '#4fc3f7',
  surgery: '#f06292',
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
      key: type,
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

function eventDay(isoDate: string): string {
  const parsed = parseISO(isoDate)
  if (Number.isNaN(parsed.getTime())) return isoDate.slice(0, 10)
  return format(parsed, 'yyyy-MM-dd')
}

function severityLabelForChart(dayIso: string, spanDays: number): string {
  const d = parseISO(dayIso)
  if (Number.isNaN(d.getTime())) return dayIso
  if (spanDays > 365) return format(d, 'MMM d, yyyy')
  if (spanDays > 45) return format(d, 'MMM d, yy')
  return format(d, 'MMM d')
}

function buildSeverityTrendInfo(entries: HealthEntry[]): SeverityTrendInfo {
  const info: SeverityTrendInfo = {
    explicitCount: 0,
    textInferredCount: 0,
    urgencyEstimatedCount: 0,
  }
  for (const entry of entries) {
    const resolved = resolveEntrySeverity(entry)
    if (!resolved) continue
    if (resolved.source === 'reported') info.explicitCount += 1
    else if (resolved.source === 'text') info.textInferredCount += 1
    else info.urgencyEstimatedCount += 1
  }
  return info
}

/** Severity by when symptoms occurred (eventDate), not when the record was saved. */
function buildSeverityTrend(entries: HealthEntry[]): SeverityPoint[] {
  const rated = entries.filter((e) => {
    if (!e.eventDate?.trim()) return false
    return resolveEntrySeverity(e) !== null
  })
  if (rated.length === 0) return []

  const byDay = new Map<string, { sum: number; count: number }>()
  for (const entry of rated) {
    const resolved = resolveEntrySeverity(entry)!
    const day = eventDay(entry.eventDate)
    const bucket = byDay.get(day) ?? { sum: 0, count: 0 }
    bucket.sum += resolved.value
    bucket.count += 1
    byDay.set(day, bucket)
  }

  const days = [...byDay.keys()].sort()
  const firstDay = days[0]
  const lastDay = days[days.length - 1]
  const spanDays =
    firstDay && lastDay
      ? Math.max(
          1,
          differenceInDays(parseISO(lastDay), parseISO(firstDay)) + 1
        )
      : 1

  return days.slice(-24).map((day) => {
    const bucket = byDay.get(day)!
    const severity = Math.round((bucket.sum / bucket.count) * 10) / 10
    return {
      date: day,
      severity,
      label: severityLabelForChart(day, spanDays),
    }
  })
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
  const confidenceKeys: Record<HypothesisConfidence, string> = {
    Exploratory: 'exploratory',
    Supported: 'supported',
    'Strongly Supported': 'stronglySupported',
  }
  return (Object.keys(counts) as HypothesisConfidence[])
    .map((confidence) => ({
      label: confidence,
      key: confidenceKeys[confidence],
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

  const resolvedSeverities = entries
    .map((e) => resolveEntrySeverity(e)?.value)
    .filter((v): v is number => v !== undefined)
  const averageSeverity =
    resolvedSeverities.length > 0
      ? Math.round(
          (resolvedSeverities.reduce((sum, v) => sum + v, 0) /
            resolvedSeverities.length) *
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
    severityTrendInfo: buildSeverityTrendInfo(entries),
    hypothesesByConfidence: countHypotheses(hypotheses),
  }
}
