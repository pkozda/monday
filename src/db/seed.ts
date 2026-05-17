import { db } from '@/db/database'
import {
  seedClinicalModel,
  SEED_TIMELINE_IDS,
  SEED_HYPOTHESIS_IDS,
} from '@/db/seedData'

/** Remove demo timeline and hypothesis rows; journal-created events are kept. */
export async function purgeSeedMockData(): Promise<void> {
  await db.transaction('rw', db.timelineEvents, db.hypotheses, async () => {
    await db.timelineEvents.bulkDelete([...SEED_TIMELINE_IDS])
    await db.hypotheses.bulkDelete([...SEED_HYPOTHESIS_IDS])
  })
}

export async function seedDatabaseIfEmpty(): Promise<void> {
  const modelCount = await db.clinicalModels.count()
  if (modelCount > 0) return

  await db.clinicalModels.add(seedClinicalModel)
}
