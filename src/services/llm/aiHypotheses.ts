import { collectEvidenceIds } from '@/services/hypothesisGenerator'
import {
  entriesForFocusArea,
  resolveCanonicalArea,
  type JournalFocusPlan,
} from '@/services/journalFocusAreas'
import { chatCompletionJson } from '@/services/llm/llmClient'
import { CLINICAL_SAFETY_SYSTEM, journalBundleUserPayload } from '@/services/llm/prompts'
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
  entries: HealthEntry[],
  plan: JournalFocusPlan
): HealthEntry[] {
  const idSet = new Set(item.evidenceEntryIds ?? [])
  const matched = entries.filter((e) => idSet.has(e.id))
  if (matched.length > 0) return matched

  const canonical = resolveCanonicalArea(item.conditionArea)
  return entriesForFocusArea(canonical, entries, plan)
}

export async function buildHypothesesWithAi(
  entries: HealthEntry[],
  focusPlan: JournalFocusPlan
): Promise<Hypothesis[]> {
  if (entries.length === 0) return []

  const focusSummary = focusPlan.areas.map((f) => ({
    area: f.area,
    entryIds: f.entryIds,
    themes: f.themes,
    rationale: f.rationale,
  }))

  const bundle = journalBundleUserPayload(
    entries.map((e) => ({
      id: e.id,
      eventDate: e.eventDate,
      conditionArea: e.conditionArea,
      entryType: e.entryType,
      title: e.title,
      description: e.description,
      medications: e.medications,
      severity: e.severity,
      analysis: {
        urgency: e.analysis.urgency,
        classification: e.analysis.classification,
        flags: e.analysis.flags,
        summary: e.analysis.summary,
      },
    }))
  )

  const response = await chatCompletionJson<AiHypothesesResponse>(
    [
      { role: 'system', content: CLINICAL_SAFETY_SYSTEM },
      {
        role: 'user',
        content: `From the journal below, propose clinical hypotheses (patterns in the user's data — NOT definitive diagnoses).

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
- Use the journalFocusPlan body regions — do NOT duplicate overlapping areas (merge left/right into one region).
- Use only journal entry ids from the bundle or focus plan assignment.
- At most 2 hypotheses per conditionArea (different patterns).
- Titles should start with the condition area, e.g. "Lower back: recurring pain pattern".
- evidenceEntryIds must belong to that focus area.

journalFocusPlan:
${JSON.stringify({ focusAreas: focusSummary, generalEntryIds: focusPlan.generalEntryIds, includeGeneralHealth: focusPlan.includeGeneralHealth }, null, 2)}

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

    const evidenceEntries = resolveEvidenceEntries(item, entries, focusPlan)
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
      pattern: asPattern(item.pattern),
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
