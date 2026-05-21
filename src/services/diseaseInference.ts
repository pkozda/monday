import { MEDICAL_DISEASE_CATALOG, type DiseaseDefinition } from '@/data/medicalDiseaseCatalog'
import { patternFromTitle } from '@/services/hypothesisGenerator'
import type {
  DiagnosisMatchFlag,
  HealthEntry,
  Hypothesis,
  HypothesisPattern,
} from '@/models/types'

export interface InferredDisease {
  diseaseId: string
  diseaseName: string
  score: number
  matchedSignals: string[]
  matchFlags: DiagnosisMatchFlag[]
  primaryJournalCount: number
  crossBodyJournalCount: number
}

const PATTERN_BOOST: Record<HypothesisPattern, number> = {
  urgent: 1.35,
  worsening: 1.25,
  recurring: 1.2,
  treatment_improvement: 1.1,
  treatment_unclear: 1.05,
  general: 1,
}

const FLAG_LABELS: Record<string, string> = {
  worsening_or_persistent: 'Worsening or persistent symptoms',
  needs_attention: 'Needs clinical attention',
  medication_change: 'Medication change noted',
  new_symptom: 'New symptom reported',
  follow_up_recommended: 'Follow-up recommended',
}

function areasMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

function entryText(entry: HealthEntry): string {
  return [
    entry.conditionArea,
    entry.title,
    entry.description,
    entry.medications ?? '',
    entry.analysis.summary,
    entry.analysis.classification,
  ].join(' ')
}

function areaMatchesHint(area: string, hint: RegExp): boolean {
  return hint.test(area.trim())
}

function keywordLabel(pattern: RegExp): string {
  return pattern
    .source
    .replace(/\\b/g, '')
    .replace(/\\/g, '')
    .replace(/[^a-z0-9\s+]/gi, ' ')
    .trim()
    .slice(0, 40)
}

function formatJournalFlag(flag: string): string {
  return FLAG_LABELS[flag] ?? flag.replace(/_/g, ' ')
}

function pushFlag(
  flags: DiagnosisMatchFlag[],
  flag: DiagnosisMatchFlag
): void {
  const key = `${flag.kind}:${flag.label}:${flag.detail}`
  if (flags.some((f) => `${f.kind}:${f.label}:${f.detail}` === key)) return
  flags.push(flag)
}

