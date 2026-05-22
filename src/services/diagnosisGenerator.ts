import { MEDICAL_DISEASE_CATALOG } from '@/data/medicalDiseaseCatalog'
import {
  collectConditionAreas,
  inferDiseasesForArea,
  type InferredDisease,
} from '@/services/diseaseInference'
import { patternFromTitle } from '@/services/hypothesisGenerator'
import type {
  DiagnosisCertainty,
  DiagnosisReport,
  DiagnosisVariant,
  HealthEntry,
  Hypothesis,
  HypothesisConfidence,
  HypothesisPattern,
} from '@/models/types'

const CERTAINTY_LABELS: Record<DiagnosisCertainty, string> = {
  high: 'Most likely match',
  moderate: 'Leading possibility',
  low: 'Several possibilities — review all variants',
}

const MIN_VARIANT_PERCENT = 3
const MAX_VARIANTS = 8
const MIN_PRECISION_FRACTION = 0.35

function normalizePercentages(weights: number[]): number[] {
  if (weights.length === 0) return []
  const total = weights.reduce((sum, w) => sum + w, 0)
  if (total <= 0) return weights.map(() => 0)

  const exact = weights.map((w) => (w / total) * 100)
  const floors = exact.map((v) => Math.floor(v))
  let remainder = 100 - floors.reduce((sum, v) => sum + v, 0)

  const order = exact
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction)

  const result = [...floors]
  for (let i = 0; i < order.length && remainder > 0; i += 1) {
    result[order[i].index] += 1
    remainder -= 1
  }
  return result
}

function resolveCertainty(percentages: number[]): DiagnosisCertainty {
  if (percentages.length === 0) return 'low'
  const sorted = [...percentages].sort((a, b) => b - a)
  const top = sorted[0] ?? 0
  const second = sorted[1] ?? 0
  if (top >= 55 && top - second >= 20) return 'high'
  if (top >= 40 && top - second >= 12) return 'moderate'
  return 'low'
}

function findLinkedHypothesis(
  diseaseId: string,
  hypotheses: Hypothesis[]
): Hypothesis | undefined {
  const definition = MEDICAL_DISEASE_CATALOG.find((d) => d.id === diseaseId)
  if (!definition?.relatedPatterns?.length) return hypotheses[0]

  return (
    hypotheses.find((h) => {
      const pattern = h.pattern ?? patternFromTitle(h.title)
      return definition.relatedPatterns!.includes(pattern)
    }) ?? hypotheses[0]
  )
}

function buildRationale(disease: InferredDisease, primaryArea: string): string {
  const confirmMet = disease.confirmCriteria.filter((c) => c.status === 'met')
    .length
  const confirmTotal = disease.confirmCriteria.length
  const exclusions = disease.excludeCriteria.filter(
    (c) => c.status === 'exclusion_present'
  ).length

  const parts: string[] = []
  if (disease.primaryJournalCount > 0) {
    parts.push(
      `${disease.primaryJournalCount} ${disease.primaryJournalCount === 1 ? 'entry' : 'entries'} in ${primaryArea}`
    )
  }
  if (disease.crossBodyJournalCount > 0) {
    parts.push(
      `${disease.crossBodyJournalCount} cross-area ${disease.crossBodyJournalCount === 1 ? 'entry' : 'entries'}`
    )
  }
  const scope =
    parts.length > 0 ? parts.join(' and ') : 'your full medical history'

  let criteriaNote = ''
  if (confirmTotal > 0) {
    criteriaNote = ` ${confirmMet} of ${confirmTotal} supporting criteria met in your journal.`
  }
  if (exclusions > 0) {
    criteriaNote += ` ${exclusions} exclusion ${exclusions === 1 ? 'factor' : 'factors'} present.`
  }

  return `Precision score ${disease.precisionScore}/100 from ${scope}, symptom patterns, and clinical criteria.${criteriaNote} Not a confirmed diagnosis — use confirm/exclude criteria below with your clinician.`
}

