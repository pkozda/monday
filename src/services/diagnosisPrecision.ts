import type { DiseaseDefinition } from '@/data/medicalDiseaseCatalog'
import {
  getDiagnosisCriteria,
  type DiseaseDiagnosisCriteria,
} from '@/data/diseaseDiagnosisCriteria'
import {
  buildMedicalHistoryContext,
  entryText,
  findMatchingEntry,
  type MedicalHistoryContext,
} from '@/services/medicalHistoryContext'
import { patternFromTitle } from '@/services/hypothesisGenerator'
import {
  areasForEntry,
  areasMatch as bodyAreasMatch,
} from '@/services/bodyAreaDetection'
import type {
  DiagnosisCriterion,
  DiagnosisMatchFlag,
  HealthEntry,
  Hypothesis,
  HypothesisPattern,
} from '@/models/types'

export interface PrecisionScoreResult {
  precisionScore: number
  rawScore: number
  matchFlags: DiagnosisMatchFlag[]
  matchedSignals: string[]
  primaryJournalCount: number
  crossBodyJournalCount: number
  confirmCriteria: DiagnosisCriterion[]
  excludeCriteria: DiagnosisCriterion[]
  suggestedWorkup: string[]
}

const PATTERN_BOOST: Record<HypothesisPattern, number> = {
  urgent: 1.2,
  worsening: 1.15,
  recurring: 1.12,
  treatment_improvement: 1.08,
  treatment_unclear: 1.04,
  general: 1,
}

/** Very common words — low specificity unless paired with strong terms */
const GENERIC_SYMPTOM = /\b(pain|ache|hurt|sore|uncomfortable|tired|fatigue|unwell|symptom)\b/i

const AREA_EXPANSIONS: { pattern: RegExp; hints: RegExp[] }[] = [
  { pattern: /lower\s+back|lumbar/i, hints: [/back/i, /spine/i, /lumbar/i] },
  { pattern: /upper\s+back|thoracic/i, hints: [/back/i, /spine/i] },
  { pattern: /neck|cervical/i, hints: [/neck/i, /cervical/i, /spine/i] },
  { pattern: /stomach|belly/i, hints: [/abdomen/i, /stomach/i, /gut/i] },
  { pattern: /chest|breast/i, hints: [/chest/i, /heart/i, /lung/i] },
  { pattern: /knee/i, hints: [/knee/i, /leg/i, /joint/i] },
  { pattern: /shoulder/i, hints: [/shoulder/i, /arm/i] },
  { pattern: /hip/i, hints: [/hip/i, /pelvic/i, /leg/i] },
  { pattern: /head/i, hints: [/head/i, /neurolog/i] },
  { pattern: /skin|rash/i, hints: [/skin/i, /rash/i, /dermat/i] },
]

function areasMatch(a: string, b: string): boolean {
  return bodyAreasMatch(a, b)
}

function areaMatchesDisease(primaryArea: string, disease: DiseaseDefinition): boolean {
  const area = primaryArea.trim()
  if (disease.areaHints.some((hint) => hint.test(area))) return true

  for (const row of AREA_EXPANSIONS) {
    if (!row.pattern.test(area)) continue
    if (disease.areaHints.some((hint) => row.hints.some((h) => h.test(area)))) {
      return true
    }
  }
  return false
}

function pushFlag(flags: DiagnosisMatchFlag[], flag: DiagnosisMatchFlag): void {
  const key = `${flag.kind}:${flag.label}:${flag.detail}`
  if (flags.some((f) => `${f.kind}:${f.label}:${f.detail}` === key)) return
  flags.push(flag)
}

