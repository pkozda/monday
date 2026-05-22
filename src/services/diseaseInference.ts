import { MEDICAL_DISEASE_CATALOG } from '@/data/medicalDiseaseCatalog'
import { inferDiseasesWithPrecision } from '@/services/diagnosisPrecision'
import type { MedicalHistoryContext } from '@/services/medicalHistoryContext'
import type { DiagnosisCriterion, DiagnosisMatchFlag, HealthEntry, Hypothesis } from '@/models/types'

export interface InferredDisease {
  diseaseId: string
  diseaseName: string
  score: number
  precisionScore: number
  matchedSignals: string[]
  matchFlags: DiagnosisMatchFlag[]
  primaryJournalCount: number
  crossBodyJournalCount: number
  confirmCriteria: DiagnosisCriterion[]
  excludeCriteria: DiagnosisCriterion[]
  suggestedWorkup: string[]
}

/** Rank diseases for an area using full medical history and precision scoring. */
export function inferDiseasesForArea(
  area: string,
  allEntries: HealthEntry[],
  allHypotheses: Hypothesis[] = [],
  sharedHistory?: MedicalHistoryContext
): InferredDisease[] {
  if (allEntries.length === 0 && allHypotheses.length === 0) return []

  return inferDiseasesWithPrecision(
    area,
    allEntries,
    allHypotheses,
    MEDICAL_DISEASE_CATALOG,
    sharedHistory
  ).map((r) => ({
    diseaseId: r.diseaseId,
    diseaseName: r.diseaseName,
    score: r.rawScore,
    precisionScore: r.precisionScore,
    matchedSignals: r.matchedSignals,
    matchFlags: r.matchFlags,
    primaryJournalCount: r.primaryJournalCount,
    crossBodyJournalCount: r.crossBodyJournalCount,
    confirmCriteria: r.confirmCriteria,
    excludeCriteria: r.excludeCriteria,
    suggestedWorkup: r.suggestedWorkup,
  }))
}

export function collectConditionAreas(
  entries: HealthEntry[],
  hypotheses: Hypothesis[]
): string[] {
  const map = new Map<string, string>()

  for (const entry of entries) {
    const area = entry.conditionArea.trim()
    if (!area) continue
    map.set(area.toLowerCase(), area)
  }

  for (const hypothesis of hypotheses) {
    const area =
      hypothesis.conditionArea?.trim() ||
      hypothesis.title.split(':')[0]?.trim() ||
      ''
    if (!area) continue
    map.set(area.toLowerCase(), area)
  }

  return [...map.values()]
}
