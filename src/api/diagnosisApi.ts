import { getHealthEntries } from '@/api/healthApi'
import { getHypotheses } from '@/api/mockApi'
import { buildDiagnosisReports } from '@/services/diagnosisGenerator'
import type { DiagnosisReport } from '@/models/types'

export async function getDiagnosisReports(): Promise<DiagnosisReport[]> {
  const [hypotheses, entries] = await Promise.all([
    getHypotheses(),
    getHealthEntries(),
  ])
  return buildDiagnosisReports(hypotheses, entries)
}
