<template>
  <div class="disease-education" :class="{ 'disease-education--compact': compact }">
    <section class="disease-education__section">
      <h5 class="disease-education__title">{{ t('diseaseInsight.aboutTitle') }}</h5>
      <p class="disease-education__overview">
        <TranslatedText :text="insight.education.overview" tag="span" :inline="false" />
      </p>
    </section>

    <section
      v-if="insight.userJournalEvidence.length"
      class="disease-education__section disease-education__section--user-evidence"
    >
      <h5 class="disease-education__title">
        {{ t('diseaseInsight.whatYouLoggedTitle') }}
      </h5>
      <p class="disease-education__section-intro">
        {{ t('diseaseInsight.whatYouLoggedIntro') }}
      </p>
      <ul class="user-evidence-list">
        <li
          v-for="row in insight.userJournalEvidence"
          :key="row.id"
          class="user-evidence-card"
        >
          <div class="user-evidence-card__head">
            <h6 class="user-evidence-card__title">
              <TranslatedText :text="row.loggedTitle" tag="span" />
            </h6>
            <p v-if="rowMeta(row)" class="user-evidence-card__meta">{{ rowMeta(row) }}</p>
          </div>
          <blockquote v-if="row.loggedQuote" class="user-evidence-card__quote">
            <TranslatedText :text="row.loggedQuote" tag="span" :inline="false" />
          </blockquote>
          <p class="user-evidence-card__why">
            <span class="user-evidence-card__why-label">
              {{ t('diseaseInsight.whyThisSupports') }}
            </span>
            {{ t(`diseaseInsight.supportReason.${row.supportReason}`) }}
          </p>
        </li>
      </ul>
    </section>

    <p
      v-else-if="insight.metCount === 0 && insight.referenceSymptoms.length"
      class="disease-education__empty-evidence"
    >
      {{ t('diseaseInsight.noJournalProofYet') }}
    </p>

    <section
      v-if="insight.referenceSymptoms.length"
      class="disease-education__section"
    >
      <h5 class="disease-education__title">
        {{ t('diseaseInsight.typicalSymptomsTitle') }}
      </h5>
      <p class="disease-education__section-intro">
        {{ t('diseaseInsight.typicalSymptomsIntro') }}
      </p>
      <ul class="disease-education__symptom-list disease-education__symptom-list--reference">
        <li v-for="(symptom, i) in insight.referenceSymptoms" :key="i">
          <TranslatedText :text="symptom" tag="span" />
        </li>
      </ul>
    </section>

    <section
      v-if="insight.missingToConfirm.length || insight.cautionSignals.length"
      class="disease-education__section disease-education__section--journal"
    >
      <h5 class="disease-education__title">
        {{ t('diseaseInsight.journalCompareTitle') }}
      </h5>
      <p class="disease-education__compare-intro">
        {{ t('diseaseInsight.journalCompareIntro') }}
      </p>

      <div v-if="insight.missingToConfirm.length" class="journal-group journal-group--missing">
        <h6 class="journal-group__label journal-group__label--missing">
          {{ t('diseaseInsight.missingToConfirmTitle') }}
        </h6>
        <p class="journal-group__hint">{{ t('diseaseInsight.missingToConfirmHint') }}</p>
        <ul class="missing-symptom-list">
          <li
            v-for="row in insight.missingToConfirm"
            :key="row.id"
            class="missing-symptom-item"
          >
            <span class="missing-symptom-icon" aria-hidden="true">○</span>
            <span class="missing-symptom-text">
              <TranslatedText :text="row.text" tag="span" />
            </span>
          </li>
        </ul>
      </div>

      <div v-if="insight.cautionSignals.length" class="journal-group">
        <h6 class="journal-group__label journal-group__label--caution">
          {{ t('diseaseInsight.cautionTitle') }}
        </h6>
        <ul class="criteria-list">
          <li
            v-for="row in insight.cautionSignals"
            :key="row.id"
            class="criteria-item criteria-item--exclusion_present"
          >
            <span class="criteria-icon" aria-hidden="true">✗</span>
            <div class="criteria-body">
              <span class="criteria-text">
                <TranslatedText :text="row.label" tag="span" />
              </span>
              <span v-if="row.detail" class="criteria-detail">
                <TranslatedText :text="row.detail" tag="span" />
              </span>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section v-if="!compact && insight.education.whenToSeekCare" class="disease-education__section">
      <h5 class="disease-education__title">{{ t('diseaseInsight.whenToSeekTitle') }}</h5>
      <p class="disease-education__when">
        <TranslatedText
          :text="insight.education.whenToSeekCare"
          tag="span"
          :inline="false"
        />
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { format, parseISO } from 'date-fns'
import TranslatedText from '@/components/TranslatedText.vue'
import { buildDiseaseInsight } from '@/services/diseaseInsight'
import type { UserJournalEvidenceRow } from '@/services/journalUserEvidence'
import { useLocale } from '@/composables/useLocale'
import type { AppLocale } from '@/i18n'
import { dateFnsLocaleFor } from '@/utils/dateLocale'
import type { DiagnosisVariant, HealthEntry } from '@/models/types'

