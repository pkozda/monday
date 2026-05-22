import { db } from '@/db/database'
import {
  extractAreaFromTitle,
  patternFromTitle,
} from '@/services/hypothesisGenerator'
import type {
  HealthEntry,
  Hypothesis,
  HypothesisHistoryEntry,
  HypothesisPattern,
} from '@/models/types'

function hypothesisGroupKey(h: Hypothesis): string {
  const area =
    h.conditionArea?.trim() || extractAreaFromTitle(h.title)
  const pattern: HypothesisPattern =
    h.pattern ?? patternFromTitle(h.title)
  return `${area.toLowerCase()}::${pattern}`
}

function journalIdsFromEvidence(
  evidenceIds: string[],
  journalIdSet: Set<string>
): string[] {
  return [...new Set(evidenceIds.filter((id) => journalIdSet.has(id)))]
}

function earliestTimestamp(entries: HealthEntry[]): string | null {
  if (entries.length === 0) return null
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  )
  return sorted[0].createdAt ?? sorted[0].eventDate
}

export function needsHypothesisMigration(raw: Hypothesis): boolean {
  if (!raw.conditionArea?.trim()) return true
  if (!raw.pattern) return true
  if (!raw.createdAt) return true
  if (!raw.updatedAt) return true
  if (!raw.history?.length) return true
  return raw.history.some(
    (h) =>
      h.kind === 'created' &&
      (!h.newJournalEntryIds?.length || !h.journalEntryCount)
  )
}

export function migrateHypothesisRecord(
  raw: Hypothesis,
  entries: HealthEntry[],
  journalIdSet: Set<string>
): Hypothesis {
  const conditionArea =
    raw.conditionArea?.trim() || extractAreaFromTitle(raw.title)
  const pattern = raw.pattern ?? patternFromTitle(raw.title)
  const linkedJournalIds = journalIdsFromEvidence(raw.evidenceIds, journalIdSet)
  const linkedEntries = entries.filter((e) => linkedJournalIds.includes(e.id))

  const fallbackTime = new Date().toISOString()
  const createdAt =
    raw.createdAt ?? earliestTimestamp(linkedEntries) ?? fallbackTime
  const updatedAt = raw.updatedAt ?? createdAt

  let history: HypothesisHistoryEntry[]

  if (!raw.history?.length) {
    history = [
      {
        id: crypto.randomUUID(),
        at: createdAt,
        kind: 'created',
        title: raw.title,
        confidence: raw.confidence,
        journalEntryCount: linkedJournalIds.length,
        newJournalEntryIds: linkedJournalIds,
        note:
          linkedJournalIds.length > 0
            ? `Migrated hypothesis with ${linkedJournalIds.length} linked journal ${linkedJournalIds.length === 1 ? 'entry' : 'entries'}.`
            : 'Migrated from earlier analysis (no journal IDs matched in evidence).',
      },
    ]
  } else {
    history = raw.history.map((item, index) => {
      const isFirstCreated =
        index === 0 && item.kind === 'created' && raw.history!.length === 1
      const needsJournalFix =
        item.kind === 'created' && !item.newJournalEntryIds?.length

      if (isFirstCreated || needsJournalFix) {
        return {
          ...item,
          journalEntryCount: linkedJournalIds.length,
          newJournalEntryIds:
            item.newJournalEntryIds?.length > 0
              ? item.newJournalEntryIds
              : linkedJournalIds,
          note:
            item.note ||
            (linkedJournalIds.length > 0
              ? `Linked ${linkedJournalIds.length} journal ${linkedJournalIds.length === 1 ? 'record' : 'records'} during migration.`
              : item.note),
        }
      }
      return item
    })
  }

  return {
    ...raw,
    title: raw.title,
    confidence: raw.confidence,
    evidenceIds: raw.evidenceIds,
    conditionArea,
    pattern,
    createdAt,
    updatedAt,
    history,
  }
}

