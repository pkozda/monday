import { getHealthEntries } from '@/api/healthApi'
import { buildClinicalModel } from '@/services/clinicalModelGenerator'
import type { ClinicalModel } from '@/models/types'

/** Clinical model derived from the user's journal (not static seed data). */
export async function getClinicalModel(): Promise<ClinicalModel> {
  const entries = await getHealthEntries()
  return buildClinicalModel(entries)
}
