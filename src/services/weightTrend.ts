import { parseISO } from 'date-fns'
import { combinedEntryText } from '@/services/healthAnalysis'
import {
  extractWeightKg,
  isWeightRelatedText,
} from '@/services/weightEntry'
import type { HealthEntry } from '@/models/types'

export type WeightTrendDirection = 'up' | 'down' | 'flat'

export interface WeightSnapshot {
  eventDate: string
  kg: number
  displayLabel: string
}

export interface WeightTrendSummary {
  currentKg: number | null
  currentLabel: string | null
  trend: WeightTrendDirection | null
  deltaKg: number | null
  previousLabel: string | null
  previousDate: string | null
}

const WEIGHT_KG =
  /\b(\d{2,3})\s*(?:[–—-]\s*(\d{2,3}))?\s*(?:kg|кг)\b/i

/** Numeric kg for trend math; ranges use the midpoint (e.g. 95–96 → 95.5). */
export function parseWeightKgNumeric(text: string): number | null {
  const match = text.match(WEIGHT_KG)
  if (!match) return null
  const low = Number(match[1])
  const high = match[2] ? Number(match[2]) : low
  if (Number.isNaN(low) || Number.isNaN(high)) return null
  return (low + high) / 2
}

function formatWeightDisplayLabel(text: string): string {
  const raw = extractWeightKg(text)
  if (raw === 'unknown') return ''
  if (raw.includes('-')) {
    return `~${raw.replace('-', '–')} kg`
  }
  return `${raw} kg`
}

export function extractWeightHistory(entries: HealthEntry[]): WeightSnapshot[] {
  const snapshots: WeightSnapshot[] = []

  for (const entry of entries) {
    const text = combinedEntryText(entry)
    if (!isWeightRelatedText(text)) continue
    const kg = parseWeightKgNumeric(text)
    if (kg === null) continue
    snapshots.push({
      eventDate: entry.eventDate,
      kg,
      displayLabel: formatWeightDisplayLabel(text),
    })
  }

  return snapshots.sort(
    (a, b) =>
      parseISO(b.eventDate).getTime() - parseISO(a.eventDate).getTime()
  )
}

export function summarizeWeightTrend(
  entries: HealthEntry[]
): WeightTrendSummary {
  const history = extractWeightHistory(entries)
  if (history.length === 0) {
    return {
      currentKg: null,
      currentLabel: null,
      trend: null,
      deltaKg: null,
      previousLabel: null,
      previousDate: null,
    }
  }

  const latest = history[0]
  const previous = history[1]

  if (!previous) {
    return {
      currentKg: latest.kg,
      currentLabel: latest.displayLabel,
      trend: null,
      deltaKg: null,
      previousLabel: null,
      previousDate: null,
    }
  }

  const deltaKg = Math.round((latest.kg - previous.kg) * 10) / 10
  let trend: WeightTrendDirection = 'flat'
  if (deltaKg < -0.05) trend = 'down'
  else if (deltaKg > 0.05) trend = 'up'

  return {
    currentKg: latest.kg,
    currentLabel: latest.displayLabel,
    trend,
    deltaKg,
    previousLabel: previous.displayLabel,
    previousDate: previous.eventDate,
  }
}
