<template>
  <div class="timeline-event">
    <div class="event-date">{{ formattedDate }}</div>
    <div class="event-content">
      <div class="event-header">
        <span class="event-type" :class="typeClass">{{ event.type }}</span>
        <h3 class="event-title">{{ event.title }}</h3>
      </div>
      <p class="event-description">{{ event.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import type { TimelineEvent as TimelineEventType } from '@/models/types'

const props = defineProps<{
  event: TimelineEventType
}>()

const formattedDate = computed(() => {
  return format(new Date(props.event.date), 'MMM d, yyyy')
})

const typeClass = computed(() => {
  return `event-type--${props.event.type}`
})
</script>

<style scoped>
.timeline-event {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
}

.timeline-event:last-child {
  border-bottom: none;
}

.event-date {
  min-width: 120px;
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.event-content {
  flex: 1;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.event-type {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: var(--bg-muted);
  color: var(--text-muted);
}

.event-type--diagnosis {
  background: var(--event-diagnosis-bg);
  color: var(--event-diagnosis-text);
}

.event-type--imaging {
  background: var(--event-imaging-bg);
  color: var(--event-imaging-text);
}

.event-type--symptom {
  background: var(--event-symptom-bg);
  color: var(--event-symptom-text);
}

.event-type--treatment {
  background: var(--event-treatment-bg);
  color: var(--event-treatment-text);
}

.event-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.event-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}
</style>
