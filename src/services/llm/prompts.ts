export const CLINICAL_SAFETY_SYSTEM = `You assist a personal health journal app called Monday.
You are NOT a doctor. You do not diagnose definitively.
Use cautious, plain language. Encourage seeing a qualified clinician for emergencies.
Never invent tests, visits, or symptoms the user did not log.
Respond only with valid JSON when asked.`

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
