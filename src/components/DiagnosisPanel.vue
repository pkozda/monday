<template>
  <div class="diagnosis-panel">
    <p v-if="loading" class="diagnosis-empty">
      Analyzing your journal for possible conditions…
    </p>

    <p v-else-if="reports.length === 0" class="diagnosis-empty">
      {{ emptyText }}
    </p>

    <template v-else-if="!loading">
      <div v-if="showToolbar" class="diagnosis-toolbar">
        <button
          type="button"
          class="btn-view-toggle"
          @click="$emit('toggle-view')"
        >
          {{ fullView ? 'Compact view' : 'Full view' }}
        </button>
      </div>

      <div class="diagnosis-list">
        <DiagnosisReportCard
          v-for="report in reports"
          :key="report.conditionArea"
          :report="report"
          :force-expanded="fullView"
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
    fullView?: boolean
    showToolbar?: boolean
    showDisclaimer?: boolean
    emptyText?: string
  }>(),
  {
    loading: false,
    fullView: false,
    showToolbar: false,
    showDisclaimer: true,
    emptyText:
      'Add journal entries describing your symptoms, body area, and medications to see possible conditions with percentages.',
  }
)

defineEmits<{
  'toggle-view': []
}>()
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

.diagnosis-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.15rem;
}

.btn-view-toggle {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--accent);
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.btn-view-toggle:hover {
  background: var(--bg-muted);
  border-color: var(--accent);
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
