import { useI18n } from 'vue-i18n'

export function useDoctorNotesNotificationMessages() {
  const { t } = useI18n()

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
