import { format, parseISO } from 'date-fns'
import { summarizeWeightTrend } from '@/services/weightTrend'
import type { HealthEntry, PatientProfile } from '@/models/types'

function formatSex(profile: PatientProfile): string | null {
  if (!profile.biologicalSex) return null
  const labels: Record<string, string> = {
    female: 'Female',
    male: 'Male',
    other: 'Other',
    prefer_not_to_say: 'Prefer not to say',
  }
  return labels[profile.biologicalSex] ?? profile.biologicalSex
}

/** Demographics + weight baseline for clinician-facing notes. */
export function buildPatientVisitBasicsLines(
  profile: PatientProfile | null,
  entries: HealthEntry[]
): string[] {
  const lines: string[] = []

  if (!profile) {
    lines.push('Patient: (profile not completed in Monday)')
  } else {
    lines.push(`Patient: ${profile.displayName}`)
    if (profile.dateOfBirth) {
      lines.push(
        `Date of birth: ${format(parseISO(profile.dateOfBirth), 'MMMM d, yyyy')}`
      )
    }
    const sex = formatSex(profile)
    if (sex) lines.push(`Biological sex: ${sex}`)
    if (profile.bloodType) lines.push(`Blood type: ${profile.bloodType}`)
  }

  const weightLine = formatWeightBaselineLine(entries)
  if (weightLine) lines.push(weightLine)

  return lines
}

export function formatWeightBaselineLine(entries: HealthEntry[]): string | null {
  const summary = summarizeWeightTrend(entries)
  if (!summary.currentLabel) return null

  let line = `Current weight (from journal): ${summary.currentLabel}`

  if (
    summary.previousLabel &&
    summary.deltaKg !== null &&
    summary.previousDate &&
    summary.trend
  ) {
    const dateLabel = format(parseISO(summary.previousDate), 'MMM yyyy')
    const delta = Math.abs(summary.deltaKg)
    if (summary.trend === 'down') {
      line += ` — down ~${delta} kg vs ${summary.previousLabel} (${dateLabel})`
    } else if (summary.trend === 'up') {
      line += ` — up ~${delta} kg vs ${summary.previousLabel} (${dateLabel})`
    }
  }

  return line
}
