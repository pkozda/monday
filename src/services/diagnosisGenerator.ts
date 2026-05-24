import { MEDICAL_DISEASE_CATALOG } from '@/data/medicalDiseaseCatalog'
import {
  areasMatch,
  detectAllBodyAreasFromText,
  entriesForDiagnosisArea,
  isGeneralHealthArea,
  sortDiagnosisReportsByArea,
} from '@/services/bodyAreaDetection'
import type { JournalFocusPlan } from '@/services/journalFocusAreas'
import { buildJournalFocusPlan, collectFocusAreaLabels } from '@/services/journalFocusAreas'
import {
  inferDiseasesForArea,
  type InferredDisease,
} from '@/services/diseaseInference'
import { patternFromTitle } from '@/services/hypothesisGenerator'
import {
  formatSpecialistVisitAdvice,
  suggestSpecialist,
} from '@/services/specialistSuggestion'
import { combinedEntryText } from '@/services/healthAnalysis'
import {
  buildJournalSymptomProfile,
  journalFitDisplayWeight,
} from '@/services/diagnosisJournalFit'
import {
  buildMedicalHistoryContext,
  type MedicalHistoryContext,
} from '@/services/medicalHistoryContext'
import type {
  DiagnosisCertainty,
  DiagnosisReport,
  DiagnosisVariant,
  HealthEntry,
  Hypothesis,
  HypothesisConfidence,
  HypothesisPattern,
} from '@/models/types'

export const CERTAINTY_LABELS: Record<DiagnosisCertainty, string> = {
  high: 'Most likely match',
  moderate: 'Leading possibility',
  low: 'Several possibilities — review all variants',
}

export const MIN_VARIANT_PERCENT = 3
export const MAX_DIAGNOSIS_VARIANTS = 8
const MIN_PRECISION_FRACTION = 0.35

