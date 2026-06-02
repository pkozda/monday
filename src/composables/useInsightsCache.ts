import { ref, shallowRef } from 'vue'
import { readAiInsightsPreference } from '@/services/llm/config'
import type { HealthEntry, Hypothesis, PatientProfile } from '@/models/types'

export interface InsightsCacheSnapshot {
  hypotheses: Hypothesis[]
  journalEntries: HealthEntry[]
  patient: PatientProfile | null
  fetchedAt: number
  /** Must match current AI toggle or cache is ignored. */
  aiInsightsEnabled: boolean
  journalRevision: string
}

export function journalRevisionKey(entries: HealthEntry[]): string {
  return `${entries.length}:${entries.map((e) => e.id).sort().join(',')}`
}

export function isInsightsCacheValid(
  cached: InsightsCacheSnapshot,
  entries: HealthEntry[]
): boolean {
  return (
    cached.aiInsightsEnabled === readAiInsightsPreference() &&
    cached.journalRevision === journalRevisionKey(entries)
  )
}

const snapshot = shallowRef<InsightsCacheSnapshot | null>(null)
const loadPromise = ref<Promise<void> | null>(null)

export function getInsightsCache(): InsightsCacheSnapshot | null {
  return snapshot.value
}

export function setInsightsCache(
  data: Omit<InsightsCacheSnapshot, 'fetchedAt' | 'aiInsightsEnabled' | 'journalRevision'> & {
    aiInsightsEnabled?: boolean
    journalRevision?: string
  }
): void {
  snapshot.value = {
    ...data,
    aiInsightsEnabled: data.aiInsightsEnabled ?? readAiInsightsPreference(),
    journalRevision:
      data.journalRevision ?? journalRevisionKey(data.journalEntries),
    fetchedAt: Date.now(),
  }
}

export function invalidateInsightsCache(): void {
  snapshot.value = null
  loadPromise.value = null
}

export function getInsightsLoadPromise(): Promise<void> | null {
  return loadPromise.value
}

export function setInsightsLoadPromise(promise: Promise<void> | null): void {
  loadPromise.value = promise
}