function buildAreaReport(
  area: string,
  entries: HealthEntry[],
  hypotheses: Hypothesis[]
): DiagnosisReport | null {
  const areaHypotheses = hypotheses.filter((h) => {
    const hArea =
      h.conditionArea?.trim() || h.title.split(':')[0]?.trim() || ''
    return hArea.toLowerCase() === area.toLowerCase()
  })

  const areaEntries = entries.filter(
    (e) => e.conditionArea.trim().toLowerCase() === area.toLowerCase()
  )

  if (areaEntries.length === 0 && areaHypotheses.length === 0) return null

  const inferred = inferDiseasesForArea(area, entries, hypotheses)
  const usesCrossBody = inferred.some((d) => d.crossBodyJournalCount > 0)
  if (inferred.length === 0) return null

  const topPrecision = inferred[0].precisionScore
  const candidates = inferred.filter(
    (d, index) =>
      index < MAX_VARIANTS &&
      d.precisionScore >= topPrecision * MIN_PRECISION_FRACTION
  )

  const weights = candidates.map((d) => d.precisionScore)
  const percentages = normalizePercentages(weights)

  const variants: DiagnosisVariant[] = candidates
    .map((disease, index) => {
      const linked = findLinkedHypothesis(disease.diseaseId, areaHypotheses)
      const pattern: HypothesisPattern | undefined = linked
        ? linked.pattern ?? patternFromTitle(linked.title)
        : undefined
      const confidence: HypothesisConfidence | undefined = linked?.confidence

      return {
        id: `${area}-${disease.diseaseId}`,
        diseaseName: disease.diseaseName,
        label: disease.diseaseName,
        percentage: percentages[index] ?? 0,
        precisionScore: disease.precisionScore,
        conditionArea: area,
        rationale: buildRationale(disease, area),
        matchedSignals: disease.matchedSignals,
        matchFlags: disease.matchFlags,
        confirmCriteria: disease.confirmCriteria,
        excludeCriteria: disease.excludeCriteria,
        suggestedWorkup: disease.suggestedWorkup,
        primaryJournalCount: disease.primaryJournalCount,
        crossBodyJournalCount: disease.crossBodyJournalCount,
        hypothesisId: linked?.id,
        pattern,
        confidence,
      }
    })
    .sort((a, b) => b.percentage - a.percentage)

  const filtered =
    variants.length <= 3
      ? variants
      : variants.filter(
          (v, index) => index < 3 || v.percentage >= MIN_VARIANT_PERCENT
        )

  const timestamps = [
    ...areaEntries.map((e) => e.createdAt),
    ...areaHypotheses.map((h) => h.updatedAt || h.createdAt),
  ]
  const updatedAt =
    timestamps.length > 0
      ? timestamps.reduce((latest, at) =>
          new Date(at).getTime() > new Date(latest).getTime() ? at : latest
        )
      : new Date().toISOString()

  const certainty = resolveCertainty(filtered.map((v) => v.percentage))

  return {
    conditionArea: area,
    certainty,
    certaintyLabel: CERTAINTY_LABELS[certainty],
    variants: filtered,
    updatedAt,
    usesCrossBodyJournal: usesCrossBody,
  }
}

/** Ranked disease names (with %) inferred from journal + hypotheses per body area. */
export function buildDiagnosisReports(
  hypotheses: Hypothesis[],
  entries: HealthEntry[] = []
): DiagnosisReport[] {
  if (hypotheses.length === 0 && entries.length === 0) return []

  const areas = collectConditionAreas(entries, hypotheses)
  const reports = areas
    .map((area) => buildAreaReport(area, entries, hypotheses))
    .filter((r): r is DiagnosisReport => Boolean(r))

  return reports.sort((a, b) => {
    const topA = a.variants[0]?.percentage ?? 0
    const topB = b.variants[0]?.percentage ?? 0
    return topB - topA
  })
}

export function findReportForArea(
  reports: DiagnosisReport[],
  area: string
): DiagnosisReport | undefined {
  return reports.find(
    (r) => r.conditionArea.trim().toLowerCase() === area.trim().toLowerCase()
  )
}
