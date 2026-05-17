import { db } from '@/db/database'
import {
  analyzeHealthEntry,
  buildTimelineDescription,
  buildTimelineTitle,
  entryTypeToTimelineType,
} from '@/services/healthAnalysis'
import type { HealthEntry, HealthEntryInput, TimelineEvent } from '@/models/types'

export async function createHealthEntry(
  input: HealthEntryInput
): Promise<HealthEntry> {
  const analysis = analyzeHealthEntry(input)
  const id = crypto.randomUUID()
  const timelineEventId = crypto.randomUUID()
  const now = new Date().toISOString()

  const entry: HealthEntry = {
    id,
    createdAt: now,
    eventDate: input.eventDate,
    conditionArea: input.conditionArea.trim(),
    entryType: input.entryType,
    title: input.title.trim(),
    description: input.description.trim(),
    medications: input.medications?.trim() || undefined,
    severity: input.severity,
    analysis: {
      ...analysis,
      linkedTimelineEventId: timelineEventId,
    },
  }

  const timelineEvent: TimelineEvent = {
    id: timelineEventId,
    date: input.eventDate,
    type: entryTypeToTimelineType(input.entryType),
    title: buildTimelineTitle(
      entry.conditionArea,
      entry.entryType,
      entry.title
    ),
    description: buildTimelineDescription(
      entry.description,
      entry.medications,
      analysis.summary
    ),
  }

  await db.transaction(
    'rw',
    db.healthEntries,
    db.timelineEvents,
    async () => {
      await db.healthEntries.add(entry)
      await db.timelineEvents.add(timelineEvent)
    }
  )

  return entry
}

export async function getHealthEntries(): Promise<HealthEntry[]> {
  const entries = await db.healthEntries.toArray()
  return entries.sort(
    (a, b) =>
      new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  )
}

export async function getHealthEntriesByCondition(
  conditionArea: string
): Promise<HealthEntry[]> {
  const normalized = conditionArea.trim().toLowerCase()
  const all = await db.healthEntries.toArray()
  return all
    .filter((e) => e.conditionArea.toLowerCase() === normalized)
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    )
}
