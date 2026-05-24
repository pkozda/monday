import {
  getLlmChatUrl,
  getLlmModel,
  LLM_REQUEST_TIMEOUT_MS,
} from '@/services/llm/config'

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmChatOptions {
  temperature?: number
  jsonMode?: boolean
  maxTokens?: number
}

export class LlmError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message)
    this.name = 'LlmError'
  }
}

export async function chatCompletion(
  messages: LlmMessage[],
  options: LlmChatOptions = {}
): Promise<string> {
  const body: Record<string, unknown> = {
    model: getLlmModel(),
    messages,
    temperature: options.temperature ?? 0.2,
  }

  if (options.maxTokens) {
    body.max_tokens = options.maxTokens
  }

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  const response = await fetch(getLlmChatUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(LLM_REQUEST_TIMEOUT_MS),
  })

  const payload = (await response.json()) as {
    error?: { message?: string }
    choices?: Array<{ message?: { content?: string } }>
  }

  if (!response.ok) {
    throw new LlmError(
      payload.error?.message ?? `AI request failed (${response.status})`,
      response.status
    )
  }

  const content = payload.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new LlmError('AI returned an empty response.')
  }

  return content
}

export async function chatCompletionJson<T>(
  messages: LlmMessage[],
  options: Omit<LlmChatOptions, 'jsonMode'> = {}
): Promise<T> {
  const raw = await chatCompletion(messages, { ...options, jsonMode: true })
  const { parseJsonFromLlm } = await import('@/services/llm/parseJson')
  return parseJsonFromLlm<T>(raw)
}
