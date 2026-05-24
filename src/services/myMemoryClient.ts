const TRANSLATE_ENDPOINT =
  import.meta.env.VITE_TRANSLATION_URL ??
  (import.meta.env.DEV ? '/api/translate' : 'https://api.mymemory.translated.net/get')

const MIN_REQUEST_GAP_MS = 1_100
const CIRCUIT_BREAK_MS = 120_000

let lastRequestAt = 0
let blockedUntil = 0
let queue: Promise<void> = Promise.resolve()

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function isMyMemoryCircuitOpen(): boolean {
  return Date.now() < blockedUntil
}

export function blockMyMemory(durationMs = CIRCUIT_BREAK_MS): void {
  blockedUntil = Date.now() + durationMs
}

function buildUrl(text: string, langpair: string): string {
  const url = new URL(
    TRANSLATE_ENDPOINT,
    TRANSLATE_ENDPOINT.startsWith('http')
      ? undefined
      : window.location.origin
  )
  url.searchParams.set('q', text)
  url.searchParams.set('langpair', langpair)
  return url.toString()
}

async function fetchOnce(text: string, langpair: string): Promise<string> {
  const retryDelaysMs = [0, 2_000, 5_000]

  for (let attempt = 0; attempt < retryDelaysMs.length; attempt++) {
    if (retryDelaysMs[attempt] > 0) {
      await sleep(retryDelaysMs[attempt])
    }

    const wait = MIN_REQUEST_GAP_MS - (Date.now() - lastRequestAt)
    if (wait > 0) await sleep(wait)
    lastRequestAt = Date.now()

    const response = await fetch(buildUrl(text, langpair), {
      signal: AbortSignal.timeout(15_000),
    })

    if (response.status === 429 || response.status === 503) {
      blockMyMemory()
      if (attempt < retryDelaysMs.length - 1) continue
      throw new Error(`Translation rate limit (${response.status})`)
    }

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
      blockMyMemory()
      throw new Error('Translation limit reached')
    }

    return translated
  }

  throw new Error('Translation rate limit')
}

/** Serialize MyMemory calls app-wide to reduce 429 errors. */
export function translateWithMyMemory(
  text: string,
  langpair: string
): Promise<string> {
  if (isMyMemoryCircuitOpen()) {
    return Promise.reject(new Error('Translation service is cooling down'))
  }

  const run = queue.then(() => fetchOnce(text, langpair))
  queue = run.then(
    () => undefined,
    () => undefined
  )
  return run
}