function scoreDisease(
  disease: DiseaseDefinition,
  primaryArea: string,
  allEntries: HealthEntry[],
  allHypotheses: Hypothesis[]
): InferredDisease | null {
  const matchFlags: DiagnosisMatchFlag[] = []
  const matchedSignals: string[] = []
  let score = 0

  const primaryEntries = allEntries.filter((e) =>
    areasMatch(e.conditionArea, primaryArea)
  )
  const crossEntries = allEntries.filter(
    (e) => !areasMatch(e.conditionArea, primaryArea)
  )

  const areaMatch = disease.areaHints.some((hint) =>
    areaMatchesHint(primaryArea, hint)
  )
  if (areaMatch) {
    score += 2.5
    pushFlag(matchFlags, {
      kind: 'body_area',
      label: 'Matches tracked body area',
      detail: primaryArea,
      sourceArea: primaryArea,
    })
    matchedSignals.push(`Body area: ${primaryArea}`)
  }

  const contributingPrimary = new Set<string>()
  const contributingCross = new Set<string>()

  for (const entry of allEntries) {
    const text = entryText(entry)
    const isPrimary = areasMatch(entry.conditionArea, primaryArea)

    for (const pattern of disease.keywords) {
      if (!pattern.test(text)) continue

      const weight = isPrimary ? 2 : 1.35
      score += weight
      if (isPrimary) contributingPrimary.add(entry.id)
      else contributingCross.add(entry.id)

      const kw = keywordLabel(pattern)
      pushFlag(matchFlags, {
        kind: isPrimary ? 'keyword' : 'cross_body',
        label: isPrimary
          ? 'Symptom or term in this area'
          : 'Related symptom in another body area',
        detail: `${entry.conditionArea} — “${entry.title}” (matched “${kw}”)`,
        sourceArea: entry.conditionArea,
      })
      if (!matchedSignals.some((s) => s.includes(kw))) {
        matchedSignals.push(
          isPrimary ? `Journal: “${kw}”` : `Other area (${entry.conditionArea}): “${kw}”`
        )
      }
    }

    if (disease.medicationHints) {
      for (const med of disease.medicationHints) {
        if (!med.test(text)) continue
        score += isPrimary ? 2.5 : 1.75
        if (isPrimary) contributingPrimary.add(entry.id)
        else contributingCross.add(entry.id)
        pushFlag(matchFlags, {
          kind: 'medication',
          label: isPrimary
            ? 'Supporting medication in this area'
            : 'Supporting medication logged elsewhere',
          detail: `${entry.conditionArea} — ${entry.medications || entry.title}`,
          sourceArea: entry.conditionArea,
        })
        matchedSignals.push(
          isPrimary
            ? 'Medication in this area'
            : `Medication (${entry.conditionArea})`
        )
        break
      }
    }

    const nameSimplified = disease.name
      .replace(/\([^)]*\)/g, '')
      .trim()
      .toLowerCase()
    if (
      text.toLowerCase().includes(nameSimplified) ||
      text.toLowerCase().includes(disease.id.replace(/_/g, ' '))
    ) {
      score += isPrimary ? 4 : 2.5
      if (isPrimary) contributingPrimary.add(entry.id)
      else contributingCross.add(entry.id)
      pushFlag(matchFlags, {
        kind: 'named_condition',
        label: 'Condition named in journal',
        detail: `${entry.conditionArea} — ${entry.title}`,
        sourceArea: entry.conditionArea,
      })
      matchedSignals.push('Condition named in journal')
    }

    if (entry.analysis.flags.length > 0) {
      const textMatched = disease.keywords.some((p) => p.test(text))
      if (textMatched || areaMatch) {
        for (const flag of entry.analysis.flags) {
          pushFlag(matchFlags, {
            kind: 'journal_flag',
            label: formatJournalFlag(flag),
            detail: `${entry.conditionArea} — ${entry.title}`,
            sourceArea: entry.conditionArea,
          })
        }
      }
    }

    if (['urgent', 'emergency'].includes(entry.analysis.urgency)) {
      if (disease.relatedPatterns?.includes('urgent')) {
        score += isPrimary ? 1.5 : 1
        pushFlag(matchFlags, {
          kind: 'urgency',
          label: `${entry.analysis.urgency} urgency in journal`,
          detail: `${entry.conditionArea} — ${entry.analysis.classification}`,
          sourceArea: entry.conditionArea,
        })
      }
    }
  }

  for (const hypothesis of allHypotheses) {
    const pattern =
      hypothesis.pattern ?? patternFromTitle(hypothesis.title)
    if (!disease.relatedPatterns?.includes(pattern)) continue

    const hArea =
      hypothesis.conditionArea?.trim() ||
      hypothesis.title.split(':')[0]?.trim() ||
      ''
    const isPrimary = areasMatch(hArea, primaryArea)

    score *= isPrimary ? PATTERN_BOOST[pattern] : PATTERN_BOOST[pattern] * 0.95
    pushFlag(matchFlags, {
      kind: 'hypothesis',
      label: isPrimary
        ? 'Aligned hypothesis for this area'
        : 'Related hypothesis from another area',
      detail: `${hArea}: ${hypothesis.title} (${pattern.replace(/_/g, ' ')})`,
      sourceArea: hArea,
    })
    matchedSignals.push(
      isPrimary
        ? `Hypothesis: ${pattern}`
        : `Hypothesis (${hArea}): ${pattern}`
    )
    break
  }

  if (score < 2) return null

  const primaryCount = contributingPrimary.size
  const crossCount = contributingCross.size
  const totalContributing = primaryCount + crossCount
  score *= 1 + Math.min(totalContributing, 8) * 0.1

  if (crossCount > 0 && primaryCount === 0) {
    pushFlag(matchFlags, {
      kind: 'cross_body',
      label: 'Supported mainly by journal entries in other areas',
      detail: `${crossCount} ${crossCount === 1 ? 'entry' : 'entries'} outside ${primaryArea}`,
    })
  } else if (crossCount > 0) {
    pushFlag(matchFlags, {
      kind: 'cross_body',
      label: 'Also supported by other body areas',
      detail: `${crossCount} related ${crossCount === 1 ? 'entry' : 'entries'} combined with ${primaryArea}`,
    })
  }

  return {
    diseaseId: disease.id,
    diseaseName: disease.name,
    score,
    matchedSignals: [...new Set(matchedSignals)].slice(0, 8),
    matchFlags: matchFlags.slice(0, 12),
    primaryJournalCount: primaryCount || primaryEntries.length,
    crossBodyJournalCount: crossCount,
  }
}

/** Rank diseases for an area using journal + hypotheses across the whole body. */
export function inferDiseasesForArea(
  area: string,
  allEntries: HealthEntry[],
  allHypotheses: Hypothesis[] = []
): InferredDisease[] {
  if (allEntries.length === 0 && allHypotheses.length === 0) return []

  const scored: InferredDisease[] = []
  for (const disease of MEDICAL_DISEASE_CATALOG) {
    const result = scoreDisease(disease, area, allEntries, allHypotheses)
    if (result) scored.push(result)
  }

  return scored.sort((a, b) => b.score - a.score)
}

export function collectConditionAreas(
  entries: HealthEntry[],
  hypotheses: Hypothesis[]
): string[] {
  const map = new Map<string, string>()

  for (const entry of entries) {
    const area = entry.conditionArea.trim()
    if (!area) continue
    map.set(area.toLowerCase(), area)
  }

  for (const hypothesis of hypotheses) {
    const area =
      hypothesis.conditionArea?.trim() ||
      hypothesis.title.split(':')[0]?.trim() ||
      ''
    if (!area) continue
    map.set(area.toLowerCase(), area)
  }

  return [...map.values()]
}
