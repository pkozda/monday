import type { Locale } from 'date-fns'
import type { Composer } from 'vue-i18n'
import type { AppLocale } from '@/i18n'
import {
  getCachedAiClinicalModel,
  invalidateClinicalModelCache,
  saveCachedAiClinicalModel,
} from '@/services/clinicalModelCache'
import { buildLocalizedClinicalModel } from '@/services/localizeClinicalModel'
import { enhanceClinicalModelWithAi } from '@/services/llm/aiClinicalModel'
import { shouldUseAiInsights } from '@/services/llm/config'
import type { ClinicalModel, HealthEntry } from '@/models/types'

type TFunction = Composer['t']

export { invalidateClinicalModelCache }

export async function buildLocalizedClinicalModelAsync(
  entries: HealthEntry[],
  t: TFunction,
  dateLocale: Locale,
  locale: AppLocale
): Promise<ClinicalModel> {
  const baseline = buildLocalizedClinicalModel(entries, t, dateLocale)
  if (!shouldUseAiInsights() || entries.length === 0) {
    return baseline
  }

  const cached = await getCachedAiClinicalModel(entries, locale)
  if (cached) {
    return cached
  }

  try {
    const enhanced = await enhanceClinicalModelWithAi(entries, baseline, locale)
    if (enhanced.aiGenerated) {
      await saveCachedAiClinicalModel(entries, locale, enhanced)
    }
    return enhanced
  } catch (error) {
    console.warn('[Monday] AI clinical model failed, using rule-based model', error)
    return baseline
  }
}
