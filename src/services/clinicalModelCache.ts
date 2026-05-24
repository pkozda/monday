import { db } from '@/db/database'
import { journalRevisionKey } from '@/composables/useInsightsCache'
import {
  isAiInsightsAvailable,
  readAiInsightsPreference,
} from '@/services/llm/config'
import type { AppLocale } from '@/i18n'
import type { ClinicalModel, HealthEntry } from '@/models/types'

export const AI_CLINICAL_MODEL_ID = 'journal-ai-model'

type CachedClinicalModel = ClinicalModel & {
  journalRevision?: string
  appLocale?: AppLocale
}

export async function getCachedAiClinicalModel(
  entries: HealthEntry[],
  locale: AppLocale
): Promise<ClinicalModel | null> {
  if (!shouldUseAiInsights()) return null

  const row = (await db.clinicalModels.get(AI_CLINICAL_MODEL_ID)) as
    | CachedClinicalModel
    | undefined

  if (!row?.aiGenerated) return null
  if (row.journalRevision !== journalRevisionKey(entries)) return null
  if (row.appLocale !== locale) return null

  return row
}

export async function saveCachedAiClinicalModel(
  entries: HealthEntry[],
  locale: AppLocale,
  model: ClinicalModel
): Promise<void> {
  if (!model.aiGenerated) return

  const record: CachedClinicalModel = {
    ...model,
    id: AI_CLINICAL_MODEL_ID,
    journalRevision: journalRevisionKey(entries),
    appLocale: locale,
  }
  await db.clinicalModels.put(record)
}

export async function invalidateClinicalModelCache(): Promise<void> {
  await db.clinicalModels.delete(AI_CLINICAL_MODEL_ID)
}

function shouldUseAiInsights(): boolean {
  return isAiInsightsAvailable() && readAiInsightsPreference()
}
