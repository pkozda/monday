import { MEDICAL_DISEASE_CATALOG } from '@/data/medicalDiseaseCatalog'
import {
  buildRationale,
  CERTAINTY_LABELS,
  findLinkedHypothesis,
  hypothesisRelatesToArea,
  MAX_DIAGNOSIS_VARIANTS,
  MIN_VARIANT_PERCENT,
  normalizePercentages,
  resolveCertainty,
} from '@/services/diagnosisGenerator'
import {
  areasMatch,
  normalizeAreaKey,
} from '@/services/bodyAreaDetection'
import { inferDiseasesForArea, type InferredDisease } from '@/services/diseaseInference'
import { patternFromTitle } from '@/services/hypothesisGenerator'
import { chatCompletionJson } from '@/services/llm/llmClient'
import { CLINICAL_SAFETY_SYSTEM, journalBundleUserPayload } from '@/services/llm/prompts'
import { buildMedicalHistoryContext } from '@/services/medicalHistoryContext'
import {
  collectFocusAreaLabels,
  type JournalFocusPlan,
} from '@/services/journalFocusAreas'
import type {
  DiagnosisReport,
  DiagnosisVariant,
  HealthEntry,
  Hypothesis,
  HypothesisConfidence,
  HypothesisPattern,
} from '@/models/types'

interface AiRankedVariant {
  diseaseId: string
  diseaseName?: string
  percentage: number
  rationale: string
  suggestedWorkup: string[]
}

interface AiRankedAreaReport {
  conditionArea: string
  variants: AiRankedVariant[]
}

interface AiDiagnosisRankingResponse {
  reports: AiRankedAreaReport[]
}

function slugifyCustomDiseaseId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return slug ? `custom-${slug}` : 'custom-condition'
}

export function isCustomDiseaseId(diseaseId: string): boolean {
  return diseaseId.startsWith('custom-')
}

function emptyInferredDisease(diseaseId: string, diseaseName: string): InferredDisease {
  return {
    diseaseId,
    diseaseName,
    score: 0,
    precisionScore: 0,
    matchedSignals: [],
    matchFlags: [],
    primaryJournalCount: 0,
    crossBodyJournalCount: 0,
    confirmCriteria: [],
    excludeCriteria: [],
    suggestedWorkup: [],
  }
}

function buildCustomInferredDisease(
  diseaseId: string | undefined,
  diseaseName: string
): InferredDisease {
  const name = diseaseName.trim()
  const id =
    diseaseId?.trim() && isCustomDiseaseId(diseaseId.trim())
      ? diseaseId.trim()
      : diseaseId?.trim() && !isCustomDiseaseId(diseaseId.trim())
        ? slugifyCustomDiseaseId(name || diseaseId)
        : slugifyCustomDiseaseId(name)

  const disease = emptyInferredDisease(id, name || id)
  disease.matchFlags = [
    {
      kind: 'named_condition',
      label: 'AI-suggested condition',
      detail:
        'This condition was proposed by AI from your journal and is not in the built-in catalog.',
    },
  ]
  return disease
}

function resolveInferredDisease(
  diseaseId: string,
  diseaseName: string | undefined,
  pool: InferredDisease[],
  ruleVariant?: DiagnosisVariant
): InferredDisease | null {
  const catalog = MEDICAL_DISEASE_CATALOG.find((d) => d.id === diseaseId)
  const byId = pool.find((d) => d.diseaseId === diseaseId)
  if (byId) return byId
  if (catalog) {
    return emptyInferredDisease(catalog.id, catalog.name)
  }

  if (ruleVariant) {
    return {
      diseaseId: ruleVariant.diseaseId ?? diseaseId,
      diseaseName: ruleVariant.diseaseName,
      score: ruleVariant.precisionScore,
      precisionScore: ruleVariant.precisionScore,
      matchedSignals: ruleVariant.matchedSignals,
      matchFlags: ruleVariant.matchFlags,
      confirmCriteria: ruleVariant.confirmCriteria,
      excludeCriteria: ruleVariant.excludeCriteria,
      suggestedWorkup: ruleVariant.suggestedWorkup,
      primaryJournalCount: ruleVariant.primaryJournalCount,
      crossBodyJournalCount: ruleVariant.crossBodyJournalCount,
    }
  }

  const nameKey = (diseaseName ?? diseaseId).trim().toLowerCase()
  const byName = pool.find((d) => d.diseaseName.trim().toLowerCase() === nameKey)
  if (byName) return byName

  if (isCustomDiseaseId(diseaseId) || diseaseName?.trim()) {
    return buildCustomInferredDisease(diseaseId, diseaseName ?? diseaseId)
  }

  return null
}

