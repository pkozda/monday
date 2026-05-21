<template>
  <article
    class="variant-card"
    :class="{ 'variant-card--lead': lead }"
  >
    <header class="variant-card-header">
      <span class="variant-percent">{{ variant.percentage }}%</span>
      <div class="variant-title-block">
        <h4 class="variant-disease">{{ variant.diseaseName }}</h4>
        <div
          class="variant-bar"
          role="presentation"
          :style="{ '--fill': `${variant.percentage}%` }"
        />
      </div>
    </header>

    <section class="variant-section">
      <h5 class="variant-section-title">Why this was suggested</h5>
      <p class="variant-summary">{{ variant.rationale }}</p>
    </section>

    <section v-if="variant.matchFlags.length" class="variant-section">
      <h5 class="variant-section-title">Matching flags</h5>
      <ul class="flag-list">
        <li
          v-for="(flag, fi) in variant.matchFlags"
          :key="fi"
          class="flag-item"
          :class="`flag-item--${flag.kind}`"
        >
          <span class="flag-kind">{{ flagKindLabel(flag.kind) }}</span>
          <span class="flag-label">{{ flag.label }}</span>
          <span class="flag-detail">{{ flag.detail }}</span>
        </li>
      </ul>
    </section>

    <footer class="variant-footer">
      <span v-if="variant.primaryJournalCount">
        {{ variant.primaryJournalCount }} journal
        {{ variant.primaryJournalCount === 1 ? 'entry' : 'entries' }} in
        {{ variant.conditionArea }}
      </span>
      <span v-if="variant.crossBodyJournalCount" class="variant-cross">
        + {{ variant.crossBodyJournalCount }} from other body
        {{ variant.crossBodyJournalCount === 1 ? 'area' : 'areas' }}
      </span>
      <span v-if="variant.pattern && variant.confidence" class="variant-hypothesis">
        Hypothesis: {{ patternLabel(variant.pattern) }} · {{ variant.confidence }}
      </span>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { PATTERN_LABELS } from '@/services/hypothesisGenerator'
import type {
  DiagnosisMatchFlagKind,
  DiagnosisVariant,
  HypothesisPattern,
} from '@/models/types'

defineProps<{
  variant: DiagnosisVariant
  lead?: boolean
}>()

const FLAG_KIND_LABELS: Record<DiagnosisMatchFlagKind, string> = {
  body_area: 'Body area',
  keyword: 'Symptom',
  medication: 'Medication',
  named_condition: 'Named',
  hypothesis: 'Hypothesis',
  urgency: 'Urgency',
  journal_flag: 'Journal flag',
  cross_body: 'Cross-area',
}

function flagKindLabel(kind: DiagnosisMatchFlagKind): string {
  return FLAG_KIND_LABELS[kind] ?? kind
}

function patternLabel(pattern: HypothesisPattern | undefined): string {
  if (!pattern) return ''
  return PATTERN_LABELS[pattern]
}
</script>

<style scoped>
.variant-card {
  background: var(--bg-muted);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.variant-card--lead {
  border-color: var(--accent);
  background: var(--hint-bg);
}

.variant-card-header {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.variant-percent {
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--accent-strong);
  min-width: 3rem;
}

.variant-card--lead .variant-percent {
  font-size: 1.4rem;
}

.variant-title-block {
  flex: 1;
  min-width: 0;
}

.variant-disease {
  margin: 0 0 0.35rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.variant-bar {
  height: 5px;
  border-radius: 3px;
  background: var(--bg-surface);
  overflow: hidden;
}

.variant-bar::after {
  content: '';
  display: block;
  height: 100%;
  width: var(--fill, 0%);
  background: var(--accent-strong);
  border-radius: 3px;
}

.variant-section {
  margin-bottom: 0.65rem;
}

.variant-section-title {
  margin: 0 0 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
}

.variant-summary {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.flag-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.flag-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.2rem 0.5rem;
  padding: 0.45rem 0.55rem;
  background: var(--bg-surface);
  border-radius: 5px;
  border-left: 3px solid var(--border-strong);
  font-size: 0.78rem;
}

.flag-item--cross_body {
  border-left-color: var(--accent);
}

.flag-item--urgency {
  border-left-color: var(--urgency-urgent-text, #c45c26);
}

.flag-item--journal_flag {
  border-left-color: var(--urgency-monitor-text, #8a6d3b);
}

.flag-item--hypothesis {
  border-left-color: var(--success-text, #2d6a4f);
}

.flag-kind {
  grid-column: 1;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-faint);
  white-space: nowrap;
}

.flag-label {
  grid-column: 2;
  font-weight: 500;
  color: var(--text-primary);
}

.flag-detail {
  grid-column: 1 / -1;
  color: var(--text-muted);
  line-height: 1.35;
}

.variant-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  font-size: 0.72rem;
  color: var(--text-faint);
  padding-top: 0.35rem;
  border-top: 1px solid var(--border);
}

.variant-cross {
  color: var(--accent);
}

.variant-hypothesis {
  width: 100%;
}
</style>