const props = defineProps<{
  variant: DiagnosisVariant
  journalEntries?: HealthEntry[]
  compact?: boolean
}>()

const { t } = useI18n()
const { locale } = useLocale()
const dfLocale = computed(() => dateFnsLocaleFor(locale.value as AppLocale))

const insight = computed(() =>
  buildDiseaseInsight(props.variant, props.journalEntries ?? [])
)

function formatEventDate(iso: string | undefined): string {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'PP', { locale: dfLocale.value })
  } catch {
    return iso
  }
}

function rowMeta(row: UserJournalEvidenceRow): string {
  const parts: string[] = []
  if (row.bodyArea) parts.push(row.bodyArea)
  const when = formatEventDate(row.eventDate)
  if (when) parts.push(when)
  return parts.join(' · ')
}
</script>

<style scoped>
.disease-education {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.disease-education--compact .disease-education__overview {
  font-size: 0.8rem;
}

.disease-education__section {
  margin: 0;
}

.disease-education__section--user-evidence {
  padding: 0.65rem 0.75rem;
  background: var(--confirm-match-bg);
  border: 1px solid var(--confirm-match-border);
  border-radius: 8px;
}

.disease-education__section--journal {
  padding: 0.65rem 0.75rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.disease-education__title {
  margin: 0 0 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
}

.disease-education__section-intro,
.disease-education__compare-intro,
.disease-education__empty-evidence {
  margin: 0 0 0.5rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.45;
}

.disease-education__overview,
.disease-education__when {
  margin: 0;
  font-size: 0.84rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.user-evidence-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-evidence-card {
  padding: 0.65rem 0.75rem;
  background: var(--bg-surface);
  border: 1px solid var(--confirm-match-border);
  border-radius: 8px;
  box-shadow: inset 3px 0 0 var(--confirm-match-border);
}

.user-evidence-card__head {
  margin-bottom: 0.35rem;
}

.user-evidence-card__title {
  margin: 0 0 0.15rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.35;
}

.user-evidence-card__meta {
  margin: 0;
  font-size: 0.72rem;
  color: var(--text-faint);
}

.user-evidence-card__quote {
  margin: 0 0 0.45rem;
  padding: 0.4rem 0.55rem;
  border-left: 2px solid var(--border-strong);
  font-size: 0.82rem;
  font-style: italic;
  color: var(--text-secondary);
  line-height: 1.45;
  background: var(--bg-muted);
  border-radius: 0 4px 4px 0;
}

.user-evidence-card__why {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.user-evidence-card__why-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--confirm-match-text);
  margin-bottom: 0.2rem;
}

.disease-education__symptom-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.disease-education__symptom-list--reference li {
  padding-left: 1rem;
  position: relative;
}

.disease-education__symptom-list--reference li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--text-faint);
}

.journal-group {
  margin-top: 0.5rem;
}

.journal-group__label {
  margin: 0 0 0.3rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
}

.journal-group__label--caution {
  color: var(--urgency-urgent-text, #c45c26);
}

.journal-group__label--missing {
  color: var(--text-secondary);
}

.journal-group__hint {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  color: var(--text-faint);
  line-height: 1.35;
}

.missing-symptom-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.missing-symptom-item {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  padding: 0.45rem 0.55rem;
  border-radius: 6px;
  font-size: 0.78rem;
  background: var(--bg-muted);
  border: 1px dashed var(--border-strong);
  border-left: 3px solid var(--text-faint);
}

.missing-symptom-icon {
  flex-shrink: 0;
  width: 1.1rem;
  font-weight: 700;
  text-align: center;
  color: var(--text-faint);
}

.missing-symptom-text {
  color: var(--text-primary);
  line-height: 1.4;
}

.criteria-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.criteria-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.45rem 0.55rem;
  border-radius: 5px;
  font-size: 0.78rem;
  background: var(--bg-muted);
  border-left: 3px solid var(--border-strong);
}

.criteria-item--exclusion_present {
  border-left-color: var(--urgency-urgent-text, #c45c26);
  background: var(--urgency-monitor-bg);
}

.criteria-icon {
  flex-shrink: 0;
  width: 1.1rem;
  font-weight: 700;
  text-align: center;
}

.criteria-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.criteria-text {
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.35;
}

.criteria-detail {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.35;
}
</style>
