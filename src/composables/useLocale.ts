import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  applyDocumentLocale,
  LOCALE_STORAGE_KEY,
  type AppLocale,
} from '@/i18n'
import { clearUiTranslationCache } from '@/services/uiTranslation'

export function useLocale() {
  const { locale } = useI18n()

  function setLocale(next: AppLocale) {
    locale.value = next
    localStorage.setItem(LOCALE_STORAGE_KEY, next)
    applyDocumentLocale(next)
    clearUiTranslationCache()
  }

  watch(
    locale,
    (value) => {
      if (value === 'en' || value === 'de' || value === 'ru') {
        applyDocumentLocale(value)
      }
    },
    { immediate: true }
  )

  return {
    locale,
    setLocale,
  }
}
