import { format, parseISO } from 'date-fns'
import type { Locale } from 'date-fns'
import type { Composer } from 'vue-i18n'
import type {
  ClinicalFactor,
  ClinicalModel,
  HealthEntry,
  HealthEntryType,
  HealthUrgency,
} from '@/models/types'
import { buildClinicalModel } from '@/services/clinicalModelGenerator'

type TFunction = Composer['t']

const ENTRY_TYPE_KEYS: Record<HealthEntryType, string> = {
  symptom: 'clinicalModel.entryTypes.symptom',
  medication: 'clinicalModel.entryTypes.medication',
  change: 'clinicalModel.entryTypes.change',
  doctor_visit: 'clinicalModel.entryTypes.doctorVisit',
  imaging: 'clinicalModel.entryTypes.imaging',
  lab_test: 'clinicalModel.entryTypes.labTest',
  surgery: 'clinicalModel.entryTypes.surgery',
  other: 'clinicalModel.entryTypes.other',
}

const URGENCY_KEYS: Record<HealthUrgency, string> = {
  emergency: 'urgency.emergency',
  urgent: 'urgency.urgent',
  monitor: 'urgency.monitor',
  routine: 'urgency.routine',
}

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

function formatShortDate(iso: string, dateLocale: Locale): string {
  return format(parseISO(iso), 'MMM yyyy', { locale: dateLocale })
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

function countEntryTypes(
  entries: HealthEntry[],
  t: TFunction
): string {
  const counts = new Map<HealthEntryType, number>()
  for (const entry of entries) {
    counts.set(entry.entryType, (counts.get(entry.entryType) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([type, n]) => `${n} ${t(ENTRY_TYPE_KEYS[type])}`)
    .join(', ')
}

function describeConditionCluster(
  cluster: ConditionCluster,
  t: TFunction,
  dateLocale: Locale
): ClinicalFactor {
  const { area, entries } = cluster
  const count = entries.length
  const first = entries[0].eventDate
  const last = entries[entries.length - 1].eventDate
  const range =
    first === last
      ? formatShortDate(first, dateLocale)
      : `${formatShortDate(first, dateLocale)} – ${formatShortDate(last, dateLocale)}`

  const urgency = latestUrgency(entries)
  const avg = averageSeverity(entries)
  const trend = severityTrend(entries)
  const worseningNotes = entries.filter(
    (e) =>
      /\b(worse|worsen|deteriorat|declin|spreading|intensif|unbearable|severe)\w*/i.test(
        [e.title, e.description, e.medications ?? ''].join(' ')
      ) || e.analysis.flags.includes('worsening_or_persistent')
  ).length

  const parts = [
    String(
      t('clinicalModel.factor.clusterIntro', {
        count,
        entries: t(
          count === 1 ? 'hypothesisCard.entry' : 'hypothesisCard.entries'
        ),
        range,
      })
    ),
    String(
      t('clinicalModel.factor.latestUrgency', {
        urgency: t(URGENCY_KEYS[urgency]),
      })
    ),
  ]

  if (avg !== null) {
    parts.push(String(t('clinicalModel.factor.avgSeverity', { avg })))
  }

  if (trend === 'rising') {
    parts.push(String(t('clinicalModel.factor.trendRising')))
  } else if (trend === 'improving') {
    parts.push(String(t('clinicalModel.factor.trendImproving')))
  } else if (trend === 'stable' && avg !== null) {
    parts.push(String(t('clinicalModel.factor.trendStable')))
  }

  if (worseningNotes > 0) {
    parts.push(
      String(
        t('clinicalModel.factor.worseningNotes', {
          count: worseningNotes,
          entries: t(
            worseningNotes === 1
              ? 'clinicalModel.factor.entryNotes'
              : 'clinicalModel.factor.entriesNote'
          ),
        })
      )
    )
  }

  const typeMix = countEntryTypes(entries, t)
  if (typeMix) {
    parts.push(String(t('clinicalModel.factor.activityMix', { mix: typeMix })))
  }

  return {
    id: `factor-${area.toLowerCase().replace(/\s+/g, '-')}`,
    name: area,
    description: parts.join(' '),
  }
}

function buildLocalizedSummary(
  entries: HealthEntry[],
  clusters: ConditionCluster[],
  t: TFunction,
  dateLocale: Locale
): string {
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  )
  const first = sorted[0].eventDate
  const last = sorted[sorted.length - 1].eventDate
  const range =
    first === last
      ? formatShortDate(first, dateLocale)
      : String(
          t('clinicalModel.summary.rangeThrough', {
            start: formatShortDate(first, dateLocale),
            end: formatShortDate(last, dateLocale),
          })
        )

  const urgentCount = entries.filter((e) =>
    ['urgent', 'emergency'].includes(e.analysis.urgency)
  ).length

  const areas = clusters.length
  const topAreas = clusters
    .slice(0, 3)
    .map((c) => c.area)
    .join(', ')

  let summary = String(
    t('clinicalModel.summary.intro', {
      count: entries.length,
      entries: t(
        entries.length === 1 ? 'hypothesisCard.entry' : 'hypothesisCard.entries'
      ),
      range,
      areas,
      areasLabel: t(
        areas === 1 ? 'clinicalModel.summary.area' : 'clinicalModel.summary.areas'
      ),
    })
  )

  if (topAreas) {
    summary += ` ${String(t('clinicalModel.summary.mostActivity', { topAreas }))}`
  }

  if (urgentCount > 0) {
    summary += ` ${String(
      t('clinicalModel.summary.urgentFlags', {
        count: urgentCount,
        entries: t(
          urgentCount === 1
            ? 'clinicalModel.summary.entryFlags'
            : 'clinicalModel.summary.entriesFlag'
        ),
      })
    )}`
  } else {
    summary += ` ${String(t('clinicalModel.summary.noUrgent'))}`
  }

  summary += ` ${String(t('clinicalModel.summary.disclaimer'))}`
  return summary
}

function buildCrossCuttingFactors(
  entries: HealthEntry[],
  t: TFunction
): ClinicalFactor[] {
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
      name: String(t('clinicalModel.factors.attentionName')),
      description: String(
        t('clinicalModel.factors.attentionDesc', {
          count: urgentEntries.length,
          has: t(
            urgentEntries.length === 1
              ? 'clinicalModel.factors.entryHas'
              : 'clinicalModel.factors.entriesHave'
          ),
          including: areas.length
            ? String(
                t('clinicalModel.factors.includingAreas', {
                  areas: areas.join(', '),
                })
              )
            : '',
        })
      ),
    })
  }

  const medEntries = entries.filter((e) => e.entryType === 'medication')
  if (medEntries.length > 0) {
    factors.push({
      id: 'factor-medication',
      name: String(t('clinicalModel.factors.medicationName')),
      description: String(
        t('clinicalModel.factors.medicationDesc', {
          count: medEntries.length,
          entries: t(
            medEntries.length === 1
              ? 'hypothesisCard.entry'
              : 'hypothesisCard.entries'
          ),
        })
      ),
    })
  }

  const visitEntries = entries.filter((e) => e.entryType === 'doctor_visit')
  if (visitEntries.length > 0) {
    factors.push({
      id: 'factor-encounters',
      name: String(t('clinicalModel.factors.encountersName')),
      description: String(
        t('clinicalModel.factors.encountersDesc', {
          count: visitEntries.length,
          visits: t(
            visitEntries.length === 1
              ? 'clinicalModel.factors.visit'
              : 'clinicalModel.factors.visits'
          ),
        })
      ),
    })
  }

  return factors
}

