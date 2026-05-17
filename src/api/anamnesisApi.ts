import { createHealthEntry } from '@/api/healthApi'
import {
  parseAnamnesis,
  toHealthEntryInput,
  type ParsedAnamnesisRecord,
} from '@/services/anamnesisParser'
import type { HealthEntry } from '@/models/types'

export type { ParsedAnamnesisRecord } from '@/services/anamnesisParser'

export interface AnamnesisImportResult {
  recordsParsed: number
  entriesCreated: number
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

  const entries: HealthEntry[] = []
  for (const record of preview) {
    entries.push(await createHealthEntry(toHealthEntryInput(record)))
  }

  return {
    recordsParsed: preview.length,
    entriesCreated: entries.length,
    preview,
    entries,
  }
}
