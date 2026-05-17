import { db } from '@/db/database'
import {
  seedClinicalModel,
  seedTimeline,
  seedHypotheses,
} from '@/db/seedData'

export async function seedDatabaseIfEmpty(): Promise<void> {
  const [modelCount, eventCount, hypothesisCount] = await Promise.all([
    db.clinicalModels.count(),
    db.timelineEvents.count(),
    db.hypotheses.count(),
  ])

  if (modelCount > 0 || eventCount > 0 || hypothesisCount > 0) {
    return
  }

  await db.transaction(
    'rw',
    db.clinicalModels,
    db.timelineEvents,
    db.hypotheses,
    async () => {
      await db.clinicalModels.add(seedClinicalModel)
      await db.timelineEvents.bulkAdd(seedTimeline)
      await db.hypotheses.bulkAdd(seedHypotheses)
    }
  )
}
