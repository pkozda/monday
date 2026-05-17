import { format, parseISO } from 'date-fns'
import { buildHypothesisDetail, formatEvidenceLine } from '@/services/hypothesisDetail'
import { getEntryClassificationLabel } from '@/services/healthAnalysis'
import type { HealthEntry, Hypothesis, PatientProfile } from '@/models/types'

function formatPatientLine(profile: PatientProfile | null): string[] {
  if (!profile) return ['Patient: (profile not completed)']
  const lines = [`Patient: ${profile.displayName}`]
  if (profile.dateOfBirth) {
    lines.push(
      `Date of birth: ${format(parseISO(profile.dateOfBirth), 'MMMM d, yyyy')}`
    )
  }
  if (profile.biologicalSex) {
    const sexLabels: Record<string, string> = {
      female: 'Female',
      male: 'Male',
      other: 'Other',
      prefer_not_to_say: 'Prefer not to say',
    }
    lines.push(`Biological sex: ${sexLabels[profile.biologicalSex] ?? profile.biologicalSex}`)
  }
  if (profile.bloodType) {
    lines.push(`Blood type: ${profile.bloodType}`)
  }
  return lines
}

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

  const lines: string[] = [
    'SUMMARY FOR CLINICIAN',
    'Prepared with Monday Health Journal',
    `Generated: ${today}`,
    '',
    ...formatPatientLine(profile),
    '',
    '—'.repeat(60),
    '',
    'REASON FOR THIS SUMMARY',
    hypothesis.title,
    '',
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
    '',
  ]

  if (entriesForNotes.length === 0) {
    lines.push('(No journal entries found for this area.)', '')
  } else {
    for (const entry of entriesForNotes) {
      lines.push(formatEvidenceLine(entry))
      lines.push(`  ${entry.description.trim()}`)
      if (entry.medications?.trim()) {
        lines.push(`  Medications: ${entry.medications.trim()}`)
      }
      lines.push(
        `  Classification: ${getEntryClassificationLabel(entry)} · Confidence in pattern: ${hypothesis.confidence}`
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
