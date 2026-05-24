import { format, parseISO } from 'date-fns'
import type { Locale } from 'date-fns'
import type { Composer } from 'vue-i18n'
import type { AppLocale } from '@/i18n'
import { buildPatientVisitBasicsLines } from '@/services/patientVisitBasics'
import { formatJournalEntryClinicianLines } from '@/services/journalEntryText'
import {
  filterEntriesForSpecialty,
  type DoctorSpecialtyId,
} from '@/services/doctorSpecialty'
import {
  generateAiClinicalHandoffContent,
  type AiClinicalHandoffContent,
} from '@/services/llm/aiClinicalHandoff'
import { shouldUseAiInsights, isLlmProxyConfigured } from '@/services/llm/config'
import type { ClinicalModel, HealthEntry, PatientProfile } from '@/models/types'

type TFunction = Composer['t']

function bulletLines(items: string[]): string[] {
  return items.map((item) => `• ${item}`)
}

function formatAiClinicalHandoffDocument(
  ai: AiClinicalHandoffContent,
  model: ClinicalModel,
  profile: PatientProfile | null,
  entries: HealthEntry[],
  specialtyLabel: string,
  t: TFunction,
  dateLocale: Locale
): string {
  const today = format(new Date(), 'PP', { locale: dateLocale })

  const lines: string[] = [
    String(t('doctorNotes.summaryTitle')),
    String(t('doctorNotes.preparedWith')),
    String(t('doctorNotes.generated', { date: today })),
    String(t('doctorNotes.preparedForSpecialty', { specialty: specialtyLabel })),
    String(t('doctorNotes.clinicalModelBadge')),
    '',
    String(t('doctorNotes.baselineTitle')),
    ...buildPatientVisitBasicsLines(profile, entries).map((line) => `  ${line}`),
    '',
    '—'.repeat(60),
    '',
    String(t('doctorNotes.clinicalModelSectionTitle')),
    model.summary,
    '',
  ]

  if (model.factors.length > 0) {
    lines.push(String(t('doctorNotes.clinicalModelFactorsTitle')))
    for (const factor of model.factors) {
      lines.push(`• ${factor.name}: ${factor.description}`)
    }
    lines.push('')
  }

  if (ai.keyFactors.length > 0) {
    lines.push(
      String(t('doctorNotes.clinicalModelAiFactorsTitle')),
      ...bulletLines(ai.keyFactors),
      ''
    )
  }

  lines.push(
    String(t('doctorNotes.aiChiefConcernTitle')),
    ai.chiefConcern,
    '',
    String(t('doctorNotes.aiClinicalPictureTitle')),
    ai.clinicalPicture,
    ''
  )

  if (ai.timelineHighlights.length > 0) {
    lines.push(String(t('doctorNotes.aiTimelineTitle')), ...bulletLines(ai.timelineHighlights), '')
  }

  if (ai.medicationsAndTreatments.length > 0) {
    lines.push(
      String(t('doctorNotes.aiMedicationsTitle')),
      ...bulletLines(ai.medicationsAndTreatments),
      ''
    )
  }

  if (ai.redFlags.length > 0) {
    lines.push(String(t('doctorNotes.aiRedFlagsTitle')), ...bulletLines(ai.redFlags), '')
  }

  lines.push(
    String(t('doctorNotes.aiQuestionsTitle')),
    ...bulletLines(ai.questionsForClinician),
    '',
    String(t('doctorNotes.discussionTitle')),
    ...bulletLines(ai.discussionPoints),
    '',
    '—'.repeat(60),
    '',
    String(t('doctorNotes.clinicalJournalSectionTitle', { count: entries.length })),
    ''
  )

  const chronological = [...entries].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  )
  const recent = chronological.slice(-12)
  for (const entry of recent) {
    lines.push(...formatJournalEntryClinicianLines(entry))
    lines.push('')
  }
  if (entries.length > recent.length) {
    lines.push(
      String(t('doctorNotes.clinicalJournalTruncated', {
        shown: recent.length,
        total: entries.length,
      })),
      ''
    )
  }

  lines.push(
    '—'.repeat(60),
    '',
    String(t('doctorNotes.disclaimerTitle')),
    String(t('doctorNotes.disclaimerBody')),
    '',
    String(t('doctorNotes.signatureLine'))
  )

  return lines.join('\n')
}

