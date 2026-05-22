import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { purgeSeedMockData, seedDatabaseIfEmpty } from '@/db/seed'
import {
  consolidateDuplicateHypotheses,
  migrateHypothesesSchemaV2,
} from '@/db/migrateHypotheses'
import { clearAllHypotheses } from '@/api/hypothesisApi'
import { clearAllJournalRecords } from '@/api/healthApi'
import { initTheme } from '@/composables/useTheme'

const HYPOTHESIS_RESET_KEY = 'monday-hypothesis-reset-v1'

initTheme()

async function runClearHypothesesFromQuery(): Promise<void> {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('clearHypotheses')) return

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
      'Delete all hypotheses for this device? Journal and timeline data are kept. This cannot be undone.'
    )
  ) {
    cleanupUrl()
    return
  }

  const removed = await clearAllHypotheses()
  window.alert(
    `Cleared ${removed} ${removed === 1 ? 'hypothesis' : 'hypotheses'}.`
  )
  cleanupUrl()
}

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

  const { total, migrated } = await migrateHypothesesSchemaV2()
  if (import.meta.env.DEV && migrated > 0) {
    console.info(
      `[Monday] Migrated ${migrated} of ${total} hypothesis records to schema v2.`
    )
  }

  const { removed, kept } = await consolidateDuplicateHypotheses()
  if (import.meta.env.DEV && removed > 0) {
    console.info(
      `[Monday] Consolidated hypotheses: kept ${kept}, removed ${removed} duplicate record(s).`
    )
  }

  await runClearHypothesesFromQuery()
  await runClearJournalFromQuery()

  const app = createApp(App)
  app.use(router)
  app.mount('#app')

  ;(
    window as Window & {
      clearMondayJournal?: typeof clearAllJournalRecords
      clearMondayHypotheses?: typeof clearAllHypotheses
    }
  ).clearMondayJournal = clearAllJournalRecords
  ;(
    window as Window & { clearMondayHypotheses?: typeof clearAllHypotheses }
  ).clearMondayHypotheses = clearAllHypotheses
}

bootstrap()
