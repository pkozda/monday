import { getHealthEntries } from '@/api/healthApi'
import {
  clearStoredDiagnosisReports,
  getStoredClinicalInsights,
  saveDiagnosisReports,
} from '@/api/diagnosisStorageApi'
import { getHypotheses } from '@/api/mockApi'
import { shouldUseAiInsights, isLlmProxyConfigured } from '@/services/llm/config'
import type {
  DiagnosisGenerationOutcome,
  DiagnosisReport,
} from '@/models/types'

export interface GetDiagnosisReportsOptions {
  /** Rebuild from LLM even if stored reports exist. */
  forceRegenerate?: boolean
}

export interface DiagnosisGenerationResult {
  reports: DiagnosisReport[]
  outcome: DiagnosisGenerationOutcome
  outcomeMessage?: string
}

function journalMayNeedMoreDetail(
  entries: Awaited<ReturnType<typeof getHealthEntries>>
): boolean {
  if (entries.length === 0) return true
  if (entries.length >= 2) return false
  const text = `${entries[0].title} ${entries[0].description}`.trim()
  return text.length < 120
}

export async function generateDiagnosisReports(
  options: GetDiagnosisReportsOptions = {}
): Promise<DiagnosisGenerationResult> {
  const [hypotheses, entries] = await Promise.all([
    getHypotheses(),
    getHealthEntries(),
  ])

  if (entries.length === 0) {
    return { reports: [], outcome: 'needs_more_journal' }
  }

  if (hypotheses.length === 0) {
    return { reports: [], outcome: 'no_suggestions' }
  }

  if (!shouldUseAiInsights() || !isLlmProxyConfigured()) {
    return { reports: [], outcome: 'failed', outcomeMessage: 'ai_off' }
  }

  if (!options.forceRegenerate) {
    const stored = await getStoredClinicalInsights()
    if (stored && stored.diagnosisReports.length > 0) {
      const { enrichAiDiagnosisReports } = await import(
        '@/services/llm/aiDiagnosisJournalSupport'
      )
      return {
        reports: enrichAiDiagnosisReports(stored.diagnosisReports, entries),
        outcome: stored.diagnosisOutcome ?? 'ok',
        outcomeMessage: stored.diagnosisOutcomeMessage,
      }
    }
    if (
      stored?.diagnosisOutcome === 'no_suggestions' ||
      stored?.diagnosisOutcome === 'needs_more_journal'
    ) {
      return {
        reports: [],
        outcome: stored.diagnosisOutcome,
        outcomeMessage: stored.diagnosisOutcomeMessage,
      }
    }
  }

  try {
    const { buildDiagnosisReportsFromAiOnly } = await import(
      '@/services/llm/aiDiagnosisPure'
    )
    const reports = await buildDiagnosisReportsFromAiOnly(entries, hypotheses)

    if (reports.length > 0) {
      await saveDiagnosisReports(reports, 'ok')
      return { reports, outcome: 'ok' }
    }

    const outcome: DiagnosisGenerationOutcome = journalMayNeedMoreDetail(entries)
      ? 'needs_more_journal'
      : 'no_suggestions'

    await saveDiagnosisReports([], outcome)
    return { reports: [], outcome }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await saveDiagnosisReports([], 'failed', message)
    return { reports: [], outcome: 'failed', outcomeMessage: message }
  }
}

export async function getDiagnosisReports(
  options: GetDiagnosisReportsOptions = {}
): Promise<DiagnosisReport[]> {
  const result = await generateDiagnosisReports(options)
  return result.reports
}

export { clearStoredDiagnosisReports }
