<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="confirm-dialog-overlay"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="messageId"
      @click.self="onCancel"
    >
      <div class="confirm-dialog">
        <h2 :id="titleId" class="confirm-dialog__title">
          {{ title }}
        </h2>
        <p :id="messageId" class="confirm-dialog__message">
          {{ message }}
        </p>
        <div class="confirm-dialog__actions">
          <button
            type="button"
            class="confirm-dialog__btn confirm-dialog__btn--secondary"
            @click="onCancel"
          >
            {{ cancelLabel }}
          </button>
          <button
            ref="confirmRef"
            type="button"
            class="confirm-dialog__btn"
            :class="
              variant === 'danger'
                ? 'confirm-dialog__btn--danger'
                : 'confirm-dialog__btn--primary'
            "
            @click="onConfirm"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel: string
    cancelLabel: string
    variant?: 'primary' | 'danger'
  }>(),
  {
    variant: 'primary',
  }
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const titleId = `confirm-dialog-title-${crypto.randomUUID()}`
const messageId = `confirm-dialog-message-${crypto.randomUUID()}`
const confirmRef = ref<HTMLButtonElement | null>(null)

function onCancel(): void {
  emit('update:open', false)
  emit('cancel')
}

function onConfirm(): void {
  emit('update:open', false)
  emit('confirm')
}

function onKeydown(event: KeyboardEvent): void {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    onCancel()
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      confirmRef.value?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 250;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
}

.confirm-dialog {
  width: 100%;
  max-width: 420px;
  padding: 1.35rem 1.5rem 1.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
}

.confirm-dialog__title {
  margin: 0 0 0.65rem;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.confirm-dialog__message {
  margin: 0 0 1.35rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.confirm-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
}

.confirm-dialog__btn {
  padding: 0.6rem 1.15rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.confirm-dialog__btn--secondary {
  background: var(--bg-muted);
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.confirm-dialog__btn--secondary:hover {
  background: var(--border);
}

.confirm-dialog__btn--primary {
  background: var(--accent-strong);
  color: #fff;
}

.confirm-dialog__btn--primary:hover {
  background: var(--accent-hover);
}

.confirm-dialog__btn--danger {
  background: var(--accent-strong);
  color: #fff;
}

.confirm-dialog__btn--danger:hover {
  background: var(--accent-hover);
}

.confirm-dialog__btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
