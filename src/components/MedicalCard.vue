<template>
  <div class="medical-card">
    <div class="medical-card__head">
      <div class="medical-card__head-text">
        <h3 class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.headerActions" class="medical-card__head-actions">
        <slot name="headerActions" />
      </div>
    </div>

    <p v-if="aiGenerated" class="card-ai-badge">{{ t('clinicalModel.aiBadge') }}</p>
    <p v-if="summary" class="card-summary">{{ summary }}</p>
    <div v-if="factors && factors.length > 0" class="card-factors">
      <h4 class="factors-title">{{ t('clinicalModel.keyFactors') }}:</h4>
      <ul class="factors-list">
        <li v-for="factor in factors" :key="factor.id" class="factor-item">
          <strong>{{ factor.name }}:</strong> {{ factor.description }}
        </li>
      </ul>
    </div>
    <div v-if="$slots.actions" class="card-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ClinicalFactor } from '@/models/types'

const { t } = useI18n()

defineProps<{
  title: string
  subtitle?: string
  summary?: string
  factors?: ClinicalFactor[]
  aiGenerated?: boolean
}>()
</script>

<style scoped>
.medical-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.medical-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.65rem;
}

.medical-card__head-text {
  flex: 1;
  min-width: 0;
}

.medical-card__head-actions {
  flex-shrink: 0;
  padding-top: 0.1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  line-height: 1.25;
}

.card-subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.card-ai-badge {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.card-summary {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.card-factors {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
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
  color: var(--text-secondary);
  line-height: 1.5;
}

.factor-item strong {
  color: var(--text-primary);
}

.card-actions {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

@media (max-width: 560px) {
  .medical-card__head {
    flex-direction: column;
    align-items: stretch;
  }

  .medical-card__head-actions :deep(.btn-clinical-doctor-notes) {
    width: 100%;
  }
}
</style>
