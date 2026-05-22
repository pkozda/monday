import type { HealthEntry, HealthUrgency, PatientProfile } from '@/models/types'

export interface MedicalHistoryContext {
  entries: HealthEntry[]
  allText: string
  entryCount: number
  spanDays: number
  hasExplicitDiagnosis: boolean
  hasDoctorVisit: boolean
  hasImaging: boolean
  averageSeverity: number | null
  urgencyCounts: Record<HealthUrgency, number>
  recurringSymptomEntries: number
  medicationSnippet: string
}

export function entryText(entry: HealthEntry): string {
  return [
    entry.conditionArea,
    entry.title,
    entry.description,
    entry.medications ?? '',
    entry.analysis.summary,
    entry.analysis.classification,
  ].join(' ')
}

export function buildMedicalHistoryContext(
  entries: HealthEntry[],
  _profile?: PatientProfile | null
): MedicalHistoryContext {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  )

  const allText = sorted.map(entryText).join('\n')
  const first = sorted[0]?.eventDate
  const last = sorted[sorted.length - 1]?.eventDate
  const spanDays =
    first && last
      ? Math.max(
          1,
          Math.round(
            (new Date(last).getTime() - new Date(first).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0

  const severities = sorted
    .map((e) => e.severity)
    .filter((s): s is number => s !== undefined)
  const averageSeverity =
    severities.length > 0
      ? Math.round(
          (severities.reduce((a, b) => a + b, 0) / severities.length) * 10
        ) / 10
      : null

  const urgencyCounts: Record<HealthUrgency, number> = {
    routine: 0,
    monitor: 0,
    urgent: 0,
    emergency: 0,
  }
  for (const e of sorted) {
    urgencyCounts[e.analysis.urgency] += 1
  }

  const recurringSymptomEntries = sorted.filter(
    (e) =>
      ['symptom', 'change'].includes(e.entryType) &&
      /\b(return|again|recurr|still|persist|chronic)\b/i.test(entryText(e))
  ).length

  return {
    entries: sorted,
    allText,
    entryCount: sorted.length,
    spanDays,
    hasExplicitDiagnosis: /\b(diagnosed|diagnosis|confirmed|icd|biopsy\s+showed)\b/i.test(
      allText
    ),
    hasDoctorVisit: sorted.some((e) => e.entryType === 'doctor_visit'),
    hasImaging: sorted.some((e) => e.entryType === 'imaging'),
    averageSeverity,
    urgencyCounts,
    recurringSymptomEntries,
    medicationSnippet: sorted
      .map((e) => e.medications)
      .filter(Boolean)
      .join(' '),
  }
}

export function findMatchingEntry(
  history: MedicalHistoryContext,
  patterns: RegExp[]
): HealthEntry | undefined {
  for (const entry of history.entries) {
    const text = entryText(entry)
    if (patterns.some((p) => p.test(text))) return entry
  }
  if (patterns.some((p) => p.test(history.allText))) {
    return history.entries[history.entries.length - 1]
  }
  return undefined
}
