<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="appointment-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
      @click.self="close"
    >
      <div class="appointment-modal-dialog">
        <header class="appointment-modal-header">
          <h2 id="appointment-modal-title">{{ t('appointmentsPage.addModalTitle') }}</h2>
          <button
            type="button"
            class="appointment-modal-close"
            :aria-label="t('common.close')"
            @click="close"
          >
            ×
          </button>
        </header>

        <p class="appointment-modal-intro">
          {{ t('appointmentsPage.modalIntro') }}
        </p>

        <AppointmentForm ref="formRef" @submitted="onSubmitted" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppointmentForm from '@/components/AppointmentForm.vue'

const { t } = useI18n()
import type { DoctorAppointment } from '@/models/types'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  submitted: [appointment: DoctorAppointment]
}>()

const formRef = ref<InstanceType<typeof AppointmentForm> | null>(null)

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

function onSubmitted(appt: DoctorAppointment) {
  emit('submitted', appt)
  emit('close')
}
</script>

<style scoped>
.appointment-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.appointment-modal-dialog {
  width: 100%;
  max-width: 520px;
  max-height: min(92vh, 720px);
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 1.25rem 1.5rem 1.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
}

.appointment-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.appointment-modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.appointment-modal-close {
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

.appointment-modal-close:hover {
  background: var(--border);
  color: var(--text-primary);
}

.appointment-modal-intro {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.appointment-modal-dialog :deep(.appointment-form) {
  border: none;
  padding: 0;
  background: transparent;
}
</style>
