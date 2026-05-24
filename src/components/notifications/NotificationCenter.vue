<template>
  <div ref="rootRef" class="notification-center">
    <button
      type="button"
      class="notification-bell"
      :aria-expanded="open"
      :aria-label="t('notifications.bellLabel', { count: unreadCount })"
      @click="open = !open"
    >
      <span class="notification-bell__icon" aria-hidden="true">🔔</span>
      <span v-if="unreadCount > 0" class="notification-bell__badge">{{
        unreadCount > 9 ? '9+' : unreadCount
      }}</span>
    </button>

    <div v-if="open" class="notification-panel" role="dialog" :aria-label="t('notifications.title')">
      <header class="notification-panel__header">
        <h2 class="notification-panel__title">{{ t('notifications.title') }}</h2>
        <button
          v-if="centerItems.length > 0"
          type="button"
          class="notification-panel__mark"
          @click="markAllNotificationsRead"
        >
          {{ t('notifications.markAllRead') }}
        </button>
      </header>

      <p v-if="centerItems.length === 0" class="notification-panel__empty">
        {{ t('notifications.empty') }}
      </p>

      <ul v-else class="notification-list">
        <li
          v-for="item in centerItems"
          :key="item.id"
          class="notification-item"
          :class="{ 'notification-item--unread': !item.read }"
        >
          <button
            type="button"
            class="notification-item__button"
            @click="onItemClick(item)"
          >
            <span
              class="notification-item__icon"
              :class="`notification-item__icon--${item.kind}`"
              aria-hidden="true"
            >
              {{ iconFor(item.kind) }}
            </span>
            <span class="notification-item__content">
              <span class="notification-item__title">{{ item.title }}</span>
              <span v-if="item.message" class="notification-item__message">{{
                item.message
              }}</span>
              <time class="notification-item__time" :datetime="item.createdAt">{{
                formatTime(item.createdAt)
              }}</time>
            </span>
          </button>
          <button
            type="button"
            class="notification-item__dismiss"
            :aria-label="t('notifications.dismiss')"
            @click.stop="removeNotification(item.id)"
          >
            ×
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import { dateFnsLocaleFor } from '@/utils/dateLocale'
import type { AppLocale } from '@/i18n'
import {
  markAllNotificationsRead,
  markNotificationRead,
  removeNotification,
  toastKindIcon,
  useNotifications,
} from '@/composables/useNotifications'
import type { AppNotification } from '@/types/notifications'

const { t, locale } = useI18n()
const router = useRouter()
const { centerItems, unreadCount } = useNotifications()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function iconFor(kind: AppNotification['kind']) {
  return toastKindIcon(kind)
}

function formatTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), {
      addSuffix: true,
      locale: dateFnsLocaleFor(locale.value as AppLocale),
    })
  } catch {
    return ''
  }
}

function onItemClick(item: AppNotification) {
  markNotificationRead(item.id)
  open.value = false
  if (item.actionRoute) {
    void router.push(item.actionRoute)
  }
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value || !rootRef.value) return
  if (!rootRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--bg-muted);
  cursor: pointer;
  font-family: inherit;
}

.notification-bell:hover {
  background: var(--bg-surface);
}

.notification-bell__icon {
  font-size: 1rem;
  line-height: 1;
}

.notification-bell__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: var(--accent-strong);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: min(340px, calc(100vw - 2rem));
  max-height: min(420px, 70vh);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  background: var(--bg-surface);
  box-shadow: 0 12px 40px var(--shadow);
  z-index: 200;
}

.notification-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border);
}

.notification-panel__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.notification-panel__mark {
  border: none;
  background: transparent;
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.notification-panel__empty {
  margin: 0;
  padding: 1.25rem 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--border);
}

.notification-item--unread {
  background: color-mix(in srgb, var(--accent-strong) 6%, transparent);
}

.notification-item__button {
  flex: 1;
  display: flex;
  gap: 0.65rem;
  padding: 0.75rem 0.5rem 0.75rem 1rem;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}

.notification-item__button:hover {
  background: var(--bg-muted);
}

.notification-item__icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  background: var(--bg-muted);
}

.notification-item__icon--success {
  color: var(--success-text, #2e7d32);
}

.notification-item__icon--error {
  color: var(--error-text);
}

.notification-item__icon--progress {
  color: var(--accent-strong);
}

.notification-item__content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.notification-item__title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.notification-item__message {
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--text-muted);
}

.notification-item__time {
  font-size: 0.7rem;
  color: var(--text-faint);
}

.notification-item__dismiss {
  flex-shrink: 0;
  width: 2rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.1rem;
  font-family: inherit;
}

.notification-item__dismiss:hover {
  color: var(--text-primary);
}
</style>
