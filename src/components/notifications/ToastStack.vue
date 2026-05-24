<template>
  <div class="toast-stack" aria-live="polite" aria-relevant="additions">
    <TransitionGroup name="toast">
      <article
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.kind}`"
        role="status"
      >
        <span class="toast__icon" aria-hidden="true">{{ iconFor(toast.kind) }}</span>
        <div class="toast__body">
          <p class="toast__title">{{ toast.title }}</p>
          <p v-if="toast.message" class="toast__message">{{ toast.message }}</p>
        </div>
        <button
          type="button"
          class="toast__close"
          :aria-label="t('notifications.dismiss')"
          @click="dismissToast(toast.id)"
        >
          ×
        </button>
      </article>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { dismissToast, toastKindIcon, useNotifications } from '@/composables/useNotifications'

const { t } = useI18n()
const { toasts } = useNotifications()

function iconFor(kind: Parameters<typeof toastKindIcon>[0]) {
  return toastKindIcon(kind)
}
</script>

<style scoped>
.toast-stack {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: min(360px, calc(100vw - 2rem));
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--bg-surface);
  box-shadow: 0 8px 24px var(--shadow);
}

.toast--success {
  border-left: 3px solid var(--success-text, #2e7d32);
}

.toast--error {
  border-left: 3px solid var(--error-text);
}

.toast--progress {
  border-left: 3px solid var(--accent-strong);
}

.toast--info {
  border-left: 3px solid var(--accent);
}

.toast__icon {
  flex-shrink: 0;
  width: 1.35rem;
  height: 1.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--bg-muted);
  color: var(--text-secondary);
}

.toast__body {
  flex: 1;
  min-width: 0;
}

.toast__title {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
}

.toast__message {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--text-muted);
}

.toast__close {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.15rem;
  font-family: inherit;
}

.toast__close:hover {
  color: var(--text-primary);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
