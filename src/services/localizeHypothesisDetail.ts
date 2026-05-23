import { format, parseISO } from 'date-fns'
import type { Locale } from 'date-fns'
import type { Composer } from 'vue-i18n'
import { patternFromTitle } from '@/services/hypothesisGenerator'
import {
  localizeHypothesisConfidence,
  localizeSpecialistBullet,
} from '@/services/localizeClinical'
import { suggestSpecialist } from '@/services/specialistSuggestion'
import {
  buildHypothesisDetail,
  type HypothesisDetail,
} from '@/services/hypothesisDetail'
import type { HealthEntry, Hypothesis, HypothesisPattern } from '@/models/types'

type TFunction = Composer['t']

function dateRangeLabel(
  entries: HealthEntry[],
  t: TFunction,
  dateLocale: Locale
): string {
  const count = entries.length
  if (count === 0) return String(t('hypothesisContent.dateRangeJournal'))
  const start = format(parseISO(entries[0].eventDate), 'PP', { locale: dateLocale })
  const end = format(parseISO(entries[count - 1].eventDate), 'PP', {
    locale: dateLocale,
  })
  return `${start} – ${end}`
}

function buildLocalizedSummary(
  pattern: HypothesisPattern,
  area: string,
  entries: HealthEntry[],
  confidence: string,
  t: TFunction,
  dateLocale: Locale
): string {
  const count = entries.length
  const range = dateRangeLabel(entries, t, dateLocale)
  const conf = localizeHypothesisConfidence(confidence, t)
  return String(
    t(`hypothesisContent.summary.${pattern}`, {
      count,
      records: t(count === 1 ? 'hypothesisCard.record' : 'hypothesisCard.records'),
      entries: t(count === 1 ? 'hypothesisCard.entry' : 'hypothesisCard.entries'),
      range,
      area,
      confidence: conf,
    })
  )
}

function hasEmergencyEvidence(entries: HealthEntry[]): boolean {
  return entries.some((e) => e.analysis.urgency === 'emergency')
}

function buildLocalizedRecommendations(
  pattern: HypothesisPattern,
  entries: HealthEntry[],
  conditionArea: string,
  t: TFunction
): string[] {
  const recs: string[] = []
  const journalContext = entries
    .map((e) => [e.title, e.description, e.medications ?? ''].join(' '))
    .join('\n')
  const specialist = suggestSpecialist(conditionArea, journalContext)
  if (specialist) {
    recs.push(localizeSpecialistBullet(specialist, t))
  }

  const bullets = t(`hypothesisContent.recommendations.${pattern}`, {
    returnObjects: true,
  })
  if (Array.isArray(bullets)) {
    recs.push(...bullets.map((b) => String(b)))
  } else if (typeof bullets === 'string' && bullets) {
    recs.push(bullets)
  }

  if (hasEmergencyEvidence(entries)) {
    recs.unshift(String(t('hypothesisContent.recommendations.emergencyUnshift')))
  }

  return recs
}

function buildLocalizedCriticalReason(
  pattern: HypothesisPattern,
  entries: HealthEntry[],
  t: TFunction
): string | undefined {
  if (hasEmergencyEvidence(entries)) {
    return String(t('hypothesisContent.critical.emergency'))
  }
  if (pattern === 'urgent') {
    return String(t('hypothesisContent.critical.urgent'))
  }
  const urgentEvidence = entries.some((e) =>
    ['urgent', 'emergency'].includes(e.analysis.urgency)
  )
  if (pattern === 'worsening' && urgentEvidence) {
    return String(t('hypothesisContent.critical.worseningUrgent'))
  }
  return undefined
}

export function buildLocalizedHypothesisDetail(
  hypothesis: Hypothesis,
  allEntries: HealthEntry[],
  t: TFunction,
  dateLocale: Locale
): HypothesisDetail {
  const base = buildHypothesisDetail(hypothesis, allEntries)
  const pattern = hypothesis.pattern ?? patternFromTitle(hypothesis.title)
  const area =
    hypothesis.conditionArea || hypothesis.title.split(':')[0]?.trim() || 'General'

  return {
    ...base,
    summary: buildLocalizedSummary(
      pattern,
      area,
      base.evidenceEntries,
      hypothesis.confidence,
      t,
      dateLocale
    ),
    recommendations: buildLocalizedRecommendations(
      pattern,
      base.evidenceEntries,
      area,
      t
    ),
    criticalReason: buildLocalizedCriticalReason(
      pattern,
      base.evidenceEntries,
      t
    ),
  }
}
