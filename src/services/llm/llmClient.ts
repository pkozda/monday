import {
  getLlmChatUrl,
  getLlmModel,
  LLM_REQUEST_TIMEOUT_MS,
} from '@/services/llm/config'
import {
  DEFAULT_LLM_MAX_OUTPUT_TOKENS,
  getInputTokenBudget,
} from '@/services/llm/llmLimits'
import {
  chatCompletionMapReduce,
  compactMessagesToBudget,
  logLlmRequestPlan,
  planRequest,
} from '@/services/llm/llmChunkedCompletion'
import {
  enqueueLlmRequest,
  LLM_QUEUE_MAX_RETRY_ATTEMPTS,
  notifyLlmRateLimited,
  parseRetryAfterMs,
  recordTpmUsage,
  waitBeforeRetryAttempt,
  waitForTpmBudget,
} from '@/services/llm/llmRequestQueue'
import { logLlmOutboundRequest } from '@/services/llm/llmRequestLogger'
import { estimateMessagesTokens } from '@/services/llm/tokenEstimation'
import type { LlmChatOptions, LlmMessage } from '@/services/llm/llmTypes'

export type { LlmChatOptions, LlmMessage } from '@/services/llm/llmTypes'

export class LlmError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly retryAfterMs?: number
  ) {
    super(message)
    this.name = 'LlmError'
  }
}

const RETRYABLE_STATUS = new Set([429, 502, 503])

export function isLlmRateLimitError(error: unknown): boolean {
  return error instanceof LlmError && error.status === 429
}

export function isRetryableLlmError(error: unknown): boolean {
  return (
    error instanceof LlmError &&
    error.status !== undefined &&
    RETRYABLE_STATUS.has(error.status)
  )
}

export function isRequestTooLargeError(error: unknown): boolean {
  if (!(error instanceof LlmError)) return false
  const message = error.message.toLowerCase()
  return (
    error.status === 413 ||
    (error.status === 400 &&
      (message.includes('too large') ||
        message.includes('token') ||
        message.includes('length') ||
        message.includes('context'))) ||
    message.includes('request too large')
  )
}

function extractLlmErrorMessage(payload: unknown, status: number): string {
  if (Array.isArray(payload)) {
    const fromArray = extractLlmErrorMessage(payload[0], status)
    if (fromArray !== `AI request failed (${status})`) return fromArray
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const nested = record.error
    if (nested && typeof nested === 'object') {
      const msg = (nested as { message?: string }).message
      if (msg?.trim()) return msg.trim()
    }
    const topLevel = record.message
    if (typeof topLevel === 'string' && topLevel.trim()) return topLevel.trim()
  }

  return `AI request failed (${status})`
}

function resolveMaxOutputTokens(options: LlmChatOptions): number {
  return options.maxTokens ?? DEFAULT_LLM_MAX_OUTPUT_TOKENS
}

function prepareMessagesForRequest(
  messages: LlmMessage[],
  maxOutputTokens: number
): LlmMessage[] {
  const budget = getInputTokenBudget(maxOutputTokens)
  if (estimateMessagesTokens(messages) <= budget) return messages
  return compactMessagesToBudget(messages, budget)
}

function estimateRequestTokens(
  messages: LlmMessage[],
  maxOutputTokens: number
): number {
  return estimateMessagesTokens(messages) + maxOutputTokens
}

async function chatCompletionOnce(
  messages: LlmMessage[],
  options: LlmChatOptions,
  logMeta?: { label?: string; attempt?: number }
): Promise<string> {
  const maxOutputTokens = resolveMaxOutputTokens(options)
  const prepared = prepareMessagesForRequest(messages, maxOutputTokens)
  const requestTokens = estimateRequestTokens(prepared, maxOutputTokens)

  await waitForTpmBudget(requestTokens)

  const body: Record<string, unknown> = {
    model: getLlmModel(),
    messages: prepared,
    temperature: options.temperature ?? 0.2,
    max_tokens: maxOutputTokens,
  }

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  const serialized = JSON.stringify(body)
  console.debug('[Monday LLM] request body size (bytes):', serialized.length)

  logLlmOutboundRequest({
    label: logMeta?.label,
    attempt: logMeta?.attempt,
    chatUrl: getLlmChatUrl(),
    model: getLlmModel(),
    estimatedInputTokens: estimateMessagesTokens(prepared),
    maxOutputTokens: maxOutputTokens,
    jsonMode: options.jsonMode,
    body,
  })

  const response = await fetch(getLlmChatUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: serialized,
    signal: AbortSignal.timeout(LLM_REQUEST_TIMEOUT_MS),
  })

  const payload: unknown = await response.json()

  if (!response.ok) {
    const message = extractLlmErrorMessage(payload, response.status)
    const retryAfterMs = parseRetryAfterMs(
      message,
      response.headers.get('retry-after')
    )
    if (response.status === 429) {
      recordTpmUsage(requestTokens)
    }
    throw new LlmError(message, response.status, retryAfterMs)
  }

  recordTpmUsage(requestTokens)

  const data = payload as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new LlmError('AI returned an empty response.')
  }

  return content
}

