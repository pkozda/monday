export type NotificationKind = 'info' | 'success' | 'error' | 'progress'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  message?: string
  createdAt: string
  read: boolean
  /** Navigate when clicking a center item */
  actionRoute?: string
  /** Group for replacing related toasts (e.g. insights-regeneration) */
  groupId?: string
}

export interface ToastOptions {
  kind?: NotificationKind
  title: string
  message?: string
  durationMs?: number
  groupId?: string
  persist?: boolean
  actionRoute?: string
}
