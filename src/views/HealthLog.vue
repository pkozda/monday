<template>
  <div class="page health-log-view">
    <PageHeader
      :eyebrow="t('journalPage.eyebrow')"
      :title="t('journalPage.title')"
      :subtitle="t('journalPage.subtitle')"
    >
      <template #actions>
        <button type="button" class="btn-new-entry" @click="openNewEntry">
          {{ t('journalPage.newEntry') }}
        </button>
      </template>
    </PageHeader>

    <div v-if="successMessage" class="page-banner page-banner--success" role="status">
      {{ successMessage }}
    </div>

    <div
      v-if="singleEntryViewActive"
      class="journal-focus-banner"
      role="navigation"
      :aria-label="t('journalPage.backNavLabel')"
    >
      <RouterLink :to="backFromSingleEntryRoute" class="journal-focus-banner__back">
        <span class="journal-focus-banner__back-icon" aria-hidden="true">←</span>
        {{ backFromSingleEntryLabel }}
      </RouterLink>
      <p class="journal-focus-banner__hint">{{ t('journalPage.singleEntryHint') }}</p>
    </div>

    <div
      v-else-if="attentionFilterActive"
      class="page-banner page-banner--info journal-filter-banner"
      role="status"
    >
      <p class="journal-filter-banner__text">
        {{ t('journalPage.attentionFilterBanner') }}
      </p>
      <RouterLink :to="journalAllEntriesRoute()" class="journal-filter-banner__clear">
        {{ t('journalPage.showAllEntries') }}
      </RouterLink>
    </div>

    <HealthEntryFormModal
      :open="entryModalOpen"
      :edit-entry="editingEntry"
      @close="closeEntryModal"
      @submitted="onEntrySaved"
    />

    <section class="page-section log-section">
      <SectionHeader
        :title="sectionTitle"
        :subtitle="sectionSubtitle"
        class="page-section-title"
      />

      <div v-if="loading" class="page-loading">{{ t('journalPage.loading') }}</div>

      <div v-else-if="displayedEntries.length === 0" class="page-empty">
        <span class="page-empty__title">{{ emptyTitle }}</span>
        <p>{{ emptyText }}</p>
        <RouterLink
          v-if="singleEntryViewActive || attentionFilterActive"
          :to="singleEntryViewActive ? backFromSingleEntryRoute : journalAllEntriesRoute()"
          class="link-cta"
        >
          {{
            singleEntryViewActive
              ? backFromSingleEntryLabel
              : t('journalPage.showAllEntries')
          }}
        </RouterLink>
        <button
          v-else
          type="button"
          class="btn-new-entry btn-new-entry--inline"
          @click="openNewEntry"
        >
          {{ t('journalPage.newEntry') }}
        </button>
      </div>

      <div v-else class="entries-list">
        <HealthEntryCard
          v-for="entry in displayedEntries"
          :key="entry.id"
          :entry="entry"
          :highlighted="entry.id === highlightEntryId"
          @edit="openEditEntry"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/PageHeader.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import HealthEntryFormModal from '@/components/HealthEntryFormModal.vue'
import HealthEntryCard from '@/components/HealthEntryCard.vue'
import { getHealthEntries } from '@/api/healthApi'
import { localizedClassificationForEntry } from '@/services/localizeClinical'
import {
  isAttentionUrgency,
  journalAllEntriesRoute,
  journalAttentionListRoute,
  JOURNAL_ATTENTION_FILTER,
} from '@/utils/journalRoutes'
import type { HealthEntry } from '@/models/types'

const { t } = useI18n()
const route = useRoute()

const loading = ref(true)
const entryModalOpen = ref(false)
const editingEntry = ref<HealthEntry | null>(null)
const entries = ref<HealthEntry[]>([])
const successMessage = ref('')

const attentionFilterActive = computed(
  () => route.query.filter === JOURNAL_ATTENTION_FILTER
)

const highlightEntryId = computed(() => {
  const raw = route.query.entry
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null
})

const singleEntryViewActive = computed(() => Boolean(highlightEntryId.value))

const backFromSingleEntryRoute = computed(() =>
  attentionFilterActive.value
    ? journalAttentionListRoute()
    : journalAllEntriesRoute()
)