function evaluateRules(
  rules: DiseaseDiagnosisCriteria['confirm'],
  role: 'confirm' | 'exclude',
  history: MedicalHistoryContext
): DiagnosisCriterion[] {
  return rules.map((rule) => {
    const match = findMatchingEntry(history, rule.patterns)
    if (role === 'confirm') {
      return {
        id: rule.id,
        text: rule.text,
        role,
        status: match ? 'met' : 'not_met',
        detail: match
          ? `${match.conditionArea} — ${match.title}`
          : undefined,
      }
    }
    return {
      id: rule.id,
      text: rule.text,
      role,
      status: match ? 'exclusion_present' : 'not_met',
      detail: match
        ? `Seen in journal: ${match.conditionArea} — ${match.title}`
        : 'Not documented in your journal',
    }
  })
}

interface EntryHitResult {
  strongEntryIds: Set<string>
  weakEntryIds: Set<string>
  strongHits: number
  weakHits: number
  primaryIds: Set<string>
  crossIds: Set<string>
  genericOnlyEntries: number
}

function countKeywordHitsPerEntry(
  disease: DiseaseDefinition,
  history: MedicalHistoryContext,
  primaryArea: string
): EntryHitResult {
  const strong = disease.strongKeywords ?? []
  const weakOnly = disease.keywords.filter(
    (k) => !strong.some((s) => s.source === k.source)
  )

  const result: EntryHitResult = {
    strongEntryIds: new Set(),
    weakEntryIds: new Set(),
    strongHits: 0,
    weakHits: 0,
    primaryIds: new Set(),
    crossIds: new Set(),
    genericOnlyEntries: 0,
  }

  for (const entry of history.entries) {
    const text = entryText(entry)
    const isPrimary = areasForEntry(entry).some((detected) =>
      areasMatch(detected, primaryArea)
    )
    let entryStrong = false
    let entryWeak = false

    for (const pattern of strong) {
      if (!pattern.test(text)) continue
      entryStrong = true
      result.strongHits += 1
    }
    for (const pattern of weakOnly) {
      if (!pattern.test(text)) continue
      entryWeak = true
      result.weakHits += 1
    }

    if (!entryStrong && !entryWeak) continue

    if (entryStrong) result.strongEntryIds.add(entry.id)
    if (entryWeak && !entryStrong) result.weakEntryIds.add(entry.id)

    if (entryWeak && !entryStrong && GENERIC_SYMPTOM.test(text)) {
      result.genericOnlyEntries += 1
    }

    if (isPrimary) result.primaryIds.add(entry.id)
    else result.crossIds.add(entry.id)
  }

  applyClinicalAugmentToHits(disease, history, result)
  return result
}

function applyClinicalAugmentToHits(
  disease: DiseaseDefinition,
  history: MedicalHistoryContext,
  result: EntryHitResult
): void {
  const augment = history.clinicalAugmentText
  if (!augment) return

  const strong = disease.strongKeywords ?? []
  const weakOnly = disease.keywords.filter(
    (k) => !strong.some((s) => s.source === k.source)
  )

  for (const pattern of strong) {
    if (!pattern.test(augment)) continue
    result.strongHits += 1
  }
  for (const pattern of weakOnly) {
    if (!pattern.test(augment)) continue
    result.weakHits += 1
  }
}

function applyNegativeKeywords(
  disease: DiseaseDefinition,
  history: MedicalHistoryContext,
  hits: EntryHitResult
): number {
  if (!disease.negativeKeywords?.length) return 0
  let penalty = 0
  for (const pattern of disease.negativeKeywords) {
    if (pattern.test(history.allText)) penalty += 6
  }
  if (hits.strongHits === 0 && penalty > 0) return penalty
  return Math.min(penalty, 12)
}

