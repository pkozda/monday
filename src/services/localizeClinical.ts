import { format, parseISO } from 'date-fns'
import type { Locale } from 'date-fns'
import type { Composer } from 'vue-i18n'
import { getEntryClassificationLabel } from '@/services/healthAnalysis'
import type {
  HealthEntry,
  HypothesisPattern,
  SpecialistSuggestion,
} from '@/models/types'

type TFunction = Composer['t']

/** English labels from classifyHealthEntry → i18n keys */
export const CLASSIFICATION_KEY_BY_LABEL: Record<string, string> = {
  'Emergency — seek care now': 'classification.emergencySeekCare',
  'Urgent — contact clinician': 'classification.urgentContact',
  'Post-procedure concern': 'classification.postProcedureConcern',
  'Surgery / procedure': 'classification.surgeryProcedure',
  'Hospital / ER care': 'classification.hospitalCare',
  'Test or imaging': 'classification.testImaging',
  'Medication update': 'classification.medicationUpdate',
  'Diagnosis / specialist visit': 'classification.diagnosisVisit',
  'Clinical visit': 'classification.clinicalVisit',
  'Weight loss (symptom)': 'classification.weightLossSymptom',
  'Weight / body composition': 'classification.weightBody',
  'Condition improving': 'classification.conditionImproving',
  'Condition worsening': 'classification.conditionWorsening',
  'Condition change': 'classification.conditionChange',
  'Symptoms — follow up': 'classification.symptomsFollowUp',
  'Persistent or worsening symptoms': 'classification.persistentWorsening',
  'Ongoing / chronic condition': 'classification.chronicOngoing',
  'Symptom log': 'classification.symptomLog',
  'Health record': 'classification.healthRecord',
}

const CONFIDENCE_KEY_BY_LABEL: Record<string, string> = {
  Exploratory: 'confidenceHypothesis.exploratory',
  Supported: 'confidenceHypothesis.supported',
  'Strongly Supported': 'confidenceHypothesis.stronglySupported',
}

const SPECIALTY_SLUG: Record<string, string> = {
  Orthopedics: 'orthopedics',
  Dermatology: 'dermatology',
  Cardiology: 'cardiology',
  Gastroenterology: 'gastroenterology',
  Neurology: 'neurology',
  Endocrinology: 'endocrinology',
  Pulmonology: 'pulmonology',
  Urology: 'urology',
  Gynecology: 'gynecology',
  Ophthalmology: 'ophthalmology',
  ENT: 'ent',
  Psychiatry: 'psychiatry',
  'Primary care': 'primaryCare',
}

export function localizeClassificationLabel(label: string, t: TFunction): string {
  const key = CLASSIFICATION_KEY_BY_LABEL[label]
  return key ? String(t(key)) : label
}

export function localizedClassificationForEntry(
  entry: Parameters<typeof getEntryClassificationLabel>[0],
  t: TFunction
): string {
  return localizeClassificationLabel(getEntryClassificationLabel(entry), t)
}

export function localizeHypothesisConfidence(confidence: string, t: TFunction): string {
  const key = CONFIDENCE_KEY_BY_LABEL[confidence]
  return key ? String(t(key)) : confidence
}

export function localizePatternLabel(pattern: HypothesisPattern, t: TFunction): string {
  return String(t(`hypothesisPatterns.${pattern}`))
}

export function localizeJournalFlag(flag: string, t: TFunction): string {
  const key = `journalFlags.${flag}`
  const translated = t(key)
  return translated !== key ? String(translated) : flag.replace(/_/g, ' ')
}

export function specialistSlug(specialty: string): string {
  return SPECIALTY_SLUG[specialty] ?? 'primaryCare'
}

export function localizeSpecialistVisitAdvice(
  suggestion: SpecialistSuggestion,
  conditionArea: string,
  t: TFunction
): string {
  const slug = specialistSlug(suggestion.specialty)
  const area = conditionArea.trim()
  return String(
    t('specialist.visitAdvice', {
      clinician: t(`specialist.${slug}.clinician`),
      specialty: t(`specialist.${slug}.specialty`),
      areaPhrase: area ? t('specialist.areaPhrase', { area }) : '',
      reason: t(`specialist.${slug}.reason`),
    })
  )
}

export function localizeSpecialistBullet(
  suggestion: SpecialistSuggestion,
  t: TFunction
): string {
  const slug = specialistSlug(suggestion.specialty)
  return String(
    t('specialist.bullet', {
      clinician: t(`specialist.${slug}.clinician`),
      specialty: t(`specialist.${slug}.specialty`),
      reason: t(`specialist.${slug}.reason`),
    })
  )
}

export function formatLocalizedJournalEntryHeader(
  entry: HealthEntry,
  t: TFunction,
  dateLocale: Locale
): string {
  const date = format(parseISO(entry.eventDate), 'PP', { locale: dateLocale })
  const label = localizedClassificationForEntry(entry, t)
  const severity =
    entry.severity !== undefined
      ? t('journalEntry.severitySnippet', { value: entry.severity })
      : ''
  return `${date} · ${label}${severity} · ${entry.title.trim()}`
}
