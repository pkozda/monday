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

const CLEARABLE_PROFILE_FIELDS = [
  'dateOfBirth',
  'biologicalSex',
  'bloodType',
  'heightCm',
  'weightKg',
] as const satisfies readonly (keyof PatientProfile)[]

export async function savePatientProfile(
  updates: Partial<Omit<PatientProfile, 'id' | 'createdAt'>>
): Promise<PatientProfile> {
  const current = await getPatientProfile()
  const updated: PatientProfile = {
    ...current,
    ...updates,
  }
  for (const key of CLEARABLE_PROFILE_FIELDS) {
    if (key in updates && updates[key] === undefined) {
      delete updated[key]
    }
  }
  await db.patientProfiles.put(updated)
  return updated
}
