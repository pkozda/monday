/** Circuit breaker for journal/UI LLM translation after rate limits. */

const CIRCUIT_BREAK_MS = 120_000

let blockedUntil = 0

export class LlmTranslationBlockedError extends Error {
  constructor() {
    super('LLM translation is temporarily paused after rate limiting.')
    this.name = 'LlmTranslationBlockedError'
  }
}

export function isLlmTranslationBlocked(): boolean {
  return Date.now() < blockedUntil
}

export function blockLlmTranslation(durationMs = CIRCUIT_BREAK_MS): void {
  blockedUntil = Math.max(blockedUntil, Date.now() + durationMs)
}

/**
 * Translation uses the centralized LLM queue in llmClient — no second queue here.
 */
export async function runLlmTranslation<T>(fn: () => Promise<T>): Promise<T> {
  if (isLlmTranslationBlocked()) {
    throw new LlmTranslationBlockedError()
  }
  return fn()
}
