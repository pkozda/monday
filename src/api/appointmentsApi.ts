import { parseISO } from 'date-fns'
import { db } from '@/db/database'
import {
  appointmentFingerprint,
  buildAppointmentFromJournalEntry,
  isJournalSyncedAppointment,
  journalVisitFingerprintFromEntry,
} from '@/services/journalAppointmentSync'
import type {
  DoctorAppointment,
  DoctorAppointmentInput,
  HealthEntry,
} from '@/models/types'

const JOURNAL_SYNC_KEY = 'monday-journal-appointments-sync-v3'

function normalizeInput(
  input: DoctorAppointmentInput
): DoctorAppointmentInput {
  return {
    scheduledAt: input.scheduledAt,
    doctorName: input.doctorName.trim(),
    clinicName: input.clinicName?.trim() || undefined,
    specialty: input.specialty.trim(),
    address: input.address.trim(),
    notes: input.notes?.trim() || undefined,
  }
}

function pickNewer(
  a: DoctorAppointment,
  b: DoctorAppointment
): DoctorAppointment {
  return parseISO(a.createdAt).getTime() >= parseISO(b.createdAt).getTime()
    ? a
    : b
}

/** Remove duplicate journal-derived appointments (keeps one per journal entry / visit). */
export async function dedupeJournalAppointments(): Promise<number> {
  const all = await db.appointments.toArray()
  const keepIds = new Set<string>()
  const deleteIds = new Set<string>()

  const byJournalId = new Map<string, DoctorAppointment[]>()
  for (const appt of all) {
    if (!appt.linkedJournalEntryId) continue
    const list = byJournalId.get(appt.linkedJournalEntryId) ?? []
    list.push(appt)
    byJournalId.set(appt.linkedJournalEntryId, list)
  }

  for (const list of byJournalId.values()) {
    const sorted = [...list].sort(
      (a, b) =>
        parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
    )
    keepIds.add(sorted[0].id)
    for (let i = 1; i < sorted.length; i++) deleteIds.add(sorted[i].id)
  }

  const journalLike = all.filter(
    (a) => !deleteIds.has(a.id) && isJournalSyncedAppointment(a)
  )

  const byFingerprint = new Map<string, DoctorAppointment[]>()
  for (const appt of journalLike) {
    const fp = appointmentFingerprint(appt)
    const list = byFingerprint.get(fp) ?? []
    list.push(appt)
    byFingerprint.set(fp, list)
  }

  for (const list of byFingerprint.values()) {
    const sorted = [...list].sort((a, b) => {
      const aLinked = Boolean(a.linkedJournalEntryId)
      const bLinked = Boolean(b.linkedJournalEntryId)
      if (aLinked !== bLinked) return aLinked ? -1 : 1
      return (
        parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
      )
    })
    keepIds.add(sorted[0].id)
    for (let i = 1; i < sorted.length; i++) deleteIds.add(sorted[i].id)
  }

  const toRemove = [...deleteIds].filter((id) => !keepIds.has(id))
  if (toRemove.length > 0) {
    await db.appointments.bulkDelete(toRemove)
  }
  return toRemove.length
}

function findAppointmentForJournalEntry(
  entry: HealthEntry,
  normalized: DoctorAppointmentInput,
  all: DoctorAppointment[]
): DoctorAppointment | undefined {
  const linked = all.find((a) => a.linkedJournalEntryId === entry.id)
  if (linked) return linked

  const visitFp = journalVisitFingerprintFromEntry(entry, normalized)
  const matches = all.filter(
    (a) =>
      isJournalSyncedAppointment(a) && appointmentFingerprint(a) === visitFp
  )
  if (matches.length === 0) return undefined
  return matches.reduce(pickNewer)
}

export async function createAppointment(
  input: DoctorAppointmentInput
): Promise<DoctorAppointment> {
  const normalized = normalizeInput(input)
  if (!normalized.doctorName || !normalized.specialty || !normalized.address) {
    throw new Error('Doctor, specialty, and address are required.')
  }

  const appointment: DoctorAppointment = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: 'manual',
    ...normalized,
  }

  await db.appointments.add(appointment)
  return appointment
}

