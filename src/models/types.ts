export type TimelineEventType = 'diagnosis' | 'imaging' | 'symptom' | 'treatment'

export type HypothesisConfidence = 'Exploratory' | 'Supported' | 'Strongly Supported'

export type HypothesisPattern =
  | 'urgent'
  | 'treatment_improvement'
  | 'worsening'
  | 'recurring'
  | 'treatment_unclear'
  | 'general'

export type HypothesisHistoryKind = 'created' | 'updated'

export interface HypothesisHistoryEntry {
  id: string
  at: string
  kind: HypothesisHistoryKind
  title: string
  confidence: HypothesisConfidence
  journalEntryCount: number
  newJournalEntryIds: string[]
  note: string
}

export interface ClinicalFactor {
  id: string
  name: string
  description: string
}

export interface ClinicalModel {
  id: string
  title: string
  summary: string
  factors: ClinicalFactor[]
  /** True when summary/factors were refined by the LLM. */
  aiGenerated?: boolean
  aiMeta?: AiInsightMeta
}

export interface TimelineEvent {
  id: string
  date: string // ISO date string
  type: TimelineEventType
  title: string
  description: string
}

export interface Hypothesis {
  id: string
  title: string
  confidence: HypothesisConfidence
  evidenceIds: string[]
  conditionArea: string
  pattern: HypothesisPattern
  createdAt: string
  updatedAt: string
  history: HypothesisHistoryEntry[]
  /** LLM-generated narrative when AI insights are enabled. */
  aiInsight?: HypothesisAiInsight
}

export type DiagnosisCertainty = 'high' | 'moderate' | 'low'

export type DiagnosisMatchFlagKind =
  | 'body_area'
  | 'keyword'
  | 'medication'
  | 'named_condition'
  | 'hypothesis'
  | 'urgency'
  | 'journal_flag'
  | 'cross_body'

export interface DiagnosisMatchFlag {
  kind: DiagnosisMatchFlagKind
  label: string
  detail: string
  sourceArea?: string
}

export type DiagnosisCriterionStatus = 'met' | 'not_met' | 'exclusion_present'

export interface DiagnosisCriterion {
  id: string
  text: string
  role: 'confirm' | 'exclude'
  status: DiagnosisCriterionStatus
  detail?: string
  /** Journal entry this criterion was linked from (AI / enriched path). */
  sourceEntryId?: string
  /** Plain-language AI note: why this journal entry supports the possible condition. */
  linkExplanation?: string
}

export interface DiagnosisVariant {
  id: string
  /** Catalog id for education lookup */
  diseaseId?: string
  /** Medical disease / condition name */
  diseaseName: string
  label: string
  percentage: number
  /** Internal 0–100 fit score from history (before normalization to %) */
  precisionScore: number
  conditionArea: string
  rationale: string
  /** @deprecated use matchFlags — kept for compact summaries */
  matchedSignals: string[]
  matchFlags: DiagnosisMatchFlag[]
  confirmCriteria: DiagnosisCriterion[]
  excludeCriteria: DiagnosisCriterion[]
  /** Tests or findings that would help confirm or rule out */
  suggestedWorkup: string[]
  primaryJournalCount: number
  crossBodyJournalCount: number
  hypothesisId?: string
  pattern?: HypothesisPattern
  confidence?: HypothesisConfidence
  /** True when rationale was written or refined by the LLM. */
  aiEnhanced?: boolean
}

/** Result of the last AI diagnosis generation attempt (stored with reports). */
export type DiagnosisGenerationOutcome =
  | 'ok'
  | 'no_suggestions'
  | 'needs_more_journal'
  | 'failed'

export interface StoredClinicalInsights {
  id: string
  diagnosisReports: DiagnosisReport[]
  generatedAt: string
  diagnosisOutcome?: DiagnosisGenerationOutcome
  diagnosisOutcomeMessage?: string
}

export interface DiagnosisReport {
  conditionArea: string
  certainty: DiagnosisCertainty
  certaintyLabel: string
  variants: DiagnosisVariant[]
  updatedAt: string
  /** True when journal entries from other body areas influenced scoring */
  usesCrossBodyJournal: boolean
  /** Suggested clinician type from tracked body area (not a diagnosis) */
  suggestedClinician?: string
  suggestedSpecialty?: string
  specialistVisitAdvice?: string
  /** True when variant order and % came from the LLM (not rule-based weights). */
  aiRanked?: boolean
}

