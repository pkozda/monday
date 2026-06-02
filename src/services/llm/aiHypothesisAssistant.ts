import type { AppLocale } from '@/i18n'
import { chatCompletion } from '@/services/llm/llmClient'
import { sanitizeEntriesForLlm } from '@/services/llm/llmClinicalPayload'
import { CLINICAL_SAFETY_SYSTEM } from '@/services/llm/prompts'
import type { HealthEntry, Hypothesis } from '@/models/types'
import type { LlmMessage } from '@/services/llm/llmTypes'

export interface HypothesisAssistantTurn {
  role: 'user' | 'assistant'
  content: string
}

const MAX_CONTEXT_ENTRIES = 48
const MAX_HISTORY_TURNS = 10

const LOCALE_INSTRUCTION: Record<AppLocale, string> = {
  en: 'Reply in English.',
  de: 'Antworte auf Deutsch.',
  ru: 'Отвечай на русском.',
}

function recentEntries(entries: HealthEntry[]): HealthEntry[] {
  return [...entries]
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
    .slice(0, MAX_CONTEXT_ENTRIES)
}

function buildHypothesisSummaries(hypotheses: Hypothesis[]) {
  return hypotheses.map((h) => ({
    conditionArea: h.conditionArea,
    title: h.title,
    pattern: h.pattern,
    confidence: h.confidence,
    narrative: h.aiInsight?.narrative?.trim() ?? '',
    recommendations: (h.aiInsight?.recommendations ?? []).slice(0, 6),
  }))
}

function buildContextBlock(
  hypotheses: Hypothesis[],
  entries: HealthEntry[]
): string {
  return JSON.stringify(
    {
      generatedHypotheses: buildHypothesisSummaries(hypotheses),
      journalEntries: sanitizeEntriesForLlm(recentEntries(entries)),
      journalEntryCount: entries.length,
    },
    null,
    2
  )
}

function buildSystemMessage(
  locale: AppLocale,
  hypotheses: Hypothesis[],
  entries: HealthEntry[]
): string {
  return [
    CLINICAL_SAFETY_SYSTEM,
    LOCALE_INSTRUCTION[locale],
    'You are the Monday assistant on the Hypotheses page. The user may ask about their journal, generated hypotheses, patterns, or what to discuss with a clinician.',
    'Use only the JSON context below. If context is empty, say you need journal entries or generated hypotheses first.',
    'Do not invent tests, diagnoses, or treatments. Keep answers clear and appropriately short unless the user asks for depth.',
    '',
    'Patient context (de-identified):',
    buildContextBlock(hypotheses, entries),
  ].join('\n')
}

function historyToLlmMessages(history: HypothesisAssistantTurn[]): LlmMessage[] {
  return history.slice(-MAX_HISTORY_TURNS * 2).map((turn) => ({
    role: turn.role,
    content: turn.content,
  }))
}

export async function sendHypothesisAssistantMessage(
  userMessage: string,
  history: HypothesisAssistantTurn[],
  hypotheses: Hypothesis[],
  entries: HealthEntry[],
  locale: AppLocale
): Promise<string> {
  const trimmed = userMessage.trim()
  if (!trimmed) {
    throw new Error('Message is empty.')
  }

  const messages: LlmMessage[] = [
    {
      role: 'system',
      content: buildSystemMessage(locale, hypotheses, entries),
    },
    ...historyToLlmMessages(history),
    { role: 'user', content: trimmed },
  ]

  return chatCompletion(messages, {
    temperature: 0.35,
    maxTokens: 900,
    skipChunking: true,
  })
}