/** Create or update a calendar visit from a journal doctor-visit record. */
export async function upsertAppointmentFromJournalEntry(
  entry: HealthEntry
): Promise<DoctorAppointment | null> {
  const allEntries = await db.healthEntries.toArray()
  const input = buildAppointmentFromJournalEntry(entry, { allEntries })
  if (!input) return null

  const normalized = normalizeInput(input)
  const all = await db.appointments.toArray()
  const existing = findAppointmentForJournalEntry(entry, normalized, all)

  if (existing) {
    await db.appointments.update(existing.id, {
      scheduledAt: normalized.scheduledAt,
      doctorName: normalized.doctorName,
      clinicName: normalized.clinicName,
      specialty: normalized.specialty,
      address: normalized.address,
      notes: normalized.notes,
      source: 'journal',
      linkedJournalEntryId: entry.id,
    })
    return {
      ...existing,
      ...normalized,
      source: 'journal',
      linkedJournalEntryId: entry.id,
    }
  }

  const appointment: DoctorAppointment = {
    id: crypto.randomUUID(),
    createdAt: entry.createdAt || new Date().toISOString(),
    source: 'journal',
    linkedJournalEntryId: entry.id,
    ...normalized,
  }

  await db.appointments.add(appointment)
  return appointment
}

/** Import past journal visits into the appointments calendar (idempotent). */
export async function syncAppointmentsFromJournalHistory(): Promise<{
  total: number
  synced: number
  skipped: number
}> {
  await dedupeJournalAppointments()

  const entries = await db.healthEntries.toArray()
  let all = await db.appointments.toArray()
  let synced = 0
  let skipped = 0

  await db.transaction('rw', db.appointments, async () => {
    for (const entry of entries) {
      const input = buildAppointmentFromJournalEntry(entry, { allEntries: entries })
      if (!input) {
        skipped += 1
        continue
      }

      const normalized = normalizeInput(input)
      const existing = findAppointmentForJournalEntry(entry, normalized, all)

      if (existing) {
        await db.appointments.update(existing.id, {
          scheduledAt: normalized.scheduledAt,
          doctorName: normalized.doctorName,
          clinicName: normalized.clinicName,
          specialty: normalized.specialty,
          address: normalized.address,
          notes: normalized.notes,
          source: 'journal',
          linkedJournalEntryId: entry.id,
        })
        const idx = all.findIndex((a) => a.id === existing.id)
        const updated: DoctorAppointment = {
          ...existing,
          ...normalized,
          source: 'journal',
          linkedJournalEntryId: entry.id,
        }
        if (idx >= 0) all[idx] = updated
        else all.push(updated)
      } else {
        const appointment: DoctorAppointment = {
          id: crypto.randomUUID(),
          createdAt: entry.createdAt || new Date().toISOString(),
          source: 'journal',
          linkedJournalEntryId: entry.id,
          ...normalized,
        }
        await db.appointments.add(appointment)
        all.push(appointment)
      }
      synced += 1
    }
  })

  return { total: entries.length, synced, skipped }
}

export async function migrateJournalAppointmentsToCalendar(): Promise<{
  total: number
  synced: number
  skipped: number
  duplicatesRemoved: number
}> {
  if (localStorage.getItem(JOURNAL_SYNC_KEY)) {
    const duplicatesRemoved = await dedupeJournalAppointments()
    return {
      total: await db.healthEntries.count(),
      synced: 0,
      skipped: 0,
      duplicatesRemoved,
    }
  }

  const result = await syncAppointmentsFromJournalHistory()
  const duplicatesRemoved = await dedupeJournalAppointments()
  localStorage.setItem(JOURNAL_SYNC_KEY, '1')

  return { ...result, duplicatesRemoved }
}

export async function getAppointments(): Promise<DoctorAppointment[]> {
  const all = await db.appointments.toArray()
  return all.sort(
    (a, b) =>
      parseISO(b.scheduledAt).getTime() - parseISO(a.scheduledAt).getTime()
  )
}

export async function deleteAppointment(id: string): Promise<void> {
  await db.appointments.delete(id)
}
