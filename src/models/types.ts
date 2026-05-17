export type TimelineEventType = 'diagnosis' | 'imaging' | 'symptom' | 'treatment'

export type HypothesisConfidence = 'Exploratory' | 'Supported' | 'Strongly Supported'

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
