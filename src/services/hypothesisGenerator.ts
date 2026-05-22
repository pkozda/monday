import type {
  HealthEntry,
  Hypothesis,
  HypothesisConfidence,
  HypothesisHistoryEntry,
  HypothesisPattern,
} from '@/models/types'

const IMPROVEMENT_RE =
  /\b(improv|better|easier|reduced|less|easing|recover|progress|healing|resolved)\w*/i
const WORSENING_RE =
  /\b(worse|worsen|deteriorat|declin|spreading|intensif|unbearable|severe)\w*/i

export type { HypothesisPattern }

export interface HypothesisGenerationResult {
  status: 'created' | 'updated' | 'no_new_data' | 'no_journal_data'
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

function getCoveredJournalEntryIds(
  hypotheses: Hypothesis[],
  journalEntryIds: Set<string>
): Set<string> {
  const covered = new Set<string>()
  for (const hypothesis of hypotheses) {
    for (const id of hypothesis.evidenceIds) {
      if (journalEntryIds.has(id)) covered.add(id)
    }
    for (const revision of hypothesis.history ?? []) {
      for (const id of revision.newJournalEntryIds) {
        covered.add(id)
      }
    }
  }
  return covered
}

export function extractAreaFromTitle(title: string): string {
  const idx = title.indexOf(':')
  if (idx === -1) return title.trim()
  return title.slice(0, idx).trim()
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

export const PATTERN_LABELS: Record<HypothesisPattern, string> = {
  urgent: 'Clinical attention',
  treatment_improvement: 'Treatment response',
  worsening: 'Worsening trend',
  recurring: 'Recurring symptoms',
  treatment_unclear: 'Treatment unclear',
  general: 'General pattern',
}

function areasMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

function findMatchingHypothesis(
  candidate: HypothesisCandidate,
  existing: Hypothesis[]
): Hypothesis | undefined {
  return existing.find(
    (h) =>
      areasMatch(h.conditionArea, candidate.area) && h.pattern === candidate.pattern
  )
}

function getNewJournalEntryIds(
  candidate: HypothesisCandidate,
  coveredJournalIds: Set<string>
): string[] {
  return candidate.entries
    .map((e) => e.id)
    .filter((id) => !coveredJournalIds.has(id))
}

function candidateHasNewJournalEvidence(
  candidate: HypothesisCandidate,
  coveredJournalIds: Set<string>
): boolean {
  return getNewJournalEntryIds(candidate, coveredJournalIds).length > 0
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

function buildUpdateNote(
  previous: Hypothesis,
  candidate: HypothesisCandidate,
  newJournalIds: string[]
): string {
  const parts = [
    `Incorporated ${newJournalIds.length} new journal ${newJournalIds.length === 1 ? 'record' : 'records'}.`,
  ]

  if (previous.confidence !== candidate.confidence) {
    parts.push(
      `Confidence updated from ${previous.confidence} to ${candidate.confidence}.`
    )
  }

  if (previous.title !== candidate.title) {
    parts.push('Summary label refreshed from your latest journal data.')
  }

  return parts.join(' ')
}

function createHypothesisFromCandidate(
  candidate: HypothesisCandidate,
  clusterEntries: HealthEntry[]
): Hypothesis {
  const now = new Date().toISOString()
  const journalIds = clusterEntries.map((e) => e.id)

  const historyEntry: HypothesisHistoryEntry = {
    id: crypto.randomUUID(),
    at: now,
    kind: 'created',
    title: candidate.title,
    confidence: candidate.confidence,
    journalEntryCount: journalIds.length,
    newJournalEntryIds: journalIds,
    note: `Initial hypothesis from ${journalIds.length} journal ${journalIds.length === 1 ? 'entry' : 'entries'}.`,
  }

  return {
    id: crypto.randomUUID(),
    title: candidate.title,
    confidence: candidate.confidence,
    evidenceIds: collectEvidenceIds(clusterEntries),
    conditionArea: candidate.area,
    pattern: candidate.pattern,
    createdAt: now,
    updatedAt: now,
    history: [historyEntry],
  }
}

function updateHypothesisFromCandidate(
  existing: Hypothesis,
  candidate: HypothesisCandidate,
  clusterEntries: HealthEntry[],
  newJournalIds: string[]
): Hypothesis {
  const now = new Date().toISOString()
  const journalIds = clusterEntries.map((e) => e.id)

  const historyEntry: HypothesisHistoryEntry = {
    id: crypto.randomUUID(),
    at: now,
    kind: 'updated',
    title: candidate.title,
    confidence: candidate.confidence,
    journalEntryCount: journalIds.length,
    newJournalEntryIds: newJournalIds,
    note: buildUpdateNote(existing, candidate, newJournalIds),
  }

  return {
    ...existing,
    title: candidate.title,
    confidence: candidate.confidence,
    evidenceIds: collectEvidenceIds(clusterEntries),
    conditionArea: candidate.area,
    pattern: candidate.pattern,
    updatedAt: now,
    history: [...(existing.history ?? []), historyEntry],
  }
}

/** Rebuild all hypotheses from current journal (one leading pattern per body area). */
export function buildAllHypothesesFromJournal(
  entries: HealthEntry[]
): Hypothesis[] {
  if (entries.length === 0) return []

  const clusters = clusterByCondition(entries)
  const hypotheses: Hypothesis[] = []

  for (const cluster of clusters) {
    const candidates = buildCandidates(cluster)
    if (candidates.length === 0) continue

    const byPattern = new Map<HypothesisPattern, HypothesisCandidate>()
    for (const candidate of candidates) {
      const prev = byPattern.get(candidate.pattern)
      if (!prev || candidate.score > prev.score) {
        byPattern.set(candidate.pattern, candidate)
      }
    }

    const ordered = [...byPattern.values()].sort((a, b) => b.score - a.score)
    for (const candidate of ordered) {
      const evidenceEntries =
        candidate.entries.length > 0 ? candidate.entries : cluster.entries
      hypotheses.push(
        createHypothesisFromCandidate(candidate, evidenceEntries)
      )
    }
  }

  return hypotheses.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
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

  const journalIds = new Set(entries.map((e) => e.id))
  const coveredJournalIds = getCoveredJournalEntryIds(
    existingHypotheses,
    journalIds
  )
  const hasUncoveredJournal = [...journalIds].some(
    (id) => !coveredJournalIds.has(id)
  )

  const clusters = clusterByCondition(entries)
  const allCandidates = clusters.flatMap((cluster) => buildCandidates(cluster))

  const withNewJournal = allCandidates.filter((c) =>
    candidateHasNewJournalEvidence(c, coveredJournalIds)
  )

  const updateOptions = withNewJournal
    .map((candidate) => ({
      candidate,
      existing: findMatchingHypothesis(candidate, existingHypotheses),
      cluster: clusters.find((c) => areasMatch(c.area, candidate.area)),
    }))
    .filter((x): x is typeof x & { existing: Hypothesis } => Boolean(x.existing))

  if (updateOptions.length > 0) {
    updateOptions.sort((a, b) => b.candidate.score - a.candidate.score)
    const { candidate, existing, cluster } = updateOptions[0]
    const clusterEntries = cluster?.entries ?? candidate.entries
    const newJournalIds = getNewJournalEntryIds(candidate, coveredJournalIds)
    const updated = updateHypothesisFromCandidate(
      existing,
      candidate,
      clusterEntries,
      newJournalIds
    )

    return {
      status: 'updated',
      message: `Updated existing hypothesis for ${candidate.area} with ${newJournalIds.length} new journal ${newJournalIds.length === 1 ? 'record' : 'records'}.`,
      hypothesis: updated,
    }
  }

  const newOptions = withNewJournal.filter(
    (c) => !findMatchingHypothesis(c, existingHypotheses)
  )

  if (newOptions.length > 0) {
    newOptions.sort((a, b) => b.score - a.score)
    const best = newOptions[0]
    const cluster = clusters.find((c) => areasMatch(c.area, best.area))
    const clusterEntries = cluster?.entries ?? best.entries
    const created = createHypothesisFromCandidate(best, clusterEntries)

    return {
      status: 'created',
      message: `New hypothesis created for ${best.area}.`,
      hypothesis: created,
    }
  }

  if (existingHypotheses.length > 0 && !hasUncoveredJournal) {
    return {
      status: 'no_new_data',
      message:
        'All journal records are already reflected in your hypotheses. Add new journal entries, then generate again.',
    }
  }

  if (existingHypotheses.length > 0) {
    return {
      status: 'no_new_data',
      message:
        'No new journal records match an existing hypothesis pattern. Log more detail for a tracked condition, or add entries for a new body area.',
    }
  }

  return {
    status: 'no_new_data',
    message:
      'Could not derive a hypothesis from the current data. Add more detailed journal entries and try again.',
  }
}
