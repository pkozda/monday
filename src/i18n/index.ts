import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import de from '@/i18n/locales/de'
import ru from '@/i18n/locales/ru'

export const LOCALE_STORAGE_KEY = 'monday-locale'

export type AppLocale = 'en' | 'de' | 'ru'

export const LOCALE_FLAGS: Record<AppLocale, string> = {
  en: '🇬🇧',
  de: '🇩🇪',
  ru: '🇷🇺',
}

export const LOCALE_OPTIONS: { value: AppLocale; labelKey: string }[] = [
  { value: 'en', labelKey: 'language.en' },
  { value: 'de', labelKey: 'language.de' },
  { value: 'ru', labelKey: 'language.ru' },
]

function browserLocale(): AppLocale {
  const code = navigator.language.slice(0, 2).toLowerCase()
  if (code === 'de') return 'de'
  if (code === 'ru') return 'ru'
  return 'en'
}

export function getInitialLocale(): AppLocale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'en' || stored === 'de' || stored === 'ru') return stored
  return browserLocale()
}

export function applyDocumentLocale(locale: AppLocale): void {
  document.documentElement.setAttribute('lang', locale)
}

export function getAppLocale(): AppLocale {
  const value = i18n.global.locale.value
  if (value === 'en' || value === 'de' || value === 'ru') return value
  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, de, ru },
})

applyDocumentLocale(i18n.global.locale.value as AppLocale)
