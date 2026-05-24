/** Dev-only: mirror outbound LLM payloads to logs/llm-traffic.log via Vite middleware. */

export interface LlmOutboundLogPayload {
  label?: string
  attempt?: number
  chatUrl: string
  model: string
  estimatedInputTokens?: number
  maxOutputTokens?: number
  jsonMode?: boolean
  body: Record<string, unknown>
}

export function logLlmOutboundRequest(payload: LlmOutboundLogPayload): void {
  if (!import.meta.env.DEV) return

  const entry = {
    direction: 'client-outbound' as const,
    source: 'llmClient',
    at: new Date().toISOString(),
    label: payload.label,
    attempt: payload.attempt,
    chatUrl: payload.chatUrl,
    model: payload.model,
    estimatedInputTokens: payload.estimatedInputTokens,
    maxOutputTokens: payload.maxOutputTokens,
    jsonMode: payload.jsonMode,
    body: payload.body,
    bodyBytes: JSON.stringify(payload.body).length,
  }

  void fetch('/api/llm-debug-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }).catch(() => {
    /* dev log endpoint optional */
  })
}
