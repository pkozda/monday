import { getHealthEntries } from '@/api/healthApi'
import { buildClinicalModel } from '@/services/clinicalModelGenerator'
import type { ClinicalModel, HealthEntry } from '@/models/types'

/** Clinical model derived from the user's journal (not static seed data). */
export async function getClinicalModel(
  cachedEntries?: HealthEntry[]
): Promise<ClinicalModel> {
  const entries = cachedEntries ?? (await getHealthEntries())
  return buildClinicalModel(entries)
}
