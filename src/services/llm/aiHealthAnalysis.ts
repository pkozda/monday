import { analyzeHealthEntry, combinedEntryText } from '@/services/healthAnalysis'
import { chatCompletionJson } from '@/services/llm/llmClient'
import { CLINICAL_SAFETY_SYSTEM, journalEntryUserPayload } from '@/services/llm/prompts'
import { getLlmModel } from '@/services/llm/config'
import type {
  HealthEntry,
  HealthEntryAiInsight,
  HealthEntryAnalysis,
  HealthEntryInput,
  HealthUrgency,
} from '@/models/types'

interface AiSymptomAnalysisResponse {
  structuredSymptoms: string[]
  clinicalSummary: string
  suggestedBodyAreas: string[]
  suggestedUrgency?: HealthUrgency
  suggestedFlags?: string[]
}

const URGENCY_RANK: Record<HealthUrgency, number> = {
  routine: 0,
  monitor: 1,
  urgent: 2,
  emergency: 3,
}

function mergeUrgency(
  baseline: HealthUrgency,
  suggested?: HealthUrgency
): HealthUrgency {
  if (!suggested || !(suggested in URGENCY_RANK)) return baseline
  return URGENCY_RANK[suggested] > URGENCY_RANK[baseline] ? suggested : baseline
}

export async function analyzeHealthEntryWithAi(
  input: HealthEntryInput,
  baseline?: HealthEntryAnalysis
): Promise<HealthEntryAnalysis> {
  const ruleAnalysis = baseline ?? analyzeHealthEntry(input)
  const combinedText = combinedEntryText(input)

  const payload = journalEntryUserPayload({
    id: 'pending',
    eventDate: input.eventDate,
    conditionArea: input.conditionArea,
    entryType: input.entryType,
    title: input.title,
    description: input.description,
    medications: input.medications,
    severity: input.severity,
  })

  const ai = await chatCompletionJson<AiSymptomAnalysisResponse>(
    [
      { role: 'system', content: CLINICAL_SAFETY_SYSTEM },
      {
        role: 'user',
        content: `Analyze this health journal entry. Extract symptoms and clinical themes from the text only.

Return JSON:
{
  "structuredSymptoms": string[],
  "clinicalSummary": string,
  "suggestedBodyAreas": string[],
  "suggestedUrgency": "routine" | "monitor" | "urgent" | "emergency",
  "suggestedFlags": string[]
}

Existing rule-based summary (you may refine, not contradict emergencies): ${JSON.stringify({
          urgency: ruleAnalysis.urgency,
          classification: ruleAnalysis.classification,
          flags: ruleAnalysis.flags,
          summary: ruleAnalysis.summary,
        })}

Entry:
${payload}

Full text:
${combinedText}`,
      },
    ],
    { temperature: 0.15, maxTokens: 1200 }
  )

  const meta = {
    generatedAt: new Date().toISOString(),
    model: getLlmModel(),
    source: 'llm' as const,
  }

  const aiInsight: HealthEntryAiInsight = {
    structuredSymptoms: (ai.structuredSymptoms ?? []).filter(Boolean).slice(0, 12),
    clinicalSummary: (ai.clinicalSummary ?? ruleAnalysis.summary).trim(),
    suggestedBodyAreas: (ai.suggestedBodyAreas ?? []).filter(Boolean).slice(0, 5),
    meta,
  }

  const mergedFlags = [
    ...new Set([
      ...ruleAnalysis.flags,
      ...(ai.suggestedFlags ?? []).filter((f) => typeof f === 'string'),
    ]),
  ]

  return {
    ...ruleAnalysis,
    urgency: mergeUrgency(ruleAnalysis.urgency, ai.suggestedUrgency),
    flags: mergedFlags,
    summary: aiInsight.clinicalSummary || ruleAnalysis.summary,
    ai: aiInsight,
  }
}

export async function enrichHealthEntryWithAi(entry: HealthEntry): Promise<HealthEntry> {
  const input: HealthEntryInput = {
    eventDate: entry.eventDate,
    conditionArea: entry.conditionArea,
    entryType: entry.entryType,
    title: entry.title,
    description: entry.description,
    medications: entry.medications,
    severity: entry.severity,
  }

  const analysis = await analyzeHealthEntryWithAi(input, entry.analysis)
  const updated: HealthEntry = { ...entry, analysis }
  return updated
}
