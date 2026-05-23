<template>
  <form class="health-entry-form" @submit.prevent="handleSubmit">
    <p class="form-lang-hint">
      {{ t('entryForm.langHint') }}
    </p>

    <div class="form-grid">
      <div class="form-field">
        <label for="eventDate">{{ t('entryForm.eventDate') }}</label>
        <input
          id="eventDate"
          v-model="form.eventDate"
          type="date"
          required
          :max="today"
        />
      </div>

      <div class="form-field">
        <label for="conditionArea">{{ t('entryForm.conditionArea') }}</label>
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
        <label for="entryType">{{ t('entryForm.entryType') }}</label>
        <select id="entryType" v-model="form.entryType" required>
          <option value="symptom">{{ t('entryForm.optionSymptom') }}</option>
          <option value="change">{{ t('entryForm.optionChange') }}</option>
          <option value="medication">{{ t('entryForm.optionMedication') }}</option>
          <option value="doctor_visit">{{ t('entryForm.optionDoctorVisit') }}</option>
          <option value="imaging">{{ t('entryForm.optionImaging') }}</option>
          <option value="other">{{ t('entryForm.optionOther') }}</option>
        </select>
      </div>

      <div class="form-field form-field--full">
        <label for="description">{{ t('entryForm.description') }}</label>
        <textarea
          id="description"
          v-model="form.description"
          required
          rows="5"
          :placeholder="descriptionPlaceholder"
          @blur="maybeSuggestTitle"
        />
        <p class="field-hint">
          {{ t('entryForm.descriptionHint') }}
        </p>
      </div>

      <div class="form-field form-field--full">
        <label for="title">{{ t('entryForm.title') }}</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          maxlength="60"
          :placeholder="titlePlaceholder"
          autocomplete="off"
        />
        <p class="field-hint">
          {{ t('entryForm.titleHint') }}
        </p>
      </div>

      <div
        v-if="showMedications"
        class="form-field form-field--full"
      >
        <label for="medications">{{ t('entryForm.medications') }}</label>
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
          {{ t('entryForm.severity') }}
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
          {{ t('entryForm.clearSeverity') }}
        </button>
      </div>
    </div>

    <p v-if="error" class="form-error" role="alert">{{ error }}</p>

    <div class="form-actions">
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitLabel }}
      </button>
      <button type="button" class="btn-secondary" :disabled="submitting" @click="resetForm">
        {{ t('entryForm.clearForm') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { createHealthEntry } from '@/api/healthApi'

const { t } = useI18n()
import { buildJournalShortTitle } from '@/services/journalEntryText'
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
    symptom: 'e.g. Leg pain after walking',
    change: 'e.g. Swelling reduced',
    medication: 'e.g. Pregabalin started',
    doctor_visit: 'e.g. Orthopedist · 2019',
    imaging: 'e.g. MRI — knee',
    other: 'e.g. Sleep and pain',
  }
  return map[form.entryType]
})

const descriptionPlaceholder = computed(() => {
  const map: Record<HealthEntryType, string> = {
    symptom:
      'What you feel, when it started, what makes it better or worse… / Что чувствуете, когда началось…',
    change:
      'How things changed compared to before… / Стало лучше, хуже или новые симптомы…',
    medication:
      'Drug name, dose, when started, side effects… / Назначение, доза, побочные эффекты…',
    doctor_visit:
      'Who you saw, what was discussed, plan and follow-up… / Кто, что сказали, рекомендации…',
    imaging:
      'What was done, findings, and next steps… / Что делали, результаты, что дальше…',
    other:
      'Full context for this note… / Всё важное о вашем состоянии…',
  }
  return map[form.entryType]
})

function maybeSuggestTitle() {
  const description = form.description.trim()
  if (!description || form.title.trim().length >= 8) return
  form.title = buildJournalShortTitle(
    description,
    form.entryType,
    form.eventDate
  )
}

const submitLabel = computed(() => {
  if (!submitting.value) return t('entryForm.saveHealthRecord')
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
    ? t('entryForm.translating')
    : t('entryForm.savingAnalyzing')
})

function resetForm() {
  Object.assign(form, defaultForm())
  error.value = ''
}

async function handleSubmit() {
  error.value = ''

  if (!form.conditionArea.trim() || !form.title.trim() || !form.description.trim()) {
    error.value = 'Please fill in the body area, short title, and full details.'
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
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
}

.form-lang-hint {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0 0 1.25rem;
  padding: 0.75rem 1rem;
  background: var(--hint-bg);
  border-radius: 6px;
  border-left: 3px solid var(--hint-border);
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
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.field-hint {
  margin: 0.4rem 0 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--text-muted);
}

.severity-value {
  color: var(--accent);
  font-weight: 600;
  margin-left: 0.5rem;
}

.form-field input[type='text'],
.form-field input[type='date'],
.form-field select,
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
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.form-field textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.form-field input[type='range'] {
  width: 100%;
  accent-color: var(--accent);
}

.clear-severity {
  margin-top: 0.35rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
}

.clear-severity:hover {
  color: var(--text-primary);
}

.form-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 6px;
  color: var(--error-text);
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
  background: var(--bg-muted);
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--border);
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
