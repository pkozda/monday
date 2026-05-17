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
