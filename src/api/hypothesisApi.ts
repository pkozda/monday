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

export interface RegenerateInsightsResult {
  hypothesisCount: number
  journalEntryCount: number
  areas: string[]
  message: string
}

/** Clear stored hypotheses and rebuild them from the full journal. */
export async function regenerateAllHypothesesFromJournal(): Promise<RegenerateInsightsResult> {
  const entries = await getHealthEntries()

  if (entries.length === 0) {
    return {
      hypothesisCount: 0,
      journalEntryCount: 0,
      areas: [],
      message:
        'Add journal entries first, then regenerate hypotheses and possible conditions.',
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
    message:
      built.length > 0
        ? `Regenerated ${built.length} ${built.length === 1 ? 'hypothesis' : 'hypotheses'} from ${entries.length} journal ${entries.length === 1 ? 'entry' : 'entries'} across ${areas.length} ${areas.length === 1 ? 'area' : 'areas'}. Possible conditions use the same records.`
        : `Reviewed ${entries.length} journal ${entries.length === 1 ? 'entry' : 'entries'} but could not derive hypotheses — add more detail per body area and try again.`,
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
