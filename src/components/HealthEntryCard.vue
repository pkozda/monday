<template>
  <article class="health-entry-card" :class="urgencyClass">
    <header class="entry-header">
      <div class="entry-meta">
        <time :datetime="entry.eventDate">{{ formattedDate }}</time>
        <span class="entry-type">{{ classificationLabel }}</span>
        <span class="condition-area">
          <TranslatedText :text="entry.conditionArea" tag="span" />
        </span>
      </div>
      <span class="urgency-badge" :class="urgencyClass">{{ urgencyLabel }}</span>
    </header>

    <h3 class="entry-title">
      <TranslatedText :text="entry.title" tag="span" />
    </h3>
    <p v-if="showFullDescription" class="entry-description">
      <TranslatedText :text="entry.description" tag="span" :inline="false" />
    </p>

    <p v-if="entry.medications" class="entry-medications">
      <strong>{{ t('healthEntryCard.medications') }}</strong>
      <TranslatedText :text="entry.medications" tag="span" />
    </p>

    <p v-if="entry.severity" class="entry-severity">
      {{ t('healthEntryCard.severity') }} {{ entry.severity }}/10
    </p>

    <div v-if="entry.analysis.flags.length" class="entry-flags">
      <span
        v-for="flag in entry.analysis.flags"
        :key="flag"
        class="flag-chip"
      >
        {{ formatFlag(flag) }}
      </span>
    </div>

    <p class="entry-summary">
      <strong>{{ t('healthEntryCard.clinicalSummary') }}</strong>
      <TranslatedText :text="entry.analysis.summary" tag="span" />
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { useLocale } from '@/composables/useLocale'
import type { AppLocale } from '@/i18n'
import { dateFnsLocaleFor } from '@/utils/dateLocale'
import TranslatedText from '@/components/TranslatedText.vue'
import { localizedClassificationForEntry, localizeJournalFlag } from '@/services/localizeClinical'

const { t } = useI18n()
const { locale } = useLocale()
import { journalDescriptionAddsDetail } from '@/services/journalEntryText'
import type { HealthEntry } from '@/models/types'

const props = defineProps<{
  entry: HealthEntry
}>()

const formattedDate = computed(() =>
  format(new Date(props.entry.eventDate), 'PP', {
    locale: dateFnsLocaleFor(locale.value as AppLocale),
  })
)

const classificationLabel = computed(() =>
  localizedClassificationForEntry(props.entry, t)
)

const showFullDescription = computed(() =>
  journalDescriptionAddsDetail(props.entry.title, props.entry.description)
)

const urgencyClass = computed(
  () => `urgency--${props.entry.analysis.urgency}`
)

const urgencyLabel = computed(() =>
  t(`urgency.${props.entry.analysis.urgency}`)
)

function formatFlag(flag: string): string {
  return localizeJournalFlag(flag, t)
}
</script>

<style scoped>
.health-entry-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  border-left: 4px solid var(--border-strong);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.entry-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.entry-type {
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  background: var(--bg-muted);
  color: var(--accent);
}

.condition-area {
  color: var(--text-secondary);
}

.urgency-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
  background: var(--bg-muted);
  color: var(--text-muted);
}

.health-entry-card.urgency--monitor {
  border-left-color: var(--urgency-monitor-text);
}

.health-entry-card.urgency--urgent {
  border-left-color: var(--urgency-urgent-text);
}

.health-entry-card.urgency--emergency {
  border-left-color: var(--urgency-emergency-text);
  background: var(--urgency-emergency-bg);
}

.urgency--monitor .urgency-badge {
  background: var(--urgency-monitor-bg);
  color: var(--urgency-monitor-text);
}

.urgency--urgent .urgency-badge {
  background: var(--urgency-urgent-bg);
  color: var(--urgency-urgent-text);
}

.urgency--emergency .urgency-badge {
  background: var(--urgency-emergency-bg);
  color: var(--urgency-emergency-text);
}

.entry-title {
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}

.entry-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 0.75rem;
  white-space: pre-wrap;
}

.entry-medications,
.entry-severity {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem;
}

.entry-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.flag-chip {
  font-size: 0.7rem;
  text-transform: capitalize;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: var(--bg-muted);
  color: var(--text-muted);
}

.entry-summary {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}
</style>
