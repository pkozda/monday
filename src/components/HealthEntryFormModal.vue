<template>
  <Teleport to="body">
    <div
      v-show="open"
      class="health-entry-modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-hidden="!open"
      aria-labelledby="health-entry-modal-title"
      @click.self="close"
    >
      <div class="health-entry-modal-dialog">
        <header class="health-entry-modal-header">
          <h2 id="health-entry-modal-title">{{ modalTitle }}</h2>
          <button
            type="button"
            class="health-entry-modal-close"
            :aria-label="t('common.close')"
            @click="close"
          >
            ×
          </button>
        </header>

        <p class="health-entry-modal-intro">
          {{ modalIntro }}
        </p>

        <HealthEntryForm
          ref="formRef"
          :edit-entry="editEntry"
          @submitted="onSubmitted"
          @cancel="close"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import HealthEntryForm from '@/components/HealthEntryForm.vue'
import type { HealthEntry } from '@/models/types'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  editEntry?: HealthEntry | null
}>()

const emit = defineEmits<{
  close: []
  submitted: [entry: HealthEntry]
}>()

const formRef = ref<InstanceType<typeof HealthEntryForm> | null>(null)

const isEditMode = computed(() => Boolean(props.editEntry?.id))

const modalTitle = computed(() =>
  isEditMode.value
    ? t('journalPage.editEntryModalTitle')
    : t('journalPage.newEntryModalTitle')
)

const modalIntro = computed(() =>
  isEditMode.value
    ? t('journalPage.editEntryModalIntro')
    : t('journalPage.newEntryModalIntro')
)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    if (props.editEntry && formRef.value) {
      formRef.value.resetForm()
    }
  }
)

function close() {
  emit('close')
}

function onSubmitted(entry: HealthEntry) {
  if (!isEditMode.value) {
    formRef.value?.resetForm()
  }
  emit('submitted', entry)
  emit('close')
}
</script>

<style scoped>
.health-entry-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.health-entry-modal-dialog {
  width: 100%;
  max-width: 640px;
  max-height: min(92vh, 820px);
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 1.25rem 1.5rem 1.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.health-entry-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.health-entry-modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.health-entry-modal-close {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  background: var(--bg-muted);
  color: var(--text-muted);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
  font-family: inherit;
}

.health-entry-modal-close:hover {
  background: var(--border);
  color: var(--text-primary);
}

.health-entry-modal-intro {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.health-entry-modal-dialog :deep(.health-entry-form) {
  border: none;
  padding: 0;
  background: transparent;
}

.health-entry-modal-dialog :deep(.form-lang-hint) {
  margin-top: 0;
}
</style>
