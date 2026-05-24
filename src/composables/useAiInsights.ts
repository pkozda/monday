import { computed, ref, watch } from 'vue'
import {
  AI_INSIGHTS_STORAGE_KEY,
  isAiInsightsAvailable,
  readAiInsightsPreference,
  writeAiInsightsPreference,
} from '@/services/llm/config'

const enabled = ref(readAiInsightsPreference())

export function useAiInsights() {
  const available = computed(() => isAiInsightsAvailable())
  const active = computed(
    () => isAiInsightsAvailable() && enabled.value
  )

  function setEnabled(value: boolean) {
    enabled.value = value
    writeAiInsightsPreference(value)
  }

  function toggle() {
    setEnabled(!enabled.value)
  }

  watch(
    () => localStorage.getItem(AI_INSIGHTS_STORAGE_KEY),
    () => {
      enabled.value = readAiInsightsPreference()
    }
  )

  return {
    available,
    active,
    enabled: computed(() => enabled.value),
    setEnabled,
    toggle,
  }
}
