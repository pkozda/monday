import type { Composer } from 'vue-i18n'
import {
  extractAreaFromTitle,
  patternFromTitle,
} from '@/services/hypothesisGenerator'
import type { HypothesisPattern } from '@/models/types'

type TFunction = Composer['t']

export function localizeHypothesisTitle(
  title: string,
  pattern: HypothesisPattern | undefined,
  t: TFunction
): string {
  const area = extractAreaFromTitle(title)
  const resolved = pattern ?? patternFromTitle(title)
  return String(t(`hypothesisTitles.${resolved}`, { area }))
}
