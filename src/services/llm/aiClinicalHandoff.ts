import { chatCompletionJson } from '@/services/llm/llmClient'
import { journalBundleForLlm } from '@/services/llm/llmClinicalPayload'
import { CLINICAL_SAFETY_SYSTEM } from '@/services/llm/prompts'
import { buildMedicalHistoryContext } from '@/services/medicalHistoryContext'
import type { AppLocale } from '@/i18n'
import {
  getSpecialtyLlmFocus,
  type DoctorSpecialtyId,
} from '@/services/doctorSpecialty'
import type { ClinicalModel, HealthEntry, PatientProfile } from '@/models/types'

export interface AiClinicalHandoffContent {
  chiefConcern: string
  clinicalPicture: string
  keyFactors: string[]
  timelineHighlights: string[]
  medicationsAndTreatments: string[]
  redFlags: string[]
  questionsForClinician: string[]
  discussionPoints: string[]
}

interface AiClinicalHandoffResponse {
  chiefConcern: string
  clinicalPicture: string
  keyFactors: string[]
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

export async function generateAiClinicalHandoffContent(
  model: ClinicalModel,
  profile: PatientProfile | null,
  entries: HealthEntry[],
  locale: AppLocale,
  specialtyId: DoctorSpecialtyId,
  specialtyLabel: string
): Promise<AiClinicalHandoffContent> {
  const bundle = journalBundleForLlm(entries)
  const medicalContext = buildMedicalHistoryContext(entries)
  const factorsBlock = model.factors
    .map((f) => `- ${f.name}: ${f.description}`)
    .join('\n')

  const response = await chatCompletionJson<AiClinicalHandoffResponse>(
    [
      { role: 'system', content: CLINICAL_SAFETY_SYSTEM },
      {
        role: 'user',
        content: `Prepare a clinician handoff brief from the patient's self-reported health journal and longitudinal clinical model summary. For a visit with a ${specialtyLabel} — NOT a definitive diagnosis.

Write all text in ${LOCALE_NAMES[locale]}.

Audience focus for this specialty:
${getSpecialtyLlmFocus(specialtyId)}
- Prioritize journal details most relevant to this clinician type; de-emphasize unrelated body systems unless they affect referral or safety.

Return JSON:
{
  "chiefConcern": string,
  "clinicalPicture": string,
  "keyFactors": string[],
  "timelineHighlights": string[],
  "medicationsAndTreatments": string[],
  "redFlags": string[],
  "questionsForClinician": string[],
  "discussionPoints": string[]
}

Rules:
- Ground every statement in the journal and clinical model below only.
- chiefConcern: 1–2 sentences on why the patient may be seeking care / what to review.
- clinicalPicture: 2–4 sentences synthesizing cross-cutting patterns.
- keyFactors: 3–6 bullets echoing the most important model factors (rephrase, do not invent).
- timelineHighlights: 4–8 chronological bullets with dates when known.
- redFlags: urgent/emergency signals from the journal only (empty array if none).
- questionsForClinician: 4–6 patient-appropriate questions.
- discussionPoints: 4–6 talking points for the visit.
- Cautious, non-diagnostic tone.

Patient snapshot:
${JSON.stringify(
  {
    displayName: profile?.displayName,
    dateOfBirth: profile?.dateOfBirth,
    entryCount: medicalContext.entryCount,
    spanDays: medicalContext.spanDays,
    averageSeverity: medicalContext.averageSeverity,
    urgencyCounts: medicalContext.urgencyCounts,
  },
  null,
  2
)}

Clinical model title: ${model.title}
Clinical model summary:
${model.summary}

Key factors:
${factorsBlock || '(none listed)'}

Journal:
${bundle}`,
      },
    ],
    { temperature: 0.25, maxTokens: 2800 }
  )

  return {
    chiefConcern: response.chiefConcern?.trim() ?? '',
    clinicalPicture: response.clinicalPicture?.trim() ?? '',
    keyFactors: cleanLines(response.keyFactors, 8),
    timelineHighlights: cleanLines(response.timelineHighlights, 10),
    medicationsAndTreatments: cleanLines(response.medicationsAndTreatments, 8),
    redFlags: cleanLines(response.redFlags, 6),
    questionsForClinician: cleanLines(response.questionsForClinician, 8),
    discussionPoints: cleanLines(response.discussionPoints, 8),
  }
}