export function scoreDiseaseWithPrecision(
  disease: DiseaseDefinition,
  primaryArea: string,
  allEntries: HealthEntry[],
  allHypotheses: Hypothesis[],
  history: MedicalHistoryContext
): PrecisionScoreResult | null {
  const criteria = getDiagnosisCriteria(disease.id)
  const matchFlags: DiagnosisMatchFlag[] = []
  const matchedSignals: string[] = []

  const hits = countKeywordHitsPerEntry(disease, history, primaryArea)
  const weightLossSignal = history.weightClinicalSignals.find(
    (s) => s.kind === 'weight_loss'
  )
  const areaMatch = areaMatchesDisease(primaryArea, disease)

  const namedInHistory =
    history.allText.toLowerCase().includes(disease.name.toLowerCase()) ||
    history.allText.toLowerCase().includes(disease.id.replace(/_/g, ' '))

  if (
    hits.strongHits === 0 &&
    hits.weakHits === 0 &&
    !namedInHistory &&
    !areaMatch
  ) {
    return null
  }

  let evidence = 0
  evidence += Math.min(hits.strongHits * 7, 28)
  evidence += Math.min(hits.weakHits * 1.8, 14)

  if (namedInHistory) {
    evidence += 10
    matchedSignals.push('Condition named in medical history')
  }

  let areaFit = 0
  if (areaMatch) {
    areaFit = 14
    pushFlag(matchFlags, {
      kind: 'body_area',
      label: 'Anatomical fit for tracked area',
      detail: primaryArea,
      sourceArea: primaryArea,
    })
  } else if (hits.crossIds.size > 0 && hits.primaryIds.size === 0) {
    areaFit = 4
  }

  const primaryEntryCount = hits.primaryIds.size
  if (primaryEntryCount >= 2) {
    evidence += Math.min(primaryEntryCount * 2, 8)
    matchedSignals.push(`${primaryEntryCount} matching entries in ${primaryArea}`)
  }

  if (hits.genericOnlyEntries > 0 && hits.strongHits === 0) {
    evidence *= 0.72
    pushFlag(matchFlags, {
      kind: 'keyword',
      label: 'Only non-specific symptom words matched',
      detail: 'Add more specific symptoms or test results to improve accuracy',
    })
  }

  if (weightLossSignal) {
    evidence += 8
    matchedSignals.push(weightLossSignal.label)
    pushFlag(matchFlags, {
      kind: 'keyword',
      label: 'Weight loss used as clinical symptom signal',
      detail: weightLossSignal.label,
    })
  }

  evidence -= applyNegativeKeywords(disease, history, hits)

  if (disease.medicationHints?.some((m) => m.test(history.allText))) {
    evidence += 9
    matchedSignals.push('Supporting medication in history')
    pushFlag(matchFlags, {
      kind: 'medication',
      label: 'Medication pattern supports this condition',
      detail: history.medicationSnippet.slice(0, 80) || 'See journal',
    })
  }

  const confirmCriteria = evaluateRules(criteria.confirm, 'confirm', history)
  const excludeCriteria = evaluateRules(criteria.exclude, 'exclude', history)

  const confirmMet = confirmCriteria.filter((c) => c.status === 'met').length
  const confirmTotal = confirmCriteria.length
  const confirmScore = confirmTotal
    ? (confirmMet / confirmTotal) * 26
    : 0

  const exclusionPresent = excludeCriteria.filter(
    (c) => c.status === 'exclusion_present'
  ).length
  const exclusionPenalty = exclusionPresent * 10

  let historyCoherence = 0
  if (history.entryCount >= 2) historyCoherence += 3
  if (history.entryCount >= 5) historyCoherence += 2
  if (history.spanDays >= 7) historyCoherence += 2
  if (history.spanDays >= 30) historyCoherence += 2
  if (history.hasDoctorVisit) historyCoherence += 5
  if (history.hasImaging) historyCoherence += 4
  if (history.hasExplicitDiagnosis) historyCoherence += 6
  if (history.recurringSymptomEntries >= 2) historyCoherence += 3

  const specificity =
    hits.strongHits >= 3
      ? 12
      : hits.strongHits >= 2
        ? 10
        : hits.strongHits === 1
          ? 6
          : hits.weakHits >= 4
            ? 2
            : 0

  let hypothesisSupport = 0
  for (const hypothesis of allHypotheses) {
    const pattern =
      hypothesis.pattern ?? patternFromTitle(hypothesis.title)
    if (!disease.relatedPatterns?.includes(pattern)) continue
    hypothesisSupport = 7 * PATTERN_BOOST[pattern]
    pushFlag(matchFlags, {
      kind: 'hypothesis',
      label: 'Consistent with generated hypothesis',
      detail: hypothesis.title,
      sourceArea: hypothesis.conditionArea,
    })
    break
  }

  const breadth = Math.min(hits.primaryIds.size + hits.crossIds.size, 8)
  if (breadth >= 2) evidence *= 1 + breadth * 0.05

  if (hits.crossIds.size > 0) {
    pushFlag(matchFlags, {
      kind: 'cross_body',
      label: 'Related findings in other body areas',
      detail: `${hits.crossIds.size} ${hits.crossIds.size === 1 ? 'entry' : 'entries'}`,
    })
  }

  const rawScore =
    evidence +
    areaFit +
    confirmScore +
    historyCoherence +
    specificity +
    hypothesisSupport -
    exclusionPenalty

  if (rawScore < 5) return null

  let precisionScore = Math.round(
    Math.min(
      100,
      rawScore * 1.1 +
        confirmMet * 5 -
        exclusionPresent * 8 +
        (history.hasExplicitDiagnosis ? 6 : 0) +
        (hits.strongHits >= 2 ? 5 : 0)
    )
  )
  precisionScore = Math.max(10, precisionScore)

  if (exclusionPresent >= 2) precisionScore = Math.round(precisionScore * 0.5)
  else if (exclusionPresent === 1) precisionScore = Math.round(precisionScore * 0.8)

  if (confirmMet === confirmTotal && confirmTotal >= 2) {
    precisionScore = Math.min(100, precisionScore + 10)
  }

  if (!areaMatch && hits.primaryIds.size === 0 && hits.strongHits < 2) {
    precisionScore = Math.round(precisionScore * 0.85)
  }

  return {
    precisionScore,
    rawScore: Math.max(0, rawScore),
    matchFlags: matchFlags.slice(0, 12),
    matchedSignals: [...new Set(matchedSignals)].slice(0, 8),
    primaryJournalCount: hits.primaryIds.size,
    crossBodyJournalCount: hits.crossIds.size,
    confirmCriteria,
    excludeCriteria,
    suggestedWorkup: criteria.workup,
  }
}

