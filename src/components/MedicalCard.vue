<template>
  <div class="medical-card">
    <h3 class="card-title">{{ title }}</h3>
    <p v-if="summary" class="card-summary">{{ summary }}</p>
    <div v-if="factors && factors.length > 0" class="card-factors">
      <h4 class="factors-title">Key Factors:</h4>
      <ul class="factors-list">
        <li v-for="factor in factors" :key="factor.id" class="factor-item">
          <strong>{{ factor.name }}:</strong> {{ factor.description }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClinicalFactor } from '@/models/types'

defineProps<{
  title: string
  summary?: string
  factors?: ClinicalFactor[]
}>()
</script>

<style scoped>
.medical-card {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #e0e0e0;
}

.card-summary {
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.card-factors {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
}

.factors-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #d0d0d0;
}

.factors-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.factor-item {
  padding: 0.5rem 0;
  color: #b0b0b0;
  line-height: 1.5;
}

.factor-item strong {
  color: #e0e0e0;
}
</style>