export function buildLocalizedClinicalModel(
  entries: HealthEntry[],
  t: TFunction,
  dateLocale: Locale
): ClinicalModel {
  if (entries.length === 0) {
    return {
      id: 'model-generated',
      title: String(t('clinicalModel.title')),
      summary: String(t('clinicalModel.emptySummary')),
      factors: [],
    }
  }

  const clusters = clusterByCondition(entries)
  const conditionFactors = clusters
    .slice(0, 5)
    .map((c) => describeConditionCluster(c, t, dateLocale))
  const crossCutting = buildCrossCuttingFactors(entries, t)

  const seenNames = new Set<string>()
  const factors: ClinicalFactor[] = []
  for (const factor of [...crossCutting, ...conditionFactors]) {
    const key = factor.name.toLowerCase()
    if (seenNames.has(key)) continue
    seenNames.add(key)
    factors.push(factor)
  }

  return {
    id: 'model-generated',
    title: String(t('clinicalModel.title')),
    summary: buildLocalizedSummary(entries, clusters, t, dateLocale),
    factors,
  }
}

/** Fallback: English model from generator (e.g. tests). */
export function localizeClinicalModelFromEnglish(
  model: ClinicalModel,
  entries: HealthEntry[],
  t: TFunction,
  dateLocale: Locale
): ClinicalModel {
  if (entries.length > 0) {
    return buildLocalizedClinicalModel(entries, t, dateLocale)
  }
  return {
    ...model,
    title: String(t('clinicalModel.title')),
    summary: String(t('clinicalModel.emptySummary')),
  }
}

export { buildClinicalModel }
