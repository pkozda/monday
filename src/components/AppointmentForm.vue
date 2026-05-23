<template>
  <form class="appointment-form" @submit.prevent="handleSubmit">
    <div class="form-grid">
      <div class="form-field">
        <label for="apptDate">{{ t('appointmentForm.date') }}</label>
        <input id="apptDate" v-model="form.date" type="date" required />
      </div>
      <div class="form-field">
        <label for="apptTime">{{ t('appointmentForm.time') }}</label>
        <input id="apptTime" v-model="form.time" type="time" required />
      </div>

      <div class="form-field form-field--full">
        <label for="doctorName">{{ t('appointmentForm.doctorName') }}</label>
        <input
          id="doctorName"
          v-model="form.doctorName"
          type="text"
          required
          placeholder="e.g. Dr. Anna Petrova"
          autocomplete="name"
        />
      </div>

      <div class="form-field form-field--full">
        <label for="clinicName">{{ t('appointmentForm.clinicName') }}</label>
        <input
          id="clinicName"
          v-model="form.clinicName"
          type="text"
          placeholder="e.g. City Medical Center"
          autocomplete="organization"
        />
      </div>

      <div class="form-field form-field--full">
        <label for="specialty">{{ t('appointmentForm.specialty') }}</label>
        <input
          id="specialty"
          v-model="form.specialty"
          type="text"
          required
          placeholder="e.g. Orthopedics, cardiology"
          autocomplete="off"
        />
      </div>

      <div class="form-field form-field--full">
        <label for="address">{{ t('appointmentForm.address') }}</label>
        <input
          id="address"
          v-model="form.address"
          type="text"
          required
          placeholder="Street, city, or clinic address"
          autocomplete="street-address"
        />
      </div>

      <div class="form-field form-field--full">
        <label for="notes">{{ t('appointmentForm.notes') }}</label>
        <textarea
          id="notes"
          v-model="form.notes"
          rows="3"
          placeholder="What to bring, referral, questions for the doctor…"
        />
      </div>
    </div>

    <p v-if="error" class="form-error" role="alert">{{ error }}</p>

    <div class="form-actions">
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? t('appointmentForm.saving') : t('appointmentForm.addAppointment') }}
      </button>
      <button
        type="button"
        class="btn-secondary"
        :disabled="submitting"
        @click="resetForm"
      >
        {{ t('appointmentForm.clearForm') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { createAppointment } from '@/api/appointmentsApi'

const { t } = useI18n()
import {
  combineDateAndTime,
  defaultAppointmentDateTime,
} from '@/services/appointmentUtils'
import type { DoctorAppointment } from '@/models/types'

const emit = defineEmits<{
  submitted: [appointment: DoctorAppointment]
}>()

const defaults = defaultAppointmentDateTime()

const form = reactive({
  date: defaults.date,
  time: defaults.time,
  doctorName: '',
  clinicName: '',
  specialty: '',
  address: '',
  notes: '',
})

const submitting = ref(false)
const error = ref('')

function resetForm() {
  const d = defaultAppointmentDateTime()
  form.date = d.date
  form.time = d.time
  form.doctorName = ''
  form.clinicName = ''
  form.specialty = ''
  form.address = ''
  form.notes = ''
  error.value = ''
}

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    const scheduledAt = combineDateAndTime(form.date, form.time)
    const appointment = await createAppointment({
      scheduledAt,
      doctorName: form.doctorName,
      clinicName: form.clinicName || undefined,
      specialty: form.specialty,
      address: form.address,
      notes: form.notes || undefined,
    })
    emit('submitted', appointment)
    resetForm()
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'Could not save. Please try again.'
  } finally {
    submitting.value = false
  }
}

defineExpose({ resetForm })
</script>

<style scoped>
.appointment-form {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.form-field--full {
  grid-column: 1 / -1;
}

.form-field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.form-field input[type='text'],
.form-field input[type='date'],
.form-field input[type='time'],
.form-field textarea {
  width: 100%;
  padding: 0.65rem 0.75rem;
  background: var(--bg-input);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.form-field textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.form-error {
  color: var(--danger, #c62828);
  font-size: 0.875rem;
  margin: 1rem 0 0;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.65rem 1.25rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.btn-primary {
  background: var(--accent-strong);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-secondary);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text-primary);
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
