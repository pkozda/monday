import { db } from '@/db/database'
import { getHealthEntries } from '@/api/healthApi'
import { getHypotheses, saveHypothesis } from '@/api/mockApi'
import {
  analyzeHypothesisGeneration,
  buildAllHypothesesFromJournal,
  type HypothesisGenerationResult,
} from '@/services/hypothesisGenerator'
import { normalizeHypothesis } from '@/services/hypothesisNormalize'

export type { HypothesisGenerationResult }

export async function clearAllHypotheses(): Promise<number> {
  const count = await db.hypotheses.count()
  await db.hypotheses.clear()
  return count
}

export type RegenerateMessageKey = 'needEntries' | 'success' | 'noHypotheses'

export interface RegenerateInsightsResult {
  hypothesisCount: number
  journalEntryCount: number
  areas: string[]
  messageKey: RegenerateMessageKey
}

/** Clear stored hypotheses and rebuild them from the full journal. */
export async function regenerateAllHypothesesFromJournal(): Promise<RegenerateInsightsResult> {
  const entries = await getHealthEntries()

  if (entries.length === 0) {
    return {
      hypothesisCount: 0,
      journalEntryCount: 0,
      areas: [],
      messageKey: 'needEntries',
    }
  }

  await clearAllHypotheses()

  const built = buildAllHypothesesFromJournal(entries)
  for (const hypothesis of built) {
    await saveHypothesis(normalizeHypothesis(hypothesis))
  }

  const areas = [...new Set(built.map((h) => h.conditionArea.trim()))].filter(
    Boolean
  )

  return {
    hypothesisCount: built.length,
    journalEntryCount: entries.length,
    areas,
    messageKey: built.length > 0 ? 'success' : 'noHypotheses',
  }
}

export async function tryGenerateHypothesis(): Promise<HypothesisGenerationResult> {
  const [entries, existing] = await Promise.all([
    getHealthEntries(),
    getHypotheses(),
  ])

  const result = analyzeHypothesisGeneration(entries, existing)

  if (
    (result.status === 'created' || result.status === 'updated') &&
    result.hypothesis
  ) {
    await saveHypothesis(normalizeHypothesis(result.hypothesis))
  }

  return result
}
