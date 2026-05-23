<template>
  <div class="diagnosis-panel">
    <p v-if="loading" class="diagnosis-empty">
      {{ t('diagnosis.loading') }}
    </p>

    <p v-else-if="reports.length === 0" class="diagnosis-empty">
      {{ emptyText ?? t('diagnosis.empty') }}
    </p>

    <template v-else-if="!loading">
      <div class="diagnosis-list">
        <DiagnosisReportCard
          v-for="report in displayReports"
          :key="report.conditionArea"
          :report="report"
        />
      </div>

      <p v-if="showDisclaimer" class="diagnosis-disclaimer">
        {{ t('diagnosis.disclaimer') }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DiagnosisReportCard from '@/components/DiagnosisReportCard.vue'
import { localizeDiagnosisReportSync } from '@/services/localizeDiagnosisContent'
import type { DiagnosisReport } from '@/models/types'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    reports: DiagnosisReport[]
    loading?: boolean
    showDisclaimer?: boolean
    emptyText?: string
  }>(),
  {
    loading: false,
    showDisclaimer: true,
  }
)

/** Sync i18n only — cards render immediately; per-field MT via TranslatedText. */
const displayReports = computed(() =>
  props.reports.map((r) => localizeDiagnosisReportSync(r, t))
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
