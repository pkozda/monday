<template>
  <article
    class="diagnosis-card"
    :class="{ 'diagnosis-card--expanded': expanded }"
  >
    <button
      type="button"
      class="diagnosis-card-trigger"
      :aria-expanded="expanded"
      @click="onToggle"
    >
      <div class="diagnosis-card-compact">
        <div class="diagnosis-card-top">
          <h3 class="diagnosis-area">{{ report.conditionArea }}</h3>
          <span
            v-if="report.aiRanked"
            class="source-badge source-badge--ai"
          >
            {{ t('diagnosis.aiBadge') }}
          </span>
          <span
            class="certainty-badge"
            :class="`certainty-badge--${report.certainty}`"
          >
            {{ certaintyShort }}
          </span>
        </div>

        <p
          v-if="!expanded && specialistName"
          class="diagnosis-specialist-compact"
        >
          {{ t('diagnosis.seeSpecialist', { name: specialistName }) }}
        </p>

        <ul v-if="!expanded" class="diagnosis-variant-rows">
          <li
            v-for="(variant, index) in compactVariants"
            :key="variant.id"
            class="diagnosis-variant-row"
            :class="{ 'diagnosis-variant-row--lead': index === 0 }"
          >
            <span class="diagnosis-variant-row__pct">{{ variant.percentage }}%</span>
            <span class="diagnosis-variant-row__name">
              <TranslatedText :text="variant.diseaseName" tag="span" />
            </span>
          </li>
        </ul>
        <p v-if="moreCompactCount > 0 && !expanded" class="diagnosis-variant-more">
          {{ t('common.expandToSeeAll', { count: moreCompactCount }) }}
        </p>
      </div>
      <span
        class="diagnosis-chevron"
        :class="{ 'diagnosis-chevron--open': expanded }"
      />
    </button>

    <div v-show="expanded" class="diagnosis-card-body">
      <p v-if="specialistAdvice" class="diagnosis-specialist">
        <strong>{{ t('diagnosis.whoToSee') }}</strong> {{ specialistAdvice }}
      </p>

      <p v-if="report.usesCrossBodyJournal" class="diagnosis-cross-note">
        {{ t('diagnosis.crossBodyNote') }}
      </p>

      <p v-if="report.certainty === 'low'" class="diagnosis-uncertain-note">
        {{ t('diagnosis.uncertainNote') }}
      </p>

      <div
        v-if="topVariants.length"
        class="diagnosis-variant-tabs-wrap"
      >
        <div
          class="diagnosis-variant-tabs"
          role="tablist"
          :aria-label="
            t('diagnosis.variantTabsLabel', { area: report.conditionArea })
          "
        >
          <button
            v-for="(variant, index) in topVariants"
            :id="`variant-tab-${variant.id}`"
            :key="variant.id"
            type="button"
            role="tab"
            class="diagnosis-variant-tab"
            :class="{
              'diagnosis-variant-tab--active': variant.id === activeVariantId,
              'diagnosis-variant-tab--lead': index === 0,
            }"
            :aria-selected="variant.id === activeVariantId"
            :aria-controls="`variant-panel-${variant.id}`"
            @click="activeVariantId = variant.id"
          >
            <span class="diagnosis-variant-tab__pct">{{ variant.percentage }}%</span>
            <span class="diagnosis-variant-tab__name">
              <TranslatedText :text="variant.diseaseName" tag="span" />
            </span>
          </button>
        </div>

        <div
          v-if="activeVariant"
          :id="`variant-panel-${activeVariant.id}`"
          role="tabpanel"
          class="diagnosis-variant-panel"
          :aria-labelledby="`variant-tab-${activeVariant.id}`"
        >
          <DiagnosisVariantCard
            :variant="activeVariant"
            :journal-entries="journalEntries"
            :lead="activeVariant.id === topVariants[0]?.id"
            in-tabs
          />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DiagnosisVariantCard from '@/components/DiagnosisVariantCard.vue'
import TranslatedText from '@/components/TranslatedText.vue'
import {
  localizedDiagnosisSpecialistAdvice,
  localizedDiagnosisSpecialistName,
} from '@/services/localizeClinical'
import type { DiagnosisReport, HealthEntry } from '@/models/types'

