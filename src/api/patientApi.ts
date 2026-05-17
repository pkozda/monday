import { db } from '@/db/database'
import type { PatientProfile } from '@/models/types'

export const DEFAULT_PATIENT_ID = 'default'

const defaultProfile = (): PatientProfile => ({
  id: DEFAULT_PATIENT_ID,
  displayName: 'You',
  createdAt: new Date().toISOString(),
})

export async function getPatientProfile(): Promise<PatientProfile> {
  const existing = await db.patientProfiles.get(DEFAULT_PATIENT_ID)
  if (existing) return existing

  const profile = defaultProfile()
  await db.patientProfiles.add(profile)
  return profile
}

export async function savePatientProfile(
  updates: Partial<Omit<PatientProfile, 'id' | 'createdAt'>>
): Promise<PatientProfile> {
  const current = await getPatientProfile()
  const updated: PatientProfile = {
    ...current,
    ...updates,
  }
  await db.patientProfiles.put(updated)
  return updated
}
