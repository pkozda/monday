import { computed, ref } from 'vue'
import { getDiagnosisReports } from '@/api/diagnosisApi'
import {
  regenerateAllHypothesesFromJournal,
  type RegenerateInsightsResult,
} from '@/api/hypothesisApi'
import { getHypotheses } from '@/api/mockApi'
import { getHealthEntries } from '@/api/healthApi'
import { getPatientProfile } from '@/api/patientApi'
import {
  invalidateInsightsCache,
  setInsightsCache,
  type InsightsCacheSnapshot,
} from '@/composables/useInsightsCache'
import {
  clearToastGroup,
  notifyError,
  notifyProgress,
  notifySuccess,
  pushNotification,
} from '@/composables/useNotifications'
import { consolidateHypothesesForDisplay } from '@/services/hypothesisDisplay'
import { shouldUseAiInsights } from '@/services/llm/config'

export const INSIGHTS_REGENERATION_GROUP = 'insights-regeneration'
export const INSIGHTS_REGENERATED_EVENT = 'monday-insights-regenerated'

export type InsightsRegenerationPhase = 'idle' | 'running'

export interface InsightsRegeneratedDetail {
  result: RegenerateInsightsResult
  snapshot: InsightsCacheSnapshot
}

const phase = ref<InsightsRegenerationPhase>('idle')
let slowNotified = false
let activeJob = 0

async function buildInsightsSnapshot(): Promise<InsightsCacheSnapshot> {
  const [hyps, entries, profile] = await Promise.all([
    getHypotheses(),
    getHealthEntries(),
    getPatientProfile(),
  ])
  const displayHyps = consolidateHypothesesForDisplay(hyps)
  const diagnosisReports = await getDiagnosisReports()

  const snapshot: InsightsCacheSnapshot = {
    hypotheses: displayHyps,
    journalEntries: entries,
    diagnosisReports,
    patient: profile,
    aiInsightsEnabled: shouldUseAiInsights(),
    journalRevision: '',
    fetchedAt: Date.now(),
  }

  setInsightsCache({
    hypotheses: snapshot.hypotheses,
    journalEntries: snapshot.journalEntries,
    diagnosisReports: snapshot.diagnosisReports,
    patient: snapshot.patient,
    aiInsightsEnabled: snapshot.aiInsightsEnabled,
  })

  return snapshot
}

export function isInsightsRegenerationRunning(): boolean {
  return phase.value === 'running'
}

export function useInsightsRegeneration() {
  const isRunning = computed(() => phase.value === 'running')
  return { isRunning, phase }
}

export interface InsightsRegenerationMessages {
  slowToastTitle: string
  slowToastMessage: string
  slowNotificationTitle: string
  slowNotificationMessage: string
  successTitle: string
  successMessage: (result: RegenerateInsightsResult) => string
  errorTitle: string
}

export interface RunInsightsRegenerationOptions {
  messages: InsightsRegenerationMessages
  /** Called immediately — clear hypotheses & diagnoses in the UI */
  onCleared?: () => void
  /** Called after 2s if still running */
  onSlow?: () => void
  /** Called when finished (any page) */
  onComplete?: (detail: InsightsRegeneratedDetail) => void
  /** Called on failure */
  onError?: (error: Error) => void
}

export async function runInsightsRegeneration(
  options: RunInsightsRegenerationOptions = {}
): Promise<InsightsRegeneratedDetail | null> {
  if (phase.value === 'running') {
    return null
  }

  const jobId = ++activeJob
  phase.value = 'running'
  slowNotified = false

  options.onCleared?.()

  const slowTimer = window.setTimeout(() => {
    if (phase.value !== 'running' || activeJob !== jobId) return
    slowNotified = true
    options.onSlow?.()
    notifyProgress(
      options.messages.slowToastTitle,
      options.messages.slowToastMessage,
      INSIGHTS_REGENERATION_GROUP
    )
    pushNotification({
      kind: 'info',
      title: options.messages.slowNotificationTitle,
      message: options.messages.slowNotificationMessage,
      groupId: INSIGHTS_REGENERATION_GROUP,
      showToast: false,
      actionRoute: '/hypotheses',
    })
  }, 2000)

  try {
    invalidateInsightsCache()
    const result = await regenerateAllHypothesesFromJournal()
    if (activeJob !== jobId) return null

    const snapshot = await buildInsightsSnapshot()
    if (activeJob !== jobId) return null

    const detail: InsightsRegeneratedDetail = { result, snapshot }

    window.dispatchEvent(
      new CustomEvent<InsightsRegeneratedDetail>(INSIGHTS_REGENERATED_EVENT, {
        detail,
      })
    )

    clearToastGroup(INSIGHTS_REGENERATION_GROUP)

    notifySuccess(
      options.messages.successTitle,
      options.messages.successMessage(result),
      '/hypotheses'
    )

    options.onComplete?.(detail)
    return detail
  } catch (err) {
    if (activeJob !== jobId) return null

    clearToastGroup(INSIGHTS_REGENERATION_GROUP)
    const error = err instanceof Error ? err : new Error(String(err))
    notifyError(options.messages.errorTitle, error.message)
    options.onError?.(error)
    return null
  } finally {
    window.clearTimeout(slowTimer)
    if (activeJob === jobId) {
      phase.value = 'idle'
    }
  }
}
