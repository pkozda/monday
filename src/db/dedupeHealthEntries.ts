import { db } from '@/db/database'
import {
  journalEntryFingerprint,
  pickEntryToKeep,
} from '@/services/journalEntryDedup'
import type { HealthEntry } from '@/models/types'

const DEDUPE_KEY = 'monday-journal-dedupe-v1'

export async function dedupeHealthJournalEntries(): Promise<{
  total: number
  removed: number
  groupsMerged: number
}> {
  if (localStorage.getItem(DEDUPE_KEY)) {
    const total = await db.healthEntries.count()
    return { total, removed: 0, groupsMerged: 0 }
  }

  const entries = await db.healthEntries.toArray()
  const groups = new Map<string, HealthEntry[]>()

  for (const entry of entries) {
    const fp = journalEntryFingerprint(entry)
    const list = groups.get(fp) ?? []
    list.push(entry)
    groups.set(fp, list)
  }

  const deleteEntryIds: string[] = []
  const deleteTimelineIds = new Set<string>()
  const deleteAppointmentIds = new Set<string>()
  let groupsMerged = 0

  const appointments = await db.appointments.toArray()

  for (const list of groups.values()) {
    if (list.length <= 1) continue
    groupsMerged += 1
    const keep = pickEntryToKeep(list)
    for (const entry of list) {
      if (entry.id === keep.id) continue
      deleteEntryIds.push(entry.id)
      const timelineId = entry.analysis?.linkedTimelineEventId
      if (timelineId) deleteTimelineIds.add(timelineId)
      for (const appt of appointments) {
        if (appt.linkedJournalEntryId === entry.id) {
          deleteAppointmentIds.add(appt.id)
        }
      }
    }
  }

  if (deleteEntryIds.length > 0) {
    await db.transaction(
      'rw',
      db.healthEntries,
      db.timelineEvents,
      db.appointments,
      async () => {
        await db.healthEntries.bulkDelete(deleteEntryIds)
        if (deleteTimelineIds.size > 0) {
          await db.timelineEvents.bulkDelete([...deleteTimelineIds])
        }
        if (deleteAppointmentIds.size > 0) {
          await db.appointments.bulkDelete([...deleteAppointmentIds])
        }
      }
    )
  }

  localStorage.setItem(DEDUPE_KEY, '1')

  return {
    total: entries.length,
    removed: deleteEntryIds.length,
    groupsMerged,
  }
}

/** Re-run journal dedupe after bulk import (e.g. anamnesis). */
export function resetJournalDedupeMigration(): void {
  localStorage.removeItem(DEDUPE_KEY)
}
