import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { purgeSeedMockData, seedDatabaseIfEmpty } from '@/db/seed'
import { clearAllHypotheses } from '@/api/hypothesisApi'
import { clearAllJournalRecords } from '@/api/healthApi'
import { initTheme } from '@/composables/useTheme'

const HYPOTHESIS_RESET_KEY = 'monday-hypothesis-reset-v1'

initTheme()

async function runClearJournalFromQuery(): Promise<void> {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('clearJournal')) return

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  const skipConfirm = isLocal && params.get('confirm') === '1'

  const cleanupUrl = () => {
    window.history.replaceState({}, '', window.location.pathname)
  }

  if (
    !skipConfirm &&
    !window.confirm(
      'Delete all journal entries, linked timeline events, and hypotheses for this device? This cannot be undone.'
    )
  ) {
    cleanupUrl()
    return
  }

  const result = await clearAllJournalRecords()
  window.alert(
    `Cleared ${result.entriesRemoved} journal ${result.entriesRemoved === 1 ? 'entry' : 'entries'}, ${result.timelineEventsRemoved} linked timeline ${result.timelineEventsRemoved === 1 ? 'event' : 'events'}, and ${result.hypothesesRemoved} ${result.hypothesesRemoved === 1 ? 'hypothesis' : 'hypotheses'}.`
  )
  cleanupUrl()
}

async function bootstrap() {
  await purgeSeedMockData()
  await seedDatabaseIfEmpty()

  if (!localStorage.getItem(HYPOTHESIS_RESET_KEY)) {
    await clearAllHypotheses()
    localStorage.setItem(HYPOTHESIS_RESET_KEY, '1')
  }

  await runClearJournalFromQuery()

  const app = createApp(App)
  app.use(router)
  app.mount('#app')

  ;(
    window as Window & { clearMondayJournal?: typeof clearAllJournalRecords }
  ).clearMondayJournal = clearAllJournalRecords
}

bootstrap()
