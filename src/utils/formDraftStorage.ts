export function readFormDraft<T>(storageKey: string): T | null {
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeFormDraft<T>(storageKey: string, value: T): void {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(value))
  } catch {
    /* quota */
  }
}

export function clearFormDraft(storageKey: string): void {
  try {
    sessionStorage.removeItem(storageKey)
  } catch {
    /* ignore */
  }
}