export interface HypothesisMigrationResult {
  total: number
  migrated: number
}

/** Persist hypothesis rows that predate schema v2 (area, pattern, history). */
export async function migrateHypothesesSchemaV2(): Promise<HypothesisMigrationResult> {
  const [rows, entries] = await Promise.all([
    db.hypotheses.toArray(),
    db.healthEntries.toArray(),
  ])

  const journalIdSet = new Set(entries.map((e) => e.id))
  let migrated = 0

  await db.transaction('rw', db.hypotheses, async () => {
    for (const row of rows) {
      if (!needsHypothesisMigration(row)) continue

      const next = migrateHypothesisRecord(row, entries, journalIdSet)
      await db.hypotheses.put(next)
      migrated += 1
    }
  })

  return { total: rows.length, migrated }
}

function mergeHistoryEntries(
  group: Hypothesis[]
): HypothesisHistoryEntry[] {
  const sorted = group
    .flatMap((h) => h.history ?? [])
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  const seenIds = new Set<string>()
  const deduped: HypothesisHistoryEntry[] = []
  for (const entry of sorted) {
    if (seenIds.has(entry.id)) continue
    seenIds.add(entry.id)
    deduped.push(entry)
  }

  let createdSeen = false
  return deduped.map((entry) => {
    if (entry.kind !== 'created') return entry
    if (!createdSeen) {
      createdSeen = true
      return entry
    }
    return {
      ...entry,
      kind: 'updated' as const,
      note: entry.note
        ? `${entry.note} (merged from earlier duplicate record.)`
        : 'Merged from earlier duplicate hypothesis record.',
    }
  })
}

function mergeHypothesisGroup(group: Hypothesis[]): Hypothesis {
  const sorted = [...group].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime()
  )
  const latest = sorted[0]

  const evidenceIds = [
    ...new Set(group.flatMap((h) => h.evidenceIds)),
  ]

  const createdAt = group.reduce((earliest, h) => {
    const candidate = h.createdAt || h.updatedAt
    return new Date(candidate).getTime() < new Date(earliest).getTime()
      ? candidate
      : earliest
  }, latest.createdAt || latest.updatedAt)

  const conditionArea =
    latest.conditionArea?.trim() || extractAreaFromTitle(latest.title)
  const pattern = latest.pattern ?? patternFromTitle(latest.title)

  return {
    ...latest,
    conditionArea,
    pattern,
    evidenceIds,
    createdAt,
    updatedAt: latest.updatedAt || latest.createdAt,
    history: mergeHistoryEntries(group),
  }
}

export interface HypothesisConsolidationResult {
  total: number
  kept: number
  removed: number
}

/** Remove duplicate hypotheses (same condition area + pattern); keep latest with merged history. */
export async function consolidateDuplicateHypotheses(): Promise<HypothesisConsolidationResult> {
  const rows = await db.hypotheses.toArray()
  const groups = new Map<string, Hypothesis[]>()

  for (const row of rows) {
    const key = hypothesisGroupKey(row)
    const list = groups.get(key) ?? []
    list.push(row)
    groups.set(key, list)
  }

  const toKeep: Hypothesis[] = []
  const toRemove: string[] = []

  for (const group of groups.values()) {
    if (group.length === 1) {
      toKeep.push(group[0])
      continue
    }

    const merged = mergeHypothesisGroup(group)
    toKeep.push(merged)
    for (const row of group) {
      if (row.id !== merged.id) toRemove.push(row.id)
    }
  }

  if (toRemove.length === 0) {
    return { total: rows.length, kept: rows.length, removed: 0 }
  }

  await db.transaction('rw', db.hypotheses, async () => {
    for (const hypothesis of toKeep) {
      await db.hypotheses.put(hypothesis)
    }
    await db.hypotheses.bulkDelete(toRemove)
  })

  return {
    total: rows.length,
    kept: toKeep.length,
    removed: toRemove.length,
  }
}
