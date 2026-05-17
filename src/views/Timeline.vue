<template>
  <div class="timeline-view">
    <SectionHeader 
      title="Medical Timeline" 
      subtitle="Events from your health journal, newest first"
    />

    <div v-if="loading" class="loading">Loading timeline...</div>
    
    <div v-else-if="timeline.length === 0" class="empty-state">
      <p>No timeline events yet. Save an entry in the Journal to add one.</p>
      <router-link to="/journal" class="empty-link">Go to Journal</router-link>
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
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.empty-link {
  display: inline-block;
  margin-top: 0.75rem;
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.empty-link:hover {
  text-decoration: underline;
}

.timeline-container {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
}
</style>
