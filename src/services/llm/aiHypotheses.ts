import { areasMatch } from '@/services/bodyAreaDetection'
import { collectEvidenceIds } from '@/services/hypothesisGenerator'
import { resolveCanonicalArea } from '@/services/journalFocusAreas'
import { chatCompletionJson } from '@/services/llm/llmClient'
import { journalBundleForLlm } from '@/services/llm/llmClinicalPayload'
import { CLINICAL_SAFETY_SYSTEM } from '@/services/llm/prompts'
import { getLlmModel } from '@/services/llm/config'
import type {
  HealthEntry,
  Hypothesis,
  HypothesisAiInsight,
  HypothesisConfidence,
  HypothesisHistoryEntry,
  HypothesisPattern,
} from '@/models/types'

const VALID_PATTERNS: HypothesisPattern[] = [
  'urgent',
  'treatment_improvement',
  'worsening',
  'recurring',
  'treatment_unclear',
  'general',
]

const VALID_CONFIDENCE: HypothesisConfidence[] = [
  'Exploratory',
  'Supported',
  'Strongly Supported',
]

interface AiHypothesisItem {
  conditionArea: string
  pattern: string
  confidence: string
  title: string
  reasoning: string
  narrative: string
  recommendations: string[]
  evidenceEntryIds: string[]
}

interface AiHypothesesResponse {
  hypotheses: AiHypothesisItem[]
}

function asPattern(value: string): HypothesisPattern {
  const normalized = value.trim() as HypothesisPattern
  return VALID_PATTERNS.includes(normalized) ? normalized : 'general'
}

function asConfidence(value: string): HypothesisConfidence {
  const normalized = value.trim() as HypothesisConfidence
  return VALID_CONFIDENCE.includes(normalized) ? normalized : 'Exploratory'
}

function resolveEvidenceEntries(
  item: AiHypothesisItem,
  entries: HealthEntry[]
): HealthEntry[] {
  const idSet = new Set(item.evidenceEntryIds ?? [])
  const matched = entries.filter((e) => idSet.has(e.id))
  if (matched.length > 0) return matched

  const canonical = resolveCanonicalArea(item.conditionArea)
  return entries.filter((e) => areasMatch(e.conditionArea, canonical))
}

/** LLM-only hypotheses from de-identified journal text (no rule-based focus plan or analysis metadata). */
export async function buildHypothesesWithAi(
  entries: HealthEntry[]
): Promise<Hypothesis[]> {
  if (entries.length === 0) return []

  const bundle = journalBundleForLlm(entries)

  const response = await chatCompletionJson<AiHypothesesResponse>(
    [
      { role: 'system', content: CLINICAL_SAFETY_SYSTEM },
      {
        role: 'user',
        content: `Read the de-identified health journal and propose clinical hypotheses (patterns in the data — NOT definitive diagnoses).

Base your answer ONLY on the journal entries below.

Return JSON:
{
  "hypotheses": [
    {
      "conditionArea": string,
      "pattern": "urgent" | "treatment_improvement" | "worsening" | "recurring" | "treatment_unclear" | "general",
      "confidence": "Exploratory" | "Supported" | "Strongly Supported",
      "title": string,
      "reasoning": string,
      "narrative": string,
      "recommendations": string[],
      "evidenceEntryIds": string[]
    }
  ]
}

Rules:
- Derive body regions from the journal (merge left/right when appropriate).
- evidenceEntryIds must be ids from the journal.
- At most 2 hypotheses per conditionArea (different patterns).
- If a clinician diagnosis is documented, hypotheses should align with it.
- Plain language; cautious tone.

Journal:
${bundle}`,
      },
    ],
    { temperature: 0.25, maxTokens: 4000 }
  )

  const now = new Date().toISOString()
  const meta = {
    generatedAt: now,
    model: getLlmModel(),
    source: 'llm' as const,
  }

  const hypotheses: Hypothesis[] = []
  const seenAreaPattern = new Set<string>()

  for (const item of response.hypotheses ?? []) {
    const area = resolveCanonicalArea(item.conditionArea)
    const pattern = asPattern(item.pattern)
    const dedupeKey = `${area.toLowerCase()}::${pattern}`
    if (seenAreaPattern.has(dedupeKey)) continue
    seenAreaPattern.add(dedupeKey)

    const evidenceEntries = resolveEvidenceEntries(item, entries)
    if (evidenceEntries.length === 0) continue

    const journalIds = evidenceEntries.map((e) => e.id)
    const historyEntry: HypothesisHistoryEntry = {
      id: crypto.randomUUID(),
      at: now,
      kind: 'created',
      title: item.title.trim(),
      confidence: asConfidence(item.confidence),
      journalEntryCount: journalIds.length,
      newJournalEntryIds: journalIds,
      note: 'Generated with AI from your journal.',
    }

    const aiInsight: HypothesisAiInsight = {
      narrative: item.narrative.trim(),
      reasoning: item.reasoning.trim(),
      recommendations: (item.recommendations ?? []).filter(Boolean).slice(0, 6),
      meta,
    }

    hypotheses.push({
      id: crypto.randomUUID(),
      title: item.title.trim(),
      confidence: asConfidence(item.confidence),
      evidenceIds: collectEvidenceIds(evidenceEntries),
      conditionArea: area,
      pattern,
      createdAt: now,
      updatedAt: now,
      history: [historyEntry],
      aiInsight,
    })
  }

  return hypotheses.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}
