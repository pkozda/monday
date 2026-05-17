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
          <h2 id="doctor-notes-title">Notes for your doctor</h2>
          <button type="button" class="notes-close" aria-label="Close" @click="emit('close')">
            ×
          </button>
        </header>

        <p class="notes-intro">
          Review and edit before printing. This summary is built from your journal entries
          related to this hypothesis.
        </p>

        <textarea
          v-model="notesText"
          class="notes-textarea"
          rows="18"
          spellcheck="true"
          aria-label="Doctor visit notes"
        />

        <div class="notes-actions">
          <button type="button" class="btn-secondary" @click="copyNotes">
            {{ copied ? 'Copied' : 'Copy text' }}
          </button>
          <button type="button" class="btn-primary" @click="printNotes">
            Print
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  content: string
}>()

const emit = defineEmits<{
  close: []
}>()

const notesText = ref('')
const copied = ref(false)

watch(
  () => props.content,
  (value) => {
    notesText.value = value
  },
  { immediate: true }
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      notesText.value = props.content
      copied.value = false
    }
  }
)

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

.notes-intro {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.notes-textarea {
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
  min-height: 320px;
}

.notes-actions {
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
  background: #42a5f5;
  color: #fff;
}

.btn-primary:hover {
  background: #64b5f6;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}
</style>
