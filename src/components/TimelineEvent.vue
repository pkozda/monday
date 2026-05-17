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
  border-bottom: 1px solid #333;
}

.timeline-event:last-child {
  border-bottom: none;
}

.event-date {
  min-width: 120px;
  font-size: 0.9rem;
  color: #999;
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
  background: #2a2a2a;
  color: #999;
}

.event-type--diagnosis {
  background: #1e3a5f;
  color: #64b5f6;
}

.event-type--imaging {
  background: #3d2a4a;
  color: #ba68c8;
}

.event-type--symptom {
  background: #4a3a1e;
  color: #ffb74d;
}

.event-type--treatment {
  background: #1e3a2a;
  color: #81c784;
}

.event-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #e0e0e0;
}

.event-description {
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0;
}
</style>
