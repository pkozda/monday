import type {
  ClinicalModel,
  TimelineEvent,
  Hypothesis,
} from '@/models/types'

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock data
const mockClinicalModel: ClinicalModel = {
  id: 'model-1',
  title: 'Primary Clinical Model',
  summary: 'Current understanding of patient health status based on longitudinal data analysis. Focus on systemic interactions rather than isolated symptoms.',
  factors: [
    {
      id: 'factor-1',
      name: 'Metabolic Function',
      description: 'Observed patterns in glucose regulation and energy metabolism',
    },
    {
      id: 'factor-2',
      name: 'Immune Response',
      description: 'Chronic inflammatory markers and immune system activity',
    },
    {
      id: 'factor-3',
      name: 'Cardiovascular Health',
      description: 'Blood pressure trends and cardiac function indicators',
    },
  ],
}

const mockTimeline: TimelineEvent[] = [
  {
    id: 'event-1',
    date: '2024-01-15',
    type: 'symptom',
    title: 'Fatigue and Brain Fog',
    description: 'Patient reports persistent fatigue and difficulty concentrating over past 2 weeks',
  },
  {
    id: 'event-2',
    date: '2024-01-20',
    type: 'imaging',
    title: 'MRI Brain Scan',
    description: 'Routine imaging study completed. Results pending review.',
  },
  {
    id: 'event-3',
    date: '2024-01-25',
    type: 'diagnosis',
    title: 'Chronic Fatigue Syndrome',
    description: 'Clinical diagnosis based on symptom pattern and exclusion of other causes',
  },
  {
    id: 'event-4',
    date: '2024-02-01',
    type: 'treatment',
    title: 'Lifestyle Modification Protocol',
    description: 'Initiated structured rest schedule and dietary adjustments',
  },
  {
    id: 'event-5',
    date: '2024-02-10',
    type: 'symptom',
    title: 'Improved Energy Levels',
    description: 'Patient reports moderate improvement in daily energy and cognitive function',
  },
]

const mockHypotheses: Hypothesis[] = [
  {
    id: 'hyp-1',
    title: 'Metabolic Dysregulation Contributing to Fatigue',
    confidence: 'Supported',
    evidenceIds: ['event-1', 'event-3', 'event-5'],
  },
  {
    id: 'hyp-2',
    title: 'Immune System Overactivation',
    confidence: 'Exploratory',
    evidenceIds: ['event-1', 'event-2'],
  },
  {
    id: 'hyp-3',
    title: 'Treatment Protocol Effectiveness',
    confidence: 'Strongly Supported',
    evidenceIds: ['event-4', 'event-5'],
  },
  {
    id: 'hyp-4',
    title: 'Potential Autoimmune Component',
    confidence: 'Exploratory',
    evidenceIds: ['event-2', 'event-3'],
  },
]

// Mock API functions
export async function getClinicalModel(): Promise<ClinicalModel> {
  await delay(300)
  return mockClinicalModel
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  await delay(400)
  return [...mockTimeline].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export async function getHypotheses(): Promise<Hypothesis[]> {
  await delay(350)
  return [...mockHypotheses]
}
