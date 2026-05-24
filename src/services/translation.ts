import { lookupRuToEnPhrase } from '@/data/ruToEnHealthPhrases'
import {
  isAiTranslationAvailable,
  translateRussianJournalFields,
  translateRussianToEnglish,
  type JournalTranslationField,
} from '@/services/llm/aiTranslation'
import { isLlmRateLimitError, isRetryableLlmError } from '@/services/llm/llmClient'
import {
  blockLlmTranslation,
  isLlmTranslationBlocked,
  LlmTranslationBlockedError,
} from '@/services/llm/llmTranslationGate'
import { isMyMemoryCircuitOpen, translateWithMyMemory } from '@/services/myMemoryClient'
import { getAppLocale, type AppLocale } from '@/i18n'
import {
  fieldNeedsRussianToEnglish,
  shouldTranslateJournalOnSave,
} from '@/utils/textLanguage'
import type { HealthEntryInput } from '@/models/types'

export { containsCyrillic, isJournalEntryInEnglish } from '@/utils/textLanguage'

const MAX_CHUNK_LENGTH = 450
const CACHE_STORAGE_KEY = 'monday-journal-ru-en-cache'
const MAX_CACHE_ENTRIES = 500

const ruEnCache = new Map<string, string>()

function loadCacheFromStorage(): void {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Record<string, string>
    for (const [k, v] of Object.entries(parsed)) {
      ruEnCache.set(k, v)
    }
  } catch {
    /* ignore */
  }
}

function persistCache(): void {
  try {
    const obj = Object.fromEntries(ruEnCache.entries())
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj))
  } catch {
    /* quota */
  }
}

function trimCache(): void {
  if (ruEnCache.size <= MAX_CACHE_ENTRIES) return
  const drop = Math.floor(MAX_CACHE_ENTRIES * 0.2)
  for (const key of [...ruEnCache.keys()].slice(0, drop)) {
    ruEnCache.delete(key)
  }
}

function rememberTranslation(source: string, english: string): string {
  ruEnCache.set(source, english)
  trimCache()
  persistCache()
  return english
}

function pauseLlmTranslationAfterError(error: unknown): void {
  if (
    isLlmRateLimitError(error) ||
    isRetryableLlmError(error) ||
    error instanceof LlmTranslationBlockedError
  ) {
    blockLlmTranslation()
  }
}

loadCacheFromStorage()

export { isAiTranslationAvailable }

export function entryNeedsTranslation(
  input: HealthEntryInput,
  appLocale: AppLocale = getAppLocale()
): boolean {
  return shouldTranslateJournalOnSave(input, appLocale)
}

function splitForTranslation(text: string): string[] {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_CHUNK_LENGTH) return [trimmed]

  const chunks: string[] = []
  let remaining = trimmed

  while (remaining.length > MAX_CHUNK_LENGTH) {
    let splitAt = remaining.lastIndexOf(' ', MAX_CHUNK_LENGTH)
    if (splitAt < MAX_CHUNK_LENGTH * 0.5) {
      splitAt = MAX_CHUNK_LENGTH
    }
    chunks.push(remaining.slice(0, splitAt).trim())
    remaining = remaining.slice(splitAt).trim()
  }

  if (remaining) chunks.push(remaining)
  return chunks
}

async function translateChunkWithLegacy(text: string): Promise<string> {
  const trimmed = text.trim()
  const cached = ruEnCache.get(trimmed)
  if (cached) return cached

  const phrase = lookupRuToEnPhrase(trimmed)
  if (phrase) return rememberTranslation(trimmed, phrase)

  if (!isMyMemoryCircuitOpen()) {
    try {
      return rememberTranslation(
        trimmed,
        await translateWithMyMemory(trimmed, 'ru|en')
      )
    } catch (error) {
      console.warn('[Monday] MyMemory translation failed', error)
    }
  }

  throw new Error('Translation unavailable')
}

async function translateChunk(text: string): Promise<string> {
  const trimmed = text.trim()
  const cached = ruEnCache.get(trimmed)
  if (cached) return cached

  if (isAiTranslationAvailable() && !isLlmTranslationBlocked()) {
    try {
      return rememberTranslation(
        trimmed,
        await translateRussianToEnglish(trimmed)
      )
    } catch (error) {
      pauseLlmTranslationAfterError(error)
      console.warn(
        '[Monday] AI translation failed for chunk; using offline fallback',
        error
      )
    }
  }

  return translateChunkWithLegacy(trimmed)
}

export async function translateRuToEn(text: string): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed || !fieldNeedsRussianToEnglish(trimmed)) return trimmed

  const chunks = splitForTranslation(trimmed)
  const translated: string[] = []
  for (const chunk of chunks) {
    translated.push(await translateChunk(chunk))
  }
  return translated.join(' ')
}

export interface NormalizeHealthEntryResult {
  input: HealthEntryInput
  /** True when Cyrillic text was kept because translation failed. */
  translationSkipped: boolean
}

async function translateFieldsWithLegacy(
  input: HealthEntryInput,
  cyrillicFields: JournalTranslationField[]
): Promise<NormalizeHealthEntryResult> {
  const next: HealthEntryInput = { ...input }
  let translationSkipped = false

  for (const field of cyrillicFields) {
    const value = input[field]!
    try {
      const chunks = splitForTranslation(value)
      const parts: string[] = []
      for (const chunk of chunks) {
        parts.push(await translateChunkWithLegacy(chunk))
      }
      next[field] = parts.join(' ')
    } catch (error) {
      console.warn(`[Monday] Could not translate journal field "${field}"`, error)
      next[field] = value
      translationSkipped = true
    }
  }

  return { input: next, translationSkipped }
}

export async function normalizeHealthEntryInput(
  input: HealthEntryInput,
  appLocale: AppLocale = getAppLocale()
): Promise<NormalizeHealthEntryResult> {
  if (!shouldTranslateJournalOnSave(input, appLocale)) {
    return { input, translationSkipped: false }
  }

  const fields: JournalTranslationField[] = [
    'conditionArea',
    'title',
    'description',
    'medications',
  ]

  const cyrillicFields = fields.filter((field) =>
    fieldNeedsRussianToEnglish(input[field])
  )

  if (cyrillicFields.length === 0) {
    return { input, translationSkipped: false }
  }

  if (isAiTranslationAvailable() && !isLlmTranslationBlocked()) {
    try {
      const translated = await translateRussianJournalFields(input, cyrillicFields)
      for (const field of cyrillicFields) {
        const source = input[field]?.trim()
        const english = translated[field]?.trim()
        if (source && english) rememberTranslation(source, english)
      }
      return { input: translated, translationSkipped: false }
    } catch (error) {
      pauseLlmTranslationAfterError(error)
      console.warn(
        '[Monday] AI journal translation unavailable; using dictionary/MyMemory fallback (no extra LLM calls)',
        error
      )
      return translateFieldsWithLegacy(input, cyrillicFields)
    }
  }

  if (isAiTranslationAvailable() && isLlmTranslationBlocked()) {
    console.warn(
      '[Monday] LLM translation paused after rate limit; using dictionary/MyMemory fallback'
    )
  }

  return translateFieldsWithLegacy(input, cyrillicFields)
}
