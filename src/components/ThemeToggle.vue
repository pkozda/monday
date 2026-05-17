<template>
  <label
    class="theme-toggle"
    :title="theme === 'dark' ? 'Dark mode — click to switch to light' : 'Light mode — click to switch to dark'"
  >
    <span class="theme-toggle__icon" aria-hidden="true">{{ theme === 'dark' ? '🌙' : '☀️' }}</span>
    <span class="theme-toggle__track">
      <input
        type="checkbox"
        class="theme-toggle__input"
        :checked="theme === 'light'"
        @change="onToggle"
      />
      <span class="theme-toggle__thumb" />
    </span>
    <span class="theme-toggle__label">{{ theme === 'dark' ? 'Dark' : 'Light' }}</span>
  </label>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

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
</style>
