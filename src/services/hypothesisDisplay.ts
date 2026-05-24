import { isGeneralHealthArea } from '@/services/bodyAreaDetection'
import type { Hypothesis, HypothesisHistoryEntry } from '@/models/types'

function mergeHistory(group: Hypothesis[]): HypothesisHistoryEntry[] {
  const all = group
    .flatMap((h) => h.history ?? [])
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  const seen = new Set<string>()
  const deduped: HypothesisHistoryEntry[] = []
  for (const entry of all) {
    if (seen.has(entry.id)) continue
    seen.add(entry.id)
    deduped.push(entry)
  }

  let createdSeen = false
  return deduped.map((entry) => {
    if (entry.kind !== 'created') return entry
    if (!createdSeen) {
      createdSeen = true
      return entry
    }
    return { ...entry, kind: 'updated' }
  })
}

function mergeGeneralHealthGroup(group: Hypothesis[]): Hypothesis {
  const sorted = [...group].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime()
  )
  const latest = sorted[0]
  const earliestCreated = sorted.reduce(
    (acc, h) =>
      new Date(h.createdAt || h.updatedAt).getTime() < new Date(acc).getTime()
        ? h.createdAt || h.updatedAt
        : acc,
    latest.createdAt || latest.updatedAt
  )

  return {
    ...latest,
    evidenceIds: [...new Set(group.flatMap((h) => h.evidenceIds))],
    createdAt: earliestCreated,
    updatedAt: latest.updatedAt || latest.createdAt,
    history: mergeHistory(group),
  }
}

/**
 * UI-only consolidation: if multiple hypotheses are in General Health,
 * show them as one evolving chain instead of separate cards.
 */
export function consolidateHypothesesForDisplay(hypotheses: Hypothesis[]): Hypothesis[] {
  const general: Hypothesis[] = []
  const other: Hypothesis[] = []

  for (const h of hypotheses) {
    if (isGeneralHealthArea(h.conditionArea)) {
      general.push(h)
    } else {
      other.push(h)
    }
  }

  const mergedGeneral =
    general.length > 1 ? [mergeGeneralHealthGroup(general)] : general

  return [...mergedGeneral, ...other].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}
