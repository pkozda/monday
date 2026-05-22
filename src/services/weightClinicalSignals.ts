import { differenceInDays, parseISO } from 'date-fns'
import { extractWeightHistory } from '@/services/weightTrend'
import type { HealthEntry } from '@/models/types'

function entrySearchText(entry: HealthEntry): string {
  return [
    entry.conditionArea,
    entry.title,
    entry.description,
    entry.medications ?? '',
    entry.analysis.summary,
    entry.analysis.classification,
  ].join(' ')
}

/** Phrases that document weight loss as a symptom (EN/RU). */
export const WEIGHT_LOSS_EXPLICIT =
  /\b(weight\s+loss|losing\s+weight|lost\s+weight|unintentional\s+weight|unexplained\s+weight|decreased\s+weight|dropped\s+\d+\s*(?:kg|кг)|похудел|похудела|потеря\s+веса|сбросил\s+вес|снижение\s+веса)\b/i

export const WEIGHT_GAIN_EXPLICIT =
  /\b(weight\s+gain|gaining\s+weight|gained\s+weight|increased\s+weight|набрал\s+вес|прибавил\s+вес)\b/i

export type WeightClinicalSignalKind = 'weight_loss' | 'weight_gain'

export interface WeightClinicalSignal {
  kind: WeightClinicalSignalKind
  /** Human-readable for UI / rationales */
  label: string
  /** Appended to medical history search text for diagnosis matching */
  augmentText: string
}

const MIN_KG_LOSS = 2
const MIN_DAYS_SPAN = 14
const MIN_PERCENT_LOSS = 5
const MIN_DAYS_FOR_PERCENT = 30

function hasExplicitWeightLoss(entries: HealthEntry[]): boolean {
  return entries.some((e) => WEIGHT_LOSS_EXPLICIT.test(entrySearchText(e)))
}

function hasExplicitWeightGain(entries: HealthEntry[]): boolean {
  return entries.some((e) => WEIGHT_GAIN_EXPLICIT.test(entrySearchText(e)))
}

function formatDaySpan(days: number): string {
  if (days < 60) return `${days} days`
  const months = Math.round(days / 30)
  if (months < 24) {
    return `${months} ${months === 1 ? 'month' : 'months'}`
  }
  const years = Math.floor(days / 365)
  const remMonths = Math.round((days % 365) / 30)
  if (remMonths === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`
  }
  return `${years} ${years === 1 ? 'year' : 'years'} · ${remMonths} mo`
}

function lossFromWeightLogs(entries: HealthEntry[]): WeightClinicalSignal | null {
  const history = extractWeightHistory(entries)
  if (history.length < 2) return null

  const latest = history[0]
  const oldest = history[history.length - 1]
  const deltaKg = Math.round((latest.kg - oldest.kg) * 10) / 10
  if (deltaKg >= -MIN_KG_LOSS) return null

  const spanDays = Math.max(
    1,
    differenceInDays(parseISO(latest.eventDate), parseISO(oldest.eventDate))
  )
  const absKg = Math.abs(deltaKg)
  const pct = Math.round((absKg / oldest.kg) * 1000) / 10

  const meetsKgRule = absKg >= MIN_KG_LOSS && spanDays >= MIN_DAYS_SPAN
  const meetsPctRule =
    pct >= MIN_PERCENT_LOSS &&
    spanDays >= MIN_DAYS_FOR_PERCENT &&
    absKg >= 1

  if (!meetsKgRule && !meetsPctRule) return null

  const spanLabel = formatDaySpan(spanDays)
  return {
    kind: 'weight_loss',
    label: `Weight decreased ~${absKg} kg (${pct}%) over ${spanLabel}`,
    augmentText: `Symptom: unexplained weight loss (~${absKg} kg, ${pct}% over ${spanLabel})`,
  }
}

function gainFromWeightLogs(entries: HealthEntry[]): WeightClinicalSignal | null {
  const history = extractWeightHistory(entries)
  if (history.length < 2) return null

  const latest = history[0]
  const oldest = history[history.length - 1]
  const deltaKg = Math.round((latest.kg - oldest.kg) * 10) / 10
  if (deltaKg <= MIN_KG_LOSS) return null

  const spanDays = Math.max(
    1,
    differenceInDays(parseISO(latest.eventDate), parseISO(oldest.eventDate))
  )
  if (deltaKg < MIN_KG_LOSS || spanDays < MIN_DAYS_SPAN) return null

  const spanLabel = formatDaySpan(spanDays)
  return {
    kind: 'weight_gain',
    label: `Weight increased ~${deltaKg} kg over ${spanLabel}`,
    augmentText: `Documented weight gain (~${deltaKg} kg over ${spanLabel})`,
  }
}

/** Derive weight change signals from narrative entries and body-weight logs. */
export function deriveWeightClinicalSignals(
  entries: HealthEntry[]
): WeightClinicalSignal[] {
  const signals: WeightClinicalSignal[] = []

  if (hasExplicitWeightLoss(entries)) {
    signals.push({
      kind: 'weight_loss',
      label: 'Weight loss described in journal',
      augmentText: 'Symptom: unexplained weight loss documented in journal',
    })
  } else {
    const fromLogs = lossFromWeightLogs(entries)
    if (fromLogs) signals.push(fromLogs)
  }

  if (hasExplicitWeightGain(entries)) {
    signals.push({
      kind: 'weight_gain',
      label: 'Weight gain described in journal',
      augmentText: 'Documented weight gain in journal',
    })
  } else {
    const fromLogs = gainFromWeightLogs(entries)
    if (fromLogs && !signals.some((s) => s.kind === 'weight_gain')) {
      signals.push(fromLogs)
    }
  }

  return signals
}

export function buildClinicalAugmentText(signals: WeightClinicalSignal[]): string {
  return signals.map((s) => s.augmentText).join('\n')
}
