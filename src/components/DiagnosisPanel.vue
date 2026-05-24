<template>
  <div class="diagnosis-panel" :class="{ 'diagnosis-panel--refreshing': refreshing }">
    <p v-if="loading && reports.length === 0" class="diagnosis-empty">
      {{ t('diagnosis.loading') }}
    </p>

    <div v-else-if="reports.length === 0" class="diagnosis-empty">
      <p class="diagnosis-empty__title">
        {{ emptyTitle ?? emptyText ?? t('diagnosis.empty') }}
      </p>
      <p v-if="emptyHint" class="diagnosis-empty__hint">
        {{ emptyHint }}
      </p>
      <button
        v-if="showEmptyAction"
        type="button"
        class="diagnosis-empty__action"
        :disabled="emptyActionDisabled"
        @click="emit('empty-action')"
      >
        {{ emptyActionLabel ?? t('diagnosis.generateAction') }}
      </button>
    </div>

    <template v-else>
      <p v-if="refreshing" class="diagnosis-refreshing" role="status">
        {{ t('diagnosis.refreshing') }}
      </p>
      <div class="diagnosis-list">
        <DiagnosisReportCard
          v-for="report in displayReports"
          :key="report.conditionArea"
          :report="report"
          :journal-entries="journalEntries"
        />
      </div>

      <p
        v-if="diagnosisMode === 'ai' && hasAiRanked"
        class="diagnosis-disclaimer diagnosis-disclaimer--ai"
      >
        {{ t('diagnosis.aiRankedNote') }}
      </p>
      <p
        v-else-if="diagnosisMode === 'rule' && reports.length > 0"
        class="diagnosis-disclaimer diagnosis-disclaimer--rule"
      >
        {{ t('diagnosis.ruleBasedNote') }}
      </p>
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
import type { DiagnosisReport, HealthEntry } from '@/models/types'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    reports: DiagnosisReport[]
    journalEntries?: HealthEntry[]
    loading?: boolean
    refreshing?: boolean
    showDisclaimer?: boolean
    /** @deprecated Prefer emptyTitle + emptyHint */
    emptyText?: string
    emptyTitle?: string
    emptyHint?: string
    showEmptyAction?: boolean
    emptyActionLabel?: string
    emptyActionDisabled?: boolean
    diagnosisMode?: 'rule' | 'ai'
  }>(),
  {
    loading: false,
    refreshing: false,
    showDisclaimer: true,
    journalEntries: () => [],
    showEmptyAction: false,
    emptyActionDisabled: false,
    diagnosisMode: 'rule',
  }
)

const emit = defineEmits<{
  'empty-action': []
}>()

/** Sync i18n only — cards render immediately; per-field MT via TranslatedText. */
const displayReports = computed(() =>
  props.reports.map((r) => localizeDiagnosisReportSync(r, t))
)

const hasAiRanked = computed(() => props.reports.some((r) => r.aiRanked))
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
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.diagnosis-empty__title {
  margin: 0;
  font-weight: 600;
  color: var(--text-primary);
}

.diagnosis-empty__hint {
  margin: 0;
  line-height: 1.45;
}

.diagnosis-empty__action {
  align-self: flex-start;
  margin-top: 0.25rem;
  padding: 0.55rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  background: var(--accent-strong);
  color: #fff;
  font-family: inherit;
}

.diagnosis-empty__action:hover:not(:disabled) {
  background: var(--accent-hover);
}

.diagnosis-empty__action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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

.diagnosis-disclaimer--ai {
  color: var(--text-muted);
}

.diagnosis-disclaimer--rule {
  color: var(--text-faint);
}

.diagnosis-refreshing {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.diagnosis-panel--refreshing .diagnosis-list {
  opacity: 0.72;
  transition: opacity 0.15s ease;
}
</style>
