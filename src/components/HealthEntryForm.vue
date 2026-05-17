<template>
  <form class="health-entry-form" @submit.prevent="handleSubmit">
    <p class="form-lang-hint">
      English and Russian (Русский) are supported. Russian text is translated to
      English before saving so analysis and your timeline stay consistent.
    </p>

    <div class="form-grid">
      <div class="form-field">
        <label for="eventDate">When did this happen?</label>
        <input
          id="eventDate"
          v-model="form.eventDate"
          type="date"
          required
          :max="today"
        />
      </div>

      <div class="form-field">
        <label for="conditionArea">Body area / condition</label>
        <input
          id="conditionArea"
          v-model="form.conditionArea"
          type="text"
          required
          placeholder="e.g. Left leg / левая нога"
          autocomplete="off"
        />
      </div>

      <div class="form-field form-field--full">
        <label for="entryType">What are you recording?</label>
        <select id="entryType" v-model="form.entryType" required>
          <option value="symptom">Symptoms</option>
          <option value="change">Change in condition</option>
          <option value="medication">Medication / prescription</option>
          <option value="doctor_visit">Doctor visit or advice</option>
          <option value="imaging">Test or imaging</option>
          <option value="other">Other health note</option>
        </select>
      </div>

      <div class="form-field form-field--full">
        <label for="title">Short summary</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          :placeholder="titlePlaceholder"
          autocomplete="off"
        />
      </div>

      <div class="form-field form-field--full">
        <label for="description">Describe what you are experiencing</label>
        <textarea
          id="description"
          v-model="form.description"
          required
          rows="5"
          :placeholder="descriptionPlaceholder"
        />
      </div>

      <div
        v-if="showMedications"
        class="form-field form-field--full"
      >
        <label for="medications">Medications (name, dose, how often)</label>
        <input
          id="medications"
          v-model="form.medications"
          type="text"
          placeholder="e.g. Ibuprofen 400mg, twice daily"
          autocomplete="off"
        />
      </div>

      <div class="form-field">
        <label for="severity">
          Severity (optional)
          <span v-if="form.severity" class="severity-value">{{ form.severity }}/10</span>
        </label>
        <input
          id="severity"
          v-model.number="form.severity"
          type="range"
          min="1"
          max="10"
          step="1"
        />
        <button
          v-if="form.severity"
          type="button"
          class="clear-severity"
          @click="form.severity = undefined"
        >
          Clear
        </button>
      </div>
    </div>

    <p v-if="error" class="form-error" role="alert">{{ error }}</p>

    <div class="form-actions">
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitLabel }}
      </button>
      <button type="button" class="btn-secondary" :disabled="submitting" @click="resetForm">
        Clear form
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { createHealthEntry } from '@/api/healthApi'
import { entryNeedsTranslation } from '@/services/translation'
import type { HealthEntry, HealthEntryInput, HealthEntryType } from '@/models/types'

const props = withDefaults(
  defineProps<{
    initialConditionArea?: string
  }>(),
  { initialConditionArea: '' }
)

const emit = defineEmits<{
  submitted: [entry: HealthEntry]
}>()

const today = new Date().toISOString().slice(0, 10)

function defaultForm(): HealthEntryInput & { severity?: number } {
  return {
    eventDate: today,
    conditionArea: props.initialConditionArea,
    entryType: 'symptom',
    title: '',
    description: '',
    medications: '',
    severity: undefined,
  }
}

const form = reactive(defaultForm())
const submitting = ref(false)
const error = ref('')

const showMedications = computed(
  () =>
    form.entryType === 'medication' ||
    form.entryType === 'doctor_visit' ||
    Boolean(form.medications?.trim())
)

const titlePlaceholder = computed(() => {
  const map: Record<HealthEntryType, string> = {
    symptom: 'e.g. Sharp pain when walking / острая боль при ходьбе',
    change: 'e.g. Swelling reduced / отёк уменьшился',
    medication: 'e.g. Started prescribed pills / начал принимать таблетки',
    doctor_visit: 'e.g. Orthopedist follow-up / приём у ортопеда',
    imaging: 'e.g. X-ray of left knee / рентген левого колена',
    other: 'e.g. Sleep affected by pain / боль мешает спать',
  }
  return map[form.entryType]
})

const descriptionPlaceholder = computed(() => {
  const map: Record<HealthEntryType, string> = {
    symptom:
      'What you feel, when it started… / Что чувствуете, когда началось…',
    change:
      'Better, worse, or new symptoms… / Стало лучше, хуже или новые симптомы…',
    medication:
      'Prescription, when started, side effects… / Назначение, когда начали, побочные эффекты…',
    doctor_visit:
      'What the doctor said, next steps… / Что сказал врач, рекомендации…',
    imaging:
      'What was done and results… / Что делали и результаты…',
    other:
      'Anything relevant to your health… / Всё важное о вашем состоянии…',
  }
  return map[form.entryType]
})

const submitLabel = computed(() => {
  if (!submitting.value) return 'Save health record'
  const draft: HealthEntryInput = {
    eventDate: form.eventDate,
    conditionArea: form.conditionArea,
    entryType: form.entryType,
    title: form.title,
    description: form.description,
    medications: form.medications?.trim() || undefined,
    severity: form.severity,
  }
  return entryNeedsTranslation(draft)
    ? 'Translating & saving…'
    : 'Saving & analyzing…'
})

function resetForm() {
  Object.assign(form, defaultForm())
  error.value = ''
}

async function handleSubmit() {
  error.value = ''

  if (!form.conditionArea.trim() || !form.title.trim() || !form.description.trim()) {
    error.value = 'Please fill in the body area, summary, and description.'
    return
  }

  if (form.entryType === 'medication' && !form.medications?.trim()) {
    error.value = 'Please list the medication name and dosage.'
    return
  }

  submitting.value = true
  try {
    const input: HealthEntryInput = {
      eventDate: form.eventDate,
      conditionArea: form.conditionArea,
      entryType: form.entryType,
      title: form.title,
      description: form.description,
      medications: form.medications?.trim() || undefined,
      severity: form.severity,
    }
    const entry = await createHealthEntry(input)
    const savedArea = form.conditionArea
    resetForm()
    form.conditionArea = savedArea
    emit('submitted', entry)
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
.health-entry-form {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1.5rem;
}

.form-lang-hint {
  font-size: 0.875rem;
  color: #999;
  line-height: 1.5;
  margin: 0 0 1.25rem;
  padding: 0.75rem 1rem;
  background: #252525;
  border-radius: 6px;
  border-left: 3px solid #64b5f6;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-field--full {
  grid-column: 1 / -1;
}

.form-field label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #b0b0b0;
  margin-bottom: 0.5rem;
}

.severity-value {
  color: #64b5f6;
  font-weight: 600;
  margin-left: 0.5rem;
}

.form-field input[type='text'],
.form-field input[type='date'],
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 0.65rem 0.75rem;
  background: #121212;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #64b5f6;
}

.form-field textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.form-field input[type='range'] {
  width: 100%;
  accent-color: #64b5f6;
}

.clear-severity {
  margin-top: 0.35rem;
  background: none;
  border: none;
  color: #999;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
}

.clear-severity:hover {
  color: #e0e0e0;
}

.form-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #3a1e1e;
  border: 1px solid #c62828;
  border-radius: 6px;
  color: #ef9a9a;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
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
  background: #1976d2;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #2a2a2a;
  color: #e0e0e0;
  border: 1px solid #444;
}

.btn-secondary:hover:not(:disabled) {
  background: #333;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
