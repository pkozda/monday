import {
  filterEducationSymptoms,
  getDiseaseEducation,
} from '@/data/diseaseEducation'
import {
  entryHasDiagnosisSupport,
  supportReasonForEntry,
  type DiagnosisSupportReason,
} from '@/services/clinicalConfirmation'
import { symptomMatchesCriterionText } from '@/services/diagnosisJournalFit'
import type {
  DiagnosisCriterion,
  DiagnosisVariant,
  HealthEntry,
} from '@/models/types'

export interface UserJournalEvidenceRow {
  id: string
  entryId?: string
  /** What the user named the entry (their words) */
  loggedTitle: string
  /** Snippet from their description */
  loggedQuote?: string
  bodyArea: string
  eventDate?: string
  /** i18n key: diseaseInsight.supportReason.* — fallback when linkExplanation is absent */
  supportReason: DiagnosisSupportReason
  /** AI-generated: why this entry supports this specific possible condition */
  linkExplanation?: string
}

function snippet(text: string, maxLen = 160): string | undefined {
  const trimmed = text.trim()
  if (!trimmed) return undefined
  if (trimmed.length <= maxLen) return trimmed
  return `${trimmed.slice(0, maxLen - 1).trim()}…`
}

function parseDetailParts(detail: string | undefined): {
  area: string
  title: string
} {
  if (!detail?.trim()) return { area: '', title: '' }
  const dash = detail.indexOf('—')
  if (dash === -1) return { area: '', title: detail.trim() }
  return {
    area: detail.slice(0, dash).trim(),
    title: detail.slice(dash + 1).trim(),
  }
}

function findEntryForDetail(
  detail: string | undefined,
  entries: HealthEntry[]
): HealthEntry | undefined {
  const { area, title } = parseDetailParts(detail)
  if (!title) return undefined

  const titleKey = title.toLowerCase()
  const areaKey = area.toLowerCase()

  const exact = entries.find(
    (e) =>
      e.title.trim().toLowerCase() === titleKey &&
      (!areaKey || e.conditionArea.trim().toLowerCase() === areaKey)
  )
  if (exact) return exact

  return entries.find((e) => e.title.trim().toLowerCase() === titleKey)
}

function buildRowFromEntry(
  id: string,
  entry: HealthEntry,
  criterionText: string,
  linkExplanation?: string
): UserJournalEvidenceRow {
  return {
    id,
    entryId: entry.id,
    loggedTitle: entry.title.trim(),
    loggedQuote: snippet(entry.description),
    bodyArea: entry.conditionArea.trim(),
    eventDate: entry.eventDate,
    supportReason: supportReasonForEntry(entry, criterionText),
    linkExplanation: linkExplanation?.trim() || undefined,
  }
}

function resolveEntryForCriterion(
  criterion: DiagnosisCriterion,
  entries: HealthEntry[]
): HealthEntry | undefined {
  if (criterion.sourceEntryId) {
    return entries.find((e) => e.id === criterion.sourceEntryId)
  }
  return findEntryForDetail(criterion.detail, entries)
}

/** User-facing journal proof rows — one per matched journal entry / criterion. */
export function buildUserJournalEvidence(
  variant: DiagnosisVariant,
  entries: HealthEntry[] = []
): UserJournalEvidenceRow[] {
  const rows: UserJournalEvidenceRow[] = []
  const seenEntryIds = new Set<string>()

  for (const criterion of variant.confirmCriteria) {
    if (criterion.status !== 'met') continue

    const entry = resolveEntryForCriterion(criterion, entries)
    if (entry) {
      if (!entryHasDiagnosisSupport(entry)) continue
      if (seenEntryIds.has(entry.id)) continue
      seenEntryIds.add(entry.id)
      rows.push(
        buildRowFromEntry(
          criterion.id,
          entry,
          criterion.text,
          criterion.linkExplanation
        )
      )
      continue
    }
  }

  return rows
}

export function buildReferenceTypicalSymptoms(diseaseId: string): string[] {
  return filterEducationSymptoms(getDiseaseEducation(diseaseId).commonSymptoms)
}

export function buildMissingTypicalSymptoms(
  diseaseId: string,
  confirmCriteria: DiagnosisCriterion[],
  entries: HealthEntry[] = []
): { id: string; text: string }[] {
  const metCriteria = confirmCriteria.filter((c) => c.status === 'met')
  const typical = buildReferenceTypicalSymptoms(diseaseId)
  const missing: { id: string; text: string }[] = []

  typical.forEach((text, i) => {
    const matched = metCriteria.some((c) =>
      symptomMatchesCriterionText(text, c.text)
    )
    if (matched) return
    missing.push({ id: `typical-${i}`, text })
  })

  for (const criterion of confirmCriteria) {
    if (criterion.status !== 'not_met') continue
    const covered = typical.some((symptom) =>
      symptomMatchesCriterionText(symptom, criterion.text)
    )
    if (covered) continue
    missing.push({ id: criterion.id, text: criterion.text })
  }

  return missing
}
