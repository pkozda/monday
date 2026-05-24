<template>
  <form class="health-entry-form" @submit.prevent="handleSubmit">
    <p class="form-lang-hint">
      {{ t('entryForm.langHint') }}
    </p>

    <div class="form-grid">
      <div class="form-field form-field--full">
        <label for="eventDate">{{ t('entryForm.eventDate') }}</label>
        <input
          id="eventDate"
          v-model="form.eventDate"
          type="date"
          required
          :max="today"
        />
      </div>

      <fieldset class="form-field form-field--full entry-type-fieldset">
        <legend class="entry-type-legend">{{ t('entryForm.entryType') }}</legend>
        <p class="field-hint entry-type-intro">
          {{ t('entryForm.entryTypeHint') }}
        </p>

        <div
          v-for="group in entryTypeGroups"
          :key="group.titleKey"
          class="entry-type-group"
        >
          <h3 class="entry-type-group-title">
            {{ t(group.titleKey) }}
          </h3>
          <div class="entry-type-grid">
            <label
              v-for="entryType in group.types"
              :key="entryType"
              class="entry-type-card"
              :class="{ 'entry-type-card--active': form.entryType === entryType }"
            >
              <input
                v-model="form.entryType"
                type="radio"
                class="entry-type-radio"
                :value="entryType"
              />
              <span class="entry-type-card-label">
                {{ t(`entryForm.types.${entryType}.label`) }}
              </span>
              <span class="entry-type-card-hint">
                {{ t(`entryForm.types.${entryType}.hint`) }}
              </span>
            </label>
          </div>
        </div>
      </fieldset>

      <div class="form-field form-field--full">
        <label for="conditionArea">{{ conditionAreaLabel }}</label>
        <input
          id="conditionArea"
          v-model="form.conditionArea"
          type="text"
          :required="bodyAreaRequired"
          :placeholder="conditionAreaPlaceholder"
          autocomplete="off"
        />
        <p class="field-hint">
          {{ conditionAreaHint }}
        </p>
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

      <div
        v-if="showSeverity"
        class="form-field form-field--full"
      >
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
      <button
        v-if="isEditMode"
        type="button"
        class="btn-secondary"
        :disabled="submitting"
        @click="handleCancel"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        v-else
        type="button"
        class="btn-secondary"
        :disabled="submitting"
        @click="resetForm"
      >
        {{ t('entryForm.clearForm') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { createHealthEntry, updateHealthEntry } from '@/api/healthApi'
import { useLocale } from '@/composables/useLocale'
import type { AppLocale } from '@/i18n'
import { buildJournalShortTitle } from '@/services/journalEntryText'
import { entryNeedsTranslation } from '@/services/translation'
import {
  ENTRY_FORM_TYPE_GROUPS,
  entryTypeRequiresBodyArea,
  entryTypeShowsMedications,
  entryTypeShowsSeverity,
  resolveConditionAreaForSave,
} from '@/services/entryTypeFormConfig'
import {
  clearFormDraft,
  readFormDraft,
  writeFormDraft,
} from '@/utils/formDraftStorage'
import type { HealthEntry, HealthEntryInput, HealthEntryType } from '@/models/types'

const { t } = useI18n()
const { locale } = useLocale()

const HEALTH_ENTRY_DRAFT_KEY = 'monday-health-entry-draft'

type HealthEntryDraft = HealthEntryInput & { severity?: number }

const props = withDefaults(
  defineProps<{
    initialConditionArea?: string
    editEntry?: HealthEntry | null
  }>(),
  { initialConditionArea: '', editEntry: null }
)

const emit = defineEmits<{
  submitted: [entry: HealthEntry]
  cancel: []
}>()

const entryTypeGroups = ENTRY_FORM_TYPE_GROUPS

const isEditMode = computed(() => Boolean(props.editEntry?.id))
const today = new Date().toISOString().slice(0, 10)

function emptyForm(): HealthEntryDraft {
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

function isDraftEmpty(draft: HealthEntryDraft): boolean {
  return (
    !draft.conditionArea.trim() &&
    !draft.title.trim() &&
    !draft.description.trim() &&
    !(draft.medications?.trim() ?? '') &&
    draft.severity === undefined
  )
}

function entryToDraft(entry: HealthEntry): HealthEntryDraft {
  const eventDate = entry.eventDate.slice(0, 10)
  return {
    eventDate,
    conditionArea: entry.conditionArea,
    entryType: entry.entryType,
    title: entry.title,
    description: entry.description,
    medications: entry.medications ?? '',
    severity: entry.severity,
  }
}

function loadInitialForm(): HealthEntryDraft {
  if (props.editEntry) return entryToDraft(props.editEntry)
  const saved = readFormDraft<HealthEntryDraft>(HEALTH_ENTRY_DRAFT_KEY)
  if (!saved) return emptyForm()
  return {
    ...emptyForm(),
    ...saved,
    medications: saved.medications ?? '',
  }
}

const form = reactive(loadInitialForm())
const submitting = ref(false)
const error = ref('')

const bodyAreaRequired = computed(() =>
  entryTypeRequiresBodyArea(form.entryType)
)

const conditionAreaLabel = computed(() =>
  bodyAreaRequired.value
    ? t('entryForm.conditionArea')
    : t('entryForm.conditionAreaOptional')
)

const conditionAreaHint = computed(() =>
  bodyAreaRequired.value
    ? t('entryForm.conditionAreaHintRequired')
    : t('entryForm.conditionAreaHintOptional')
)

const conditionAreaPlaceholder = computed(() => {
  if (bodyAreaRequired.value) return 'e.g. Left leg / левая нога'
  if (form.entryType === 'lab_test') return 'e.g. General / общий (optional)'
  if (form.entryType === 'surgery') return 'e.g. Right knee / правое колено (optional)'
  return 'e.g. General health (optional)'
})

const showMedications = computed(() => entryTypeShowsMedications(form.entryType))

const showSeverity = computed(() => entryTypeShowsSeverity(form.entryType))

const titlePlaceholder = computed(() => {
  const map: Record<HealthEntryType, string> = {
    symptom: 'e.g. Leg pain after walking',
    change: 'e.g. Swelling reduced',
    medication: 'e.g. Pregabalin started',
    doctor_visit: 'e.g. Orthopedist · 2019',
    lab_test: 'e.g. CBC · Mar 2024',
    imaging: 'e.g. MRI — knee',
    surgery: 'e.g. Knee arthroscopy · 2019',
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
    lab_test:
      'Test name, key values, reference ranges, date… / Какой анализ, результаты, дата…',
    imaging:
      'What was done, findings, and next steps… / Что делали, результаты, что дальше…',
    surgery:
      'Procedure, hospital, recovery, complications… / Операция, стационар, восстановление…',
    other:
      'Full context for this note… / Всё важное о вашем состоянии…',
  }
  return map[form.entryType]
})

watch(
  () => form.entryType,
  (type) => {
    if (!entryTypeShowsSeverity(type)) {
      form.severity = undefined
    }
  }
)

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
  if (!submitting.value) {
    return isEditMode.value
      ? t('entryForm.saveChanges')
      : t('entryForm.saveHealthRecord')
  }
  const draft: HealthEntryInput = {
    eventDate: form.eventDate,
    conditionArea: form.conditionArea,
    entryType: form.entryType,
    title: form.title,
    description: form.description,
    medications: form.medications?.trim() || undefined,
    severity: form.severity,
  }
  return entryNeedsTranslation(draft, locale.value as AppLocale)
    ? t('entryForm.translating')
    : t('entryForm.savingAnalyzing')
})

let draftSaveTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.editEntry,
  (entry) => {
    if (entry) {
      Object.assign(form, entryToDraft(entry))
      error.value = ''
    }
  }
)

