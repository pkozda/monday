import { chatCompletionJson } from '@/services/llm/llmClient'
import { CLINICAL_SAFETY_SYSTEM, journalBundleUserPayload } from '@/services/llm/prompts'
import { buildHypothesisDetail } from '@/services/hypothesisDetail'
import { buildMedicalHistoryContext } from '@/services/medicalHistoryContext'
import type { AppLocale } from '@/i18n'
import type { HealthEntry, Hypothesis, PatientProfile } from '@/models/types'

export interface AiDoctorNotesContent {
  chiefConcern: string
  clinicalPicture: string
  timelineHighlights: string[]
  medicationsAndTreatments: string[]
  redFlags: string[]
  questionsForClinician: string[]
  discussionPoints: string[]
}

interface AiDoctorNotesResponse {
  chiefConcern: string
  clinicalPicture: string
  timelineHighlights: string[]
  medicationsAndTreatments: string[]
  redFlags: string[]
  questionsForClinician: string[]
  discussionPoints: string[]
}

const LOCALE_NAMES: Record<AppLocale, string> = {
  en: 'English',
  de: 'German',
  ru: 'Russian',
}

function cleanLines(items: string[] | undefined, max: number): string[] {
  return (items ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max)
}

export async function generateAiDoctorNotesContent(
  hypothesis: Hypothesis,
  profile: PatientProfile | null,
  allJournalEntries: HealthEntry[],
  locale: AppLocale
): Promise<AiDoctorNotesContent> {
  const detail = buildHypothesisDetail(hypothesis, allJournalEntries)
  const area = detail.area

  const areaEntries = allJournalEntries
    .filter((e) => e.conditionArea.trim().toLowerCase() === area.toLowerCase())
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )

  const entriesForNotes =
    areaEntries.length > 0 ? areaEntries : detail.evidenceEntries

  const bundle = journalBundleUserPayload(
    entriesForNotes.map((e) => ({
      id: e.id,
      eventDate: e.eventDate,
      conditionArea: e.conditionArea,
      entryType: e.entryType,
      title: e.title,
      description: e.description,
      medications: e.medications,
      severity: e.severity,
      analysis: {
        urgency: e.analysis.urgency,
        classification: e.analysis.classification,
        flags: e.analysis.flags,
        summary: e.analysis.summary,
      },
    }))
  )

  const medicalContext = buildMedicalHistoryContext(allJournalEntries)
  const historySnapshot = JSON.stringify(
    {
      entryCount: medicalContext.entryCount,
      spanDays: medicalContext.spanDays,
      averageSeverity: medicalContext.averageSeverity,
      urgencyCounts: medicalContext.urgencyCounts,
      hasDoctorVisit: medicalContext.hasDoctorVisit,
      hasImaging: medicalContext.hasImaging,
      medicationSnippet: medicalContext.medicationSnippet,
      weightSignals: medicalContext.weightClinicalSignals.map((s) => s.label),
    },
    null,
    2
  )

  const response = await chatCompletionJson<AiDoctorNotesResponse>(
    [
      { role: 'system', content: CLINICAL_SAFETY_SYSTEM },
      {
        role: 'user',
        content: `Prepare a clinician handoff brief from the patient's self-reported journal. This is for a doctor visit — NOT a definitive diagnosis.

Write all text in ${LOCALE_NAMES[locale]}.

Return JSON:
{
  "chiefConcern": string,
  "clinicalPicture": string,
  "timelineHighlights": string[],
  "medicationsAndTreatments": string[],
  "redFlags": string[],
  "questionsForClinician": string[],
  "discussionPoints": string[]
}

Rules:
- Synthesize; do NOT paste long journal excerpts or list every entry verbatim.
- timelineHighlights: 4–8 dated bullets (include approximate dates from entries), most clinically relevant first.
- medicationsAndTreatments: only what appears in the journal; empty array if none.
- redFlags: urgent/emergency signals or worsening patterns from data; empty if none.
- questionsForClinician: 3–6 thoughtful questions the clinician might explore (not patient self-diagnosis).
- discussionPoints: 3–6 agenda items for the visit.
- clinicalPicture: 2–4 sentences integrating pattern, trajectory, and hypothesis context.
- chiefConcern: one sentence reason for this visit summary.
- Use only facts from the journal and context below.

Hypothesis focus:
${JSON.stringify(
          {
            title: hypothesis.title,
            pattern: hypothesis.pattern,
            confidence: hypothesis.confidence,
            conditionArea: area,
            ruleSummary: detail.summary,
            ruleRecommendations: detail.recommendations,
          },
          null,
          2
        )}

Patient profile:
${JSON.stringify(profile ?? { note: 'Profile not completed' }, null, 2)}

Broader medical history context:
${historySnapshot}

Journal entries for this focus (${entriesForNotes.length}):
${bundle}`,
      },
    ],
    { temperature: 0.25, maxTokens: 2800 }
  )

  return {
    chiefConcern: (response.chiefConcern ?? hypothesis.title).trim(),
    clinicalPicture: (response.clinicalPicture ?? detail.summary).trim(),
    timelineHighlights: cleanLines(response.timelineHighlights, 8),
    medicationsAndTreatments: cleanLines(response.medicationsAndTreatments, 8),
    redFlags: cleanLines(response.redFlags, 6),
    questionsForClinician: cleanLines(response.questionsForClinician, 6),
    discussionPoints: cleanLines(
      response.discussionPoints?.length
        ? response.discussionPoints
        : detail.recommendations,
      8
    ),
  }
}
