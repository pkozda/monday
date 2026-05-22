<template>
  <div class="diagnosis-panel">
    <p v-if="loading" class="diagnosis-empty">
      Analyzing your journal for possible conditions…
    </p>

    <p v-else-if="reports.length === 0" class="diagnosis-empty">
      {{ emptyText }}
    </p>

    <template v-else-if="!loading">
      <div class="diagnosis-list">
        <DiagnosisReportCard
          v-for="report in reports"
          :key="report.conditionArea"
          :report="report"
        />
      </div>

      <p v-if="showDisclaimer" class="diagnosis-disclaimer">
        Conditions are inferred from your full journal (including related entries in
        other body areas). Always confirm with a qualified clinician.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import DiagnosisReportCard from '@/components/DiagnosisReportCard.vue'
import type { DiagnosisReport } from '@/models/types'

withDefaults(
  defineProps<{
    reports: DiagnosisReport[]
    loading?: boolean
    showDisclaimer?: boolean
    emptyText?: string
  }>(),
  {
    loading: false,
    showDisclaimer: true,
    emptyText:
      'Add journal entries describing your symptoms, body area, and medications to see possible conditions with percentages.',
  }
)
</script>

<style scoped>
.diagnosis-panel {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.diagnosis-empty {
  margin: 0;
  padding: 1.25rem 1.5rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
}

.diagnosis-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.diagnosis-disclaimer {
  margin: 0.35rem 0 0;
  font-size: 0.72rem;
  color: var(--text-faint);
  line-height: 1.4;
}
</style>
