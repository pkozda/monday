export const CLINICAL_SAFETY_SYSTEM = `Monday health journal assistant. Not a doctor. Cautious tone. No invented facts. JSON only when asked.`

export function journalEntryUserPayload(entry: {
  id: string
  eventDate: string
  conditionArea: string
  entryType: string
  title: string
  description: string
  medications?: string
  severity?: number
}): string {
  return JSON.stringify(
    {
      id: entry.id,
      eventDate: entry.eventDate,
      conditionArea: entry.conditionArea,
      entryType: entry.entryType,
      title: entry.title,
      description: entry.description,
      medications: entry.medications,
      severity: entry.severity,
    },
    null,
    2
  )
}

export function journalBundleUserPayload(
  entries: Array<{
    id: string
    eventDate: string
    conditionArea: string
    entryType: string
    title: string
    description: string
    medications?: string
    severity?: number
    analysis?: { urgency: string; classification: string; flags: string[]; summary: string }
  }>
): string {
  return JSON.stringify({ journalEntries: entries }, null, 2)
}