const { t } = useI18n()

const props = defineProps<{
  report: DiagnosisReport
  journalEntries?: HealthEntry[]
}>()

const specialistName = computed(() =>
  localizedDiagnosisSpecialistName(props.report, t)
)

const specialistAdvice = computed(() =>
  localizedDiagnosisSpecialistAdvice(props.report, t)
)

const MAX_VARIANTS = 8
const MAX_VARIANTS_COMPACT = 3

const expanded = ref(false)
const activeVariantId = ref<string | null>(null)

const sortedVariants = computed(() =>
  [...props.report.variants].sort((a, b) => b.percentage - a.percentage)
)

const topVariants = computed(() => sortedVariants.value.slice(0, MAX_VARIANTS))

const compactVariants = computed(() =>
  topVariants.value.slice(0, MAX_VARIANTS_COMPACT)
)

const moreCompactCount = computed(() =>
  Math.max(0, topVariants.value.length - compactVariants.value.length)
)

const certaintyShort = computed(() => {
  switch (props.report.certainty) {
    case 'high':
      return t('diagnosis.certaintyHigh')
    case 'moderate':
      return t('diagnosis.certaintyModerate')
    default:
      return t('diagnosis.certaintyLow')
  }
})

const activeVariant = computed(() =>
  topVariants.value.find((v) => v.id === activeVariantId.value) ?? topVariants.value[0] ?? null
)

watch(
  topVariants,
  (variants) => {
    if (!variants.length) {
      activeVariantId.value = null
      return
    }
    if (!variants.some((v) => v.id === activeVariantId.value)) {
      activeVariantId.value = variants[0].id
    }
  },
  { immediate: true }
)

function onToggle() {
  const opening = !expanded.value
  expanded.value = !expanded.value
  if (opening && topVariants.value.length && !activeVariantId.value) {
    activeVariantId.value = topVariants.value[0].id
  }
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

.diagnosis-card--expanded .diagnosis-card-trigger {
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

.source-badge {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
}

.source-badge--ai {
  background: color-mix(in srgb, var(--accent-strong) 18%, transparent);
  color: var(--accent-strong);
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

.diagnosis-variant-rows {
  list-style: none;
  margin: 0.35rem 0 0;
  padding: 0 0 0.15rem;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: baseline;
  gap: 0.5rem 1rem;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.diagnosis-variant-row {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  flex-shrink: 0;
  line-height: 1.35;
  white-space: nowrap;
}

.diagnosis-variant-row__pct {
  font-size: 0.82rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--accent-strong);
}

.diagnosis-variant-row--lead .diagnosis-variant-row__pct {
  font-size: 0.9rem;
}

.diagnosis-variant-row__name {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.diagnosis-variant-row--lead .diagnosis-variant-row__name {
  font-weight: 600;
  color: var(--text-primary);
}

.diagnosis-variant-more {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
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

.diagnosis-variant-tabs-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.15rem;
}

.diagnosis-variant-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.35rem;
  background: var(--bg-muted);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.diagnosis-variant-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.8rem;
  line-height: 1.3;
  cursor: pointer;
  text-align: left;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.diagnosis-variant-tab:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.diagnosis-variant-tab--active {
  background: var(--bg-surface);
  border-color: var(--accent);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.diagnosis-variant-tab--active.diagnosis-variant-tab--lead {
  background: var(--hint-bg);
}

.diagnosis-variant-tab__pct {
  flex-shrink: 0;
  font-size: 0.85rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--accent-strong);
}

.diagnosis-variant-tab--active .diagnosis-variant-tab__pct {
  color: var(--accent-strong);
}

.diagnosis-variant-tab__name {
  min-width: 0;
  font-weight: 500;
  word-break: break-word;
}

.diagnosis-variant-tab--lead .diagnosis-variant-tab__name {
  font-weight: 600;
}

.diagnosis-variant-panel {
  width: 100%;
}

.diagnosis-variant-panel :deep(.variant-card) {
  width: 100%;
  max-width: none;
}
</style>