function buildVariant(
  disease: InferredDisease,
  area: string,
  percentage: number,
  rationale: string,
  suggestedWorkup: string[],
  areaHypotheses: Hypothesis[],
  aiRanked: boolean
): DiagnosisVariant {
  const linked = findLinkedHypothesis(disease.diseaseId, areaHypotheses)
  const pattern: HypothesisPattern | undefined = linked
    ? linked.pattern ?? patternFromTitle(linked.title)
    : undefined
  const confidence: HypothesisConfidence | undefined = linked?.confidence

  return {
    id: `${area}-${disease.diseaseId}`,
    diseaseId: disease.diseaseId,
    diseaseName: disease.diseaseName,
    label: disease.diseaseName,
    percentage,
    precisionScore: percentage,
    conditionArea: area,
    rationale: rationale.trim() || buildRationale(disease, area),
    matchedSignals: disease.matchedSignals,
    matchFlags: disease.matchFlags,
    confirmCriteria: disease.confirmCriteria,
    excludeCriteria: disease.excludeCriteria,
    suggestedWorkup:
      suggestedWorkup.length > 0 ? suggestedWorkup : disease.suggestedWorkup,
    primaryJournalCount: disease.primaryJournalCount,
    crossBodyJournalCount: disease.crossBodyJournalCount,
    hypothesisId: linked?.id,
    pattern,
    confidence,
    aiEnhanced: true,
    aiRanked,
  }
}

function filterVariants(variants: DiagnosisVariant[]): DiagnosisVariant[] {
  const sorted = [...variants].sort((a, b) => b.percentage - a.percentage)
  if (sorted.length <= 3) return sorted
  return sorted.filter(
    (v, index) => index < 3 || v.percentage >= MIN_VARIANT_PERCENT
  )
}

function applyAiRankingToReport(
  ruleReport: DiagnosisReport,
  aiArea: AiRankedAreaReport | undefined,
  pool: InferredDisease[],
  areaHypotheses: Hypothesis[]
): DiagnosisReport {
  if (!aiArea?.variants?.length) {
    return ruleReport
  }

  const ruleById = new Map(
    ruleReport.variants
      .filter((v) => v.diseaseId)
      .map((v) => [v.diseaseId!, v])
  )

  const built: DiagnosisVariant[] = []

  for (const ai of aiArea.variants.slice(0, MAX_DIAGNOSIS_VARIANTS)) {
    const name = ai.diseaseName?.trim()
    const id =
      ai.diseaseId?.trim() ||
      (name ? slugifyCustomDiseaseId(name) : '')
    if (!id && !name) continue

    const ruleVariant =
      ruleById.get(id) ??
      [...ruleById.values()].find(
        (v) => v.diseaseName.trim().toLowerCase() === name?.toLowerCase()
      )

    const disease = resolveInferredDisease(id, name, pool, ruleVariant)
    if (!disease) continue

    built.push(
      buildVariant(
        disease,
        ruleReport.conditionArea,
        Math.max(0, Math.min(100, Math.round(ai.percentage))),
        ai.rationale,
        (ai.suggestedWorkup ?? []).filter(Boolean).slice(0, 8),
        areaHypotheses,
        true
      )
    )
  }

  if (built.length === 0) {
    return ruleReport
  }

  const percentages = normalizePercentages(built.map((v) => v.percentage))
  const variants = filterVariants(
    built.map((v, i) => ({ ...v, percentage: percentages[i] ?? v.percentage }))
  )

  const certainty = resolveCertainty(variants.map((v) => v.percentage))

  return {
    ...ruleReport,
    certainty,
    certaintyLabel: CERTAINTY_LABELS[certainty],
    variants,
    updatedAt: new Date().toISOString(),
    aiRanked: true,
  }
}

function findAiAreaPatch(
  patches: AiRankedAreaReport[],
  areaLabel: string
): AiRankedAreaReport | undefined {
  const key = normalizeAreaKey(areaLabel)
  return patches.find(
    (patch) =>
      normalizeAreaKey(patch.conditionArea) === key ||
      areasMatch(patch.conditionArea, areaLabel)
  )
}

function buildAreaRankingPayload(
  report: DiagnosisReport,
  pool: InferredDisease[]
) {
  return {
    conditionArea: report.conditionArea,
    ruleBasedRanking: report.variants.map((v) => ({
      diseaseId: v.diseaseId,
      diseaseName: v.diseaseName,
      percentage: v.percentage,
      precisionScore: v.precisionScore,
    })),
    candidates: pool.map((d) => ({
      diseaseId: d.diseaseId,
      diseaseName: d.diseaseName,
      precisionScore: d.precisionScore,
      confirmMet: d.confirmCriteria.filter((c) => c.status === 'met').length,
      confirmTotal: d.confirmCriteria.length,
      exclusionsPresent: d.excludeCriteria.filter(
        (c) => c.status === 'exclusion_present'
      ).length,
      journalSignals: d.matchedSignals.slice(0, 6),
    })),
  }
}

/**
 * Full AI ranking: LLM assigns order and percentages per body area.
 * Clinical metadata (criteria, flags, counts) stays from rule-based inference.
 */
