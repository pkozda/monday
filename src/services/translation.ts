import type { HealthEntryInput } from '@/models/types'

const CYRILLIC = /[\u0400-\u04FF]/
const MAX_CHUNK_LENGTH = 450

const TRANSLATE_ENDPOINT =
  import.meta.env.VITE_TRANSLATION_URL ??
  (import.meta.env.DEV ? '/api/translate' : 'https://api.mymemory.translated.net/get')

export function containsCyrillic(text: string): boolean {
  return CYRILLIC.test(text)
}

export function entryNeedsTranslation(input: HealthEntryInput): boolean {
  const fields = [
    input.conditionArea,
    input.title,
    input.description,
    input.medications,
  ]
  return fields.some((value) => value && containsCyrillic(value))
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

async function translateChunk(text: string): Promise<string> {
  const url = new URL(
    TRANSLATE_ENDPOINT,
    TRANSLATE_ENDPOINT.startsWith('http')
      ? undefined
      : window.location.origin
  )
  url.searchParams.set('q', text)
  url.searchParams.set('langpair', 'ru|en')

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Translation failed (${response.status})`)
  }

  const data = (await response.json()) as {
    responseData?: { translatedText?: string }
  }

  const translated = data.responseData?.translatedText?.trim()
  if (!translated) {
    throw new Error('Translation service returned an empty result')
  }

  if (translated.toUpperCase().includes('MYMEMORY WARNING')) {
    throw new Error('Translation limit reached. Try again later or use English.')
  }

  return translated
}

export async function translateRuToEn(text: string): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed || !containsCyrillic(trimmed)) return trimmed

  const chunks = splitForTranslation(trimmed)
  const translated = await Promise.all(chunks.map(translateChunk))
  return translated.join(' ')
}

export async function normalizeHealthEntryInput(
  input: HealthEntryInput
): Promise<HealthEntryInput> {
  if (!entryNeedsTranslation(input)) return input

  const [conditionArea, title, description, medications] = await Promise.all([
    translateRuToEn(input.conditionArea),
    translateRuToEn(input.title),
    translateRuToEn(input.description),
    input.medications
      ? translateRuToEn(input.medications)
      : Promise.resolve(undefined),
  ])

  return {
    ...input,
    conditionArea,
    title,
    description,
    medications,
  }
}
