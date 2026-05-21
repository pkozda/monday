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

export interface DiagnosisVariant {
  id: string
  /** Medical disease / condition name */
  diseaseName: string
  label: string
  percentage: number
  conditionArea: string
  rationale: string
  /** @deprecated use matchFlags — kept for compact summaries */
  matchedSignals: string[]
  matchFlags: DiagnosisMatchFlag[]
  primaryJournalCount: number
  crossBodyJournalCount: number
  hypothesisId?: string
  pattern?: HypothesisPattern
  confidence?: HypothesisConfidence
}

export interface DiagnosisReport {
  conditionArea: string
  certainty: DiagnosisCertainty
  certaintyLabel: string
  variants: DiagnosisVariant[]
  updatedAt: string
  /** True when journal entries from other body areas influenced scoring */
  usesCrossBodyJournal: boolean
}

export type HealthEntryType =
  | 'symptom'
  | 'medication'
  | 'change'
  | 'doctor_visit'
  | 'imaging'
  | 'other'

export type HealthUrgency = 'routine' | 'monitor' | 'urgent' | 'emergency'

export interface HealthEntryAnalysis {
  urgency: HealthUrgency
  /** Specific care context label shown in the UI (e.g. "Surgery / procedure"). */
  classification: string
  flags: string[]
  summary: string
  linkedTimelineEventId?: string
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

export type BiologicalSex = 'female' | 'male' | 'other' | 'prefer_not_to_say'

export interface PatientProfile {
  id: string
  displayName: string
  dateOfBirth?: string
  biologicalSex?: BiologicalSex
  bloodType?: string
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
}

export interface SeverityPoint {
  date: string
  severity: number
  label: string
}

export type HealthRecommendationCategory =
  | 'screening'
  | 'preventive'
  | 'lifestyle'
  | 'profile'
  | 'journal'

export type HealthRecommendationPriority = 'high' | 'medium' | 'low'

export interface HealthRecommendation {
  id: string
  title: string
  detail: string
  category: HealthRecommendationCategory
  priority: HealthRecommendationPriority
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
  hypothesesByConfidence: ChartSegment[]
}
