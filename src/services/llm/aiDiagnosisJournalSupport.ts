import { areasMatch } from '@/services/bodyAreaDetection'
import { entryHasDiagnosisSupport } from '@/services/clinicalConfirmation'
import { entryText } from '@/services/medicalHistoryContext'
import type {
  DiagnosisCriterion,
  DiagnosisMatchFlag,
  DiagnosisVariant,
  HealthEntry,
} from '@/models/types'

function slugifyArea(area: string): string {
  const slug = area
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
  return slug || 'general'
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4)
}

function entrySupportsVariant(
  entry: HealthEntry,
  conditionName: string,
  rationale: string
): boolean {
  const text = entryText(entry).toLowerCase()
  const nameTokens = tokenize(conditionName)
  const rationaleTokens = tokenize(rationale)

  const nameHits = nameTokens.filter((t) => text.includes(t)).length
  if (nameHits >= 2 || (nameHits === 1 && nameTokens[0]?.length >= 6)) {
    return true
  }

  const rationaleHits = rationaleTokens.filter((t) => text.includes(t)).length
  if (rationaleHits >= 2) return true

  for (const token of nameTokens) {
    if (token.length >= 5 && rationale.toLowerCase().includes(token)) {
      if (text.includes(token)) return true
    }
  }

  return false
}

function criterionLabelForEntry(entry: HealthEntry): string {
  const title = entry.title.trim()
  const snippet = entry.description.trim().split(/\n/)[0]?.trim() ?? ''
  if (snippet && snippet.length > 12 && snippet.length < 120) {
    return snippet
  }
  return title || entry.conditionArea
}

function buildMatchFlagsFromCriteria(
  criteria: DiagnosisCriterion[],
  conditionName: string
): DiagnosisMatchFlag[] {
  const flags: DiagnosisMatchFlag[] = []

  for (const criterion of criteria) {
    if (criterion.status !== 'met' || !criterion.detail) continue
    flags.push({
      kind: 'journal_pattern',
      label: criterion.text.slice(0, 80),
      detail: criterion.linkExplanation?.trim() || criterion.detail || '',
    })
  }

  if (flags.length === 0) {
    flags.push({
      kind: 'named_condition',
      label: conditionName,
      detail:
        'Exploratory suggestion from your journal — discuss with a qualified clinician.',
    })
  }

  return flags.slice(0, 8)
}

/**
 * Rule-based path sets id, confirmCriteria, and journal counts; AI-only variants need the same
 * so variant tabs work and journal evidence sections can render.
 */
export function enrichAiDiagnosisVariant(
  variant: DiagnosisVariant,
  entries: HealthEntry[],
  variantIndex = 0
): DiagnosisVariant {
  const diseaseSlug =
    variant.diseaseId ??
    variant.diseaseName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 48)
  const id = variant.id?.trim() || `${slugifyArea(variant.conditionArea)}-${diseaseSlug}`

  const areaEntries = entries.filter((e) =>
    areasMatch(e.conditionArea, variant.conditionArea)
  )
  const pool =
    areaEntries.length > 0
      ? areaEntries
      : entries.filter((e) => entryHasDiagnosisSupport(e))

  const confirmCriteria: DiagnosisCriterion[] = []
  const seenEntryIds = new Set<string>()

  for (const entry of pool) {
    if (!entryHasDiagnosisSupport(entry)) continue

    const include =
      pool.length === 1 ||
      entrySupportsVariant(entry, variant.diseaseName, variant.rationale)

    if (!include) continue
    if (seenEntryIds.has(entry.id)) continue
    seenEntryIds.add(entry.id)

    const text = criterionLabelForEntry(entry)
    confirmCriteria.push({
      id: `ai-journal-${entry.id}-${variantIndex}`,
      text,
      role: 'confirm',
      status: 'met',
      detail: `${entry.conditionArea.trim()} — ${entry.title.trim()}`,
      sourceEntryId: entry.id,
    })
  }

  if (confirmCriteria.length === 0 && entries.length > 0) {
    const fallback = (areaEntries[0] ?? entries[0])!
    if (entryHasDiagnosisSupport(fallback)) {
      confirmCriteria.push({
        id: `ai-journal-${fallback.id}-${variantIndex}`,
        text: criterionLabelForEntry(fallback),
        role: 'confirm',
        status: 'met',
        detail: `${fallback.conditionArea.trim()} — ${fallback.title.trim()}`,
        sourceEntryId: fallback.id,
      })
      seenEntryIds.add(fallback.id)
    }
  }

  const matchFlags = buildMatchFlagsFromCriteria(
    confirmCriteria,
    variant.diseaseName
  )

  return {
    ...variant,
    id,
    diseaseId: variant.diseaseId ?? diseaseSlug,
    confirmCriteria,
    excludeCriteria: variant.excludeCriteria ?? [],
    matchFlags,
    primaryJournalCount: seenEntryIds.size,
    crossBodyJournalCount:
      variant.crossBodyJournalCount ??
      Math.max(0, seenEntryIds.size - areaEntries.length),
    aiEnhanced: true,
    aiRanked: true,
  }
}

export function enrichAiDiagnosisReports(
  reports: import('@/models/types').DiagnosisReport[],
  entries: HealthEntry[]
): import('@/models/types').DiagnosisReport[] {
  let variantIndex = 0
  return reports.map((report) => ({
    ...report,
    variants: report.variants.map((variant) =>
      enrichAiDiagnosisVariant(variant, entries, variantIndex++)
    ),
  }))
}

export async function enrichAiDiagnosisReportsAsync(
  reports: import('@/models/types').DiagnosisReport[],
  entries: HealthEntry[]
): Promise<import('@/models/types').DiagnosisReport[]> {
  const { fillJournalLinkExplanations } = await import(
    '@/services/llm/aiDiagnosisJournalLinks'
  )
  const enriched = enrichAiDiagnosisReports(reports, entries)
  return fillJournalLinkExplanations(enriched, entries)
}

/** Stable key for tabs when legacy stored rows lack `id`. */
export function diagnosisVariantKey(variant: DiagnosisVariant): string {
  if (variant.id?.trim()) return variant.id
  const area = slugifyArea(variant.conditionArea)
  const disease =
    variant.diseaseId ??
    variant.diseaseName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 48)
  return `${area}-${disease}`
}
