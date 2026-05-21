import { db } from '@/db/database'
import { getHealthEntries } from '@/api/healthApi'
import { getHypotheses, saveHypothesis } from '@/api/mockApi'
import {
  analyzeHypothesisGeneration,
  type HypothesisGenerationResult,
} from '@/services/hypothesisGenerator'
import { normalizeHypothesis } from '@/services/hypothesisNormalize'

export type { HypothesisGenerationResult }

export async function clearAllHypotheses(): Promise<number> {
  const count = await db.hypotheses.count()
  await db.hypotheses.clear()
  return count
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
