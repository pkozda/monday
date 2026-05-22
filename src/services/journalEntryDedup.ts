import {
  combinedEntryText,
  getEntryClassificationLabel,
  resolveEntryType,
} from '@/services/healthAnalysis'
import { procedureVisitFingerprint } from '@/services/journalAppointmentSync'
import {
  isWeightRelatedText,
  weightEntryFingerprint,
} from '@/services/weightEntry'
import type { HealthEntry, HealthEntryInput } from '@/models/types'

function fingerprintForEntry(
  text: string,
  eventDate: string,
  labelOrType: string
): string {
  if (isWeightRelatedText(text)) {
    return weightEntryFingerprint(eventDate, text)
  }
  return procedureVisitFingerprint(text, labelOrType, eventDate)
}

/** Stable identity for “same event” journal rows (e.g. repeated anamnesis import). */
export function journalEntryFingerprintFromInput(
  input: HealthEntryInput
): string {
  const text = combinedEntryText(input)
  const entryType = resolveEntryType(input.entryType, text)
  return fingerprintForEntry(text, input.eventDate, entryType)
}

export function journalEntryFingerprint(entry: HealthEntry): string {
  const text = combinedEntryText(entry)
  const label = getEntryClassificationLabel(entry)
  return fingerprintForEntry(text, entry.eventDate, label)
}

function entryRichness(entry: HealthEntry): number {
  return (
    entry.title.length +
    entry.description.length +
    (entry.medications?.length ?? 0)
  )
}

/** Prefer the fullest record when two rows describe the same visit. */
export function pickEntryToKeep(entries: HealthEntry[]): HealthEntry {
  return [...entries].sort((a, b) => {
    const richness = entryRichness(b) - entryRichness(a)
    if (richness !== 0) return richness
    return a.createdAt.localeCompare(b.createdAt)
  })[0]
}
