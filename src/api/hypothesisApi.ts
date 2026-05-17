import { db } from '@/db/database'
import { getHealthEntries } from '@/api/healthApi'
import { getHypotheses, saveHypothesis } from '@/api/mockApi'
import {
  analyzeHypothesisGeneration,
  type HypothesisGenerationResult,
} from '@/services/hypothesisGenerator'

export type { HypothesisGenerationResult }

export async function clearAllHypotheses(): Promise<void> {
  await db.hypotheses.clear()
}

export async function tryGenerateHypothesis(): Promise<HypothesisGenerationResult> {
  const [entries, existing] = await Promise.all([
    getHealthEntries(),
    getHypotheses(),
  ])

  const result = analyzeHypothesisGeneration(entries, existing)

  if (result.status === 'created' && result.hypothesis) {
    await saveHypothesis(result.hypothesis)
  }

  return result
}
