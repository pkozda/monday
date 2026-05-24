import { entryText } from '@/services/medicalHistoryContext'
import type { CriterionRule } from '@/data/diseaseDiagnosisCriteria'
import type { HealthEntry } from '@/models/types'
import type { MedicalHistoryContext } from '@/services/medicalHistoryContext'

/** Findings, results, or diagnoses — not “I had an appointment”. */
const CLINICAL_FINDING_RE =
  /\b(diagnos|diagnosed|test\s+result|lab\s+result|blood\s+work|pathology|biopsy|mri|ct\s+scan|x-?ray|ultrasound|sonograph|imaging|scan\s+show|results?\s+show|positive\s+for|negative\s+for|confirmed|fracture|sprain|tear|infection|inflammation|arthritis|prescribed|referr|ordered\s+(a\s+)?test)\b/i

export type DiagnosisSupportReason =
  | 'symptom_logged'
  | 'imaging_or_test'
  | 'finding_in_visit_note'
  | 'medication_change'
  | 'explicit_diagnosis'
  | 'journal_pattern'

export function entryHasDiagnosisSupport(entry: HealthEntry): boolean {
  if (entry.entryType === 'imaging') return true
  if (entry.entryType === 'symptom' || entry.entryType === 'change') return true

  const text = entryText(entry)

  if (entry.entryType === 'medication') {
    return text.trim().length > 12
  }

  if (entry.entryType === 'doctor_visit') {
    return CLINICAL_FINDING_RE.test(text)
  }

  return CLINICAL_FINDING_RE.test(text)
}

export function isVisitOnlyConfirmRule(rule: CriterionRule): boolean {
  if (rule.id.endsWith('-visit')) return true
  return (
    /\bclinician\s+visit\b/i.test(rule.text) &&
    /\btest\s+result\b/i.test(rule.text)
  )
}

function entryMatchesPatterns(entry: HealthEntry, patterns: RegExp[]): boolean {
  const text = entryText(entry)
  return patterns.some((p) => p.test(text))
}

/** Pick a journal entry that truly supports confirmation (not a bare visit log). */
export function findEntryForConfirmCriterion(
  history: MedicalHistoryContext,
  rule: CriterionRule
): HealthEntry | undefined {
  const visitRule = isVisitOnlyConfirmRule(rule)

  for (const entry of history.entries) {
    if (!entryMatchesPatterns(entry, rule.patterns)) continue
    if (visitRule && !entryHasDiagnosisSupport(entry)) continue
    if (!visitRule && !entryHasDiagnosisSupport(entry) && entry.entryType === 'doctor_visit') {
      continue
    }
    return entry
  }

  if (visitRule) return undefined

  for (const entry of history.entries) {
    if (entryMatchesPatterns(entry, rule.patterns)) return entry
  }

  return undefined
}

export function supportReasonForEntry(
  entry: HealthEntry,
  criterionText: string
): DiagnosisSupportReason {
  const text = entryText(entry)

  if (entry.entryType === 'imaging' || /\b(mri|x-?ray|ct\s+scan|ultrasound|biopsy)\b/i.test(text)) {
    return 'imaging_or_test'
  }

  if (/\b(diagnosed|diagnosis|confirmed\s+as)\b/i.test(text)) {
    return 'explicit_diagnosis'
  }

  if (entry.entryType === 'doctor_visit' && CLINICAL_FINDING_RE.test(text)) {
    return 'finding_in_visit_note'
  }

  if (entry.entryType === 'medication') {
    return 'medication_change'
  }

  if (entry.entryType === 'symptom' || entry.entryType === 'change') {
    return 'symptom_logged'
  }

  return 'journal_pattern'
}
