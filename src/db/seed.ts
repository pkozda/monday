import { db } from '@/db/database'
import { SEED_TIMELINE_IDS, SEED_HYPOTHESIS_IDS } from '@/db/seedData'

const SEED_CLINICAL_MODEL_ID = 'model-1'

/** Remove demo timeline, hypothesis, and static clinical model rows. */
export async function purgeSeedMockData(): Promise<void> {
  await db.transaction(
    'rw',
    db.timelineEvents,
    db.hypotheses,
    db.clinicalModels,
    async () => {
      await db.timelineEvents.bulkDelete([...SEED_TIMELINE_IDS])
      await db.hypotheses.bulkDelete([...SEED_HYPOTHESIS_IDS])
      await db.clinicalModels.delete(SEED_CLINICAL_MODEL_ID)
    }
  )
}

/** Clinical model is generated from journal entries — nothing to seed. */
export async function seedDatabaseIfEmpty(): Promise<void> {
  // no-op
}
