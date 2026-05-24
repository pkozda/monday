import type { Locale } from 'date-fns'
import type { Composer } from 'vue-i18n'
import type { AppLocale } from '@/i18n'
import { buildLocalizedClinicalModel } from '@/services/localizeClinicalModel'
import { enhanceClinicalModelWithAi } from '@/services/llm/aiClinicalModel'
import { shouldUseAiInsights } from '@/services/llm/config'
import type { ClinicalModel, HealthEntry } from '@/models/types'

type TFunction = Composer['t']

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

  try {
    return await enhanceClinicalModelWithAi(entries, baseline, locale)
  } catch (error) {
    console.warn('[Monday] AI clinical model failed, using rule-based model', error)
    return baseline
  }
}
