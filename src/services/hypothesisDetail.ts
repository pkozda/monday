import { format, parseISO } from 'date-fns'
import { patternFromTitle } from '@/services/hypothesisGenerator'
import type { HypothesisPattern } from '@/models/types'
import { formatJournalEntryHeader } from '@/services/journalEntryText'
import {
  formatSpecialistBullet,
  suggestSpecialist,
} from '@/services/specialistSuggestion'
import type { HealthEntry, Hypothesis } from '@/models/types'

export interface HypothesisDetail {
  pattern: HypothesisPattern
  area: string
  summary: string
  recommendations: string[]
  isCritical: boolean
  criticalReason?: string
  evidenceEntries: HealthEntry[]
}

function resolveEvidenceEntries(
  hypothesis: Hypothesis,
  allEntries: HealthEntry[]
): HealthEntry[] {
  const idSet = new Set(hypothesis.evidenceIds)
  return allEntries
    .filter((e) => idSet.has(e.id))
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )
}

function hasEmergencyEvidence(entries: HealthEntry[]): boolean {
  return entries.some((e) => e.analysis.urgency === 'emergency')
}

function hasUrgentEvidence(entries: HealthEntry[]): boolean {
  return entries.some((e) =>
    ['urgent', 'emergency'].includes(e.analysis.urgency)
  )
}

function buildSummary(
  pattern: HypothesisPattern,
  area: string,
  entries: HealthEntry[],
  confidence: string
): string {
  const count = entries.length
  const dateRange =
    count > 0
      ? `${format(parseISO(entries[0].eventDate), 'MMM d, yyyy')} – ${format(parseISO(entries[count - 1].eventDate), 'MMM d, yyyy')}`
      : 'your journal'

  switch (pattern) {
    case 'urgent':
      return `Based on ${count} journal ${count === 1 ? 'entry' : 'entries'} (${dateRange}) for ${area}, there are signals that may need prompt clinical attention. Confidence: ${confidence}. This is generated from your self-reported data, not a diagnosis.`
    case 'worsening':
      return `Your logged symptoms for ${area} suggest a possible worsening trend across ${count} ${count === 1 ? 'record' : 'records'} (${dateRange}). Confidence: ${confidence}.`
    case 'treatment_improvement':
      return `Medication or treatment changes for ${area} appear alongside improvement notes in ${count} related ${count === 1 ? 'entry' : 'entries'} (${dateRange}). Confidence: ${confidence}.`
    case 'recurring':
      return `Repeated symptom or change entries for ${area} (${count} items, ${dateRange}) suggest an ongoing pattern worth discussing with a clinician. Confidence: ${confidence}.`
    case 'treatment_unclear':
      return `You started or changed treatment for ${area}, but outcomes are not yet clear in ${count} related ${count === 1 ? 'log' : 'logs'} (${dateRange}). Confidence: ${confidence}.`
    default:
      return `Monday identified a trackable pattern for ${area} from ${count} journal ${count === 1 ? 'entry' : 'entries'} (${dateRange}). Confidence: ${confidence}.`
  }
}

function buildRecommendations(
  pattern: HypothesisPattern,
  entries: HealthEntry[],
  conditionArea: string
): string[] {
  const recs: string[] = []

  const journalContext = entries
    .map((e) => [e.title, e.description, e.medications ?? ''].join(' '))
    .join('\n')
  const specialist = suggestSpecialist(conditionArea, journalContext)
  if (specialist) {
    recs.push(formatSpecialistBullet(specialist))
  }

  switch (pattern) {
    case 'urgent':
      recs.push(
        'Contact your doctor, urgent care, or emergency services if symptoms are severe or sudden.'
      )
      recs.push(
        'Bring this summary and your journal printout to your appointment.'
      )
      recs.push('Do not delay care if you feel unsafe or symptoms are rapidly worsening.')
      break
    case 'worsening':
      recs.push('Schedule a clinician visit to review whether treatment should be adjusted.')
      recs.push('Continue logging severity daily until your appointment.')
      recs.push('Note any new triggers, medications, or limitations in your journal.')
      break
    case 'treatment_improvement':
      recs.push('Keep tracking symptoms to confirm improvement is sustained.')
      recs.push('Share positive and negative effects of treatment at your next visit.')
      recs.push('Avoid stopping prescribed medication without medical advice.')
      break
    case 'recurring':
      recs.push('Discuss frequency, triggers, and impact on daily life with your clinician.')
      recs.push('Consider a structured symptom diary for the next 2–4 weeks.')
      recs.push('Review prior tests or imaging mentioned in your journal at follow-up.')
      break
    case 'treatment_unclear':
      recs.push('Log weekly updates on symptoms and side effects while on new treatment.')
      recs.push('Book a follow-up to assess whether the treatment is working.')
      recs.push('Record exact medication names, doses, and start dates in the journal.')
      break
    default:
      recs.push('Continue regular journaling for this body area.')
      recs.push('Discuss this pattern at your next routine or scheduled visit.')
      recs.push('Add doctor visits, test results, and medication changes when they occur.')
  }

  if (hasEmergencyEvidence(entries)) {
    recs.unshift(
      'At least one journal entry was flagged as emergency-level — seek immediate care if still applicable.'
    )
  }

  return recs
}

export function buildHypothesisDetail(
  hypothesis: Hypothesis,
  allEntries: HealthEntry[]
): HypothesisDetail {
  const pattern = hypothesis.pattern ?? patternFromTitle(hypothesis.title)
  const area = hypothesis.conditionArea || hypothesis.title.split(':')[0]?.trim() || 'General'
  const evidenceEntries = resolveEvidenceEntries(hypothesis, allEntries)

  const isUrgentPattern = pattern === 'urgent' || pattern === 'worsening'
  const urgentEvidence = hasUrgentEvidence(evidenceEntries)
  const emergencyEvidence = hasEmergencyEvidence(evidenceEntries)

  const isCritical =
    pattern === 'urgent' || emergencyEvidence || (isUrgentPattern && urgentEvidence)

  let criticalReason: string | undefined
  if (emergencyEvidence) {
    criticalReason = 'Journal includes emergency-level entries.'
  } else if (pattern === 'urgent') {
    criticalReason = 'Urgent signals detected in your health journal.'
  } else if (pattern === 'worsening' && urgentEvidence) {
    criticalReason = 'Worsening trend with elevated urgency in recent logs.'
  }

  const summary =
    hypothesis.aiInsight?.narrative?.trim() ||
    buildSummary(pattern, area, evidenceEntries, hypothesis.confidence)

  const recommendations =
    hypothesis.aiInsight?.recommendations?.length &&
    hypothesis.aiInsight.recommendations.length > 0
      ? hypothesis.aiInsight.recommendations
      : buildRecommendations(pattern, evidenceEntries, area)

  return {
    pattern,
    area,
    summary,
    recommendations,
    isCritical,
    criticalReason,
    evidenceEntries,
  }
}

export function formatEvidenceLine(entry: HealthEntry): string {
  return formatJournalEntryHeader(entry)
}
