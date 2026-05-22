<template>
  <article
    class="diagnosis-card"
    :class="{
      'diagnosis-card--expanded': expanded,
      'diagnosis-card--full': forceExpanded,
    }"
  >
    <button
      type="button"
      class="diagnosis-card-trigger"
      :aria-expanded="expanded || forceExpanded"
      @click="onToggle"
    >
      <div class="diagnosis-card-compact">
        <div class="diagnosis-card-top">
          <h3 class="diagnosis-area">{{ report.conditionArea }}</h3>
          <span
            class="certainty-badge"
            :class="`certainty-badge--${report.certainty}`"
          >
            {{ certaintyShort }}
          </span>
        </div>

        <p
          v-if="!expanded && !forceExpanded && report.suggestedClinician"
          class="diagnosis-specialist-compact"
        >
          See: {{ report.suggestedClinician }}
        </p>

        <p v-if="!expanded && !forceExpanded" class="diagnosis-inline">
          <template
            v-for="(variant, index) in report.variants"
            :key="variant.id"
          >
            <span v-if="index > 0" class="diagnosis-sep">·</span>
            <span class="diagnosis-inline-item">
              <strong>{{ variant.percentage }}%</strong>
              {{ variant.diseaseName }}
            </span>
          </template>
        </p>
      </div>
      <span
        v-if="!forceExpanded"
        class="diagnosis-chevron"
        :class="{ 'diagnosis-chevron--open': expanded }"
      />
    </button>

    <div
      v-show="expanded || forceExpanded"
      class="diagnosis-card-body"
    >
      <p v-if="report.specialistVisitAdvice" class="diagnosis-specialist">
        <strong>Who to see:</strong> {{ report.specialistVisitAdvice }}
      </p>

      <p v-if="report.usesCrossBodyJournal" class="diagnosis-cross-note">
        Scoring includes journal entries from other body areas when they may relate to
        the same condition.
      </p>

      <p v-if="report.certainty === 'low'" class="diagnosis-uncertain-note">
        No single match is dominant — compare variants and discuss with a clinician.
      </p>

      <div class="diagnosis-variants">
        <DiagnosisVariantCard
          v-for="(variant, index) in report.variants"
          :key="variant.id"
          :variant="variant"
          :lead="index === 0"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DiagnosisVariantCard from '@/components/DiagnosisVariantCard.vue'
import type { DiagnosisReport } from '@/models/types'

const props = defineProps<{
  report: DiagnosisReport
  forceExpanded?: boolean
}>()

const expanded = ref(false)

const certaintyShort = computed(() => {
  switch (props.report.certainty) {
    case 'high':
      return 'Likely'
    case 'moderate':
      return 'Leading'
    default:
      return 'Uncertain'
  }
})

watch(
  () => props.forceExpanded,
  (full) => {
    if (full) expanded.value = true
  },
  { immediate: true }
)

function onToggle() {
  if (props.forceExpanded) return
  expanded.value = !expanded.value
}

</script>

<style scoped>
.diagnosis-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.diagnosis-card-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.diagnosis-card--expanded .diagnosis-card-trigger,
.diagnosis-card--full .diagnosis-card-trigger {
  border-bottom: 1px solid var(--border);
}

.diagnosis-card-compact {
  flex: 1;
  min-width: 0;
}

.diagnosis-card-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.2rem;
}

.diagnosis-area {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.certainty-badge {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
}

.certainty-badge--high {
  background: var(--success-bg);
  color: var(--success-text);
}

.certainty-badge--moderate {
  background: var(--hint-bg);
  color: var(--text-secondary);
}

.diagnosis-specialist {
  margin: 0 0 0.85rem;
  padding: 0.75rem 1rem;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-secondary);
  background: var(--hint-bg);
  border-left: 3px solid var(--accent);
  border-radius: 4px;
}

.diagnosis-specialist strong {
  color: var(--text-primary);
}

.diagnosis-specialist-compact {
  margin: 0.15rem 0 0.35rem;
  font-size: 0.8rem;
  color: var(--accent);
}

.certainty-badge--low {
  background: var(--urgency-monitor-bg);
  color: var(--urgency-monitor-text);
}

.diagnosis-inline {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.diagnosis-inline-item strong {
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.diagnosis-sep {
  margin: 0 0.25rem;
  color: var(--text-faint);
}

.diagnosis-chevron {
  flex-shrink: 0;
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid var(--text-muted);
  border-bottom: 2px solid var(--text-muted);
  transform: rotate(-45deg);
  transition: transform 0.2s ease;
}

.diagnosis-chevron--open {
  transform: rotate(45deg);
}

.diagnosis-card-body {
  padding: 0.75rem 0.85rem 0.85rem;
}

.diagnosis-cross-note {
  margin: 0 0 0.65rem;
  font-size: 0.78rem;
  color: var(--text-secondary);
  padding: 0.45rem 0.6rem;
  background: var(--bg-muted);
  border-radius: 4px;
}

.diagnosis-uncertain-note {
  margin: 0 0 0.65rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 0.5rem 0.65rem;
  background: var(--hint-bg);
  border-radius: 4px;
  border-left: 2px solid var(--accent);
}

.diagnosis-variants {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
</style>
