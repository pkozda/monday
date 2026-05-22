import { db } from '@/db/database'
import {
  analyzeHealthEntry,
  buildTimelineDescription,
  buildTimelineTitle,
  combinedEntryText,
  entryTypeToTimelineType,
  resolveEntryType,
} from '@/services/healthAnalysis'
import { polishJournalEntryInput } from '@/services/journalEntryText'
import { normalizeHealthEntryInput } from '@/services/translation'
import type { HealthEntry, HealthEntryInput, TimelineEvent } from '@/models/types'

export async function createHealthEntry(
  input: HealthEntryInput
): Promise<HealthEntry> {
  const englishInput = polishJournalEntryInput(
    await normalizeHealthEntryInput(input)
  )
  const combinedText = combinedEntryText(englishInput)
  const entryType = resolveEntryType(englishInput.entryType, combinedText)
  const resolvedInput = { ...englishInput, entryType }
  const analysis = analyzeHealthEntry(resolvedInput)
  const id = crypto.randomUUID()
  const timelineEventId = crypto.randomUUID()
  const now = new Date().toISOString()

  const entry: HealthEntry = {
    id,
    createdAt: now,
    eventDate: englishInput.eventDate,
    conditionArea: englishInput.conditionArea.trim(),
    entryType,
    title: englishInput.title.trim(),
    description: englishInput.description.trim(),
    medications: englishInput.medications?.trim() || undefined,
    severity: englishInput.severity,
    analysis: {
      ...analysis,
      linkedTimelineEventId: timelineEventId,
    },
  }

  const timelineEvent: TimelineEvent = {
    id: timelineEventId,
    date: englishInput.eventDate,
    type: entryTypeToTimelineType(entryType),
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
    db.appointments,
    async () => {
      await db.healthEntries.add(entry)
      await db.timelineEvents.add(timelineEvent)
      const { upsertAppointmentFromJournalEntry } = await import(
        '@/api/appointmentsApi'
      )
      await upsertAppointmentFromJournalEntry(entry)
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

export interface ClearJournalResult {
  entriesRemoved: number
  timelineEventsRemoved: number
  hypothesesRemoved: number
}

/** Removes all journal entries, linked timeline events, and hypotheses for the local user. */
export async function clearAllJournalRecords(): Promise<ClearJournalResult> {
  const entries = await db.healthEntries.toArray()
  const timelineIds = [
    ...new Set(
      entries
        .map((e) => e.analysis?.linkedTimelineEventId)
        .filter((id): id is string => Boolean(id))
    ),
  ]
  const hypothesesCount = await db.hypotheses.count()

  await db.transaction(
    'rw',
    db.healthEntries,
    db.timelineEvents,
    db.hypotheses,
    async () => {
      await db.healthEntries.clear()
      if (timelineIds.length > 0) {
        await db.timelineEvents.bulkDelete(timelineIds)
      }
      await db.hypotheses.clear()
    }
  )

  return {
    entriesRemoved: entries.length,
    timelineEventsRemoved: timelineIds.length,
    hypothesesRemoved: hypothesesCount,
  }
}
