<template>
  <article class="health-entry-card" :class="urgencyClass">
    <header class="entry-header">
      <div class="entry-meta">
        <time :datetime="entry.eventDate">{{ formattedDate }}</time>
        <span class="entry-type">{{ typeLabel }}</span>
        <span class="condition-area">{{ entry.conditionArea }}</span>
      </div>
      <span class="urgency-badge" :class="urgencyClass">{{ urgencyLabel }}</span>
    </header>

    <h3 class="entry-title">{{ entry.title }}</h3>
    <p class="entry-description">{{ entry.description }}</p>

    <p v-if="entry.medications" class="entry-medications">
      <strong>Medications:</strong> {{ entry.medications }}
    </p>

    <p v-if="entry.severity" class="entry-severity">
      Severity: {{ entry.severity }}/10
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
      <strong>Clinical summary:</strong> {{ entry.analysis.summary }}
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import type { HealthEntry, HealthEntryType } from '@/models/types'

const props = defineProps<{
  entry: HealthEntry
}>()

const TYPE_LABELS: Record<HealthEntryType, string> = {
  symptom: 'Symptoms',
  medication: 'Medication',
  change: 'Change',
  doctor_visit: 'Doctor visit',
  imaging: 'Test / imaging',
  other: 'Note',
}

const URGENCY_LABELS = {
  routine: 'Routine',
  monitor: 'Monitor',
  urgent: 'See clinician soon',
  emergency: 'Seek emergency care',
} as const

const formattedDate = computed(() =>
  format(new Date(props.entry.eventDate), 'MMM d, yyyy')
)

const typeLabel = computed(() => TYPE_LABELS[props.entry.entryType])

const urgencyClass = computed(
  () => `urgency--${props.entry.analysis.urgency}`
)

const urgencyLabel = computed(
  () => URGENCY_LABELS[props.entry.analysis.urgency]
)

function formatFlag(flag: string): string {
  return flag.replace(/_/g, ' ')
}
</script>

<style scoped>
.health-entry-card {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.25rem;
  border-left: 4px solid #444;
}

.health-entry-card.urgency--monitor {
  border-left-color: #ffb74d;
}

.health-entry-card.urgency--urgent {
  border-left-color: #ff7043;
}

.health-entry-card.urgency--emergency {
  border-left-color: #ef5350;
  background: #2a1e1e;
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
  color: #999;
}

.entry-type {
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  background: #2a2a2a;
  color: #64b5f6;
}

.condition-area {
  color: #b0b0b0;
}

.urgency-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
  background: #2a2a2a;
  color: #999;
}

.urgency--monitor .urgency-badge {
  background: #4a3a1e;
  color: #ffb74d;
}

.urgency--urgent .urgency-badge {
  background: #4a2a1e;
  color: #ff7043;
}

.urgency--emergency .urgency-badge {
  background: #4a1e1e;
  color: #ef5350;
}

.entry-title {
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
  color: #e0e0e0;
}

.entry-description {
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0 0 0.75rem;
  white-space: pre-wrap;
}

.entry-medications,
.entry-severity {
  font-size: 0.9rem;
  color: #b0b0b0;
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
  background: #2a2a2a;
  color: #999;
}

.entry-summary {
  font-size: 0.85rem;
  color: #999;
  line-height: 1.5;
  margin: 0;
  padding-top: 0.75rem;
  border-top: 1px solid #333;
}
</style>