export type HealthEntryType =
  | 'symptom'
  | 'medication'
  | 'change'
  | 'doctor_visit'
  | 'imaging'
  | 'lab_test'
  | 'surgery'
  | 'other'

export type HealthUrgency = 'routine' | 'monitor' | 'urgent' | 'emergency'

export interface AiInsightMeta {
  generatedAt: string
  model?: string
  source: 'llm'
}

/** Optional LLM enrichment stored on journal analysis. */
export interface HealthEntryAiInsight {
  structuredSymptoms: string[]
  clinicalSummary: string
  suggestedBodyAreas: string[]
  meta: AiInsightMeta
}

export interface HealthEntryAnalysis {
  urgency: HealthUrgency
  /** Specific care context label shown in the UI (e.g. "Surgery / procedure"). */
  classification: string
  flags: string[]
  summary: string
  linkedTimelineEventId?: string
  /** Present when AI symptom analysis has run for this entry. */
  ai?: HealthEntryAiInsight
}

export interface HypothesisAiInsight {
  narrative: string
  reasoning: string
  recommendations: string[]
  meta: AiInsightMeta
}

export interface HealthEntry {
  id: string
  createdAt: string
  eventDate: string
  conditionArea: string
  entryType: HealthEntryType
  title: string
  description: string
  medications?: string
  severity?: number
  analysis: HealthEntryAnalysis
}

export interface HealthEntryInput {
  eventDate: string
  conditionArea: string
  entryType: HealthEntryType
  title: string
  description: string
  medications?: string
  severity?: number
}

export type DoctorAppointmentSource = 'manual' | 'journal'

export interface DoctorAppointment {
  id: string
  createdAt: string
  /** ISO datetime — when the visit is scheduled */
  scheduledAt: string
  doctorName: string
  clinicName?: string
  specialty: string
  address: string
  notes?: string
  /** Set when created automatically from a journal entry */
  linkedJournalEntryId?: string
  source?: DoctorAppointmentSource
}

export interface DoctorAppointmentInput {
  scheduledAt: string
  doctorName: string
  clinicName?: string
  specialty: string
  address: string
  notes?: string
}

export type BiologicalSex = 'female' | 'male' | 'other' | 'prefer_not_to_say'

export interface PatientProfile {
  id: string
  displayName: string
  dateOfBirth?: string
  biologicalSex?: BiologicalSex
  bloodType?: string
  /** Optional baseline height in centimeters */
  heightCm?: number
  /** Optional baseline weight in kilograms */
  weightKg?: number
  createdAt: string
}

export interface ConditionSummary {
  name: string
  entryCount: number
  lastEntryDate: string
  latestUrgency: HealthUrgency
  latestClassification: string
}

export interface ChartSegment {
  label: string
  value: number
  color: string
  /** Stable id for i18n (e.g. entry type or confidence bucket) */
  key?: string
}

export interface SeverityPoint {
  date: string
  severity: number
  label: string
}

export interface SeverityTrendInfo {
  explicitCount: number
  textInferredCount: number
  urgencyEstimatedCount: number
}

export type HealthRecommendationCategory =
  | 'screening'
  | 'preventive'
  | 'lifestyle'
  | 'profile'
  | 'journal'

export type HealthRecommendationPriority = 'high' | 'medium' | 'low'

/** Link from a recommendation to a specific journal record. */
export interface RecommendationJournalLink {
  entryId: string
  title: string
  eventDate: string
  conditionArea: string
  urgency: HealthUrgency
}

export interface HealthRecommendation {
  id: string
  title: string
  detail: string
  category: HealthRecommendationCategory
  priority: HealthRecommendationPriority
  /** In-app route (e.g. journal list with filter). */
  actionRoute?: string
  /** Journal entries this recommendation refers to. */
  journalLinks?: RecommendationJournalLink[]
}

export interface DashboardStats {
  trackingSince: string | null
  daysTracked: number
  totalJournalEntries: number
  totalTimelineEvents: number
  totalHypotheses: number
  entriesLast30Days: number
  attentionRequired: number
  averageSeverity: number | null
  conditions: ConditionSummary[]
  entriesByType: ChartSegment[]
  urgencyBreakdown: ChartSegment[]
  severityTrend: SeverityPoint[]
  severityTrendInfo: SeverityTrendInfo
  hypothesesByConfidence: ChartSegment[]
}
