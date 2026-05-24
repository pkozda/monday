import { db } from '@/db/database'
import { getHealthEntries } from '@/api/healthApi'
import { getHypotheses, saveHypothesis } from '@/api/mockApi'
import {
  analyzeHypothesisGeneration,
  buildAllHypothesesFromJournal,
  type HypothesisGenerationResult,
} from '@/services/hypothesisGenerator'
import { invalidateInsightsCache } from '@/composables/useInsightsCache'
import { resolveJournalFocusPlan } from '@/services/journalFocusAreas'
import { shouldUseAiInsights } from '@/services/llm/config'
import { normalizeHypothesis } from '@/services/hypothesisNormalize'
import type { Hypothesis } from '@/models/types'

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
  invalidateInsightsCache()

  const built = await buildHypothesesForRegenerate(entries)
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

async function buildHypothesesForRegenerate(
  entries: Awaited<ReturnType<typeof getHealthEntries>>
): Promise<Hypothesis[]> {
  const focusPlan = await resolveJournalFocusPlan(entries)

  if (!shouldUseAiInsights()) {
    return buildAllHypothesesFromJournal(entries, focusPlan)
  }

  try {
    const { buildHypothesesWithAi } = await import('@/services/llm/aiHypotheses')
    const aiBuilt = await buildHypothesesWithAi(entries, focusPlan)
    if (aiBuilt.length > 0) return aiBuilt
  } catch (err) {
    console.warn(
      '[Monday] AI hypothesis generation failed; using rule-based engine.',
      err
    )
  }

  return buildAllHypothesesFromJournal(entries, focusPlan)
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