watch(
  form,
  () => {
    if (isEditMode.value) return
    if (draftSaveTimer) clearTimeout(draftSaveTimer)
    draftSaveTimer = setTimeout(() => {
      const snapshot: HealthEntryDraft = {
        eventDate: form.eventDate,
        conditionArea: form.conditionArea,
        entryType: form.entryType,
        title: form.title,
        description: form.description,
        medications: form.medications,
        severity: form.severity,
      }
      if (isDraftEmpty(snapshot)) {
        clearFormDraft(HEALTH_ENTRY_DRAFT_KEY)
      } else {
        writeFormDraft(HEALTH_ENTRY_DRAFT_KEY, snapshot)
      }
    }, 250)
  },
  { deep: true }
)

function resetForm() {
  if (isEditMode.value && props.editEntry) {
    Object.assign(form, entryToDraft(props.editEntry))
    error.value = ''
    return
  }
  clearFormDraft(HEALTH_ENTRY_DRAFT_KEY)
  Object.assign(form, emptyForm())
  error.value = ''
}

function handleCancel() {
  resetForm()
  emit('cancel')
}

async function handleSubmit() {
  error.value = ''

  const conditionArea = resolveConditionAreaForSave(
    form.conditionArea,
    form.entryType
  )

  if (entryTypeRequiresBodyArea(form.entryType) && !conditionArea) {
    error.value = t('entryForm.validationMissingBody')
    return
  }

  if (!form.title.trim() || !form.description.trim()) {
    error.value = t('entryForm.validationMissingCore')
    return
  }

  if (form.entryType === 'medication' && !form.medications?.trim()) {
    error.value = t('entryForm.validationMedication')
    return
  }

  submitting.value = true
  try {
    const input: HealthEntryInput = {
      eventDate: form.eventDate,
      conditionArea,
      entryType: form.entryType,
      title: form.title,
      description: form.description,
      medications: form.medications?.trim() || undefined,
      severity: form.severity,
    }
    const entry = isEditMode.value
      ? await updateHealthEntry(props.editEntry!.id, input, {
          appLocale: locale.value as AppLocale,
        })
      : await createHealthEntry(input, {
          appLocale: locale.value as AppLocale,
        })
    if (!isEditMode.value) {
      const savedArea = form.conditionArea
      resetForm()
      form.conditionArea = savedArea
    }
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
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.form-field--full {
  grid-column: 1 / -1;
}

.form-field label,
.entry-type-legend {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.entry-type-fieldset {
  border: none;
  margin: 0;
  padding: 0;
}

.entry-type-intro {
  margin-top: 0;
}

.entry-type-group {
  margin-top: 1rem;
}

.entry-type-group-title {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.entry-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
  gap: 0.5rem;
}

.entry-type-radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.entry-type-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--bg-input);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.entry-type-card:hover {
  border-color: var(--accent);
}

.entry-type-card--active {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, var(--bg-input));
  box-shadow: 0 0 0 1px var(--accent);
}

.entry-type-card-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0 0 0.4rem;
}

.entry-type-card-hint {
  display: block;
  font-size: 0.72rem;
  line-height: 1.35;
  color: var(--text-muted);
  margin: 0;
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
</style>
