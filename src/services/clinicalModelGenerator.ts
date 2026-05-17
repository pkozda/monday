import { format, parseISO } from 'date-fns'
import type {
  ClinicalFactor,
  ClinicalModel,
  HealthEntry,
  HealthEntryType,
  HealthUrgency,
} from '@/models/types'

const ENTRY_TYPE_LABELS: Record<HealthEntryType, string> = {
  symptom: 'symptoms',
  medication: 'medication updates',
  change: 'condition changes',
  doctor_visit: 'doctor visits',
  imaging: 'tests / imaging',
  other: 'notes',
}

const WORSENING_RE =
  /\b(worse|worsen|deteriorat|declin|spreading|intensif|unbearable|severe)\w*/i

interface ConditionCluster {
  area: string
  entries: HealthEntry[]
}

function clusterByCondition(entries: HealthEntry[]): ConditionCluster[] {
  const map = new Map<string, HealthEntry[]>()
  for (const entry of entries) {
    const area = entry.conditionArea.trim()
    const list = map.get(area) ?? []
    list.push(entry)
    map.set(area, list)
  }
  return [...map.entries()]
    .map(([area, clusterEntries]) => ({
      area,
      entries: clusterEntries.sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      ),
    }))
    .sort((a, b) => b.entries.length - a.entries.length)
}

function formatShortDate(iso: string): string {
  return format(parseISO(iso), 'MMM yyyy')
}

function averageSeverity(entries: HealthEntry[]): number | null {
  const rated = entries.filter((e) => e.severity !== undefined)
  if (rated.length === 0) return null
  const sum = rated.reduce((acc, e) => acc + e.severity!, 0)
  return Math.round((sum / rated.length) * 10) / 10
}

function severityTrend(
  entries: HealthEntry[]
): 'rising' | 'improving' | 'stable' | 'unknown' {
  const rated = entries
    .filter((e) => e.severity !== undefined)
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )
  if (rated.length < 2) return 'unknown'
  const first = rated[0].severity!
  const last = rated[rated.length - 1].severity!
  if (last >= first + 1) return 'rising'
  if (last <= first - 1) return 'improving'
  return 'stable'
}

function latestUrgency(entries: HealthEntry[]): HealthUrgency {
  const order: HealthUrgency[] = ['emergency', 'urgent', 'monitor', 'routine']
  let maxIdx = order.length - 1
  for (const entry of entries) {
    const idx = order.indexOf(entry.analysis.urgency)
    if (idx < maxIdx) maxIdx = idx
  }
  return order[maxIdx]
}

function countEntryTypes(entries: HealthEntry[]): string {
  const counts = new Map<HealthEntryType, number>()
  for (const entry of entries) {
    counts.set(entry.entryType, (counts.get(entry.entryType) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, n]) => `${n} ${ENTRY_TYPE_LABELS[type]}`)
    .join(', ')
}

function describeConditionCluster(cluster: ConditionCluster): ClinicalFactor {
  const { area, entries } = cluster
  const count = entries.length
  const first = entries[0].eventDate
  const last = entries[entries.length - 1].eventDate
  const range =
    first === last
      ? formatShortDate(first)
      : `${formatShortDate(first)} – ${formatShortDate(last)}`

  const urgency = latestUrgency(entries)
  const avg = averageSeverity(entries)
  const trend = severityTrend(entries)
  const worseningNotes = entries.filter(
    (e) =>
      WORSENING_RE.test(
        [e.title, e.description, e.medications ?? ''].join(' ')
      ) || e.analysis.flags.includes('worsening_or_persistent')
  ).length

  const parts = [
    `${count} journal ${count === 1 ? 'entry' : 'entries'} (${range}).`,
    `Latest assessed urgency: ${urgency}.`,
  ]

  if (avg !== null) {
    parts.push(`Average self-reported severity: ${avg}/10.`)
  }

  if (trend === 'rising') {
    parts.push('Severity scores trend upward over this period.')
  } else if (trend === 'improving') {
    parts.push('Severity scores trend downward over this period.')
  } else if (trend === 'stable' && avg !== null) {
    parts.push('Reported severity has been relatively stable.')
  }

  if (worseningNotes > 0) {
    parts.push(
      `${worseningNotes} ${worseningNotes === 1 ? 'entry notes' : 'entries note'} worsening or persistence.`
    )
  }

  const typeMix = countEntryTypes(entries)
  if (typeMix) {
    parts.push(`Activity mix: ${typeMix}.`)
  }

  return {
    id: `factor-${area.toLowerCase().replace(/\s+/g, '-')}`,
    name: area,
    description: parts.join(' '),
  }
}

