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
  background: #1e1e1e;
  border: 1px solid #333;
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
  color: #e0e0e0;
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
  background: #4a3a1e;
  color: #ffb74d;
}

.confidence--supported {
  background: #1e3a5f;
  color: #64b5f6;
}

.confidence--strong {
  background: #1e3a2a;
  color: #81c784;
}

.hypothesis-evidence {
  font-size: 0.9rem;
  color: #999;
}

.evidence-label {
  font-weight: 500;
  margin-right: 0.5rem;
}

.evidence-count {
  color: #777;
}
</style>
