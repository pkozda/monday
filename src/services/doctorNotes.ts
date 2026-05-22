import { format } from 'date-fns'
import { buildHypothesisDetail } from '@/services/hypothesisDetail'
import { formatJournalEntryClinicianLines } from '@/services/journalEntryText'
import { buildPatientVisitBasicsLines } from '@/services/patientVisitBasics'
import {
  formatSpecialistVisitAdvice,
  suggestSpecialist,
} from '@/services/specialistSuggestion'
import type { HealthEntry, Hypothesis, PatientProfile } from '@/models/types'

export function generateDoctorNotes(
  hypothesis: Hypothesis,
  profile: PatientProfile | null,
  allJournalEntries: HealthEntry[]
): string {
  const detail = buildHypothesisDetail(hypothesis, allJournalEntries)
  const area = detail.area
  const today = format(new Date(), 'MMMM d, yyyy')

  const areaEntries = allJournalEntries
    .filter((e) => e.conditionArea.trim().toLowerCase() === area.toLowerCase())
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )

  const entriesForNotes =
    areaEntries.length > 0 ? areaEntries : detail.evidenceEntries

  const journalContext = entriesForNotes
    .map((e) => [e.title, e.description, e.medications ?? ''].join(' '))
    .join('\n')
  const specialist = suggestSpecialist(area, journalContext)

  const lines: string[] = [
    'SUMMARY FOR CLINICIAN',
    'Prepared with Monday Health Journal',
    `Generated: ${today}`,
    '',
    'PATIENT BASELINE',
    ...buildPatientVisitBasicsLines(profile, allJournalEntries).map(
      (line) => `  ${line}`
    ),
    '',
    '—'.repeat(60),
    '',
    'REASON FOR THIS SUMMARY',
    hypothesis.title,
    '',
  ]

  if (specialist) {
    lines.push(
      'SUGGESTED TYPE OF DOCTOR',
      `  ${formatSpecialistVisitAdvice(specialist, area)}`,
      ''
    )
  }

  lines.push(
    'PATIENT-REPORTED CONTEXT',
    detail.summary,
    '',
    'SUGGESTED DISCUSSION POINTS',
    ...detail.recommendations.map((r) => `• ${r}`),
    '',
    '—'.repeat(60),
    '',
    `HEALTH JOURNAL — ${area.toUpperCase()}`,
    `(${entriesForNotes.length} ${entriesForNotes.length === 1 ? 'entry' : 'entries'}, chronological)`,
    ''
  )

  if (entriesForNotes.length === 0) {
    lines.push('(No journal entries found for this area.)', '')
  } else {
    for (const entry of entriesForNotes) {
      lines.push(...formatJournalEntryClinicianLines(entry))
      lines.push(
        `  Pattern confidence: ${hypothesis.confidence}`
      )
      lines.push('')
    }
  }

  lines.push(
    '—'.repeat(60),
    '',
    'DISCLAIMER',
    'This document was generated from self-reported journal entries stored locally on the',
    "patient's device. It is not a medical diagnosis and does not replace clinical assessment.",
    '',
    'Signature / date: _______________________________'
  )

  return lines.join('\n')
}
