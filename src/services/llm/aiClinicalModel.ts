import { chatCompletionJson } from '@/services/llm/llmClient'
import { getLlmModel } from '@/services/llm/config'
import { CLINICAL_SAFETY_SYSTEM, journalBundleUserPayload } from '@/services/llm/prompts'
import type { ClinicalFactor, ClinicalModel, HealthEntry } from '@/models/types'
import type { AppLocale } from '@/i18n'

interface AiClinicalFactor {
  id?: string
  name: string
  description: string
}

interface AiClinicalModelResponse {
  summary: string
  factors: AiClinicalFactor[]
}

const LOCALE_NAMES: Record<AppLocale, string> = {
  en: 'English',
  de: 'German',
  ru: 'Russian',
}

function sanitizeFactorId(id: string | undefined, index: number): string {
  const raw = (id ?? '').trim()
  if (/^factor-[a-z0-9-]+$/.test(raw)) return raw
  return `factor-ai-${index + 1}`
}

function normalizeFactors(items: AiClinicalFactor[]): ClinicalFactor[] {
  const factors: ClinicalFactor[] = []
  const seenNames = new Set<string>()

  for (let i = 0; i < items.length && factors.length < 6; i++) {
    const item = items[i]
    const name = item.name?.trim()
    const description = item.description?.trim()
    if (!name || !description) continue
    const key = name.toLowerCase()
    if (seenNames.has(key)) continue
    seenNames.add(key)
    factors.push({
      id: sanitizeFactorId(item.id, i),
      name,
      description,
    })
  }

  return factors
}

export async function enhanceClinicalModelWithAi(
  entries: HealthEntry[],
  baseline: ClinicalModel,
  locale: AppLocale
): Promise<ClinicalModel> {
  if (entries.length === 0) return baseline

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

  const response = await chatCompletionJson<AiClinicalModelResponse>(
    [
      { role: 'system', content: CLINICAL_SAFETY_SYSTEM },
      {
        role: 'user',
        content: `Build a longitudinal "clinical model" summary for the patient's health journal — patterns a clinician would want at a glance, NOT a diagnosis.

Write all text in ${LOCALE_NAMES[locale]}.

Return JSON:
{
  "summary": string,
  "factors": [
    { "id": string, "name": string, "description": string }
  ]
}

Rules:
- Ground every statement in the journal bundle only; do not invent visits, labs, or symptoms.
- summary: 3–5 sentences on cross-cutting themes, trajectory, and what to watch (cautious tone).
- factors: 3–6 items — mix body-region patterns and cross-cutting themes (medications, urgency, visits).
- factor ids: use short kebab ids like "factor-back-pain" or "factor-meds".
- Do not duplicate the same theme in multiple factors.
- This is patient-facing synthesis; not a definitive medical diagnosis.

Rule-based baseline (you may refine, not contradict urgent flags):
${JSON.stringify({ summary: baseline.summary, factors: baseline.factors }, null, 2)}

Journal:
${bundle}`,
      },
    ],
    { temperature: 0.25, maxTokens: 2200 }
  )

  const summary = response.summary?.trim()
  const factors = normalizeFactors(response.factors ?? [])

  if (!summary && factors.length === 0) {
    return baseline
  }

  return {
    ...baseline,
    summary: summary || baseline.summary,
    factors: factors.length > 0 ? factors : baseline.factors,
    aiGenerated: true,
    aiMeta: {
      generatedAt: new Date().toISOString(),
      model: getLlmModel(),
      source: 'llm',
    },
  }
}
