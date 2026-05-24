import { computed, ref, watch, unref, type MaybeRefOrGetter, toValue } from 'vue'
import type { AppLocale } from '@/i18n'
import { translateUiText } from '@/services/uiTranslation'
import { useLocale } from '@/composables/useLocale'
import { shouldTranslateForDisplay } from '@/utils/textLanguage'

/** Reactive English source text → locale-aware display (async MT when not English). */
export function useUiTranslate(source: MaybeRefOrGetter<string>) {
  const { locale } = useLocale()
  const display = ref(toValue(source))
  let generation = 0

  const raw = computed(() => toValue(source))

  async function refresh() {
    const text = raw.value
    const gen = ++generation
    if (!shouldTranslateForDisplay(text, locale.value as AppLocale)) {
      display.value = text
      return
    }
    display.value = text
    const translated = await translateUiText(text, locale.value as AppLocale)
    if (gen === generation) display.value = translated
  }

  watch(
    [locale, raw],
    () => {
      void refresh()
    },
    { immediate: true }
  )

  return { display }
}
