import {
  getLlmMinRequestGapMs,
  getLlmTpmLimit,
  getLlmTpmSafetyRatio,
} from '@/services/llm/llmLimits'
import { blockLlmTranslation } from '@/services/llm/llmTranslationGate'

const TPM_WINDOW_MS = 60_000
const MAX_RETRY_ATTEMPTS = 6
const RETRY_BASE_DELAY_MS = 1_000
const RETRY_MAX_DELAY_MS = 32_000

interface TpmUsageEntry {
  at: number
  tokens: number
}

export interface LlmQueueRequest<T> {
  label: string
  estimatedInputTokens: number
  maxOutputTokens: number
  /** Runs inside the queue (retries must stay here — do not re-enqueue). */
  run: () => Promise<T>
}

export interface LlmQueueStats {
  queueSize: number
  active: boolean
  tpmUsed: number
  tpmLimit: number
  tpmEffectiveLimit: number
  cooldownRemainingMs: number
}

type QueueItem<T> = LlmQueueRequest<T> & {
  resolve: (value: T) => void
  reject: (reason: unknown) => void
  enqueuedAt: number
}

let serialChain: Promise<void> = Promise.resolve()
let pending: QueueItem<unknown>[] = []
let active = false
let lastFinishedAt = 0
let globalCooldownUntil = 0

const tpmWindow: TpmUsageEntry[] = []

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function effectiveTpmLimit(): number {
  return Math.floor(getLlmTpmLimit() * getLlmTpmSafetyRatio())
}

function pruneTpmWindow(now = Date.now()): void {
  const cutoff = now - TPM_WINDOW_MS
  while (tpmWindow.length > 0 && tpmWindow[0].at < cutoff) {
    tpmWindow.shift()
  }
}

export function getTpmUsedInWindow(): number {
  pruneTpmWindow()
  return tpmWindow.reduce((sum, entry) => sum + entry.tokens, 0)
}

export function recordTpmUsage(tokens: number): void {
  if (tokens <= 0) return
  const now = Date.now()
  pruneTpmWindow(now)
  tpmWindow.push({ at: now, tokens })
}

export function getLlmQueueStats(): LlmQueueStats {
  const now = Date.now()
  return {
    queueSize: pending.length + (active ? 1 : 0),
    active,
    tpmUsed: getTpmUsedInWindow(),
    tpmLimit: getLlmTpmLimit(),
    tpmEffectiveLimit: effectiveTpmLimit(),
    cooldownRemainingMs: Math.max(0, globalCooldownUntil - now),
  }
}

function logQueue(
  event: string,
  details: Record<string, unknown>
): void {
  const stats = getLlmQueueStats()
  console.info('[Monday LLM Queue]', event, {
    ...details,
    queueSize: stats.queueSize,
    tpmUsed: stats.tpmUsed,
    tpmLimit: stats.tpmLimit,
    tpmEffectiveLimit: stats.tpmEffectiveLimit,
    cooldownRemainingMs: stats.cooldownRemainingMs,
    active: stats.active,
  })
}

export function notifyLlmRateLimited(retryAfterMs: number): void {
  const ms = Math.max(retryAfterMs, RETRY_BASE_DELAY_MS)
  globalCooldownUntil = Math.max(globalCooldownUntil, Date.now() + ms)
  blockLlmTranslation(ms + 5_000)
  logQueue('rate_limited', { retryAfterMs: ms })
}

export function parseRetryAfterMs(
  message: string,
  retryAfterHeader: string | null
): number | undefined {
  if (retryAfterHeader) {
    const seconds = Number.parseFloat(retryAfterHeader)
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.ceil(seconds * 1000)
    }
  }

  const tryAgain = message.match(/try again in ([\d.]+)\s*s/i)
  if (tryAgain) {
    return Math.ceil(Number.parseFloat(tryAgain[1]) * 1000)
  }

  const retryIn = message.match(/retry (?:after|in) ([\d.]+)\s*s/i)
  if (retryIn) {
    return Math.ceil(Number.parseFloat(retryIn[1]) * 1000)
  }

  return undefined
}

