<template>
  <div
    v-if="available"
    class="ai-insights-switch"
    :class="{ 'ai-insights-switch--menu': layout === 'menu' }"
  >
    <label class="ai-insights-switch__row" :title="hint">
      <span v-if="layout !== 'menu'" class="ai-insights-switch__icon" aria-hidden="true">✦</span>
      <span v-if="layout === 'menu'" class="ai-insights-switch__menu-label">{{
        t('aiInsights.toggle')
      }}</span>
      <span class="ai-insights-switch__track">
        <input
          type="checkbox"
          class="ai-insights-switch__input"
          :checked="enabled"
          :disabled="busy || isRegenerating"
          :aria-label="t('aiInsights.toggle')"
          @change="onChange"
        />
        <span class="ai-insights-switch__thumb" />
      </span>
      <span v-if="layout !== 'menu'" class="ai-insights-switch__label">{{
        t('aiInsights.toggle')
      }}</span>
    </label>
    <p v-if="layout === 'menu'" class="ai-insights-switch__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

withDefaults(
  defineProps<{
    layout?: 'default' | 'menu'
  }>(),
  { layout: 'default' }
)
import { useI18n } from 'vue-i18n'
import { useAiInsights } from '@/composables/useAiInsights'
import { invalidateInsightsCache } from '@/composables/useInsightsCache'
import { useInsightsRegeneration } from '@/services/insightsRegeneration'

const { t } = useI18n()
const { available, active, enabled, setEnabled } = useAiInsights()
const { isRunning: isRegenerating } = useInsightsRegeneration()
const busy = ref(false)

const hint = computed(() =>
  active.value ? t('aiInsights.hintOn') : t('aiInsights.hintOff')
)

async function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  busy.value = true
  try {
    setEnabled(target.checked)
    invalidateInsightsCache()
    window.dispatchEvent(new CustomEvent('monday-ai-insights-changed'))
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.ai-insights-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.ai-insights-switch__icon {
  font-size: 0.85rem;
  line-height: 1;
  color: var(--accent-strong);
}

.ai-insights-switch__track {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.ai-insights-switch__input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  z-index: 1;
}

.ai-insights-switch__input:disabled {
  cursor: not-allowed;
}

.ai-insights-switch__thumb {
  position: absolute;
  inset: 0;
  background: var(--bg-muted);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  transition: background 0.2s, border-color 0.2s;
}

.ai-insights-switch__thumb::after {
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

.ai-insights-switch__input:checked + .ai-insights-switch__thumb {
  background: var(--accent-strong);
  border-color: var(--accent-strong);
}

.ai-insights-switch__input:checked + .ai-insights-switch__thumb::after {
  transform: translateX(20px);
  background: #fff;
}

.ai-insights-switch__label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

.ai-insights-switch:focus-within .ai-insights-switch__thumb {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.ai-insights-switch__input:disabled + .ai-insights-switch__thumb {
  opacity: 0.55;
}

.ai-insights-switch--menu {
  display: block;
  width: 100%;
}

.ai-insights-switch__row {
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
  user-select: none;
}

.ai-insights-switch--menu .ai-insights-switch__row {
  justify-content: space-between;
  gap: 0.75rem;
}

.ai-insights-switch__menu-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.ai-insights-switch__hint {
  margin: 0.45rem 0 0;
  font-size: 0.72rem;
  line-height: 1.45;
  color: var(--text-muted);
}
</style>
