import { useI18n } from 'vue-i18n'
import type { InsightsRegenerationMessages } from '@/services/insightsRegeneration'
import type { RegenerateInsightsResult } from '@/api/hypothesisApi'

export function useInsightsRegenerationMessages(): InsightsRegenerationMessages {
  const { t } = useI18n()

  return {
    slowToastTitle: t('notifications.regeneration.slowToastTitle'),
    slowToastMessage: t('notifications.regeneration.slowToastMessage'),
    slowNotificationTitle: t('notifications.regeneration.slowNotificationTitle'),
    slowNotificationMessage: t('notifications.regeneration.slowNotificationMessage'),
    successTitle: t('notifications.regeneration.successTitle'),
    successToastMessage: t('notifications.regeneration.successToastMessage'),
    successMessage: (result: RegenerateInsightsResult) =>
      t(`hypothesesPage.regenerateMessages.${result.messageKey}`, {
        hypothesisCount: result.hypothesisCount,
        journalEntryCount: result.journalEntryCount,
        areaCount: result.areas.length,
      }),
    errorTitle: t('notifications.regeneration.errorTitle'),
  }
}
