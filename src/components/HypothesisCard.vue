<template>
  <div class="hypothesis-card">
    <div class="hypothesis-header">
      <h3 class="hypothesis-title">{{ hypothesis.title }}</h3>
      <span class="hypothesis-confidence" :class="confidenceClass">
        {{ hypothesis.confidence }}
      </span>
    </div>
    <div v-if="hypothesis.evidenceIds.length > 0" class="hypothesis-evidence">
      <span class="evidence-label">Evidence:</span>
      <span class="evidence-count">{{ hypothesis.evidenceIds.length }} items</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Hypothesis } from '@/models/types'

const props = defineProps<{
  hypothesis: Hypothesis
}>()

const confidenceClass = computed(() => {
  const map: Record<string, string> = {
    'Exploratory': 'confidence--exploratory',
    'Supported': 'confidence--supported',
    'Strongly Supported': 'confidence--strong',
  }
  return map[props.hypothesis.confidence] || ''
})
</script>

<style scoped>
.hypothesis-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.hypothesis-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.hypothesis-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  flex: 1;
}

.hypothesis-confidence {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  white-space: nowrap;
}

.confidence--exploratory {
  background: var(--confidence-exploratory-bg);
  color: var(--confidence-exploratory-text);
}

.confidence--supported {
  background: var(--confidence-supported-bg);
  color: var(--confidence-supported-text);
}

.confidence--strong {
  background: var(--confidence-strong-bg);
  color: var(--confidence-strong-text);
}

.hypothesis-evidence {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.evidence-label {
  font-weight: 500;
  margin-right: 0.5rem;
}

.evidence-count {
  color: var(--text-faint);
}
</style>
