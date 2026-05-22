<template>
  <div class="page health-log-view">
    <PageHeader
      eyebrow="Journal"
      title="Health journal"
      subtitle="Record symptoms, medications, and changes. Each entry is analyzed and linked to your health timeline."
    >
      <template #actions>
        <button type="button" class="btn-new-entry" @click="entryModalOpen = true">
          New entry
        </button>
      </template>
    </PageHeader>

    <div v-if="successMessage" class="page-banner page-banner--success" role="status">
      {{ successMessage }}
    </div>

    <HealthEntryFormModal
      :open="entryModalOpen"
      @close="entryModalOpen = false"
      @submitted="onEntrySubmitted"
    />

    <section class="page-section log-section">
      <SectionHeader
        title="Your records"
        subtitle="Longitudinal notes for your conditions, newest first."
        class="page-section-title"
      />

      <div v-if="loading" class="page-loading">Loading records…</div>

      <div v-else-if="entries.length === 0" class="page-empty">
        <span class="page-empty__title">No records yet</span>
        <p>Click <strong>New entry</strong> in the header to log your first note.</p>
        <button type="button" class="btn-new-entry btn-new-entry--inline" @click="entryModalOpen = true">
          New entry
        </button>
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
import PageHeader from '@/components/PageHeader.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import HealthEntryFormModal from '@/components/HealthEntryFormModal.vue'
import HealthEntryCard from '@/components/HealthEntryCard.vue'
import { getHealthEntries } from '@/api/healthApi'
import { getEntryClassificationLabel } from '@/services/healthAnalysis'
import type { HealthEntry } from '@/models/types'

const loading = ref(true)
const entryModalOpen = ref(false)
const entries = ref<HealthEntry[]>([])
const successMessage = ref('')

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
  successMessage.value = `Saved as “${getEntryClassificationLabel(entry)}”. Added to your timeline.`
  window.setTimeout(() => {
    successMessage.value = ''
  }, 8000)
}
</script>

<style scoped>
.log-section {
  margin-bottom: 0;
}

.btn-new-entry {
  flex-shrink: 0;
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 6px;
  background: var(--accent-strong);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

.btn-new-entry:hover {
  background: var(--accent-hover);
}

.btn-new-entry--inline {
  margin-top: 1rem;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
