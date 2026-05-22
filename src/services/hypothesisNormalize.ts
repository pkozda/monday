import {
  extractAreaFromTitle,
  patternFromTitle,
} from '@/services/hypothesisGenerator'
import {
  migrateHypothesisRecord,
  needsHypothesisMigration,
} from '@/db/migrateHypotheses'
import type { HealthEntry, Hypothesis } from '@/models/types'

/** In-memory normalize for display (DB rows should be migrated via migrateHypothesesSchemaV2). */
export function normalizeHypothesis(
  raw: Hypothesis,
  entries: HealthEntry[] = []
): Hypothesis {
  const journalIdSet = new Set(entries.map((e) => e.id))

  if (needsHypothesisMigration(raw) && entries.length > 0) {
    return migrateHypothesisRecord(raw, entries, journalIdSet)
  }

  const conditionArea =
    raw.conditionArea?.trim() || extractAreaFromTitle(raw.title)
  const pattern = raw.pattern ?? patternFromTitle(raw.title)
  const updatedAt = raw.updatedAt ?? raw.createdAt ?? new Date().toISOString()
  const createdAt = raw.createdAt ?? updatedAt

  const history =
    raw.history?.length > 0
      ? raw.history
      : [
          {
            id: crypto.randomUUID(),
            at: createdAt,
            kind: 'created' as const,
            title: raw.title,
            confidence: raw.confidence,
            journalEntryCount: journalIdsFromEvidence(
              raw.evidenceIds,
              journalIdSet
            ).length,
            newJournalEntryIds: journalIdsFromEvidence(
              raw.evidenceIds,
              journalIdSet
            ),
            note: 'Earlier analysis (imported into history).',
          },
        ]

  return {
    ...raw,
    conditionArea,
    pattern,
    createdAt,
    updatedAt,
    history,
  }
}

function journalIdsFromEvidence(
  evidenceIds: string[],
  journalIdSet: Set<string>
): string[] {
  return [...new Set(evidenceIds.filter((id) => journalIdSet.has(id)))]
}
