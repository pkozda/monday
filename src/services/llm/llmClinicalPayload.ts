import type { HealthEntry } from '@/models/types'

/** Clinical fields only — no profile, appointments, or rule-based analysis metadata. */
export interface LlmJournalEntry {
  id: string
  eventDate: string
  entryType: string
  conditionArea: string
  title: string
  description: string
  medications?: string
  severity?: number
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
const PHONE_RE = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3}[\s-]?\d{2,3}[\s-]?\d{2,4}/g

export function redactLikelyPii(text: string): string {
  return text.replace(EMAIL_RE, '[redacted]').replace(PHONE_RE, '[redacted]')
}

export function sanitizeEntryForLlm(entry: HealthEntry): LlmJournalEntry {
  const payload: LlmJournalEntry = {
    id: entry.id,
    eventDate: entry.eventDate,
    entryType: entry.entryType,
    conditionArea: entry.conditionArea.trim(),
    title: redactLikelyPii(entry.title.trim()),
    description: redactLikelyPii(entry.description.trim()),
  }
  const meds = entry.medications?.trim()
  if (meds) payload.medications = redactLikelyPii(meds)
  if (entry.severity !== undefined) payload.severity = entry.severity
  return payload
}

export function sanitizeEntriesForLlm(entries: HealthEntry[]): LlmJournalEntry[] {
  return entries.map(sanitizeEntryForLlm)
}

export function journalBundleForLlm(entries: HealthEntry[]): string {
  return JSON.stringify(
    { journalEntries: sanitizeEntriesForLlm(entries) },
    null,
    2
  )
}