const backFromSingleEntryLabel = computed(() =>
  attentionFilterActive.value
    ? t('journalPage.backToAttentionEntries')
    : t('journalPage.backToAllEntries')
)

const displayedEntries = computed(() => {
  const id = highlightEntryId.value
  if (id) {
    const match = entries.value.find((e) => e.id === id)
    if (match) return [match]
  }
  if (attentionFilterActive.value) {
    return entries.value.filter((e) => isAttentionUrgency(e.analysis.urgency))
  }
  return entries.value
})

const sectionTitle = computed(() => {
  if (singleEntryViewActive.value) return t('journalPage.singleEntryTitle')
  if (attentionFilterActive.value) return t('journalPage.attentionRecordsTitle')
  return t('journalPage.recordsTitle')
})

const sectionSubtitle = computed(() => {
  if (singleEntryViewActive.value) return t('journalPage.singleEntrySubtitle')
  if (attentionFilterActive.value) {
    return t('journalPage.attentionRecordsSubtitle', {
      count: displayedEntries.value.length,
    })
  }
  return t('journalPage.recordsSubtitle')
})

const emptyTitle = computed(() => {
  if (singleEntryViewActive.value) return t('journalPage.entryNotFoundTitle')
  if (attentionFilterActive.value) return t('journalPage.noAttentionTitle')
  return t('journalPage.noRecordsTitle')
})

const emptyText = computed(() => {
  if (singleEntryViewActive.value) return t('journalPage.entryNotFoundText')
  if (attentionFilterActive.value) return t('journalPage.noAttentionText')
  return t('journalPage.noRecordsText')
})

watch(
  () => [highlightEntryId.value, loading.value, displayedEntries.value.length],
  async () => {
    await scrollToHighlightedEntry()
  }
)

watch(
  () => route.query,
  async () => {
    await scrollToHighlightedEntry()
  }
)

async function scrollToHighlightedEntry() {
  const id = highlightEntryId.value
  if (!id || loading.value) return
  if (!displayedEntries.value.some((e) => e.id === id)) return

  await nextTick()
  const el = document.getElementById(`journal-entry-${id}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

loadEntries()

async function loadEntries() {
  loading.value = true
  try {
    entries.value = await getHealthEntries()
    await scrollToHighlightedEntry()
  } finally {
    loading.value = false
  }
}

function openNewEntry() {
  editingEntry.value = null
  entryModalOpen.value = true
}

function closeEntryModal() {
  entryModalOpen.value = false
  editingEntry.value = null
}

function openEditEntry(entry: HealthEntry) {
  editingEntry.value = entry
  entryModalOpen.value = true
}

function onEntrySaved(entry: HealthEntry) {
  const wasEdit = Boolean(editingEntry.value?.id)
  entries.value = [entry, ...entries.value.filter((e) => e.id !== entry.id)]
  successMessage.value = wasEdit
    ? t('journalPage.entryUpdated', {
        classification: localizedClassificationForEntry(entry, t),
      })
    : `${t('journalPage.entrySaved', {
        classification: localizedClassificationForEntry(entry, t),
      })} ${t('journalPage.entrySavedTimeline')}`
  editingEntry.value = null
  window.setTimeout(() => {
    successMessage.value = ''
  }, 8000)
}
</script>

<style scoped>
.log-section {
  margin-bottom: 0;
}

.journal-focus-banner {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  background: var(--bg-surface);
}

.journal-focus-banner__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  width: fit-content;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-strong);
  text-decoration: none;
}

.journal-focus-banner__back:hover {
  text-decoration: underline;
}

.journal-focus-banner__back-icon {
  font-size: 1rem;
  line-height: 1;
}

.journal-focus-banner__hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.45;
}

.journal-filter-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem 1rem;
  margin-bottom: 1rem;
}

.journal-filter-banner__text {
  margin: 0;
  flex: 1;
  min-width: 12rem;
}

.journal-filter-banner__clear {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-strong);
  text-decoration: none;
  white-space: nowrap;
}

.journal-filter-banner__clear:hover {
  text-decoration: underline;
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

.link-cta {
  display: inline-block;
  margin-top: 0.75rem;
  color: var(--accent-strong);
  text-decoration: none;
  font-weight: 600;
}

.link-cta:hover {
  text-decoration: underline;
}
</style>
