import type {
  HealthEntry,
  Hypothesis,
  HypothesisConfidence,
} from '@/models/types'

const IMPROVEMENT_RE =
  /\b(improv|better|easier|reduced|less|easing|recover|progress|healing|resolved)\w*/i
const WORSENING_RE =
  /\b(worse|worsen|deteriorat|declin|spreading|intensif|unbearable|severe)\w*/i

export type HypothesisPattern =
  | 'urgent'
  | 'treatment_improvement'
  | 'worsening'
  | 'recurring'
  | 'treatment_unclear'
  | 'general'

export interface HypothesisGenerationResult {
  status: 'created' | 'no_new_data' | 'no_journal_data'
  hypothesis?: Hypothesis
  message: string
}

interface ConditionCluster {
  area: string
  entries: HealthEntry[]
}

interface HypothesisCandidate {
  area: string
  entries: HealthEntry[]
  title: string
  confidence: HypothesisConfidence
  score: number
  pattern: HypothesisPattern
}

function clusterByCondition(entries: HealthEntry[]): ConditionCluster[] {
  const map = new Map<string, HealthEntry[]>()
  for (const entry of entries) {
    const area = entry.conditionArea.trim()
    const list = map.get(area) ?? []
    list.push(entry)
    map.set(area, list)
  }
  return [...map.entries()]
    .map(([area, clusterEntries]) => ({
      area,
      entries: clusterEntries.sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      ),
    }))
    .sort((a, b) => b.entries.length - a.entries.length)
}

function collectEvidenceIds(entries: HealthEntry[]): string[] {
  const ids = new Set<string>()
  for (const entry of entries) {
    ids.add(entry.id)
    if (entry.analysis.linkedTimelineEventId) {
      ids.add(entry.analysis.linkedTimelineEventId)
    }
  }
  return [...ids]
}

function getCoveredEntryIds(hypotheses: Hypothesis[]): Set<string> {
  const covered = new Set<string>()
  for (const hypothesis of hypotheses) {
    for (const id of hypothesis.evidenceIds) {
      covered.add(id)
    }
  }
  return covered
}

export function extractAreaFromTitle(title: string): string {
  const idx = title.indexOf(':')
  if (idx === -1) return title.trim().toLowerCase()
  return title.slice(0, idx).trim().toLowerCase()
}

export function patternFromTitle(title: string): HypothesisPattern {
  const t = title.toLowerCase()
  if (t.includes('clinical attention') || t.includes('urgent')) return 'urgent'
  if (t.includes('contributing') || t.includes('improvement')) {
    return 'treatment_improvement'
  }
  if (t.includes('worsening')) return 'worsening'
  if (t.includes('recurring')) return 'recurring'
  if (t.includes('response still unclear') || t.includes('new treatment')) {
    return 'treatment_unclear'
  }
  return 'general'
}

function isDuplicateCandidate(
  candidate: HypothesisCandidate,
  existing: Hypothesis[]
): boolean {
  const area = candidate.area.toLowerCase()
  const pattern = candidate.pattern

  for (const hypothesis of existing) {
    const existingArea = extractAreaFromTitle(hypothesis.title)
    const existingPattern = patternFromTitle(hypothesis.title)
    if (existingArea === area && existingPattern === pattern) {
      return true
    }
  }

  const normalized = candidate.title.toLowerCase()
  return existing.some(
    (h) =>
      h.title.toLowerCase() === normalized ||
      h.title.toLowerCase().includes(normalized.slice(0, 40))
  )
}

function hasNewEvidence(
  candidate: HypothesisCandidate,
  coveredEntryIds: Set<string>
): boolean {
  return candidate.entries.some((entry) => !coveredEntryIds.has(entry.id))
}

function textOf(entry: HealthEntry): string {
  return [entry.title, entry.description, entry.medications ?? ''].join(' ')
}

function hasUrgentSignals(entries: HealthEntry[]): boolean {
  return entries.some((e) =>
    ['urgent', 'emergency'].includes(e.analysis.urgency)
  )
}

function hasMedicationEntries(entries: HealthEntry[]): boolean {
  return entries.some((e) => e.entryType === 'medication')
}

function hasImprovementSignals(entries: HealthEntry[]): boolean {
  return entries.some(
    (e) => e.entryType === 'change' && IMPROVEMENT_RE.test(textOf(e))
  )
}

function hasWorseningSignals(entries: HealthEntry[]): boolean {
  return entries.some(
    (e) =>
      WORSENING_RE.test(textOf(e)) ||
      e.analysis.flags.includes('worsening_or_persistent') ||
      e.analysis.flags.includes('needs_attention')
  )
}

function severityTrend(entries: HealthEntry[]): 'up' | 'down' | 'flat' | 'unknown' {
  const rated = entries
    .filter((e) => e.severity !== undefined)
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    )
  if (rated.length < 2) return 'unknown'
  const first = rated[0].severity!
  const last = rated[rated.length - 1].severity!
  if (last <= first - 1) return 'down'
  if (last >= first + 1) return 'up'
  return 'flat'
}

function resolveConfidence(
  evidenceCount: number,
  strongPattern: boolean
): HypothesisConfidence {
  if (evidenceCount >= 4 && strongPattern) return 'Strongly Supported'
  if (evidenceCount >= 3 && strongPattern) return 'Strongly Supported'
  if (evidenceCount >= 2 && strongPattern) return 'Supported'
  if (evidenceCount >= 3) return 'Supported'
  return 'Exploratory'
}

