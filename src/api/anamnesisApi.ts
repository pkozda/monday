import { createHealthEntry } from '@/api/healthApi'
import { db } from '@/db/database'
import {
  parseAnamnesis,
  toHealthEntryInput,
  type ParsedAnamnesisRecord,
} from '@/services/anamnesisParser'
import {
  journalEntryFingerprint,
  journalEntryFingerprintFromInput,
} from '@/services/journalEntryDedup'
import type { HealthEntry } from '@/models/types'

export type { ParsedAnamnesisRecord } from '@/services/anamnesisParser'

export interface AnamnesisImportResult {
  recordsParsed: number
  entriesCreated: number
  duplicatesSkipped: number
  preview: ParsedAnamnesisRecord[]
  entries: HealthEntry[]
}

export function previewAnamnesis(
  text: string,
  primaryConditionArea?: string
): ParsedAnamnesisRecord[] {
  return parseAnamnesis(text, primaryConditionArea)
}

export async function importAnamnesis(
  text: string,
  primaryConditionArea?: string
): Promise<AnamnesisImportResult> {
  const preview = parseAnamnesis(text, primaryConditionArea)

  if (preview.length === 0) {
    throw new Error(
      'Could not parse any history from this text. Try splitting into paragraphs or bullet points, each describing one event or period.'
    )
  }

  const existing = await db.healthEntries.toArray()
  const seen = new Set(existing.map((e) => journalEntryFingerprint(e)))

  const entries: HealthEntry[] = []
  let duplicatesSkipped = 0

  for (const record of preview) {
    const input = toHealthEntryInput(record)
    const fp = journalEntryFingerprintFromInput(input)
    if (seen.has(fp)) {
      duplicatesSkipped += 1
      continue
    }
    const entry = await createHealthEntry(input)
    seen.add(fp)
    entries.push(entry)
  }

  return {
    recordsParsed: preview.length,
    entriesCreated: entries.length,
    duplicatesSkipped,
    preview,
    entries,
  }
}
