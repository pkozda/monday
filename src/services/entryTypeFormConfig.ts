import { GENERAL_HEALTH_AREA } from '@/services/bodyAreaDetection'
import type { HealthEntryType } from '@/models/types'

export interface EntryFormTypeGroup {
  titleKey: string
  types: HealthEntryType[]
}

export const ENTRY_FORM_TYPE_GROUPS: EntryFormTypeGroup[] = [
  {
    titleKey: 'entryForm.typeGroupFeel',
    types: ['symptom', 'change'],
  },
  {
    titleKey: 'entryForm.typeGroupCare',
    types: ['medication', 'doctor_visit'],
  },
  {
    titleKey: 'entryForm.typeGroupTests',
    types: ['lab_test', 'imaging', 'surgery'],
  },
  {
    titleKey: 'entryForm.typeGroupOther',
    types: ['other'],
  },
]

export function entryTypeRequiresBodyArea(entryType: HealthEntryType): boolean {
  return entryType === 'symptom' || entryType === 'change'
}

export function entryTypeShowsSeverity(entryType: HealthEntryType): boolean {
  return entryType === 'symptom' || entryType === 'change'
}

export function entryTypeShowsMedications(entryType: HealthEntryType): boolean {
  return (
    entryType === 'medication' ||
    entryType === 'doctor_visit' ||
    entryType === 'surgery'
  )
}

export function resolveConditionAreaForSave(
  rawArea: string,
  entryType: HealthEntryType
): string {
  const trimmed = rawArea.trim()
  if (trimmed) return trimmed
  if (entryTypeRequiresBodyArea(entryType)) return ''
  return GENERAL_HEALTH_AREA
}
