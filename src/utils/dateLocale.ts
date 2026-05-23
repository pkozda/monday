import { de, enUS, ru } from 'date-fns/locale'
import type { AppLocale } from '@/i18n'

const LOCALES = {
  en: enUS,
  de,
  ru,
} as const

export function dateFnsLocaleFor(appLocale: AppLocale) {
  return LOCALES[appLocale] ?? enUS
}