function buildCandidates(cluster: ConditionCluster): HypothesisCandidate[] {
  const { area, entries } = cluster
  const candidates: HypothesisCandidate[] = []
  const count = entries.length
  const urgent = hasUrgentSignals(entries)
  const meds = hasMedicationEntries(entries)
  const improved = hasImprovementSignals(entries)
  const worsening = hasWorseningSignals(entries)
  const trend = severityTrend(entries)
  const symptomCount = entries.filter((e) => e.entryType === 'symptom').length

  if (urgent) {
    candidates.push({
      area,
      entries,
      pattern: 'urgent',
      title: `${area}: clinical attention may be needed based on urgent journal signals`,
      confidence: resolveConfidence(count, true),
      score: 100 + count,
    })
  }

  if (meds && improved) {
    candidates.push({
      area,
      pattern: 'treatment_improvement',
      entries: entries.filter(
        (e) =>
          e.entryType === 'medication' ||
          e.entryType === 'change' ||
          IMPROVEMENT_RE.test(textOf(e))
      ),
      title: `${area}: treatment may be contributing to reported improvement`,
      confidence: resolveConfidence(
        entries.filter(
          (e) => e.entryType === 'medication' || e.entryType === 'change'
        ).length,
        true
      ),
      score: 80 + count,
    })
  }

  if (worsening || trend === 'up') {
    const relevant = entries.filter(
      (e) => WORSENING_RE.test(textOf(e)) || e.severity !== undefined
    )
    candidates.push({
      area,
      pattern: 'worsening',
      entries: relevant.length > 0 ? relevant : entries,
      title: `${area}: symptoms may be worsening over the tracked period`,
      confidence: resolveConfidence(relevant.length || count, worsening),
      score: 70 + count,
    })
  }

  if (symptomCount >= 2) {
    candidates.push({
      area,
      pattern: 'recurring',
      entries: entries.filter((e) =>
        ['symptom', 'change', 'other'].includes(e.entryType)
      ),
      title: `${area}: recurring symptoms suggest ongoing monitoring`,
      confidence: resolveConfidence(symptomCount, symptomCount >= 3),
      score: 50 + symptomCount,
    })
  }

  if (meds && !improved) {
    candidates.push({
      area,
      pattern: 'treatment_unclear',
      entries: entries.filter((e) =>
        ['medication', 'doctor_visit'].includes(e.entryType)
      ),
      title: `${area}: new treatment started — response still unclear`,
      confidence: 'Exploratory',
      score: 40 + count,
    })
  }

  candidates.push({
    area,
    pattern: 'general',
    entries,
    title: `${area}: health pattern worth tracking based on ${count} journal ${count === 1 ? 'entry' : 'entries'}`,
    confidence: resolveConfidence(count, false),
    score: 10 + count,
  })

  return candidates
}

function filterActionableCandidates(
  candidates: HypothesisCandidate[],
  existing: Hypothesis[],
  coveredEntryIds: Set<string>
): HypothesisCandidate[] {
  return candidates.filter(
    (candidate) =>
      !isDuplicateCandidate(candidate, existing) &&
      hasNewEvidence(candidate, coveredEntryIds)
  )
}

export function analyzeHypothesisGeneration(
  entries: HealthEntry[],
  existingHypotheses: Hypothesis[]
): HypothesisGenerationResult {
  if (entries.length === 0) {
    return {
      status: 'no_journal_data',
      message:
        'Add at least one journal entry before generating a hypothesis.',
    }
  }

  const coveredEntryIds = getCoveredEntryIds(existingHypotheses)
  const allEntryIds = entries.map((e) => e.id)
  const hasUncoveredEntries = allEntryIds.some((id) => !coveredEntryIds.has(id))

  const clusters = clusterByCondition(entries)
  const allCandidates = clusters.flatMap((cluster) => buildCandidates(cluster))
  const actionable = filterActionableCandidates(
    allCandidates,
    existingHypotheses,
    coveredEntryIds
  )

  if (actionable.length === 0) {
    if (existingHypotheses.length > 0 && !hasUncoveredEntries) {
      return {
        status: 'no_new_data',
        message:
          'All journal data has already been analyzed. No new hypotheses were generated. Add more journal entries to analyze new patterns.',
      }
    }

    if (existingHypotheses.length > 0) {
      return {
        status: 'no_new_data',
        message:
          'Your existing hypotheses already cover the current journal data. No new hypotheses were generated. Log new symptoms, changes, or treatments to unlock more analysis.',
      }
    }

    return {
      status: 'no_new_data',
      message:
        'Could not derive a new hypothesis from the current data. Add more detailed journal entries and try again.',
    }
  }

  actionable.sort((a, b) => b.score - a.score)
  const best = actionable[0]
  const evidenceEntries =
    best.entries.length > 0 ? best.entries : clusters[0].entries

  return {
    status: 'created',
    message: `New hypothesis created for ${best.area}.`,
    hypothesis: {
      id: crypto.randomUUID(),
      title: best.title,
      confidence: best.confidence,
      evidenceIds: collectEvidenceIds(evidenceEntries),
    },
  }
}

/** @deprecated Use analyzeHypothesisGeneration — kept for tests if any */
export function generateHypothesisFromUserData(
  entries: HealthEntry[],
  existingHypotheses: Hypothesis[]
): Hypothesis {
  const result = analyzeHypothesisGeneration(entries, existingHypotheses)
  if (result.status !== 'created' || !result.hypothesis) {
    throw new Error(result.message)
  }
  return result.hypothesis
}
