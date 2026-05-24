import { parseDiseaseIdFromVariantId } from '@/data/diseaseEducation'
import { buildJournalSymptomProfile } from '@/services/diagnosisJournalFit'
import type { DiagnosisCriterion } from '@/models/types'

/** User-facing match strength — not a clinical score. */
export type JournalAlignment = 'strong' | 'partial' | 'limited'

export type SymptomsMatchKind = 'all' | 'some' | 'none' | 'skip'

export interface DiagnosisMatchProfile {
  alignment: JournalAlignment
  symptomsMatch: SymptomsMatchKind
  confirmMet: number
  confirmTotal: number
  typicalMatched: number
  typicalTotal: number
  exclusions: number
  supportRatio: number
}

export function getDiagnosisMatchProfile(input: {
  percentage: number
  diseaseId?: string
  confirmCriteria?: DiagnosisCriterion[]
  confirmMet?: number
  confirmTotal?: number
  exclusions: number
}): DiagnosisMatchProfile {
  const { percentage, exclusions } = input

  const profile =
    input.diseaseId && input.confirmCriteria
      ? buildJournalSymptomProfile(input.diseaseId, input.confirmCriteria)
      : null

  const confirmMet = profile?.confirmMet ?? input.confirmMet ?? 0
  const confirmTotal = profile?.confirmTotal ?? input.confirmTotal ?? 0
  const typicalMatched = profile?.typicalMatched ?? 0
  const typicalTotal = profile?.typicalTotal ?? 0
  const supportRatio = profile?.supportRatio ?? 0

  let alignment: JournalAlignment = 'limited'
  if (profile && profile.typicalTotal + profile.confirmTotal > 0) {
    if (supportRatio >= 0.67 && percentage >= 22) alignment = 'strong'
    else if (supportRatio >= 0.34 || percentage >= 15) alignment = 'partial'
  } else if (confirmTotal > 0) {
    const ratio = confirmMet / confirmTotal
    if (ratio >= 0.67 && percentage >= 28) alignment = 'strong'
    else if (ratio >= 0.34 || percentage >= 18) alignment = 'partial'
  } else if (percentage >= 45) {
    alignment = 'strong'
  } else if (percentage >= 22) {
    alignment = 'partial'
  }

  let symptomsMatch: SymptomsMatchKind = 'skip'
  const typicalMissing = profile?.typicalMissing ?? 0

  if (confirmTotal > 0 || typicalTotal > 0) {
    const allTypicalFound = typicalTotal > 0 && typicalMissing === 0
    if (confirmMet === confirmTotal && confirmTotal > 0 && allTypicalFound) {
      symptomsMatch = 'all'
    } else if (confirmMet > 0 || (profile?.typicalMatched ?? 0) > 0) {
      symptomsMatch = 'some'
    } else {
      symptomsMatch = 'none'
    }
  }

  return {
    alignment,
    symptomsMatch,
    confirmMet,
    confirmTotal,
    typicalMatched,
    typicalTotal,
    exclusions,
    supportRatio,
  }
}

export function resolveVariantDiseaseId(variant: {
  id: string
  diseaseId?: string
}): string {
  return variant.diseaseId ?? parseDiseaseIdFromVariantId(variant.id)
}
