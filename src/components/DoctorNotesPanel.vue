<template>
  <div class="doctor-notes-panel" :class="{ 'doctor-notes-panel--compact': compact }">
    <div
      v-if="loading"
      class="doctor-notes-panel__loading"
      role="status"
      aria-live="polite"
      :aria-label="generatingText"
    >
      <span class="doctor-notes-panel__spinner" aria-hidden="true" />
      <p class="doctor-notes-panel__loading-text">{{ generatingText }}</p>
    </div>
    <p v-else class="doctor-notes-panel__intro">
      {{ introText }}
    </p>

    <div v-if="showSpecialtySelector" class="doctor-notes-panel__specialty">
      <label class="doctor-notes-panel__specialty-label" for="doctor-specialty-select">
        {{ t('doctorNotes.specialtyLabel') }}
      </label>
      <div class="doctor-notes-panel__specialty-field">
        <select
          id="doctor-specialty-select"
          class="doctor-notes-panel__specialty-select"
          :value="specialty"
          :disabled="loading"
          @change="onSpecialtyChange"
        >
          <option v-for="id in specialtyIds" :key="id" :value="id">
            {{ t(`doctorSpecialty.${id}`) }}
          </option>
        </select>
        <span class="doctor-notes-panel__specialty-chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>
      <p class="doctor-notes-panel__specialty-hint">
        {{ t(`doctorNotes.specialtyFocus.${specialty}`) }}
      </p>
    </div>

    <div class="doctor-notes-panel__textarea-wrap">
      <textarea
        v-model="notesText"
        class="doctor-notes-panel__textarea"
        :class="{ 'doctor-notes-panel__textarea--loading': loading }"
        rows="18"
        spellcheck="true"
        :disabled="loading"
        :aria-busy="loading"
        :aria-label="t('doctorNotes.notesLabel')"
      />
      <div v-if="loading" class="doctor-notes-panel__textarea-overlay" aria-hidden="true">
        <span class="doctor-notes-panel__spinner doctor-notes-panel__spinner--lg" />
      </div>
    </div>

    <div class="doctor-notes-panel__actions">
      <button type="button" class="btn-secondary" :disabled="loading" @click="copyNotes">
        {{ copied ? t('doctorNotes.copied') : t('doctorNotes.copy') }}
      </button>
      <button type="button" class="btn-primary" :disabled="loading" @click="printNotes">
        {{ t('doctorNotes.print') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DOCTOR_SPECIALTY_IDS, type DoctorSpecialtyId } from '@/services/doctorSpecialty'

const props = withDefaults(
  defineProps<{
    content: string
    loading?: boolean
    intro?: string
    generatingLabel?: string
    showSpecialtySelector?: boolean
    specialty?: DoctorSpecialtyId
    compact?: boolean
  }>(),
  {
    loading: false,
    showSpecialtySelector: false,
    specialty: 'primary_care',
    compact: false,
  }
)

const emit = defineEmits<{
  'update:specialty': [value: DoctorSpecialtyId]
  'specialty-change': [value: DoctorSpecialtyId]
}>()

const { t } = useI18n()

const specialtyIds = DOCTOR_SPECIALTY_IDS

const introText = computed(() => props.intro ?? t('doctorNotes.intro'))
const generatingText = computed(
  () => props.generatingLabel ?? t('doctorNotes.generating')
)

const notesText = ref('')
const copied = ref(false)

watch(
  () => props.content,
  (value) => {
    notesText.value = value
  },
  { immediate: true }
)

function onSpecialtyChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as DoctorSpecialtyId
  emit('update:specialty', value)
  emit('specialty-change', value)
}

async function copyNotes() {
  try {
    await navigator.clipboard.writeText(notesText.value)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copied.value = false
  }
}

function printNotes() {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) return

  const escaped = notesText.value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Doctor visit notes</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 2cm; color: #111; }
  pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; margin: 0; }
</style></head>
<body><pre>${escaped}</pre></body></html>`)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
</script>

<style scoped>
.doctor-notes-panel__intro {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.doctor-notes-panel__loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1rem;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--accent-strong) 28%, var(--border));
  background: color-mix(in srgb, var(--accent-strong) 8%, var(--bg-muted));
}

.doctor-notes-panel__loading-text {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.45;
}

.doctor-notes-panel__spinner {
  flex-shrink: 0;
  width: 1.15rem;
  height: 1.15rem;
  border: 2px solid color-mix(in srgb, var(--accent-strong) 22%, transparent);
  border-top-color: var(--accent-strong);
  border-radius: 50%;
  animation: doctor-notes-panel-spin 0.65s linear infinite;
}

.doctor-notes-panel__spinner--lg {
  width: 1.75rem;
  height: 1.75rem;
  border-width: 2.5px;
}

@keyframes doctor-notes-panel-spin {
  to {
    transform: rotate(360deg);
  }
}

.doctor-notes-panel__textarea-wrap {
  position: relative;
}

.doctor-notes-panel__textarea--loading {
  color: transparent;
  caret-color: transparent;
}

.doctor-notes-panel__textarea-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: color-mix(in srgb, var(--bg-surface) 72%, transparent);
  pointer-events: none;
}

.doctor-notes-panel__specialty {
  margin-bottom: 1rem;
}

.doctor-notes-panel__specialty-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.doctor-notes-panel__specialty-field {
  position: relative;
  display: flex;
  align-items: stretch;
}

.doctor-notes-panel__specialty-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  padding: 0.7rem 3rem 0.7rem 0.9rem;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 0.92rem;
  font-weight: 500;
  font-family: inherit;
  line-height: 1.35;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.doctor-notes-panel__specialty-select:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--accent-strong) 45%, var(--border-strong));
  background: color-mix(in srgb, var(--accent-strong) 4%, var(--bg-input));
}

.doctor-notes-panel__specialty-select:focus-visible {
  outline: none;
  border-color: var(--accent-strong);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-strong) 22%, transparent);
}

.doctor-notes-panel__specialty-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.doctor-notes-panel__specialty-chevron {
  position: absolute;
  top: 50%;
  right: 0.55rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 7px;
  color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent-strong) 14%, var(--bg-muted));
  border: 1px solid color-mix(in srgb, var(--accent-strong) 22%, var(--border));
  pointer-events: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.doctor-notes-panel__specialty-field:focus-within .doctor-notes-panel__specialty-chevron {
  background: color-mix(in srgb, var(--accent-strong) 22%, var(--bg-muted));
  border-color: color-mix(in srgb, var(--accent-strong) 40%, var(--border));
}

.doctor-notes-panel__specialty-hint {
  margin: 0.45rem 0 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--text-faint);
}

.doctor-notes-panel__textarea {
  width: 100%;
  padding: 0.85rem 1rem;
  background: var(--bg-input);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 280px;
  box-sizing: border-box;
}

.doctor-notes-panel--compact .doctor-notes-panel__textarea {
  min-height: 220px;
}

.doctor-notes-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  border-radius: 8px;
  padding: 0.6rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--accent-strong);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.55;
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
</style>