function buildSummary(entries: HealthEntry[], clusters: ConditionCluster[]): string {
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  )
  const first = sorted[0].eventDate
  const last = sorted[sorted.length - 1].eventDate
  const range =
    first === last
      ? formatShortDate(first)
      : `${formatShortDate(first)} through ${formatShortDate(last)}`

  const urgentCount = entries.filter((e) =>
    ['urgent', 'emergency'].includes(e.analysis.urgency)
  ).length

  const areas = clusters.length
  const topAreas = clusters
    .slice(0, 3)
    .map((c) => c.area)
    .join(', ')

  let summary = `Synthesized from ${entries.length} journal ${entries.length === 1 ? 'entry' : 'entries'} (${range}) across ${areas} tracked ${areas === 1 ? 'area' : 'areas'}.`

  if (topAreas) {
    summary += ` Most activity: ${topAreas}.`
  }

  if (urgentCount > 0) {
    summary += ` ${urgentCount} ${urgentCount === 1 ? 'entry flags' : 'entries flag'} urgent or emergency-level attention—review those records with a clinician.`
  } else {
    summary +=
      ' No urgent or emergency flags in the current journal snapshot.'
  }

  summary +=
    ' This model summarizes patterns in your logged data; it is not a medical diagnosis.'

  return summary
}

function buildCrossCuttingFactors(entries: HealthEntry[]): ClinicalFactor[] {
  const factors: ClinicalFactor[] = []

  const urgentEntries = entries.filter((e) =>
    ['urgent', 'emergency'].includes(e.analysis.urgency)
  )
  if (urgentEntries.length > 0) {
    const areas = [
      ...new Set(urgentEntries.map((e) => e.conditionArea.trim())),
    ].slice(0, 4)
    factors.push({
      id: 'factor-attention',
      name: 'Attention signals',
      description: `${urgentEntries.length} ${urgentEntries.length === 1 ? 'entry has' : 'entries have'} urgent or emergency-level urgency${areas.length ? ` (including ${areas.join(', ')})` : ''}. Prioritize follow-up with a care provider for these logs.`,
    })
  }

  const medEntries = entries.filter((e) => e.entryType === 'medication')
  if (medEntries.length > 0) {
    factors.push({
      id: 'factor-medication',
      name: 'Medication activity',
      description: `${medEntries.length} medication-related ${medEntries.length === 1 ? 'entry' : 'entries'} logged. Track dose changes, side effects, and timing alongside symptom entries for clearer treatment response patterns.`,
    })
  }

  const visitEntries = entries.filter((e) => e.entryType === 'doctor_visit')
  if (visitEntries.length > 0) {
    factors.push({
      id: 'factor-encounters',
      name: 'Clinical encounters',
      description: `${visitEntries.length} doctor ${visitEntries.length === 1 ? 'visit' : 'visits'} recorded. Visit notes help anchor timeline context when correlating tests, treatments, and symptom changes.`,
    })
  }

  return factors
}

const CLINICAL_MODEL_ID = 'model-generated'

export function buildClinicalModel(entries: HealthEntry[]): ClinicalModel {
  if (entries.length === 0) {
    return {
      id: CLINICAL_MODEL_ID,
      title: 'Your clinical model',
      summary:
        'No journal data yet. As you log symptoms, medications, visits, and tests, Monday will build a longitudinal clinical model summarizing patterns across the body areas you track.',
      factors: [],
    }
  }

  const clusters = clusterByCondition(entries)
  const conditionFactors = clusters
    .slice(0, 5)
    .map(describeConditionCluster)
  const crossCutting = buildCrossCuttingFactors(entries)

  const seenNames = new Set<string>()
  const factors: ClinicalFactor[] = []
  for (const factor of [...crossCutting, ...conditionFactors]) {
    const key = factor.name.toLowerCase()
    if (seenNames.has(key)) continue
    seenNames.add(key)
    factors.push(factor)
  }

  return {
    id: CLINICAL_MODEL_ID,
    title: 'Your clinical model',
    summary: buildSummary(entries, clusters),
    factors,
  }
}