export async function rankDiagnosisReportsWithAi(
  ruleReports: DiagnosisReport[],
  hypotheses: Hypothesis[],
  entries: HealthEntry[],
  focusPlan: JournalFocusPlan
): Promise<DiagnosisReport[]> {
  if (entries.length === 0) return ruleReports

  const sharedHistory = buildMedicalHistoryContext(entries)
  const poolByArea = new Map<string, InferredDisease[]>()

  const focusLabels = collectFocusAreaLabels(focusPlan, hypotheses)
  const reportsByArea = new Map(
    ruleReports.map((r) => [r.conditionArea.trim().toLowerCase(), r])
  )

  const areasPayload = focusLabels.map((areaLabel) => {
    const report =
      reportsByArea.get(areaLabel.trim().toLowerCase()) ??
      ruleReports.find((r) => r.conditionArea.trim().toLowerCase() === areaLabel.trim().toLowerCase())

    const pool = inferDiseasesForArea(
      areaLabel,
      entries,
      hypotheses,
      sharedHistory
    ).slice(0, 15)
    poolByArea.set(areaLabel.trim().toLowerCase(), pool)

    return buildAreaRankingPayload(
      report ?? {
        conditionArea: areaLabel,
        certainty: 'low',
        certaintyLabel: CERTAINTY_LABELS.low,
        variants: [],
        updatedAt: new Date().toISOString(),
        usesCrossBodyJournal: false,
      },
      pool
    )
  })

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

  const hypothesisSummary = hypotheses.map((h) => ({
    conditionArea: h.conditionArea,
    pattern: h.pattern,
    confidence: h.confidence,
    title: h.title,
    aiNarrative: h.aiInsight?.narrative,
  }))

  const response = await chatCompletionJson<AiDiagnosisRankingResponse>(
    [
      { role: 'system', content: CLINICAL_SAFETY_SYSTEM },
      {
        role: 'user',
        content: `Rank possible medical conditions for each body area using the patient's journal.
You are suggesting conditions to discuss with a clinician — NOT making a definitive diagnosis.

Return JSON:
{
  "reports": [
    {
      "conditionArea": string,
      "variants": [
        {
          "diseaseId": string,
          "diseaseName": string,
          "percentage": number,
          "rationale": string,
          "suggestedWorkup": string[]
        }
      ]
    }
  ]
}

Rules:
- Prefer diseaseId from "candidates" when they fit the journal.
- You MUST change rankings vs ruleBasedRanking when the journal supports a different order (do not copy the same percentages).
- You MAY add new plausible conditions: diseaseId "custom-<short-slug>" and a clear diseaseName.
- Include 1–${MAX_DIAGNOSIS_VARIANTS} variants per area, ordered most to least likely.
- Percentages for each area must be integers summing to exactly 100.
- conditionArea must exactly match the area label from "Areas to rank".
- Plain-language rationales; no "precision score" jargon.
- suggestedWorkup: 2–5 practical next steps (tests, questions for clinician).

journalFocusPlan:
${JSON.stringify(focusPlan, null, 2)}

Areas to rank:
${JSON.stringify(areasPayload, null, 2)}

Hypotheses:
${JSON.stringify(hypothesisSummary, null, 2)}

Journal:
${bundle}`,
      },
    ],
    { temperature: 0.35, maxTokens: 6000 }
  )

  const aiPatches = response.reports ?? []

  return focusLabels.map((areaLabel) => {
    const key = areaLabel.trim().toLowerCase()
    const pool = poolByArea.get(key) ?? []
    const ruleReport =
      reportsByArea.get(key) ??
      ruleReports.find((r) => r.conditionArea.trim().toLowerCase() === key) ?? {
        conditionArea: areaLabel,
        certainty: 'low' as const,
        certaintyLabel: CERTAINTY_LABELS.low,
        variants: [],
        updatedAt: new Date().toISOString(),
        usesCrossBodyJournal: false,
      }

    const areaHypotheses = hypotheses.filter((h) =>
      hypothesisRelatesToArea(h, areaLabel)
    )

    return applyAiRankingToReport(
      ruleReport,
      findAiAreaPatch(aiPatches, areaLabel),
      pool,
      areaHypotheses.length > 0 ? areaHypotheses : hypotheses
    )
  })
}

/** AI-only diagnosis path — throws if no report was successfully AI-ranked. */
export async function generateDiagnosisReportsWithAi(
  ruleReports: DiagnosisReport[],
  hypotheses: Hypothesis[],
  entries: HealthEntry[],
  focusPlan: JournalFocusPlan
): Promise<DiagnosisReport[]> {
  const ranked = await rankDiagnosisReportsWithAi(
    ruleReports,
    hypotheses,
    entries,
    focusPlan
  )

  if (!ranked.some((report) => report.aiRanked)) {
    throw new Error(
      'AI diagnosis ranking did not apply to any body area (check LLM response or API key).'
    )
  }

  return ranked
}

/** @deprecated Use generateDiagnosisReportsWithAi */
export const enhanceDiagnosisReportsWithAi = generateDiagnosisReportsWithAi
