<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="notes-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-notes-title"
      @click.self="emit('close')"
    >
      <div class="notes-dialog">
        <header class="notes-header">
          <h2 id="doctor-notes-title">{{ title ?? t('doctorNotes.title') }}</h2>
          <button type="button" class="notes-close" :aria-label="t('common.close')" @click="emit('close')">
            ×
          </button>
        </header>

        <DoctorNotesPanel
          :content="content"
          :loading="loading"
          :intro="intro"
          :generating-label="generatingLabel"
          :show-specialty-selector="showSpecialtySelector"
          :specialty="specialty"
          @update:specialty="emit('update:specialty', $event)"
          @specialty-change="emit('specialty-change', $event)"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import DoctorNotesPanel from '@/components/DoctorNotesPanel.vue'
import type { DoctorSpecialtyId } from '@/services/doctorSpecialty'

withDefaults(
  defineProps<{
    open: boolean
    content: string
    loading?: boolean
    title?: string
    intro?: string
    generatingLabel?: string
    showSpecialtySelector?: boolean
    specialty?: DoctorSpecialtyId
  }>(),
  {
    showSpecialtySelector: false,
    specialty: 'primary_care',
  }
)

const emit = defineEmits<{
  close: []
  'update:specialty': [value: DoctorSpecialtyId]
  'specialty-change': [value: DoctorSpecialtyId]
}>()

const { t } = useI18n()
</script>

<style scoped>
.notes-overlay {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(4px);
}

.notes-dialog {
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 16px 48px var(--shadow);
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.notes-header h2 {
  margin: 0;
  font-size: 1.35rem;
  color: var(--text-primary);
}

.notes-close {
  background: transparent;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
}

.notes-close:hover {
  color: var(--text-primary);
}
</style>
