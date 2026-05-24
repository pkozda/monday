import type { AppLocale } from '@/i18n'
import type { HealthEntryInput } from '@/models/types'

const CYRILLIC = /[\u0400-\u04FF]/
const LATIN = /[A-Za-z]/
const GERMAN_MARKERS = /[äöüßÄÖÜ]/

const JOURNAL_TEXT_FIELDS: Array<
  keyof Pick<
    HealthEntryInput,
    'conditionArea' | 'title' | 'description' | 'medications'
  >
> = ['conditionArea', 'title', 'description', 'medications']

export function containsCyrillic(text: string): boolean {
  return CYRILLIC.test(text)
}

export function containsLatinLetters(text: string): boolean {
  return LATIN.test(text)
}

/** Field has no Cyrillic — Latin/English (or numbers/punctuation only). */
export function isEnglishOrLatinText(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return true
  if (containsCyrillic(trimmed)) return false
  if (containsLatinLetters(trimmed)) return true
  return /^[\d\s.,;:!?'"()\-–—/+%™©®@#&*+[\]{}|<>]+$/u.test(trimmed)
}

export function isRussianText(text: string): boolean {
  return containsCyrillic(text.trim())
}

export function fieldNeedsRussianToEnglish(text: string | undefined): boolean {
  if (!text?.trim()) return false
  return isRussianText(text)
}

/** All filled journal fields are English/Latin (no Cyrillic). */
export function isJournalEntryInEnglish(input: HealthEntryInput): boolean {
  return JOURNAL_TEXT_FIELDS.every((field) => {
    const value = input[field]
    return !value?.trim() || isEnglishOrLatinText(value)
  })
}

/**
 * RU→EN on save: only when there is Russian text to convert.
 * When app UI is English and the entry is English, skip translation entirely.
 */
export function shouldTranslateJournalOnSave(
  input: HealthEntryInput,
  appLocale: AppLocale
): boolean {
  if (appLocale === 'en' && isJournalEntryInEnglish(input)) {
    return false
  }
  return JOURNAL_TEXT_FIELDS.some((field) =>
    fieldNeedsRussianToEnglish(input[field])
  )
}

/**
 * Machine-translate generated English UI copy for DE/RU display.
 * (Journal entries use shouldTranslateJournalOnSave on save instead.)
 */
export function shouldTranslateForDisplay(
  text: string,
  locale: AppLocale
): boolean {
  const trimmed = text.trim()
  if (!trimmed || locale === 'en') return false
  if (locale === 'ru' && isRussianText(trimmed)) return false
  if (locale === 'de' && GERMAN_MARKERS.test(trimmed)) return false
  return true
}
