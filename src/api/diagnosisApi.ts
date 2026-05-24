import { getHealthEntries } from '@/api/healthApi'
import { getHypotheses } from '@/api/mockApi'
import { buildDiagnosisReports } from '@/services/diagnosisGenerator'
import {
  buildJournalFocusPlan,
  resolveJournalFocusPlan,
} from '@/services/journalFocusAreas'
import { shouldUseAiInsights } from '@/services/llm/config'
import type { DiagnosisReport, DiagnosisVariant } from '@/models/types'

function stripAiMetadata(reports: DiagnosisReport[]): DiagnosisReport[] {
  return reports.map((report) => ({
    ...report,
    aiRanked: false,
    variants: report.variants.map((variant) => stripVariantAi(variant)),
  }))
}

function stripVariantAi(variant: DiagnosisVariant): DiagnosisVariant {
  return {
    ...variant,
    aiEnhanced: false,
    aiRanked: false,
  }
}

export async function getDiagnosisReports(): Promise<DiagnosisReport[]> {
  const [hypotheses, entries] = await Promise.all([
    getHypotheses(),
    getHealthEntries(),
  ])

  if (entries.length === 0 && hypotheses.length === 0) {
    return []
  }

  const useAi = shouldUseAiInsights()

  if (!useAi) {
    const focusPlan = buildJournalFocusPlan(entries)
    return stripAiMetadata(buildDiagnosisReports(hypotheses, entries, focusPlan))
  }

  const focusPlan = await resolveJournalFocusPlan(entries, { useAi: true })
  const ruleReports = buildDiagnosisReports(hypotheses, entries, focusPlan)

  if (ruleReports.length === 0) {
    return ruleReports
  }

  try {
    const { generateDiagnosisReportsWithAi } = await import(
      '@/services/llm/aiDiagnosis'
    )
    return await generateDiagnosisReportsWithAi(
      ruleReports,
      hypotheses,
      entries,
      focusPlan
    )
  } catch (err) {
    console.warn(
      '[Monday] AI diagnosis generation failed; showing rule-based diagnoses.',
      err
    )
    return stripAiMetadata(ruleReports)
  }
}
