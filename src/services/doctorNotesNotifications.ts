import {
  notifyDoctorNotesComplete,
  notifyDoctorNotesFailed,
  notifyProgress,
  pushNotification,
} from '@/composables/useNotifications'

export const CLINICAL_DOCTOR_NOTES_GROUP = 'clinical-doctor-notes'

export const REOPEN_CLINICAL_DOCTOR_NOTES_EVENT = 'monday-reopen-clinical-doctor-notes'
export const REOPEN_HYPOTHESIS_DOCTOR_NOTES_EVENT = 'monday-reopen-hypothesis-doctor-notes'

export type ClinicalDoctorNotesReopenSurface = 'dashboard' | 'appointment'

export function hypothesisDoctorNotesGroupId(hypothesisId: string): string {
  return `hypothesis-doctor-notes-${hypothesisId}`
}

let clinicalReopenSurface: ClinicalDoctorNotesReopenSurface | null = null

export function setClinicalDoctorNotesReopenSurface(
  surface: ClinicalDoctorNotesReopenSurface
): void {
  clinicalReopenSurface = surface
}

export function consumeClinicalDoctorNotesReopenSurface(): ClinicalDoctorNotesReopenSurface | null {
  const surface = clinicalReopenSurface
  clinicalReopenSurface = null
  return surface
}

export function notifyDoctorNotesInProgress(
  groupId: string,
  progressTitle: string,
  progressMessage: string,
  notificationTitle: string,
  notificationMessage: string
): void {
  notifyProgress(progressTitle, progressMessage, groupId)
  pushNotification({
    kind: 'info',
    title: notificationTitle,
    message: notificationMessage,
    groupId,
    showToast: false,
  })
}