/** Retries run inside the queue job — never re-enqueued (avoids TPM spikes). */
async function invokeWithRetryInner(
  messages: LlmMessage[],
  options: LlmChatOptions,
  label: string
): Promise<string> {
  let lastError: LlmError | undefined

  for (let attempt = 0; attempt < LLM_QUEUE_MAX_RETRY_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      const retryAfterMs = lastError?.retryAfterMs
      await waitBeforeRetryAttempt(attempt - 1, retryAfterMs)
      console.info('[Monday LLM Queue]', 'retry_attempt', {
        label,
        attempt,
        maxAttempts: LLM_QUEUE_MAX_RETRY_ATTEMPTS,
      })
    }

    try {
      return await chatCompletionOnce(messages, options, {
        label,
        attempt,
      })
    } catch (error) {
      if (!(error instanceof LlmError)) throw error
      lastError = error

      if (isRequestTooLargeError(error)) {
        throw error
      }

      if (isRetryableLlmError(error) && attempt < LLM_QUEUE_MAX_RETRY_ATTEMPTS - 1) {
        if (error.status === 429) {
          notifyLlmRateLimited(
            error.retryAfterMs ?? backoffFallbackMs(attempt)
          )
        }
        continue
      }
      throw error
    }
  }

  throw lastError ?? new LlmError('AI request failed after retries.')
}

function backoffFallbackMs(attempt: number): number {
  return Math.min(32_000, 1_000 * 2 ** attempt)
}

function invokeWithRetry(
  messages: LlmMessage[],
  options: LlmChatOptions,
  label: string
): Promise<string> {
  const maxOutputTokens = resolveMaxOutputTokens(options)
  const estimatedInputTokens = estimateMessagesTokens(messages)

  return enqueueLlmRequest({
    label,
    estimatedInputTokens,
    maxOutputTokens,
    run: () => invokeWithRetryInner(messages, options, label),
  })
}

export async function chatCompletion(
  messages: LlmMessage[],
  options: LlmChatOptions = {}
): Promise<string> {
  const maxOutputTokens = resolveMaxOutputTokens(options)
  const meta = planRequest(messages, maxOutputTokens)
  logLlmRequestPlan('chatCompletion', meta)

  const runDirect = () =>
    invokeWithRetry(messages, { ...options, maxTokens: maxOutputTokens }, 'chatCompletion')

  if (options.skipChunking || !meta.usedMapReduce) {
    try {
      return await runDirect()
    } catch (error) {
      if (isRequestTooLargeError(error)) {
        console.warn(
          '[Monday LLM] request too large — switching to map-reduce chunking (data unchanged in storage)'
        )
        logLlmRequestPlan(
          'chatCompletion chunked (fallback)',
          planRequest(messages, maxOutputTokens, true)
        )
        return chatCompletionMapReduce(
          messages,
          { ...options, maxTokens: maxOutputTokens },
          (msgs, opts) =>
            invokeWithRetry(msgs, opts, 'chatCompletion.chunk')
        )
      }
      throw error
    }
  }

  return chatCompletionMapReduce(
    messages,
    { ...options, maxTokens: maxOutputTokens },
    (msgs, opts) => invokeWithRetry(msgs, opts, 'chatCompletion.chunk')
  )
}

export async function chatCompletionJson<T>(
  messages: LlmMessage[],
  options: Omit<LlmChatOptions, 'jsonMode'> = {}
): Promise<T> {
  const maxOutputTokens = resolveMaxOutputTokens(options)
  const meta = planRequest(messages, maxOutputTokens)
  logLlmRequestPlan('chatCompletionJson', meta)

  const raw = await chatCompletion(messages, {
    ...options,
    maxTokens: maxOutputTokens,
    jsonMode: true,
  })
  const { parseJsonFromLlm } = await import('@/services/llm/parseJson')
  return parseJsonFromLlm<T>(raw)
}

export { estimateMessagesTokens, estimateTextTokens } from '@/services/llm/tokenEstimation'
export { getLlmQueueStats } from '@/services/llm/llmRequestQueue'
