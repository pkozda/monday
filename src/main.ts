import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n } from '@/i18n'
import { purgeSeedMockData, seedDatabaseIfEmpty } from '@/db/seed'
import {
  consolidateDuplicateHypotheses,
  migrateHypothesesSchemaV2,
} from '@/db/migrateHypotheses'
import { dedupeHealthJournalEntries } from '@/db/dedupeHealthEntries'
import {
  migrateHealthEntryClassifications,
  migrateJournalEntryTitles,
} from '@/db/migrateHealthEntries'
import { migrateJournalAppointmentsToCalendar } from '@/api/appointmentsApi'
import {
  clearAllHypotheses,
  regenerateAllHypothesesFromJournal,
} from '@/api/hypothesisApi'
import { clearAllJournalRecords } from '@/api/healthApi'
import { initTheme } from '@/composables/useTheme'
import { scheduleIdleWork } from '@/utils/scheduleIdleWork'

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

async function runRegenerateInsightsFromQuery(): Promise<void> {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('regenerateInsights')) return

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  const skipConfirm = isLocal && params.get('confirm') === '1'

  const cleanupUrl = () => {
    window.history.replaceState({}, '', window.location.pathname)
  }

  if (
    !skipConfirm &&
    !window.confirm(i18n.global.t('hypothesesPage.regenerateConfirm'))
  ) {
    cleanupUrl()
    return
  }

  const result = await regenerateAllHypothesesFromJournal()
  window.alert(
    i18n.global.t(`hypothesesPage.regenerateMessages.${result.messageKey}`, {
      hypothesisCount: result.hypothesisCount,
      journalEntryCount: result.journalEntryCount,
      areaCount: result.areas.length,
    })
  )
  cleanupUrl()
  window.location.reload()
}

function exposeDevClearHelpers(): void {
  ;(
    window as Window & {
      clearMondayJournal?: typeof clearAllJournalRecords
      clearMondayHypotheses?: typeof clearAllHypotheses
      regenerateMondayInsights?: typeof regenerateAllHypothesesFromJournal
    }
  ).clearMondayJournal = clearAllJournalRecords
  ;(
    window as Window & { clearMondayHypotheses?: typeof clearAllHypotheses }
  ).clearMondayHypotheses = clearAllHypotheses
  ;(
    window as Window & {
      regenerateMondayInsights?: typeof regenerateAllHypothesesFromJournal
    }
  ).regenerateMondayInsights = regenerateAllHypothesesFromJournal
}

/** Fast migrations so IndexedDB is not busy during the first dashboard paint. */
async function runEssentialStartupMigrations(): Promise<void> {
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
}

/** Heavy journal work — deferred until after the UI is interactive. */
async function runDeferredStartupMigrations(): Promise<void> {
  const { total: journalTotal, updated: journalUpdated } =
    await migrateHealthEntryClassifications()
  if (import.meta.env.DEV && journalUpdated > 0) {
    console.info(
      `[Monday] Reclassified ${journalUpdated} of ${journalTotal} journal entries from note text.`
    )
  }

  const { total: titleTotal, updated: titlesUpdated } =
    await migrateJournalEntryTitles()
  if (import.meta.env.DEV && titlesUpdated > 0) {
    console.info(
      `[Monday] Shortened ${titlesUpdated} of ${titleTotal} journal titles (details kept in description).`
    )
  }

  const {
    removed: journalDupesRemoved,
    groupsMerged: journalDupesGroups,
  } = await dedupeHealthJournalEntries()
  if (import.meta.env.DEV && journalDupesRemoved > 0) {
    console.info(
      `[Monday] Removed ${journalDupesRemoved} duplicate journal ${journalDupesRemoved === 1 ? 'entry' : 'entries'} (${journalDupesGroups} merged groups).`
    )
  }

  const {
    synced: apptSynced,
    skipped: apptSkipped,
    duplicatesRemoved: apptDeduped,
  } = await migrateJournalAppointmentsToCalendar()
  if (import.meta.env.DEV && (apptSynced > 0 || apptDeduped > 0)) {
    console.info(
      `[Monday] Journal appointments: ${apptSynced} synced, ${apptSkipped} skipped, ${apptDeduped} duplicate(s) removed.`
    )
  }
}

async function runStartupMigrations(): Promise<void> {
  await runEssentialStartupMigrations()
  await runClearHypothesesFromQuery()
  await runClearJournalFromQuery()
  await runRegenerateInsightsFromQuery()

  scheduleIdleWork(() => {
    void runDeferredStartupMigrations().catch((err) => {
      console.error('[Monday] Deferred migrations failed:', err)
    })
  })
}

function bootstrap(): void {
  const app = createApp(App)
  app.use(i18n)
  app.use(router)
  app.mount('#app')
  exposeDevClearHelpers()

  void runStartupMigrations().catch((err) => {
    console.error('[Monday] Startup migrations failed:', err)
  })
}

bootstrap()
