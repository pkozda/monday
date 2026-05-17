import { db } from '@/db/database'
import type {
  ClinicalModel,
  TimelineEvent,
  Hypothesis,
} from '@/models/types'

const PRIMARY_MODEL_ID = 'model-1'

export async function getClinicalModel(): Promise<ClinicalModel> {
  const model = await db.clinicalModels.get(PRIMARY_MODEL_ID)
  if (!model) {
    throw new Error('Clinical model not found in local database')
  }
  return model
}

export async function getTimeline(): Promise<TimelineEvent[]> {
  const events = await db.timelineEvents.toArray()
  return events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export async function getHypotheses(): Promise<Hypothesis[]> {
  return db.hypotheses.toArray()
}

export async function saveClinicalModel(model: ClinicalModel): Promise<void> {
  await db.clinicalModels.put(model)
}

export async function saveTimelineEvent(event: TimelineEvent): Promise<void> {
  await db.timelineEvents.put(event)
}

export async function saveHypothesis(hypothesis: Hypothesis): Promise<void> {
  await db.hypotheses.put(hypothesis)
}

export async function deleteTimelineEvent(id: string): Promise<void> {
  await db.timelineEvents.delete(id)
}

export async function deleteHypothesis(id: string): Promise<void> {
  await db.hypotheses.delete(id)
}
