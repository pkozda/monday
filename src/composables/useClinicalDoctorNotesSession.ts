import { ref } from 'vue'
import type { Locale } from 'date-fns'
import type { Composer } from 'vue-i18n'
import { i18n } from '@/i18n'
import type { AppLocale } from '@/i18n'
import {
  notifyDoctorNotesComplete,
  notifyDoctorNotesFailed,
} from '@/composables/useNotifications'
import {
  generateClinicalDoctorNotesAsync,
  type DoctorSpecialtyId,
} from '@/services/clinicalDoctorNotes'
import {
  CLINICAL_DOCTOR_NOTES_GROUP,
  notifyDoctorNotesInProgress,
  setClinicalDoctorNotesReopenSurface,
  consumeClinicalDoctorNotesReopenSurface,
  type ClinicalDoctorNotesReopenSurface,
} from '@/services/doctorNotesNotifications'
import type { ClinicalModel, HealthEntry, PatientProfile } from '@/models/types'

export type { ClinicalDoctorNotesReopenSurface }

export const clinicalDoctorNotesSurface = ref<'dashboard' | 'appointment' | null>(
  null
)
export const clinicalDoctorNotesContent = ref('')
export const clinicalDoctorNotesLoading = ref(false)
export const clinicalDoctorSpecialty = ref<DoctorSpecialtyId>('primary_care')
export const clinicalDoctorNotesNotifyWhenDone = ref(false)
export const clinicalDoctorNotesGenerationRequested = ref(false)
export const clinicalDoctorNotesActiveSurface = ref<ClinicalDoctorNotesReopenSurface | null>(
  null
)

let activeJob = 0

type TFunction = Composer['t']

export interface ClinicalDoctorNotesRunParams {
  model: ClinicalModel
  profile: PatientProfile | null
  entries: HealthEntry[]
  specialty: DoctorSpecialtyId
  t: TFunction
  dateLocale: Locale
  locale: AppLocale
}

function doctorNotesNotificationMessages() {
  const { t } = i18n.global
  return {
    progressToastTitle: t('notifications.doctorNotes.progressToastTitle'),
    progressToastMessage: t('notifications.doctorNotes.progressToastMessage'),
    progressNotificationTitle: t('notifications.doctorNotes.progressNotificationTitle'),
    progressNotificationMessage: t('notifications.doctorNotes.progressNotificationMessage'),
    readyTitle: t('notifications.doctorNotes.readyTitle'),
    readyToastMessage: t('notifications.doctorNotes.readyToastMessage'),
    errorTitle: t('notifications.doctorNotes.errorTitle'),
  }
}

export function resetClinicalDoctorNotesBackgroundNotify(): void {
  clinicalDoctorNotesNotifyWhenDone.value = false
  clinicalDoctorNotesGenerationRequested.value = false
}

export function markClinicalDoctorNotesDismissedWhileLoading(): void {
  if (
    !clinicalDoctorNotesGenerationRequested.value ||
    !clinicalDoctorNotesLoading.value ||
    !clinicalDoctorNotesActiveSurface.value
  ) {
    return
  }

  clinicalDoctorNotesNotifyWhenDone.value = true
  setClinicalDoctorNotesReopenSurface(clinicalDoctorNotesActiveSurface.value)

  const messages = doctorNotesNotificationMessages()
  notifyDoctorNotesInProgress(
    CLINICAL_DOCTOR_NOTES_GROUP,
    messages.progressToastTitle,
    messages.progressToastMessage,
    messages.progressNotificationTitle,
    messages.progressNotificationMessage
  )
}

function finishClinicalDoctorNotesBackgroundNotify(success: boolean): void {
  if (!clinicalDoctorNotesNotifyWhenDone.value) return

  clinicalDoctorNotesNotifyWhenDone.value = false
  clinicalDoctorNotesGenerationRequested.value = false
  const messages = doctorNotesNotificationMessages()

  if (success && clinicalDoctorNotesContent.value) {
    notifyDoctorNotesComplete(
      CLINICAL_DOCTOR_NOTES_GROUP,
      messages.readyTitle,
      messages.readyToastMessage,
      {
        actionRoute: '/',
        actionKey: 'clinical-doctor-notes',
      }
    )
    return
  }

  if (!success) {
    notifyDoctorNotesFailed(CLINICAL_DOCTOR_NOTES_GROUP, messages.errorTitle)
  }
}

export function reopenClinicalDoctorNotesFromNotification(): void {
  if (!clinicalDoctorNotesContent.value) return

  const surface = consumeClinicalDoctorNotesReopenSurface() ?? 'dashboard'
  clinicalDoctorNotesSurface.value = surface

  if (surface === 'appointment') {
    window.dispatchEvent(new CustomEvent('monday-reopen-appointment-modal'))
  }
}

/** Keep in-flight generation alive across dashboard unmount / route changes. */
export async function runClinicalDoctorNotesLoad(
  params: ClinicalDoctorNotesRunParams
): Promise<void> {
  if (clinicalDoctorNotesSurface.value) {
    clinicalDoctorNotesActiveSurface.value = clinicalDoctorNotesSurface.value
  }

  const jobId = ++activeJob
  clinicalDoctorNotesLoading.value = true
  let succeeded = false

  try {
    const notes = await generateClinicalDoctorNotesAsync(
      params.model,
      params.profile,
      params.entries,
      params.specialty,
      params.t,
      params.dateLocale,
      params.locale
    )
    if (jobId === activeJob) {
      clinicalDoctorNotesContent.value = notes
      succeeded = true
    }
  } catch (err) {
    console.warn('[Monday] Clinical doctor notes failed.', err)
    if (jobId === activeJob) {
      finishClinicalDoctorNotesBackgroundNotify(false)
    }
  } finally {
    if (jobId === activeJob) {
      clinicalDoctorNotesLoading.value = false
      if (succeeded) {
        finishClinicalDoctorNotesBackgroundNotify(true)
      }
      if (!clinicalDoctorNotesNotifyWhenDone.value) {
        clinicalDoctorNotesGenerationRequested.value = false
      }
    }
  }
}

export function useClinicalDoctorNotesSession() {
  return {
    clinicalDoctorNotesSurface,
    clinicalDoctorNotesContent,
    clinicalDoctorNotesLoading,
    clinicalDoctorSpecialty,
    clinicalDoctorNotesNotifyWhenDone,
    clinicalDoctorNotesGenerationRequested,
    clinicalDoctorNotesActiveSurface,
    resetClinicalDoctorNotesBackgroundNotify,
    markClinicalDoctorNotesDismissedWhileLoading,
    reopenClinicalDoctorNotesFromNotification,
    runClinicalDoctorNotesLoad,
  }
}