/** Reduce scores when many diseases share only vague symptom overlap */
function applyCompetitionAdjustment(
  scored: Array<
    PrecisionScoreResult & { diseaseId: string; diseaseName: string }
  >
): typeof scored {
  if (scored.length < 3) return scored

  const vagueLeaders = scored.filter(
    (s) => s.precisionScore < 45 && s.primaryJournalCount === 0
  ).length

  if (vagueLeaders < 2) return scored

  return scored.map((s) => {
    if (s.precisionScore >= 50 || s.primaryJournalCount > 0) return s
    return {
      ...s,
      precisionScore: Math.round(s.precisionScore * 0.9),
      rawScore: s.rawScore * 0.9,
    }
  })
}

export function inferDiseasesWithPrecision(
  area: string,
  allEntries: HealthEntry[],
  allHypotheses: Hypothesis[],
  diseases: DiseaseDefinition[],
  sharedHistory?: MedicalHistoryContext
): Array<
  PrecisionScoreResult & { diseaseId: string; diseaseName: string }
> {
  const history = sharedHistory ?? buildMedicalHistoryContext(allEntries)

  const scored = diseases
    .map((disease) => {
      const result = scoreDiseaseWithPrecision(
        disease,
        area,
        allEntries,
        allHypotheses,
        history
      )
      if (!result) return null
      return { ...result, diseaseId: disease.id, diseaseName: disease.name }
    })
    .filter(
      (
        x
      ): x is PrecisionScoreResult & {
        diseaseId: string
        diseaseName: string
      } => Boolean(x)
    )
    .sort((a, b) => b.precisionScore - a.precisionScore)

  return applyCompetitionAdjustment(scored)
}