export function normalizePercentages(weights: number[]): number[] {
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

export function resolveCertainty(percentages: number[]): DiagnosisCertainty {
  if (percentages.length === 0) return 'low'
  const sorted = [...percentages].sort((a, b) => b - a)
  const top = sorted[0] ?? 0
  const second = sorted[1] ?? 0
  if (top >= 55 && top - second >= 20) return 'high'
  if (top >= 40 && top - second >= 12) return 'moderate'
  return 'low'
}

export function findLinkedHypothesis(
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

export function buildRationale(disease: InferredDisease, primaryArea: string): string {
  const confirmMet = disease.confirmCriteria.filter((c) => c.status === 'met')
    .length
  const confirmTotal = disease.confirmCriteria.length
  const exclusions = disease.excludeCriteria.filter(
    (c) => c.status === 'exclusion_present'
  ).length

  const scopeParts: string[] = []
  if (disease.primaryJournalCount > 0) {
    scopeParts.push(
      `${disease.primaryJournalCount} journal ${disease.primaryJournalCount === 1 ? 'entry' : 'entries'} about ${primaryArea}`
    )
  }
  if (disease.crossBodyJournalCount > 0) {
    scopeParts.push(
      `${disease.crossBodyJournalCount} related ${disease.crossBodyJournalCount === 1 ? 'entry' : 'entries'} from other body areas`
    )
  }
  const scope =
    scopeParts.length > 0 ? scopeParts.join(' and ') : 'your health journal'

  const sentences = [`We looked at ${scope}.`]

  if (confirmTotal > 0) {
    if (confirmMet === confirmTotal) {
      sentences.push(
        'Several typical signs for this condition appear in what you logged.'
      )
    } else if (confirmMet > 0) {
      sentences.push(
        `Some typical signs show up in your journal (${confirmMet} of ${confirmTotal}); others are not documented yet.`
      )
    } else {
      sentences.push(
        'Few typical signs are clearly documented in your journal so far.'
      )
    }
  }

  if (exclusions > 0) {
    sentences.push(
      exclusions === 1
        ? 'One journal note may point away from this condition—worth discussing with your clinician.'
        : `${exclusions} journal notes may point away from this condition—worth discussing with your clinician.`
    )
  }

  sentences.push(
    'This is a suggestion to explore with a clinician, not a confirmed diagnosis.'
  )

  return sentences.join(' ')
}

function buildAreaReport(
  area: string,
  entries: HealthEntry[],
  hypotheses: Hypothesis[],
  sharedHistory: MedicalHistoryContext,
  focusPlan: JournalFocusPlan
): DiagnosisReport | null {
  const areaHypotheses = hypotheses.filter((h) => hypothesisRelatesToArea(h, area))

  const areaEntries = entriesForDiagnosisArea(area, entries, focusPlan)

  if (
    !isGeneralHealthArea(area) &&
    areaEntries.length === 0 &&
    areaHypotheses.length === 0
  ) {
    return null
  }

  const inferred = inferDiseasesForArea(
    area,
    entries,
    hypotheses,
    sharedHistory
  )
  const usesCrossBody = inferred.some((d) => d.crossBodyJournalCount > 0)
  if (inferred.length === 0) return null

  const topPrecision = inferred[0].precisionScore
  const candidates = inferred.filter(
    (d, index) =>
      index < MAX_DIAGNOSIS_VARIANTS &&
      d.precisionScore >= topPrecision * MIN_PRECISION_FRACTION
  )

  const weights = candidates.map((d) => {
    const profile = buildJournalSymptomProfile(
      d.diseaseId,
      d.confirmCriteria,
      sharedHistory
    )
    return journalFitDisplayWeight(d.precisionScore, profile)
  })
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
        diseaseId: disease.diseaseId,
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

  const journalContext = [
    ...areaEntries.map((e) => combinedEntryText(e)),
    ...areaHypotheses.map((h) => h.title),
  ].join('\n')
  const specialist = suggestSpecialist(area, journalContext)

  return {
    conditionArea: area,
    certainty,
    certaintyLabel: CERTAINTY_LABELS[certainty],
    variants: filtered,
    updatedAt,
    usesCrossBodyJournal: usesCrossBody,
    suggestedClinician: specialist?.clinicianTitle,
    suggestedSpecialty: specialist?.specialty,
    specialistVisitAdvice: specialist
      ? formatSpecialistVisitAdvice(specialist, area)
      : undefined,
  }
}

/** Ranked disease names (with %) inferred from journal + hypotheses per body area. */
export function buildDiagnosisReports(
  hypotheses: Hypothesis[],
  entries: HealthEntry[] = [],
  focusPlan?: JournalFocusPlan
): DiagnosisReport[] {
  if (hypotheses.length === 0 && entries.length === 0) return []

  const plan = focusPlan ?? buildJournalFocusPlan(entries)
  const sharedHistory = buildMedicalHistoryContext(entries)
  const areas = collectFocusAreaLabels(plan, hypotheses)
  const reports = areas
    .map((area) =>
      buildAreaReport(area, entries, hypotheses, sharedHistory, plan)
    )
    .filter((r): r is DiagnosisReport => Boolean(r))

  return sortDiagnosisReportsByArea(reports)
}

export function hypothesisRelatesToArea(hypothesis: Hypothesis, area: string): boolean {
  if (isGeneralHealthArea(area)) return true
  const hArea =
    hypothesis.conditionArea?.trim() || hypothesis.title.split(':')[0]?.trim() || ''
  if (hArea && areasMatch(hArea, area)) return true
  const text = [hypothesis.conditionArea, hypothesis.title].join(' ')
  return detectAllBodyAreasFromText(text).some((detected) => areasMatch(detected, area))
}

export function findReportForArea(
  reports: DiagnosisReport[],
  area: string
): DiagnosisReport | undefined {
  return reports.find(
    (r) => r.conditionArea.trim().toLowerCase() === area.trim().toLowerCase()
  )
}
