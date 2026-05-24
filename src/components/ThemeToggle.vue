<template>
  <label
    class="theme-toggle"
    :class="{ 'theme-toggle--menu': layout === 'menu' }"
    :title="theme === 'dark' ? t('theme.darkHint') : t('theme.lightHint')"
  >
    <span v-if="layout === 'menu'" class="theme-toggle__menu-label">
      {{ t('theme.appearance') }}
    </span>
    <template v-else>
      <span class="theme-toggle__icon" aria-hidden="true">{{ theme === 'dark' ? '🌙' : '☀️' }}</span>
    </template>
    <span class="theme-toggle__control" :class="{ 'theme-toggle__control--menu': layout === 'menu' }">
      <span v-if="layout === 'menu'" class="theme-toggle__menu-value">{{
        theme === 'dark' ? t('theme.dark') : t('theme.light')
      }}</span>
      <span class="theme-toggle__track">
        <input
          type="checkbox"
          class="theme-toggle__input"
          :checked="theme === 'light'"
          :aria-label="layout === 'menu' ? t('theme.appearance') : undefined"
          @change="onToggle"
        />
        <span class="theme-toggle__thumb" />
      </span>
    </span>
    <span v-if="layout !== 'menu'" class="theme-toggle__label">{{
      theme === 'dark' ? t('theme.dark') : t('theme.light')
    }}</span>
  </label>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'

withDefaults(
  defineProps<{
    layout?: 'default' | 'menu'
  }>(),
  { layout: 'default' }
)

const { t } = useI18n()
const { theme, setTheme } = useTheme()

function onToggle(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  setTheme(checked ? 'light' : 'dark')
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.theme-toggle__icon {
  font-size: 1rem;
  line-height: 1;
}

.theme-toggle__track {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.theme-toggle__input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  z-index: 1;
}

.theme-toggle__thumb {
  position: absolute;
  inset: 0;
  background: var(--bg-muted);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  transition: background 0.2s;
}

.theme-toggle__thumb::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: var(--text-primary);
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px var(--shadow);
}

.theme-toggle__input:checked + .theme-toggle__thumb {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
}

.theme-toggle__input:checked + .theme-toggle__thumb::after {
  transform: translateX(20px);
  background: #fff;
}

.theme-toggle__label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  min-width: 2.25rem;
}

.theme-toggle:focus-within .theme-toggle__thumb {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.theme-toggle--menu {
  width: 100%;
  justify-content: space-between;
  gap: 0.75rem;
}

.theme-toggle__menu-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.theme-toggle__control--menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.theme-toggle__menu-value {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
}
</style>
