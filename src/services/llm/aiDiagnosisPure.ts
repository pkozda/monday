import { enrichAiDiagnosisReportsAsync } from '@/services/llm/aiDiagnosisJournalSupport'
import { chatCompletionJson } from '@/services/llm/llmClient'
import { journalBundleForLlm } from '@/services/llm/llmClinicalPayload'
import { CLINICAL_SAFETY_SYSTEM } from '@/services/llm/prompts'
import { getLlmModel } from '@/services/llm/config'

/** Diagnosis JSON needs more room than short summaries; still under typical TPM caps. */
const DIAGNOSIS_MAX_OUTPUT_TOKENS = 1200
import type {
  DiagnosisCertainty,
  DiagnosisReport,
  DiagnosisVariant,
  HealthEntry,
  Hypothesis,
} from '@/models/types'

const MAX_VARIANTS = 5

interface AiDiagnosisVariant {
  conditionName: string
  percentage: number
  rationale: string
  suggestedWorkup?: string[]
}

interface AiDiagnosisAreaReport {
  conditionArea: string
  certainty?: string
  variants: AiDiagnosisVariant[]
}

interface AiDiagnosisOnlyResponse {
  reports: AiDiagnosisAreaReport[]
}

function slugifyDiseaseId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return slug ? `ai-${slug}` : 'ai-condition'
}

function asCertainty(value: string | undefined): DiagnosisCertainty {
  const v = (value ?? '').trim().toLowerCase()
  if (v === 'high') return 'high'
  if (v === 'medium' || v === 'moderate') return 'moderate'
  if (v === 'low') return 'low'
  return 'low'
}

const CERTAINTY_LABELS: Record<DiagnosisCertainty, string> = {
  high: 'Higher confidence (exploratory)',
  moderate: 'Moderate confidence (exploratory)',
  low: 'Low confidence (exploratory)',
}

function normalizeAreaPercentages(variants: DiagnosisVariant[]): DiagnosisVariant[] {
  if (variants.length === 0) return []
  const sum = variants.reduce((s, v) => s + v.percentage, 0)
  if (sum <= 0) {
    const even = Math.floor(100 / variants.length)
    return variants.map((v, i) => ({
      ...v,
      percentage: i === 0 ? 100 - even * (variants.length - 1) : even,
    }))
  }
  return variants.map((v) => ({
    ...v,
    percentage: Math.max(1, Math.round((v.percentage / sum) * 100)),
  }))
}

function toVariant(
  item: AiDiagnosisVariant,
  conditionArea: string
): DiagnosisVariant {
  const name = item.conditionName.trim()
  const id = slugifyDiseaseId(name)
  return {
    diseaseId: id,
    diseaseName: name,
    label: name,
    percentage: Math.min(100, Math.max(1, Math.round(item.percentage))),
    precisionScore: Math.round(item.percentage),
    conditionArea,
    rationale: item.rationale.trim(),
    matchedSignals: [],
    matchFlags: [
      {
        kind: 'named_condition',
        label: 'AI exploratory suggestion',
        detail:
          'Suggested from your journal text by AI — discuss with a qualified clinician.',
      },
    ],
    confirmCriteria: [],
    excludeCriteria: [],
    suggestedWorkup: (item.suggestedWorkup ?? []).filter(Boolean).slice(0, 6),
    primaryJournalCount: 0,
    crossBodyJournalCount: 0,
    aiEnhanced: true,
    aiRanked: true,
  }
}

function hypothesesSummaryForLlm(hypotheses: Hypothesis[]) {
  return hypotheses.map((h) => ({
    conditionArea: h.conditionArea,
    pattern: h.pattern,
    confidence: h.confidence,
    title: h.title,
    narrative: h.aiInsight?.narrative,
    evidenceEntryIds: h.evidenceIds,
  }))
}

/**
 * LLM-only possible conditions — no disease catalog, rule engine, or pre-ranked candidates.
 */
export async function buildDiagnosisReportsFromAiOnly(
  entries: HealthEntry[],
  hypotheses: Hypothesis[]
): Promise<DiagnosisReport[]> {
  if (entries.length === 0) return []

  const bundle = journalBundleForLlm(entries)
  const hypothesisBlock = JSON.stringify(
    hypothesesSummaryForLlm(hypotheses),
    null,
    2
  )

  const response = await chatCompletionJson<AiDiagnosisOnlyResponse>(
    [
      { role: 'system', content: CLINICAL_SAFETY_SYSTEM },
      {
        role: 'user',
        content: `You are a clinical documentation assistant. Read the de-identified health journal and list EXPLORATORY possible conditions to discuss with a doctor — NOT definitive diagnoses.

Base your answer ONLY on the journal and hypotheses below. Do not use external patient identifiers or assumptions beyond the text.

Return JSON:
{
  "reports": [
    {
      "conditionArea": string,
      "certainty": "low" | "moderate" | "high",
      "variants": [
        {
          "conditionName": string,
          "percentage": number,
          "rationale": string,
          "suggestedWorkup": string[]
        }
      ]
    }
  ]
}

Rules:
- Group by body region or clinical theme (e.g. "Left ankle", "General").
- Respect an existing clinician diagnosis in the journal when present — rank matching conditions higher; do not replace it with unrelated conditions (e.g. do not suggest cellulitis for an isolated ligament injury unless the journal supports infection).
- 1–${MAX_VARIANTS} variants per area; integer percentages summing to 100 per area.
- conditionName: plain medical terms (e.g. "Lateral ankle ligament sprain").
- Rationales must cite what appears in the journal.
- suggestedWorkup: 2–4 practical next steps.

Hypotheses (from same journal):
${hypothesisBlock}

Journal:
${bundle}`,
      },
    ],
    { temperature: 0.3, maxTokens: DIAGNOSIS_MAX_OUTPUT_TOKENS }
  )

  const now = new Date().toISOString()
  const reports: DiagnosisReport[] = []

  for (const area of response.reports ?? []) {
    const conditionArea = area.conditionArea?.trim()
    if (!conditionArea) continue

    const rawVariants = (area.variants ?? [])
      .filter((v) => v.conditionName?.trim())
      .slice(0, MAX_VARIANTS)
      .map((v) => toVariant(v, conditionArea))

    if (rawVariants.length === 0) continue

    const variants = normalizeAreaPercentages(rawVariants)
    const certainty = asCertainty(area.certainty)

    reports.push({
      conditionArea,
      certainty,
      certaintyLabel: CERTAINTY_LABELS[certainty],
      variants,
      updatedAt: now,
      usesCrossBodyJournal: false,
      aiRanked: true,
    })
  }

  if (reports.length === 0) {
    console.info('[Monday LLM] AI-only diagnoses: no areas returned', {
      model: getLlmModel(),
    })
    return []
  }

  console.info('[Monday LLM] AI-only diagnoses generated', {
    model: getLlmModel(),
    areaCount: reports.length,
  })

  return enrichAiDiagnosisReportsAsync(reports, entries)
}
