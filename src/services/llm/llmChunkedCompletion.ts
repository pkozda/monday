import {
  DEFAULT_LLM_MAX_OUTPUT_TOKENS,
  getInputTokenBudget,
  getLlmChunkTargetInputTokens,
} from '@/services/llm/llmLimits'
import {
  estimateMessagesTokens,
  estimateTextTokens,
  splitTextByTokenBudget,
} from '@/services/llm/tokenEstimation'
import type { LlmChatOptions, LlmMessage } from '@/services/llm/llmTypes'

const JOURNAL_MARKER = '\nJournal:\n'
const CHUNK_EXTRACT_SYSTEM = `You extract clinical facts from a portion of a patient's self-reported health journal.
Output concise bullet points only. Do not diagnose. Do not invent facts. Plain text, no JSON.`

type InvokeFn = (
  messages: LlmMessage[],
  options: LlmChatOptions
) => Promise<string>

export interface ChunkedCompletionMeta {
  estimatedInputTokens: number
  inputTokenBudget: number
  chunkCount: number
  usedMapReduce: boolean
  maxOutputTokens: number
}

export function logLlmRequestPlan(
  label: string,
  meta: ChunkedCompletionMeta
): void {
  console.info('[Monday LLM]', label, {
    estimatedInputTokens: meta.estimatedInputTokens,
    inputTokenBudget: meta.inputTokenBudget,
    chunkCount: meta.chunkCount,
    usedMapReduce: meta.usedMapReduce,
    maxOutputTokens: meta.maxOutputTokens,
  })
}

function systemMessages(messages: LlmMessage[]): LlmMessage[] {
  return messages.filter((m) => m.role === 'system')
}

function lastUserMessage(messages: LlmMessage[]): LlmMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i]
  }
  return undefined
}

function splitJournalEntriesInUserContent(
  userContent: string,
  maxTokensPerChunk: number
): string[] | null {
  const markerIndex = userContent.indexOf(JOURNAL_MARKER)
  if (markerIndex < 0) return null

  const instructions = userContent.slice(0, markerIndex + JOURNAL_MARKER.length)
  const journalPart = userContent.slice(markerIndex + JOURNAL_MARKER.length).trim()

  try {
    const parsed = JSON.parse(journalPart) as {
      journalEntries?: unknown[]
    }
    const entries = parsed.journalEntries
    if (!Array.isArray(entries) || entries.length === 0) return null

    const chunks: string[] = []
    let batch: unknown[] = []

    const flush = () => {
      if (batch.length === 0) return
      chunks.push(
        `${instructions}\n${JSON.stringify({ journalEntries: batch })}`
      )
      batch = []
    }

    for (const entry of entries) {
      const trial = [
        ...batch,
        entry,
      ]
      const trialBody = `${instructions}\n${JSON.stringify({ journalEntries: trial })}`
      if (
        batch.length > 0 &&
        estimateTextTokens(trialBody) > maxTokensPerChunk
      ) {
        flush()
      }
      batch.push(entry)
    }
    flush()

    return chunks.length > 0 ? chunks : null
  } catch {
    return null
  }
}

function splitUserContentIntoChunks(
  userContent: string,
  maxTokensPerChunk: number
): string[] {
  const journalChunks = splitJournalEntriesInUserContent(
    userContent,
    maxTokensPerChunk
  )
  if (journalChunks && journalChunks.length > 0) return journalChunks
  return splitTextByTokenBudget(userContent, maxTokensPerChunk)
}

function buildChunkExtractMessages(
  system: LlmMessage[],
  chunkText: string,
  chunkIndex: number,
  chunkTotal: number
): LlmMessage[] {
  return [
    ...system,
    { role: 'system', content: CHUNK_EXTRACT_SYSTEM },
    {
      role: 'user',
      content: `Journal excerpt ${chunkIndex + 1} of ${chunkTotal} (extract key facts only):\n\n${chunkText}`,
    },
  ]
}