export function backoffWithJitter(
  attempt: number,
  retryAfterMs?: number
): number {
  const exponential = Math.min(
    RETRY_MAX_DELAY_MS,
    RETRY_BASE_DELAY_MS * 2 ** attempt
  )
  const base = Math.max(exponential, retryAfterMs ?? 0)
  const jitter = Math.floor(Math.random() * base * 0.25)
  return base + jitter
}

async function waitForGlobalCooldown(): Promise<number> {
  const remaining = globalCooldownUntil - Date.now()
  if (remaining <= 0) return 0
  logQueue('cooldown_wait', { waitMs: remaining })
  await sleep(remaining)
  return remaining
}

/**
 * Block until the TPM window has enough headroom for the next request.
 * `neededTokens` is capped to the effective limit so a single request cannot
 * wait forever when its estimated size exceeds the configured TPM cap.
 */
export async function waitForTpmBudget(neededTokens: number): Promise<number> {
  const limit = effectiveTpmLimit()
  const gateTokens = Math.min(Math.max(1, neededTokens), limit)
  let totalWait = 0

  if (neededTokens > limit) {
    logQueue('tpm_budget_capped', {
      neededTokens,
      limit,
      gateTokens,
    })
  }

  while (true) {
    pruneTpmWindow()
    const used = getTpmUsedInWindow()
    const headroom = limit - used

    if (headroom >= gateTokens) {
      if (totalWait > 0) {
        logQueue('tpm_ready', {
          neededTokens,
          gateTokens,
          waitedMs: totalWait,
          tpmUsed: used,
        })
      }
      return totalWait
    }

    const oldest = tpmWindow[0]
    const waitMs = oldest
      ? Math.max(50, oldest.at + TPM_WINDOW_MS - Date.now() + 25)
      : 250

    logQueue('tpm_wait', {
      neededTokens,
      gateTokens,
      headroom,
      waitMs,
      tpmUsed: used,
    })

    await sleep(waitMs)
    totalWait += waitMs
  }
}

async function waitMinRequestGap(): Promise<number> {
  const gap = getLlmMinRequestGapMs()
  const elapsed = Date.now() - lastFinishedAt
  const waitMs = gap - elapsed
  if (waitMs <= 0) return 0
  await sleep(waitMs)
  return waitMs
}

async function processNextItem<T>(item: QueueItem<T>): Promise<void> {
  active = true
  const waitStart = Date.now()

  try {
    const gapWait = await waitMinRequestGap()
    const cooldownWait = await waitForGlobalCooldown()

    logQueue('dequeue', {
      label: item.label,
      estimatedInputTokens: item.estimatedInputTokens,
      maxOutputTokens: item.maxOutputTokens,
      estimatedTotalTokens: item.estimatedInputTokens + item.maxOutputTokens,
      queueWaitMs: Date.now() - item.enqueuedAt,
      gapWaitMs: gapWait,
      cooldownWaitMs: cooldownWait,
    })

    const result = await item.run()
    item.resolve(result)
  } catch (error) {
    item.reject(error)
  } finally {
    lastFinishedAt = Date.now()
    active = false
    logQueue('done', { label: item.label })
  }
}

function pumpQueue(): void {
  if (pending.length === 0) return

  const item = pending.shift() as QueueItem<unknown>
  serialChain = serialChain.then(() => processNextItem(item))
}

/**
 * FIFO queue: max 1 in-flight Groq request. TPM-aware waits; retries stay inside `run`.
 */
export function enqueueLlmRequest<T>(request: LlmQueueRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const item: QueueItem<T> = {
      ...request,
      resolve,
      reject,
      enqueuedAt: Date.now(),
    }

    pending.push(item as QueueItem<unknown>)

    logQueue('enqueued', {
      label: request.label,
      estimatedInputTokens: request.estimatedInputTokens,
      maxOutputTokens: request.maxOutputTokens,
      estimatedTotalTokens:
        request.estimatedInputTokens + request.maxOutputTokens,
    })

    pumpQueue()
  })
}

export const LLM_QUEUE_MAX_RETRY_ATTEMPTS = MAX_RETRY_ATTEMPTS

export async function waitBeforeRetryAttempt(
  attempt: number,
  retryAfterMs?: number
): Promise<number> {
  const delay = backoffWithJitter(attempt, retryAfterMs)
  logQueue('retry_wait', { attempt, delayMs: delay, retryAfterMs })
  await sleep(delay)
  return delay
}
