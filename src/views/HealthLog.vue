<template>
  <div class="page health-log-view">
    <PageHeader
      :eyebrow="t('journalPage.eyebrow')"
      :title="t('journalPage.title')"
      :subtitle="t('journalPage.subtitle')"
    >
      <template #actions>
        <button type="button" class="btn-new-entry" @click="entryModalOpen = true">
          {{ t('journalPage.newEntry') }}
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
        :title="t('journalPage.recordsTitle')"
        :subtitle="t('journalPage.recordsSubtitle')"
        class="page-section-title"
      />

      <div v-if="loading" class="page-loading">{{ t('journalPage.loading') }}</div>

      <div v-else-if="entries.length === 0" class="page-empty">
        <span class="page-empty__title">{{ t('journalPage.noRecordsTitle') }}</span>
        <p>{{ t('journalPage.noRecordsText') }}</p>
        <button type="button" class="btn-new-entry btn-new-entry--inline" @click="entryModalOpen = true">
          {{ t('journalPage.newEntry') }}
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
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'

const { t } = useI18n()
import SectionHeader from '@/components/SectionHeader.vue'
import HealthEntryFormModal from '@/components/HealthEntryFormModal.vue'
import HealthEntryCard from '@/components/HealthEntryCard.vue'
import { getHealthEntries } from '@/api/healthApi'
import { localizedClassificationForEntry } from '@/services/localizeClinical'
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
  successMessage.value = `${t('journalPage.entrySaved', {
    classification: localizedClassificationForEntry(entry, t),
  })} ${t('journalPage.entrySavedTimeline')}`
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
