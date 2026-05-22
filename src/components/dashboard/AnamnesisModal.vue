<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="anamnesis-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="anamnesis-title"
      @click.self="close"
    >
      <div class="anamnesis-dialog">
        <header class="anamnesis-header">
          <h2 id="anamnesis-title">Health history (anamnesis)</h2>
          <button type="button" class="anamnesis-close" aria-label="Close" @click="close">
            ×
          </button>
        </header>

        <p class="anamnesis-intro">
          Describe your illness history in your own words—when symptoms started,
          tests, treatments, and changes over time. Monday will split this into
          journal entries and timeline events.
        </p>

        <form class="anamnesis-form" @submit.prevent="onImport">
          <div class="form-field">
            <label for="primaryArea">Main body area / condition</label>
            <input
              id="primaryArea"
              v-model="primaryArea"
              type="text"
              placeholder="e.g. Legs, lower back, left knee"
              autocomplete="off"
            />
            <span class="field-hint">
              Used when a paragraph does not mention a specific area.
            </span>
          </div>

          <div class="form-field">
            <label for="anamnesisText">Your health history</label>
            <textarea
              id="anamnesisText"
              v-model="text"
              rows="10"
              required
              placeholder="Example:&#10;&#10;• In 2019 I started having pain in both legs after long walks.&#10;• 2021 — MRI showed disc issues; neurologist prescribed pregabalin.&#10;• Last year symptoms got worse, pain about 7/10 most days."
            />
            <span class="field-hint">
              Use paragraphs or bullet points—one item per event or time period works best.
            </span>
          </div>

          <div v-if="preview.length" class="preview-block">
            <h3 class="preview-title">
              Preview — {{ preview.length }}
              {{ preview.length === 1 ? 'journal entry' : 'journal entries' }}
            </h3>
            <ul class="preview-list">
              <li v-for="(item, index) in preview" :key="index" class="preview-item">
                <span class="preview-date">{{ formatPreviewDate(item.eventDate) }}</span>
                <span class="preview-type">{{ previewClassification(item) }}</span>
                <strong class="preview-area">{{ item.conditionArea }}</strong>
                <p class="preview-title-text">{{ item.title }}</p>
              </li>
            </ul>
          </div>

          <p v-if="error" class="anamnesis-error" role="alert">{{ error }}</p>
          <p v-if="success" class="anamnesis-success" role="status">{{ success }}</p>

          <div class="anamnesis-actions">
            <button
              type="button"
              class="btn-secondary"
              :disabled="importing || !text.trim()"
              @click="onPreview"
            >
              Preview
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="importing || !text.trim()"
            >
              {{ importing ? 'Importing…' : 'Import to journal' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { format, parseISO } from 'date-fns'
import {
  importAnamnesis,
  previewAnamnesis,
  type ParsedAnamnesisRecord,
} from '@/api/anamnesisApi'
import { analyzeHealthEntry } from '@/services/healthAnalysis'
import { toHealthEntryInput } from '@/services/anamnesisParser'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  imported: [count: number]
}>()

const text = ref('')
const primaryArea = ref('')
const preview = ref<ParsedAnamnesisRecord[]>([])
const importing = ref(false)
const error = ref('')
const success = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    error.value = ''
    success.value = ''
    preview.value = []
  }
)

function close() {
  emit('close')
}

function previewClassification(item: ParsedAnamnesisRecord): string {
  return analyzeHealthEntry(toHealthEntryInput(item)).classification
}

function formatPreviewDate(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy')
  } catch {
    return iso
  }
}

function onPreview() {
  error.value = ''
  success.value = ''
  try {
    preview.value = previewAnamnesis(text.value, primaryArea.value)
    if (preview.value.length === 0) {
      error.value =
        'No entries detected. Add more detail or use bullet points for separate events.'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not parse text.'
    preview.value = []
  }
}

async function onImport() {
  error.value = ''
  success.value = ''
  importing.value = true
  try {
    const result = await importAnamnesis(text.value, primaryArea.value)
    preview.value = result.preview
    const skipped =
      result.duplicatesSkipped > 0
        ? ` (${result.duplicatesSkipped} duplicate${result.duplicatesSkipped === 1 ? '' : 's'} skipped — already in your journal)`
        : ''
    success.value = `Added ${result.entriesCreated} journal ${result.entriesCreated === 1 ? 'entry' : 'entries'} to your timeline.${skipped}`
    emit('imported', result.entriesCreated)
    setTimeout(() => {
      text.value = ''
      primaryArea.value = ''
      preview.value = []
      success.value = ''
      close()
    }, 1200)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Import failed.'
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.anamnesis-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(4px);
}

.anamnesis-dialog {
  width: 100%;
  max-width: 640px;
  max-height: min(90vh, 900px);
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 16px 48px var(--shadow);
}

.anamnesis-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.anamnesis-header h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-primary);
}

.anamnesis-close {
  background: transparent;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0 0.25rem;
}

.anamnesis-close:hover {
  color: var(--text-primary);
}

.anamnesis-intro {
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.anamnesis-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

.form-field input,
.form-field textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: var(--bg-input);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.45;
}

.form-field textarea {
  resize: vertical;
  min-height: 180px;
}

.field-hint {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: var(--text-faint);
}

.preview-block {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  background: var(--bg-muted);
}

.preview-title {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.preview-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  max-height: 220px;
  overflow-y: auto;
}

.preview-item {
  padding: 0.65rem 0.75rem;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.85rem;
}

.preview-date,
.preview-type {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-right: 0.5rem;
  color: var(--text-faint);
}

.preview-type {
  color: var(--accent);
}

.preview-area {
  display: block;
  margin: 0.25rem 0 0.15rem;
  color: var(--text-primary);
  font-size: 0.8rem;
}

.preview-title-text {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.4;
}

.anamnesis-error {
  margin: 0;
  padding: 0.65rem 0.75rem;
  border-radius: 6px;
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  color: var(--error-text);
  font-size: 0.875rem;
}

.anamnesis-success {
  margin: 0;
  padding: 0.65rem 0.75rem;
  border-radius: 6px;
  background: var(--success-bg);
  border: 1px solid var(--success-border);
  color: var(--success-text);
  font-size: 0.875rem;
}

.anamnesis-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-top: 0.25rem;
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
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
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

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
