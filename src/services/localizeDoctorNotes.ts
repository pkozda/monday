import { format } from 'date-fns'
import type { Locale } from 'date-fns'
import type { Composer } from 'vue-i18n'
import { buildLocalizedHypothesisDetail } from '@/services/localizeHypothesisDetail'
import {
  formatLocalizedJournalEntryHeader,
  localizeHypothesisConfidence,
  localizeSpecialistVisitAdvice,
} from '@/services/localizeClinical'
import { journalDescriptionAddsDetail } from '@/services/journalEntryText'
import { buildPatientVisitBasicsLines } from '@/services/patientVisitBasics'
import { suggestSpecialist } from '@/services/specialistSuggestion'
import type { HealthEntry, Hypothesis, PatientProfile } from '@/models/types'

type TFunction = Composer['t']

export function generateLocalizedDoctorNotes(
  hypothesis: Hypothesis,
  profile: PatientProfile | null,
  allJournalEntries: HealthEntry[],
  t: TFunction,
  dateLocale: Locale
): string {
  const detail = buildLocalizedHypothesisDetail(
    hypothesis,
    allJournalEntries,
    t,
    dateLocale
  )
  const area = detail.area
  const today = format(new Date(), 'PP', { locale: dateLocale })

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
    String(t('doctorNotes.summaryTitle')),
    String(t('doctorNotes.preparedWith')),
    String(t('doctorNotes.generated', { date: today })),
    '',
    String(t('doctorNotes.baselineTitle')),
    ...buildPatientVisitBasicsLines(profile, allJournalEntries).map(
      (line) => `  ${line}`
    ),
    '',
    '—'.repeat(60),
    '',
    String(t('doctorNotes.reasonTitle')),
    hypothesis.title,
    '',
  ]

  if (specialist) {
    lines.push(
      String(t('doctorNotes.suggestedDoctorTitle')),
      `  ${localizeSpecialistVisitAdvice(specialist, area, t)}`,
      ''
    )
  }

  lines.push(
    String(t('doctorNotes.contextTitle')),
    detail.summary,
    '',
    String(t('doctorNotes.discussionTitle')),
    ...detail.recommendations.map((r) => `• ${r}`),
    '',
    '—'.repeat(60),
    '',
    String(t('doctorNotes.journalSectionTitle', { area: area.toUpperCase() })),
    String(
      t('doctorNotes.journalSectionMeta', {
        count: entriesForNotes.length,
        entries: t(
          entriesForNotes.length === 1
            ? 'hypothesisCard.entry'
            : 'hypothesisCard.entries'
        ),
      })
    ),
    ''
  )

  if (entriesForNotes.length === 0) {
    lines.push(String(t('doctorNotes.noEntries')), '')
  } else {
    for (const entry of entriesForNotes) {
      lines.push(
        `  ${formatLocalizedJournalEntryHeader(entry, t, dateLocale)}`
      )
      const title = entry.title.trim()
      const description = entry.description.trim()
      if (journalDescriptionAddsDetail(title, description)) {
        lines.push(`  ${description}`)
      }
      if (entry.medications?.trim()) {
        lines.push(
          `  ${t('healthEntryCard.medications')} ${entry.medications.trim()}`
        )
      }
      lines.push(
        `  ${t('doctorNotes.patternConfidence', {
          confidence: localizeHypothesisConfidence(hypothesis.confidence, t),
        })}`
      )
      lines.push('')
    }
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
