/** Run work after first paint / when the browser is idle. */
export function scheduleIdleWork(task: () => void, timeoutMs = 2500): void {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => task(), { timeout: timeoutMs })
    return
  }
  setTimeout(task, 0)
}
