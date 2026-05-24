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
import { getAppLocale, type AppLocale } from '@/i18n'
import { normalizeHealthEntryInput } from '@/services/translation'
import { clearStoredDiagnosisReports } from '@/api/diagnosisStorageApi'
import { invalidateInsightsCache } from '@/composables/useInsightsCache'
import { invalidateClinicalModelCache } from '@/services/clinicalModelCache'
import { shouldUseAiInsights } from '@/services/llm/config'
import { scheduleIdleWork } from '@/utils/scheduleIdleWork'
import type { HealthEntry, HealthEntryInput, TimelineEvent } from '@/models/types'

export async function createHealthEntry(
  input: HealthEntryInput,
  options?: { appLocale?: AppLocale }
): Promise<HealthEntry> {
  const appLocale = options?.appLocale ?? getAppLocale()
  const { input: normalizedInput, translationSkipped } =
    await normalizeHealthEntryInput(input, appLocale)
  const englishInput = polishJournalEntryInput(normalizedInput)
  const combinedText = combinedEntryText(englishInput)
  const entryType = resolveEntryType(englishInput.entryType, combinedText)
  const resolvedInput = { ...englishInput, entryType }
  let analysis = analyzeHealthEntry(resolvedInput)

  if (shouldUseAiInsights()) {
    try {
      const { analyzeHealthEntryWithAi } = await import(
        '@/services/llm/aiHealthAnalysis'
      )
      analysis = await analyzeHealthEntryWithAi(resolvedInput, analysis)
    } catch (err) {
      console.warn('[Monday] AI journal analysis failed; using rule-based analysis.', err)
    }
  }
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

  await db.transaction('rw', db.healthEntries, db.timelineEvents, async () => {
    await db.healthEntries.add(entry)
    await db.timelineEvents.add(timelineEvent)
  })

  try {
    const { upsertAppointmentFromJournalEntry } = await import(
      '@/api/appointmentsApi'
    )
    await upsertAppointmentFromJournalEntry(entry)
  } catch (err) {
    console.warn(
      '[Monday] Could not sync doctor visit to appointments calendar.',
      err
    )
  }

  invalidateInsightsCache()
  await invalidateClinicalModelCache()

  if (translationSkipped) {
    window.dispatchEvent(
      new CustomEvent('monday-translation-skipped', {
        detail: { entryId: id },
      })
    )
  }

  return entry
}

export async function getHealthEntryById(
  id: string
): Promise<HealthEntry | undefined> {
  return db.healthEntries.get(id)
}

export async function updateHealthEntry(
  id: string,
  input: HealthEntryInput,
  options?: { appLocale?: AppLocale }
): Promise<HealthEntry> {
  const existing = await db.healthEntries.get(id)
  if (!existing) {
    throw new Error('Journal entry not found.')
  }

  const appLocale = options?.appLocale ?? getAppLocale()
  const { input: normalizedInput, translationSkipped } =
    await normalizeHealthEntryInput(input, appLocale)
  const englishInput = polishJournalEntryInput(normalizedInput)
  const combinedText = combinedEntryText(englishInput)
  const entryType = resolveEntryType(englishInput.entryType, combinedText)
  const resolvedInput = { ...englishInput, entryType }
  let analysis = analyzeHealthEntry(resolvedInput)

  if (shouldUseAiInsights()) {
    try {
      const { analyzeHealthEntryWithAi } = await import(
        '@/services/llm/aiHealthAnalysis'
      )
      analysis = await analyzeHealthEntryWithAi(resolvedInput, analysis)
    } catch (err) {
      console.warn('[Monday] AI journal analysis failed; using rule-based analysis.', err)
    }
  }

  let timelineEventId = existing.analysis.linkedTimelineEventId

  const entry: HealthEntry = {
    ...existing,
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
    id: timelineEventId ?? crypto.randomUUID(),
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

  if (!timelineEventId) {
    timelineEventId = timelineEvent.id
    entry.analysis.linkedTimelineEventId = timelineEventId
  }

  await db.transaction('rw', db.healthEntries, db.timelineEvents, async () => {
    await db.healthEntries.put(entry)
    if (existing.analysis.linkedTimelineEventId) {
      await db.timelineEvents.update(timelineEventId!, {
        date: timelineEvent.date,
        type: timelineEvent.type,
        title: timelineEvent.title,
        description: timelineEvent.description,
      })
    } else {
      await db.timelineEvents.add(timelineEvent)
    }
  })

  try {
    const { upsertAppointmentFromJournalEntry } = await import(
      '@/api/appointmentsApi'
    )
    await upsertAppointmentFromJournalEntry(entry)
  } catch (err) {
    console.warn(
      '[Monday] Could not sync doctor visit to appointments calendar.',
      err
    )
  }

  invalidateInsightsCache()
  await invalidateClinicalModelCache()

  if (translationSkipped) {
    window.dispatchEvent(
      new CustomEvent('monday-translation-skipped', {
        detail: { entryId: id },
      })
    )
  }

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

  await clearStoredDiagnosisReports()
  invalidateInsightsCache()

  return {
    entriesRemoved: entries.length,
    timelineEventsRemoved: timelineIds.length,
    hypothesesRemoved: hypothesesCount,
  }
}