function formatRuleBasedClinicalHandoff(
  model: ClinicalModel,
  profile: PatientProfile | null,
  entries: HealthEntry[],
  specialtyId: DoctorSpecialtyId,
  specialtyLabel: string,
  t: TFunction,
  dateLocale: Locale
): string {
  const today = format(new Date(), 'PP', { locale: dateLocale })

  const lines: string[] = [
    String(t('doctorNotes.summaryTitle')),
    String(t('doctorNotes.preparedWith')),
    String(t('doctorNotes.generated', { date: today })),
    String(t('doctorNotes.preparedForSpecialty', { specialty: specialtyLabel })),
    '',
    String(t('doctorNotes.baselineTitle')),
    ...buildPatientVisitBasicsLines(profile, entries).map((line) => `  ${line}`),
    '',
    '—'.repeat(60),
    '',
    String(t('doctorNotes.clinicalModelSectionTitle')),
    model.summary,
    '',
  ]

  if (model.factors.length > 0) {
    lines.push(String(t('doctorNotes.clinicalModelFactorsTitle')))
    for (const factor of model.factors) {
      lines.push(`• ${factor.name}: ${factor.description}`)
    }
    lines.push('')
  }

  lines.push(String(t('doctorNotes.discussionTitle')))
  lines.push(`• ${String(t('doctorNotes.clinicalDiscussReview'))}`)
  lines.push(`• ${String(t('doctorNotes.clinicalDiscussTrajectory'))}`)
  lines.push(`• ${String(t(`doctorNotes.specialtyFocus.${specialtyId}`))}`)
  lines.push('')

  const urgent = entries.filter((e) =>
    ['urgent', 'emergency'].includes(e.analysis.urgency)
  )
  if (urgent.length > 0) {
    lines.push(String(t('doctorNotes.aiRedFlagsTitle')))
    for (const entry of urgent.slice(0, 6)) {
      let dateLabel = entry.eventDate
      try {
        dateLabel = format(parseISO(entry.eventDate), 'MMM d, yyyy', {
          locale: dateLocale,
        })
      } catch {
        /* keep raw */
      }
      lines.push(`• ${dateLabel} — ${entry.title} (${entry.conditionArea})`)
    }
    lines.push('')
  }

  lines.push(
    String(t('doctorNotes.clinicalJournalSectionTitle', { count: entries.length })),
    ''
  )

  const chronological = [...entries].sort(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
  )
  for (const entry of chronological.slice(-15)) {
    lines.push(...formatJournalEntryClinicianLines(entry))
    lines.push('')
  }

  lines.push(
    '—'.repeat(60),
    '',
    String(t('doctorNotes.disclaimerTitle')),
    String(t('doctorNotes.disclaimerBody')),
    '',
    String(t('doctorNotes.signatureLine'))
  )

  return lines.join('\n')
}

export async function generateClinicalDoctorNotesAsync(
  model: ClinicalModel,
  profile: PatientProfile | null,
  entries: HealthEntry[],
  specialtyId: DoctorSpecialtyId,
  t: TFunction,
  dateLocale: Locale,
  locale: AppLocale
): Promise<string> {
  if (entries.length === 0) {
    return String(t('doctorNotes.clinicalNoJournal'))
  }

  const specialtyLabel = String(t(`doctorSpecialty.${specialtyId}`))
  const focusedEntries = filterEntriesForSpecialty(entries, specialtyId)

  if (shouldUseAiInsights() && isLlmProxyConfigured()) {
    try {
      const ai = await generateAiClinicalHandoffContent(
        model,
        profile,
        focusedEntries,
        locale,
        specialtyId,
        specialtyLabel
      )
      if (ai.chiefConcern || ai.clinicalPicture) {
        return formatAiClinicalHandoffDocument(
          ai,
          model,
          profile,
          focusedEntries,
          specialtyLabel,
          t,
          dateLocale
        )
      }
    } catch (err) {
      console.warn('[Monday] AI clinical handoff failed; using template notes.', err)
    }
  }

  return formatRuleBasedClinicalHandoff(
    model,
    profile,
    focusedEntries,
    specialtyId,
    specialtyLabel,
    t,
    dateLocale
  )
}

export type { DoctorSpecialtyId }
