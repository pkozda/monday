import { computed, ref } from 'vue'
import type { AppNotification, NotificationKind, ToastOptions } from '@/types/notifications'

const MAX_CENTER_ITEMS = 40
const DEFAULT_TOAST_MS = 6000

const centerItems = ref<AppNotification[]>([])
const toasts = ref<AppNotification[]>([])
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>()

function createNotification(
  options: ToastOptions & { read?: boolean }
): AppNotification {
  return {
    id: crypto.randomUUID(),
    kind: options.kind ?? 'info',
    title: options.title,
    message: options.message,
    createdAt: new Date().toISOString(),
    read: options.read ?? false,
    actionRoute: options.actionRoute,
    groupId: options.groupId,
  }
}

export function dismissToast(id: string): void {
  const timer = toastTimers.get(id)
  if (timer) {
    clearTimeout(timer)
    toastTimers.delete(id)
  }
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function dismissToastGroup(groupId: string): void {
  for (const toast of [...toasts.value]) {
    if (toast.groupId === groupId) {
      dismissToast(toast.id)
    }
  }
}

function scheduleToastDismiss(id: string, durationMs: number): void {
  const timer = setTimeout(() => dismissToast(id), durationMs)
  toastTimers.set(id, timer)
}

export function pushToast(options: ToastOptions): string {
  if (options.groupId) {
    dismissToastGroup(options.groupId)
  }

  const item = createNotification(options)
  toasts.value = [...toasts.value, item].slice(-5)

  if (!options.persist) {
    scheduleToastDismiss(item.id, options.durationMs ?? DEFAULT_TOAST_MS)
  }

  return item.id
}

export function pushNotification(
  options: ToastOptions & { showToast?: boolean }
): string {
  const item = createNotification({ ...options, read: false })
  centerItems.value = [item, ...centerItems.value].slice(0, MAX_CENTER_ITEMS)

  if (options.showToast !== false) {
    pushToast({
      ...options,
      durationMs: options.durationMs ?? DEFAULT_TOAST_MS,
    })
  }

  return item.id
}

export function markNotificationRead(id: string): void {
  centerItems.value = centerItems.value.map((n) =>
    n.id === id ? { ...n, read: true } : n
  )
}

export function markAllNotificationsRead(): void {
  centerItems.value = centerItems.value.map((n) => ({ ...n, read: true }))
}

export function clearNotifications(): void {
  centerItems.value = []
}

export function removeNotification(id: string): void {
  centerItems.value = centerItems.value.filter((n) => n.id !== id)
}

export function notifySuccess(title: string, message?: string, actionRoute?: string): void {
  pushNotification({
    kind: 'success',
    title,
    message,
    actionRoute,
    showToast: true,
  })
}

export function notifyError(title: string, message?: string): void {
  pushNotification({
    kind: 'error',
    title,
    message,
    showToast: true,
    durationMs: 9000,
  })
}

export function notifyProgress(
  title: string,
  message: string,
  groupId: string
): string {
  return pushToast({
    kind: 'progress',
    title,
    message,
    groupId,
    persist: true,
  })
}

export function clearToastGroup(groupId: string): void {
  dismissToastGroup(groupId)
}

/** Replace in-progress regeneration toast with a visible success toast + notification. */
export function notifyInsightsRegenerationComplete(
  groupId: string,
  title: string,
  message: string,
  actionRoute?: string
): void {
  clearToastGroup(groupId)

  pushToast({
    kind: 'success',
    title,
    message,
    groupId,
    durationMs: 12_000,
  })

  pushNotification({
    kind: 'success',
    title,
    message,
    actionRoute,
    groupId,
    showToast: false,
    read: false,
  })
}

export function useNotifications() {
  const unreadCount = computed(
    () => centerItems.value.filter((n) => !n.read).length
  )

  return {
    centerItems,
    toasts,
    unreadCount,
    pushToast,
    pushNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    removeNotification,
    notifySuccess,
    notifyError,
    notifyProgress,
    clearToastGroup,
    dismissToast,
  }
}

export function toastKindIcon(kind: NotificationKind): string {
  switch (kind) {
    case 'success':
      return '✓'
    case 'error':
      return '!'
    case 'progress':
      return '…'
    default:
      return 'i'
  }
}
