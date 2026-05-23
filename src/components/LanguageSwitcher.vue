<template>
  <label class="language-switcher">
    <select
      class="language-switcher__select"
      :value="locale"
      :aria-label="selectAriaLabel"
      @change="onChange"
    >
      <option
        v-for="opt in LOCALE_OPTIONS"
        :key="opt.value"
        :value="opt.value"
        :title="t(opt.labelKey)"
      >
        {{ LOCALE_FLAGS[opt.value] }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALE_FLAGS, LOCALE_OPTIONS, type AppLocale } from '@/i18n'
import { useLocale } from '@/composables/useLocale'

const { t } = useI18n()
const { locale, setLocale } = useLocale()

const selectAriaLabel = computed(() => {
  const current = LOCALE_OPTIONS.find((o) => o.value === locale.value)
  const name = current ? t(current.labelKey) : ''
  return `${t('language.label')}: ${name}`
})

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as AppLocale
  setLocale(value)
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  font-family: inherit;
}

.language-switcher__select {
  appearance: none;
  padding: 0.4rem 1.5rem 0.4rem 0.5rem;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--bg-surface)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%23999'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")
    no-repeat right 0.4rem center;
  color: var(--text-primary);
  font-size: 1.2rem;
  line-height: 1;
  font-family: inherit;
  cursor: pointer;
  min-width: 2.85rem;
  text-align: center;
}

.language-switcher__select:hover {
  border-color: var(--accent);
}

.language-switcher__select:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
