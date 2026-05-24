import { chatCompletionJson } from '@/services/llm/llmClient'
import { redactLikelyPii } from '@/services/llm/llmClinicalPayload'
import { CLINICAL_SAFETY_SYSTEM } from '@/services/llm/prompts'
import { diagnosisVariantKey } from '@/services/llm/aiDiagnosisJournalSupport'
import { entryText } from '@/services/medicalHistoryContext'
import type {
  DiagnosisReport,
  HealthEntry,
} from '@/models/types'

const MAX_LINKS_PER_REQUEST = 12
const EXCERPT_MAX = 320

interface LinkRequestRow {
  linkId: string
  conditionName: string
  conditionArea: string
  exploratoryRationale: string
  entryId: string
  entryTitle: string
  entryType: string
  entryDate: string
  entryExcerpt: string
}

interface LinkExplanationItem {
  linkId: string
  whyItSupports: string
}

interface LinkExplanationsResponse {
  explanations: LinkExplanationItem[]
}

function excerpt(text: string): string {
  const trimmed = redactLikelyPii(text.trim())
  if (trimmed.length <= EXCERPT_MAX) return trimmed
  return `${trimmed.slice(0, EXCERPT_MAX - 1).trim()}…`
}

function collectLinkRequests(
  reports: DiagnosisReport[],
  entries: HealthEntry[]
): LinkRequestRow[] {
  const rows: LinkRequestRow[] = []
  const entryById = new Map(entries.map((e) => [e.id, e]))

  for (const report of reports) {
    for (const variant of report.variants) {
      const variantKey = diagnosisVariantKey(variant)

      for (const criterion of variant.confirmCriteria) {
        if (criterion.status !== 'met') continue
        if (criterion.linkExplanation?.trim()) continue

        const entryId = criterion.sourceEntryId
        if (!entryId) continue

        const entry = entryById.get(entryId)
        if (!entry) continue

        rows.push({
          linkId: `${variantKey}::${entryId}`,
          conditionName: variant.diseaseName,
          conditionArea: variant.conditionArea,
          exploratoryRationale: variant.rationale,
          entryId,
          entryTitle: entry.title.trim(),
          entryType: entry.entryType,
          entryDate: entry.eventDate,
          entryExcerpt: excerpt(entryText(entry)),
        })
      }
    }
  }

  return rows
}

function applyExplanations(
  reports: DiagnosisReport[],
  explanations: LinkExplanationItem[]
): DiagnosisReport[] {
  const byLinkId = new Map(
    explanations
      .filter((e) => e.linkId?.trim() && e.whyItSupports?.trim())
      .map((e) => [e.linkId.trim(), e.whyItSupports.trim()])
  )

  if (byLinkId.size === 0) return reports

  return reports.map((report) => ({
    ...report,
    variants: report.variants.map((variant) => {
      const variantKey = diagnosisVariantKey(variant)
      return {
        ...variant,
        confirmCriteria: variant.confirmCriteria.map((criterion) => {
          if (criterion.status !== 'met' || !criterion.sourceEntryId) {
            return criterion
          }
          const linkId = `${variantKey}::${criterion.sourceEntryId}`
          const why = byLinkId.get(linkId)
          if (!why) return criterion
          return { ...criterion, linkExplanation: why }
        }),
        matchFlags: buildJournalMatchFlags(
          variant.confirmCriteria,
          variant.diseaseName,
          variant.matchFlags
        ),
      }
    }),
  }))
}

function buildJournalMatchFlags(
  criteria: import('@/models/types').DiagnosisCriterion[],
  conditionName: string,
  fallback: import('@/models/types').DiagnosisMatchFlag[]
): import('@/models/types').DiagnosisMatchFlag[] {
  const journalFlags = criteria
    .filter((c) => c.status === 'met')
    .map((c) => ({
      kind: 'journal_pattern' as const,
      label: c.text.slice(0, 80),
      detail: c.linkExplanation?.trim() || c.detail || '',
    }))
    .filter((f) => f.detail)

  if (journalFlags.length > 0) return journalFlags.slice(0, 8)

  return fallback.length > 0
    ? fallback
    : [
        {
          kind: 'named_condition' as const,
          label: conditionName,
          detail:
            'Exploratory suggestion from your journal — discuss with a qualified clinician.',
        },
      ]
}

async function requestLinkExplanations(
  batch: LinkRequestRow[]
): Promise<LinkExplanationItem[]> {
  const response = await chatCompletionJson<LinkExplanationsResponse>(
    [
      { role: 'system', content: CLINICAL_SAFETY_SYSTEM },
      {
        role: 'user',
        content: `You explain how de-identified journal entries relate to EXPLORATORY possible conditions (not definitive diagnoses).

For each link below, write whyItSupports: 2–4 sentences in plain language for the patient. Must:
- Name the possible condition and reference specific details from THAT journal entry excerpt (symptoms, test results, timeline, body area).
- Explain the clinical connection cautiously ("may be consistent with", "worth discussing") — not "you have" or "this confirms".
- Use only facts from the entry excerpt and exploratory rationale; do not invent tests or symptoms.

Return JSON:
{
  "explanations": [
    { "linkId": string, "whyItSupports": string }
  ]
}

Include one explanation per linkId listed. Keep each whyItSupports under 120 words.

Links:
${JSON.stringify(batch, null, 2)}`,
      },
    ],
    { temperature: 0.25, maxTokens: 900 }
  )

  return response.explanations ?? []
}

/**
 * Adds AI explanations for journal ↔ possible-condition links (after structural enrich).
 */
export async function fillJournalLinkExplanations(
  reports: DiagnosisReport[],
  entries: HealthEntry[]
): Promise<DiagnosisReport[]> {
  const pending = collectLinkRequests(reports, entries)
  if (pending.length === 0) return reports

  let result = reports

  for (let i = 0; i < pending.length; i += MAX_LINKS_PER_REQUEST) {
    const batch = pending.slice(i, i + MAX_LINKS_PER_REQUEST)
    try {
      const explanations = await requestLinkExplanations(batch)
      result = applyExplanations(result, explanations)
    } catch (err) {
      console.warn('[Monday LLM] journal link explanations failed', err)
      break
    }
  }

  return result
}
