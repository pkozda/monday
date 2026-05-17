import type { ClinicalModel } from '@/models/types'

/** Fixed IDs of demo timeline events — removed on startup for existing DBs */
export const SEED_TIMELINE_IDS = [
  'event-1',
  'event-2',
  'event-3',
  'event-4',
  'event-5',
] as const

/** Fixed IDs of demo hypotheses — removed on startup for existing DBs */
export const SEED_HYPOTHESIS_IDS = [
  'hyp-1',
  'hyp-2',
  'hyp-3',
  'hyp-4',
] as const

export const seedClinicalModel: ClinicalModel = {
  id: 'model-1',
  title: 'Primary Clinical Model',
  summary:
    'Current understanding of patient health status based on longitudinal data analysis. Focus on systemic interactions rather than isolated symptoms.',
  factors: [
    {
      id: 'factor-1',
      name: 'Metabolic Function',
      description:
        'Observed patterns in glucose regulation and energy metabolism',
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
