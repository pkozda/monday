import { db } from '@/db/database'
import { getHealthEntries } from '@/api/healthApi'
import { getHypotheses, saveHypothesis } from '@/api/mockApi'
import { invalidateInsightsCache } from '@/composables/useInsightsCache'
import { isLlmProxyConfigured, shouldUseAiInsights } from '@/services/llm/config'
import { normalizeHypothesis } from '@/services/hypothesisNormalize'
import type { Hypothesis } from '@/models/types'

export type RegenerateMessageKey =
  | 'needEntries'
  | 'success'
  | 'noHypotheses'
  | 'aiRequired'

export interface RegenerateInsightsResult {
  hypothesisCount: number
  journalEntryCount: number
  areas: string[]
  messageKey: RegenerateMessageKey
}

export async function clearAllHypotheses(): Promise<number> {
  const count = await db.hypotheses.count()
  await db.hypotheses.clear()
  return count
}

/** Clear stored hypotheses and rebuild from journal using LLM only. */
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

  if (!shouldUseAiInsights() || !isLlmProxyConfigured()) {
    return {
      hypothesisCount: 0,
      journalEntryCount: entries.length,
      areas: [],
      messageKey: 'aiRequired',
    }
  }

  await clearAllHypotheses()
  invalidateInsightsCache()

  const built = await buildHypothesesForJournal(entries)
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

/** LLM-first when AI insights are on; rule-based fallback if the model fails or returns nothing. */
async function buildHypothesesForJournal(
  entries: Awaited<ReturnType<typeof getHealthEntries>>
): Promise<Hypothesis[]> {
  if (shouldUseAiInsights() && isLlmProxyConfigured()) {
    try {
      const { buildHypothesesWithAi } = await import('@/services/llm/aiHypotheses')
      const fromAi = await buildHypothesesWithAi(entries)
      if (fromAi.length > 0) return fromAi
      console.warn(
        '[Monday] AI returned no hypotheses; falling back to rule-based generation.'
      )
    } catch (err) {
      console.warn(
        '[Monday] AI hypothesis generation failed; falling back to rule-based generation.',
        err
      )
    }
  }

  const { resolveJournalFocusPlan } = await import('@/services/journalFocusAreas')
  const { buildAllHypothesesFromJournal } = await import(
    '@/services/hypothesisGenerator'
  )
  const plan = await resolveJournalFocusPlan(entries)
  return buildAllHypothesesFromJournal(entries, plan)
}

/** Incremental rule-based updates are disabled — use Generate on Hypotheses page. */
export async function tryGenerateHypothesis(): Promise<{
  status: 'skipped'
  message: string
}> {
  return {
    status: 'skipped',
    message:
      'Hypotheses are updated when you use Generate on the Hypotheses page.',
  }
}
