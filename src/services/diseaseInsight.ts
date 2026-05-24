import {
  getDiseaseEducation,
  parseDiseaseIdFromVariantId,
  type DiseaseEducation,
} from '@/data/diseaseEducation'
import {
  buildJournalSymptomProfile,
} from '@/services/diagnosisJournalFit'
import {
  buildMissingTypicalSymptoms,
  buildReferenceTypicalSymptoms,
  buildUserJournalEvidence,
  type UserJournalEvidenceRow,
} from '@/services/journalUserEvidence'
import { buildMedicalHistoryContext } from '@/services/medicalHistoryContext'
import type { DiagnosisVariant, HealthEntry } from '@/models/types'

export { symptomMatchesCriterionText } from '@/services/diagnosisJournalFit'
export type { UserJournalEvidenceRow } from '@/services/journalUserEvidence'

export interface MissingConfirmRow {
  id: string
  text: string
}

export interface CautionSignalRow {
  id: string
  label: string
  detail?: string
}

export interface DiseaseInsight {
  diseaseId: string
  education: DiseaseEducation
  /** Real typical signs (reference only — not journal highlights) */
  referenceSymptoms: string[]
  /** What the user actually logged that supports this possibility */
  userJournalEvidence: UserJournalEvidenceRow[]
  missingToConfirm: MissingConfirmRow[]
  cautionSignals: CautionSignalRow[]
  metCount: number
  totalConfirmCount: number
  hasConfirmingSymptoms: boolean
  supportRatio: number
}

export function resolveDiseaseId(variant: DiagnosisVariant): string {
  return variant.diseaseId ?? parseDiseaseIdFromVariantId(variant.id)
}

export function buildDiseaseInsight(
  variant: DiagnosisVariant,
  journalEntries: HealthEntry[] = []
): DiseaseInsight {
  const diseaseId = resolveDiseaseId(variant)
  const education = getDiseaseEducation(diseaseId)
  const history = journalEntries.length
    ? buildMedicalHistoryContext(journalEntries)
    : undefined

  const referenceSymptoms = buildReferenceTypicalSymptoms(diseaseId)
  const userJournalEvidence = buildUserJournalEvidence(variant, journalEntries)
  const missingToConfirm = buildMissingTypicalSymptoms(
    diseaseId,
    variant.confirmCriteria,
    journalEntries
  )

  const cautionSignals = variant.excludeCriteria
    .filter((c) => c.status === 'exclusion_present')
    .map((c) => ({
      id: c.id,
      label: c.text,
      detail: c.detail,
    }))

  const metCount = variant.confirmCriteria.filter((c) => c.status === 'met').length
  const profile = buildJournalSymptomProfile(
    diseaseId,
    variant.confirmCriteria,
    history
  )

  return {
    diseaseId,
    education,
    referenceSymptoms,
    userJournalEvidence,
    missingToConfirm,
    cautionSignals,
    metCount,
    totalConfirmCount: variant.confirmCriteria.length,
    hasConfirmingSymptoms:
      userJournalEvidence.length > 0 || metCount > 0,
    supportRatio: profile.supportRatio,
  }
}
