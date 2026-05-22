import type { HealthEntry, HealthUrgency } from '@/models/types'

export type SeveritySource = 'reported' | 'text' | 'urgency'

export interface ResolvedEntrySeverity {
  value: number
  source: SeveritySource
}

const URGENCY_TO_SEVERITY: Record<HealthUrgency, number> = {
  routine: 3,
  monitor: 5,
  urgent: 7,
  emergency: 9,
}

/** Parse self-reported pain/severity from free text (e.g. "7/10", "pain level 8"). */
export function extractSeverityFromText(text: string): number | undefined {
  const slash = text.match(/\b(\d{1,2})\s*\/\s*10\b/)
  if (slash) {
    const n = Number(slash[1])
    if (n >= 1 && n <= 10) return n
  }

  const painLevel = text.match(
    /\b(?:pain|severity)\s*(?:level|score)?\s*[:is]?\s*(\d{1,2})\b/i
  )
  if (painLevel) {
    const n = Number(painLevel[1])
    if (n >= 1 && n <= 10) return n
  }

  return undefined
}

function entryTextBundle(entry: HealthEntry): string {
  return [entry.title, entry.description, entry.medications]
    .filter(Boolean)
    .join(' ')
}

/** Severity for charts: explicit rating, then note text, then urgency band. */
export function resolveEntrySeverity(
  entry: HealthEntry
): ResolvedEntrySeverity | null {
  if (
    entry.severity !== undefined &&
    entry.severity >= 1 &&
    entry.severity <= 10
  ) {
    return { value: entry.severity, source: 'reported' }
  }

  const fromText = extractSeverityFromText(entryTextBundle(entry))
  if (fromText !== undefined) {
    return { value: fromText, source: 'text' }
  }

  const urgency = entry.analysis?.urgency
  if (urgency) {
    return { value: URGENCY_TO_SEVERITY[urgency], source: 'urgency' }
  }

  return null
}
