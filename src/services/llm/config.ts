/** Build-time: LLM proxy route is available (dev server or your own backend). */
export function isLlmProxyConfigured(): boolean {
  const url = import.meta.env.VITE_LLM_CHAT_URL as string | undefined
  return Boolean(url?.trim())
}

/** User preference — stored in localStorage by useAiInsights. */
export const AI_INSIGHTS_STORAGE_KEY = 'monday-ai-insights-enabled'

export function readAiInsightsPreference(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(AI_INSIGHTS_STORAGE_KEY) === '1'
}

export function writeAiInsightsPreference(enabled: boolean): void {
  localStorage.setItem(AI_INSIGHTS_STORAGE_KEY, enabled ? '1' : '0')
}

export function isAiInsightsAvailable(): boolean {
  return isLlmProxyConfigured()
}

export function shouldUseAiInsights(): boolean {
  return isAiInsightsAvailable() && readAiInsightsPreference()
}

export function getLlmChatUrl(): string {
  return (
    (import.meta.env.VITE_LLM_CHAT_URL as string | undefined)?.trim() ||
    '/api/llm/chat/completions'
  )
}

export function getLlmModel(): string {
  return (
    (import.meta.env.VITE_LLM_MODEL as string | undefined)?.trim() ||
    'gpt-4o-mini'
  )
}

export const LLM_REQUEST_TIMEOUT_MS = 90_000
