import { db } from '@/db/database'
import {
  analyzeHealthEntry,
  buildTimelineDescription,
  buildTimelineTitle,
  combinedEntryText,
  entryTypeToTimelineType,
  resolveEntryType,
} from '@/services/healthAnalysis'
import {
  rebuildJournalTitleFromEntry,
  shouldRebuildJournalTitle,
} from '@/services/journalEntryText'
import type { HealthEntry, HealthEntryInput } from '@/models/types'

const RECLASSIFY_KEY = 'monday-health-reclassify-v2'
const JOURNAL_TITLE_KEY = 'monday-journal-short-titles-v1'

function toInput(entry: HealthEntry, entryType: HealthEntry['entryType']): HealthEntryInput {
  return {
    eventDate: entry.eventDate,
    conditionArea: entry.conditionArea,
    entryType,
    title: entry.title,
    description: entry.description,
    medications: entry.medications,
    severity: entry.severity,
  }
}

export async function reclassifyAllHealthEntries(): Promise<{
  total: number
  updated: number
}> {
  const entries = await db.healthEntries.toArray()
  let updated = 0

  await db.transaction('rw', db.healthEntries, db.timelineEvents, async () => {
    for (const entry of entries) {
      const combinedText = combinedEntryText(entry)
      const entryType = resolveEntryType(entry.entryType, combinedText)
      const analysis = analyzeHealthEntry(toInput(entry, entryType))

      const classificationChanged =
        entry.analysis.classification !== analysis.classification
      const urgencyChanged = entry.analysis.urgency !== analysis.urgency
      const typeChanged = entry.entryType !== entryType
      const flagsChanged =
        JSON.stringify(entry.analysis.flags) !== JSON.stringify(analysis.flags)

      if (
        !classificationChanged &&
        !urgencyChanged &&
        !typeChanged &&
        !flagsChanged
      ) {
        continue
      }

      const linkedId = entry.analysis.linkedTimelineEventId
      const nextAnalysis = {
        ...analysis,
        linkedTimelineEventId: linkedId,
      }

      await db.healthEntries.update(entry.id, {
        entryType,
        analysis: nextAnalysis,
      })

      if (linkedId) {
        const timeline = await db.timelineEvents.get(linkedId)
        if (timeline) {
          await db.timelineEvents.update(linkedId, {
            type: entryTypeToTimelineType(entryType),
            title: buildTimelineTitle(
              entry.conditionArea,
              entryType,
              entry.title
            ),
            description: buildTimelineDescription(
              entry.description,
              entry.medications,
              analysis.summary
            ),
          })
        }
      }

      updated += 1
    }
  })

  return { total: entries.length, updated }
}

/** One-time migration: fix entry types and classifications from note text. */
export async function migrateHealthEntryClassifications(): Promise<{
  total: number
  updated: number
}> {
  if (localStorage.getItem(RECLASSIFY_KEY)) {
    const entries = await db.healthEntries.count()
    return { total: entries, updated: 0 }
  }

  const result = await reclassifyAllHealthEntries()
  localStorage.setItem(RECLASSIFY_KEY, '1')
  return result
}

/** Shorten titles that duplicate the full description (anamnesis import, older saves). */
export async function migrateJournalEntryTitles(): Promise<{
  total: number
  updated: number
}> {
  if (localStorage.getItem(JOURNAL_TITLE_KEY)) {
    const total = await db.healthEntries.count()
    return { total, updated: 0 }
  }

  const entries = await db.healthEntries.toArray()
  let updated = 0

  await db.transaction('rw', db.healthEntries, db.timelineEvents, async () => {
    for (const entry of entries) {
      if (!shouldRebuildJournalTitle(entry)) continue

      const title = rebuildJournalTitleFromEntry(entry)
      if (title === entry.title) continue

      await db.healthEntries.update(entry.id, { title })

      const linkedId = entry.analysis.linkedTimelineEventId
      if (linkedId) {
        const timeline = await db.timelineEvents.get(linkedId)
        if (timeline) {
          await db.timelineEvents.update(linkedId, {
            title: buildTimelineTitle(
              entry.conditionArea,
              entry.entryType,
              title
            ),
          })
        }
      }

      updated += 1
    }
  })

  localStorage.setItem(JOURNAL_TITLE_KEY, '1')
  return { total: entries.length, updated }
}
