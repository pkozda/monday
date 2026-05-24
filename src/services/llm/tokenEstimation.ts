import type { LlmMessage } from '@/services/llm/llmTypes'

/** Conservative chars-per-token ratio (works for EN/RU mixed clinical text). */
const CHARS_PER_TOKEN = 3.6
const MESSAGE_OVERHEAD_TOKENS = 6

export function estimateTextTokens(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return Math.max(1, Math.ceil(trimmed.length / CHARS_PER_TOKEN))
}

export function estimateMessagesTokens(messages: LlmMessage[]): number {
  return messages.reduce(
    (sum, message) => sum + MESSAGE_OVERHEAD_TOKENS + estimateTextTokens(message.content),
    0
  )
}

export function splitTextByTokenBudget(text: string, maxTokens: number): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  if (estimateTextTokens(trimmed) <= maxTokens) return [trimmed]

  const maxChars = Math.floor(maxTokens * CHARS_PER_TOKEN)
  const chunks: string[] = []
  let remaining = trimmed

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining)
      break
    }

    let splitAt = remaining.lastIndexOf('\n\n', maxChars)
    if (splitAt < maxChars * 0.35) {
      splitAt = remaining.lastIndexOf('\n', maxChars)
    }
    if (splitAt < maxChars * 0.25) {
      splitAt = remaining.lastIndexOf(' ', maxChars)
    }
    if (splitAt < maxChars * 0.15) {
      splitAt = maxChars
    }

    const piece = remaining.slice(0, splitAt).trim()
    if (piece) chunks.push(piece)
    remaining = remaining.slice(splitAt).trim()
  }

  return chunks.length > 0 ? chunks : [trimmed]
}
