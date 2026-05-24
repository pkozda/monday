import type { AppLocale } from '@/i18n'
import { isAiTranslationAvailable, translateEnglishToLocale } from '@/services/llm/aiTranslation'
import { isLlmTranslationBlocked } from '@/services/llm/llmTranslationGate'
import { translateWithMyMemory } from '@/services/myMemoryClient'
import { shouldTranslateForDisplay } from '@/utils/textLanguage'

const UI_CACHE = new Map<string, string>()
const MAX_CACHE = 800
const CACHE_STORAGE_KEY = 'monday-ui-translation-cache'

const LANG_PAIR: Record<Exclude<AppLocale, 'en'>, string> = {
  de: 'en|de',
  ru: 'en|ru',
}

function loadCacheFromStorage(): void {
  try {
    const raw = sessionStorage.getItem(CACHE_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as Record<string, string>
    for (const [k, v] of Object.entries(parsed)) {
      UI_CACHE.set(k, v)
    }
  } catch {
    /* ignore */
  }
}

function persistCache(): void {
  try {
    const obj = Object.fromEntries(UI_CACHE.entries())
    sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj))
  } catch {
    /* ignore quota */
  }
}

loadCacheFromStorage()

function cacheKey(locale: AppLocale, text: string): string {
  return `${locale}:${text}`
}

function trimCache(): void {
  if (UI_CACHE.size <= MAX_CACHE) return
  const drop = Math.floor(MAX_CACHE * 0.2)
  const keys = [...UI_CACHE.keys()].slice(0, drop)
  for (const k of keys) UI_CACHE.delete(k)
}

const MAX_CHUNK = 450

function splitChunks(text: string): string[] {
  const trimmed = text.trim()
  if (trimmed.length <= MAX_CHUNK) return [trimmed]

  const chunks: string[] = []
  let remaining = trimmed
  while (remaining.length > MAX_CHUNK) {
    let splitAt = remaining.lastIndexOf(' ', MAX_CHUNK)
    if (splitAt < MAX_CHUNK * 0.5) splitAt = MAX_CHUNK
    chunks.push(remaining.slice(0, splitAt).trim())
    remaining = remaining.slice(splitAt).trim()
  }
  if (remaining) chunks.push(remaining)
  return chunks
}

async function translateChunkEnTo(
  text: string,
  locale: Exclude<AppLocale, 'en'>
): Promise<string> {
  if (isAiTranslationAvailable() && !isLlmTranslationBlocked()) {
    try {
      return await translateEnglishToLocale(text, locale)
    } catch {
      /* fall through to MyMemory */
    }
  }
  return translateWithMyMemory(text, LANG_PAIR[locale])
}

/** Translate English UI/generated prose for display (cached). Falls back to source on error. */
export async function translateUiText(
  text: string,
  locale: AppLocale
): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed || !shouldTranslateForDisplay(trimmed, locale)) return text

  const key = cacheKey(locale, trimmed)
  const hit = UI_CACHE.get(key)
  if (hit) return hit

  try {
    const chunks = splitChunks(trimmed)
    const parts: string[] = []
    for (const chunk of chunks) {
      parts.push(await translateChunkEnTo(chunk, locale))
    }
    const result = parts.join(' ')
    UI_CACHE.set(key, result)
    trimCache()
    persistCache()
    return result
  } catch {
    return text
  }
}

export async function translateUiTexts(
  texts: string[],
  locale: AppLocale
): Promise<string[]> {
  if (locale === 'en') return texts
  return Promise.all(texts.map((t) => translateUiText(t, locale)))
}

export function clearUiTranslationCache(): void {
  UI_CACHE.clear()
  try {
    sessionStorage.removeItem(CACHE_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
