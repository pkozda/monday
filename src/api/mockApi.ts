import { db } from '@/db/database'
import type { TimelineEvent, Hypothesis, ClinicalModel } from '@/models/types'

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
