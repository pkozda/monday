import { getHealthEntries } from '@/api/healthApi'
import { getHypotheses, saveHypothesis } from '@/api/mockApi'
import { generateHypothesisFromUserData } from '@/services/hypothesisGenerator'
import type { Hypothesis } from '@/models/types'

export async function generateAndSaveHypothesis(): Promise<Hypothesis> {
  const [entries, existing] = await Promise.all([
    getHealthEntries(),
    getHypotheses(),
  ])

  const hypothesis = generateHypothesisFromUserData(entries, existing)
  await saveHypothesis(hypothesis)
  return hypothesis
}
