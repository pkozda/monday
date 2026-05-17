<template>
  <div class="health-log-view">
    <SectionHeader
      title="Health journal"
      subtitle="Record symptoms, medications, and changes over time. Each entry is analyzed and added to your timeline."
    />

    <div v-if="successMessage" class="success-banner" role="status">
      {{ successMessage }}
    </div>

    <section class="log-section">
      <SectionHeader
        title="New entry"
        subtitle="Describe what you are experiencing in English or Russian — entries are stored in English."
      />
      <HealthEntryForm @submitted="onEntrySubmitted" />
    </section>

    <section class="log-section">
      <SectionHeader
        title="Your records"
        subtitle="Longitudinal notes for your conditions, newest first."
      />

      <div v-if="loading" class="loading">Loading records…</div>

      <div v-else-if="entries.length === 0" class="empty-state">
        <p>No health records yet. Submit your first entry above.</p>
      </div>

      <div v-else class="entries-list">
        <HealthEntryCard
          v-for="entry in entries"
          :key="entry.id"
          :entry="entry"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SectionHeader from '@/components/SectionHeader.vue'
import HealthEntryForm from '@/components/HealthEntryForm.vue'
import HealthEntryCard from '@/components/HealthEntryCard.vue'
import { getHealthEntries } from '@/api/healthApi'
import type { HealthEntry, HealthUrgency } from '@/models/types'

const loading = ref(true)
const entries = ref<HealthEntry[]>([])
const successMessage = ref('')

const URGENCY_MESSAGES: Record<HealthUrgency, string> = {
  routine: 'Saved. Your note was added to your timeline.',
  monitor:
    'Saved. We flagged this for monitoring — keep tracking if symptoms persist.',
  urgent:
    'Saved. Consider contacting a clinician soon based on what you described.',
  emergency:
    'Saved. Your description may indicate an emergency — seek immediate medical care if you are in danger.',
}

onMounted(async () => {
  await loadEntries()
})

async function loadEntries() {
  loading.value = true
  try {
    entries.value = await getHealthEntries()
  } finally {
    loading.value = false
  }
}

function onEntrySubmitted(entry: HealthEntry) {
  entries.value = [entry, ...entries.value.filter((e) => e.id !== entry.id)]
  successMessage.value = URGENCY_MESSAGES[entry.analysis.urgency]
  window.setTimeout(() => {
    successMessage.value = ''
  }, 8000)
}
</script>

<style scoped>
.health-log-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.log-section {
  margin-bottom: 3rem;
}

.success-banner {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: #1e3a2a;
  border: 1px solid #2e7d52;
  border-radius: 8px;
  color: #a5d6a7;
  font-size: 0.95rem;
}

.loading,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
