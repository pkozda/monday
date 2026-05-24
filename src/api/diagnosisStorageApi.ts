import { db } from '@/db/database'
import type {
  DiagnosisGenerationOutcome,
  DiagnosisReport,
  StoredClinicalInsights,
} from '@/models/types'

const BLOB_ID = 'current'

export async function getStoredClinicalInsights(): Promise<StoredClinicalInsights | null> {
  const row = await db.clinicalInsights.get(BLOB_ID)
  return row ?? null
}

export async function getStoredDiagnosisReports(): Promise<DiagnosisReport[]> {
  const row = await getStoredClinicalInsights()
  return row?.diagnosisReports ?? []
}

export async function saveDiagnosisReports(
  reports: DiagnosisReport[],
  outcome: DiagnosisGenerationOutcome = 'ok',
  outcomeMessage?: string
): Promise<void> {
  await db.clinicalInsights.put({
    id: BLOB_ID,
    diagnosisReports: reports,
    generatedAt: new Date().toISOString(),
    diagnosisOutcome: outcome,
    diagnosisOutcomeMessage: outcomeMessage,
  })
}

export async function clearStoredDiagnosisReports(): Promise<void> {
  await db.clinicalInsights.delete(BLOB_ID)
}
