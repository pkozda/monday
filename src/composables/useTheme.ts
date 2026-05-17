import { ref } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'monday-theme'

function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return null
}

function getPreferredTheme(): Theme {
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return 'dark'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(STORAGE_KEY, theme)
}

export function initTheme(): Theme {
  const theme = getStoredTheme() ?? getPreferredTheme()
  applyTheme(theme)
  return theme
}

const theme = ref<Theme>('dark')
let synced = false

export function useTheme() {
  if (!synced && typeof document !== 'undefined') {
    const current = document.documentElement.getAttribute('data-theme')
    if (current === 'light' || current === 'dark') {
      theme.value = current
    }
    synced = true
  }

  function setTheme(next: Theme) {
    theme.value = next
    applyTheme(next)
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: () => theme.value === 'dark',
  }
}
