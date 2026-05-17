<template>
  <div class="timeline-view">
    <SectionHeader 
      title="Medical Timeline" 
      subtitle="Chronological view of medical events"
    />

    <div v-if="loading" class="loading">Loading timeline...</div>
    
    <div v-else-if="timeline.length === 0" class="empty-state">
      <p>No timeline events available.</p>
    </div>

    <div v-else class="timeline-container">
      <TimelineEvent
        v-for="event in timeline"
        :key="event.id"
        :event="event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SectionHeader from '@/components/SectionHeader.vue'
import TimelineEvent from '@/components/TimelineEvent.vue'
import { getTimeline } from '@/api/mockApi'
import type { TimelineEvent as TimelineEventType } from '@/models/types'

const loading = ref(true)
const timeline = ref<TimelineEventType[]>([])

onMounted(async () => {
  try {
    timeline.value = await getTimeline()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.timeline-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.timeline-container {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.5rem;
}
</style>
