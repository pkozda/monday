<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="health-entry-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="health-entry-modal-title"
      @click.self="close"
    >
      <div class="health-entry-modal-dialog">
        <header class="health-entry-modal-header">
          <h2 id="health-entry-modal-title">New journal entry</h2>
          <button
            type="button"
            class="health-entry-modal-close"
            aria-label="Close"
            @click="close"
          >
            ×
          </button>
        </header>

        <p class="health-entry-modal-intro">
          Describe what you are experiencing in English or Russian — entries are
          stored in English and analyzed automatically.
        </p>

        <HealthEntryForm ref="formRef" @submitted="onSubmitted" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import HealthEntryForm from '@/components/HealthEntryForm.vue'
import type { HealthEntry } from '@/models/types'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  submitted: [entry: HealthEntry]
}>()

const formRef = ref<InstanceType<typeof HealthEntryForm> | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) return
    formRef.value?.resetForm()
  }
)

function close() {
  emit('close')
}

function onSubmitted(entry: HealthEntry) {
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