function buildFinalSynthesisUserContent(
  originalUser: string,
  chunkSummaries: string[]
): string {
  const combined = chunkSummaries
    .map((summary, index) => `### Excerpt ${index + 1}\n${summary}`)
    .join('\n\n')

  const taskMatch = originalUser.match(/^[\s\S]*?(?=\nJournal:\n|$)/)
  const taskPrefix = taskMatch?.[0]?.trim() ?? originalUser.slice(0, 1200)

  return `${taskPrefix}

---
The full journal was processed in ${chunkSummaries.length} excerpts (all patient records remain stored in the app; this is a condensed view for analysis).

${combined}

---
Complete the original task using the excerpts above. If JSON was requested, return valid JSON only.`
}

/**
 * Map-reduce: chunk oversized user context → bullet summaries → final answer.
 * Stored journal/history in IndexedDB is never modified.
 */
export async function chatCompletionMapReduce(
  messages: LlmMessage[],
  options: LlmChatOptions,
  invoke: InvokeFn
): Promise<string> {
  const maxOutput = options.maxTokens ?? DEFAULT_LLM_MAX_OUTPUT_TOKENS
  const system = systemMessages(messages)
  const user = lastUserMessage(messages)
  if (!user) {
    return invoke(messages, { ...options, maxTokens: maxOutput })
  }

  const chunkTarget = getLlmChunkTargetInputTokens()
  const userChunks = splitUserContentIntoChunks(user.content, chunkTarget)

  if (userChunks.length <= 1) {
    const budget = getInputTokenBudget(maxOutput)
    const compacted = compactMessagesToBudget(messages, budget)
    return invoke(compacted, { ...options, maxTokens: maxOutput })
  }

  const chunkSummaries: string[] = []
  for (let i = 0; i < userChunks.length; i++) {
    const extractMessages = buildChunkExtractMessages(
      system,
      userChunks[i],
      i,
      userChunks.length
    )
    const summary = await invoke(extractMessages, {
      temperature: options.temperature ?? 0.2,
      maxTokens: Math.min(384, maxOutput),
    })
    chunkSummaries.push(summary.trim())
  }

  const finalUserContent = buildFinalSynthesisUserContent(
    user.content,
    chunkSummaries
  )
  let finalMessages: LlmMessage[] = [
    ...system,
    { role: 'user', content: finalUserContent },
  ]

  const budget = getInputTokenBudget(maxOutput)
  if (estimateMessagesTokens(finalMessages) > budget) {
    finalMessages = compactMessagesToBudget(finalMessages, budget)
  }

  return invoke(finalMessages, { ...options, maxTokens: maxOutput })
}

/** Trim only the prompt sent to the API — not persisted patient data. */
export function compactMessagesToBudget(
  messages: LlmMessage[],
  inputBudget: number
): LlmMessage[] {
  if (estimateMessagesTokens(messages) <= inputBudget) return messages

  const system = systemMessages(messages)
  const user = lastUserMessage(messages)
  if (!user) return messages

  const systemTokens = estimateMessagesTokens(system)
  const remaining = Math.max(256, inputBudget - systemTokens)
  const userChunks = splitUserContentIntoChunks(user.content, remaining)
  const lastChunk = userChunks[userChunks.length - 1] ?? user.content

  return [...system, { role: 'user', content: lastChunk }]
}

export function planRequest(
  messages: LlmMessage[],
  maxOutputTokens: number,
  forceChunk = false
): ChunkedCompletionMeta {
  const budget = getInputTokenBudget(maxOutputTokens)
  const estimated = estimateMessagesTokens(messages)
  const user = lastUserMessage(messages)
  const chunkTarget = getLlmChunkTargetInputTokens()
  const chunkCount = user
    ? splitUserContentIntoChunks(user.content, chunkTarget).length
    : 1

  return {
    estimatedInputTokens: estimated,
    inputTokenBudget: budget,
    chunkCount: forceChunk || estimated > budget ? Math.max(chunkCount, 1) : 1,
    usedMapReduce: forceChunk || estimated > budget,
    maxOutputTokens: maxOutputTokens,
  }
}
