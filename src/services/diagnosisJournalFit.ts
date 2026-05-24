import {
  filterEducationSymptoms,
  getDiseaseEducation,
} from '@/data/diseaseEducation'
import type { DiagnosisCriterion } from '@/models/types'
import type { MedicalHistoryContext } from '@/services/medicalHistoryContext'

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'or',
  'and',
  'with',
  'to',
  'of',
  'in',
  'on',
  'for',
  'is',
  'are',
  'was',
  'were',
  'your',
  'that',
  'when',
  'often',
  'sometimes',
  'especially',
  'before',
  'after',
  'from',
  'into',
  'over',
  'under',
  'not',
  'may',
  'can',
  'has',
  'have',
  'had',
  'this',
  'than',
  'more',
  'less',
  'one',
  'two',
  'see',
  'below',
  'people',
  'between',
  'early',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
}

/** Heuristic overlap between education symptom line and criterion label. */
export function symptomMatchesCriterionText(symptom: string, criterionText: string): boolean {
  const symptomNorm = symptom.toLowerCase()
  const criterionNorm = criterionText.toLowerCase()

  const symptomTokens = tokenize(symptom)
  const criterionTokens = tokenize(criterionText)
  if (!symptomTokens.length || !criterionTokens.length) return false

  const overlap = symptomTokens.filter((w) => criterionTokens.includes(w))
  if (overlap.length >= 2) return true
  if (overlap.length === 1 && overlap[0].length >= 6) return true

  for (const word of symptomTokens) {
    if (word.length >= 5 && criterionNorm.includes(word)) return true
  }
  for (const word of criterionTokens) {
    if (word.length >= 5 && symptomNorm.includes(word)) return true
  }

  return false
}

function typicalSymptomInJournalText(
  symptom: string,
  history: MedicalHistoryContext
): boolean {
  const tokens = tokenize(symptom).filter((w) => w.length >= 4)
  if (!tokens.length) return false

  const text = history.allText.toLowerCase()
  const hits = tokens.filter((t) => text.includes(t))
  const needed = tokens.length >= 3 ? 2 : 1
  return hits.length >= needed
}

export interface TypicalSymptomMatch {
  text: string
  confirmsDiagnosis: boolean
  journalDetail?: string
}

export interface JournalSymptomProfile {
  typicalTotal: number
  typicalMatched: number
  typicalMissing: number
  confirmMet: number
  confirmTotal: number
  missingCount: number
  /** 0–1: share of typical signs + confirm checks found in journal */
  supportRatio: number
}

export function buildTypicalSymptomMatches(
  diseaseId: string,
  confirmCriteria: DiagnosisCriterion[],
  history?: MedicalHistoryContext
): TypicalSymptomMatch[] {
  const education = getDiseaseEducation(diseaseId)
  const metCriteria = confirmCriteria.filter((c) => c.status === 'met')
  const symptoms = filterEducationSymptoms(education.commonSymptoms)

  return symptoms.map((text) => {
    const criterion = metCriteria.find((c) =>
      symptomMatchesCriterionText(text, c.text)
    )
    if (criterion) {
      return {
        text,
        confirmsDiagnosis: true,
        journalDetail: criterion.detail,
      }
    }

    if (history && typicalSymptomInJournalText(text, history)) {
      return { text, confirmsDiagnosis: true }
    }

    return { text, confirmsDiagnosis: false }
  })
}

export function buildJournalSymptomProfile(
  diseaseId: string,
  confirmCriteria: DiagnosisCriterion[],
  history?: MedicalHistoryContext
): JournalSymptomProfile {
  const typicalRows = buildTypicalSymptomMatches(diseaseId, confirmCriteria, history)
  const typicalTotal = typicalRows.length
  const typicalMatched = typicalRows.filter((r) => r.confirmsDiagnosis).length
  const typicalMissing = typicalTotal - typicalMatched

  const confirmMet = confirmCriteria.filter((c) => c.status === 'met').length
  const confirmTotal = confirmCriteria.length

  const missingFromTypical = typicalRows
    .filter((r) => !r.confirmsDiagnosis)
    .map((r) => r.text.trim().toLowerCase())

  let extraMissingCriteria = 0
  for (const criterion of confirmCriteria) {
    if (criterion.status !== 'not_met') continue
    const covered = typicalRows.some((row) =>
      symptomMatchesCriterionText(row.text, criterion.text)
    )
    if (!covered) extraMissingCriteria += 1
  }

  const missingCount = missingFromTypical.length + extraMissingCriteria

  const supportNumerator = typicalMatched + confirmMet
  const supportDenominator = typicalTotal + confirmTotal
  const supportRatio =
    supportDenominator > 0 ? supportNumerator / supportDenominator : 0

  return {
    typicalTotal,
    typicalMatched,
    typicalMissing,
    confirmMet,
    confirmTotal,
    missingCount,
    supportRatio,
  }
}

export interface JournalFitScoreAdjustments {
  /** Added to raw evidence score */
  typicalAndConfirmBonus: number
  /** Subtracted from raw evidence */
  missingPenalty: number
  /** Multiplier applied to precision score (0.55–1.05) */
  precisionMultiplier: number
  /** Flat bonus/penalty after multiplier */
  precisionFlatAdjust: number
}

export function journalFitScoreAdjustments(
  profile: JournalSymptomProfile
): JournalFitScoreAdjustments {
  const { supportRatio, typicalMissing, missingCount, confirmMet, confirmTotal } =
    profile

  const typicalAndConfirmBonus = Math.round(supportRatio * 24)

  const missingPenalty = Math.min(
    28,
    typicalMissing * 4 + Math.max(0, missingCount - typicalMissing) * 5
  )

  let precisionMultiplier = 0.58 + supportRatio * 0.47

  if (confirmTotal > 0 && confirmMet === confirmTotal && profile.typicalTotal > 0) {
    if (typicalMissing === 0) precisionMultiplier = Math.min(1.08, precisionMultiplier + 0.1)
  }

  if (missingCount >= 3 && supportRatio < 0.35) {
    precisionMultiplier *= 0.88
  }

  let precisionFlatAdjust = 0
  if (supportRatio >= 0.85 && confirmMet + profile.typicalMatched >= 2) {
    precisionFlatAdjust += 6
  }
  if (supportRatio <= 0.2 && profile.typicalTotal + confirmTotal >= 2) {
    precisionFlatAdjust -= 10
  }

  return {
    typicalAndConfirmBonus,
    missingPenalty,
    precisionMultiplier,
    precisionFlatAdjust,
  }
}

/** Weight for percentage distribution (scoring already includes journal fit). */
export function journalFitDisplayWeight(
  precisionScore: number,
  profile: JournalSymptomProfile
): number {
  if (profile.typicalTotal + profile.confirmTotal === 0) {
    return precisionScore
  }
  const blend = 0.35 + profile.supportRatio * 0.65
  return Math.max(1, Math.round(precisionScore * blend))
}
