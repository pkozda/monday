import type {
  HealthEntry,
  Hypothesis,
  HypothesisConfidence,
} from '@/models/types'

const IMPROVEMENT_RE =
  /\b(improv|better|easier|reduced|less|easing|recover|progress|healing|resolved)\w*/i
const WORSENING_RE =
  /\b(worse|worsen|deteriorat|declin|spreading|intensif|unbearable|severe)\w*/i

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
    (e) =>
      e.entryType === 'change' && IMPROVEMENT_RE.test(textOf(e))
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

function isDuplicateTitle(title: string, existing: Hypothesis[]): boolean {
  const normalized = title.toLowerCase()
  return existing.some(
    (h) =>
      h.title.toLowerCase() === normalized ||
      h.title.toLowerCase().includes(normalized.slice(0, 40))
  )
}

function buildCandidates(
  cluster: ConditionCluster,
  existing: Hypothesis[]
): HypothesisCandidate[] {
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
      title: `${area}: clinical attention may be needed based on urgent journal signals`,
      confidence: resolveConfidence(count, true),
      score: 100 + count,
    })
  }

  if (meds && improved) {
    candidates.push({
      area,
      entries: entries.filter(
        (e) =>
          e.entryType === 'medication' ||
          e.entryType === 'change' ||
          IMPROVEMENT_RE.test(textOf(e))
      ),
      title: `${area}: treatment may be contributing to reported improvement`,
      confidence: resolveConfidence(
        entries.filter((e) => e.entryType === 'medication' || e.entryType === 'change')
          .length,
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
      entries: relevant.length > 0 ? relevant : entries,
      title: `${area}: symptoms may be worsening over the tracked period`,
      confidence: resolveConfidence(relevant.length || count, worsening),
      score: 70 + count,
    })
  }

  if (symptomCount >= 2) {
    candidates.push({
      area,
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
    entries,
    title: `${area}: health pattern worth tracking based on ${count} journal ${count === 1 ? 'entry' : 'entries'}`,
    confidence: resolveConfidence(count, false),
    score: 10 + count,
  })

  return candidates.filter((c) => !isDuplicateTitle(c.title, existing))
}

export function generateHypothesisFromUserData(
  entries: HealthEntry[],
  existingHypotheses: Hypothesis[]
): Hypothesis {
  if (entries.length === 0) {
    throw new Error(
      'Add at least one journal entry before generating a hypothesis.'
    )
  }

  const clusters = clusterByCondition(entries)
  const allCandidates = clusters.flatMap((c) =>
    buildCandidates(c, existingHypotheses)
  )

  if (allCandidates.length === 0) {
    throw new Error(
      'Could not form a new hypothesis — existing hypotheses may already cover your data. Add more journal entries or try again later.'
    )
  }

  allCandidates.sort((a, b) => b.score - a.score)
  const best = allCandidates[0]
  const evidenceEntries =
    best.entries.length > 0 ? best.entries : clusters[0].entries

  return {
    id: crypto.randomUUID(),
    title: best.title,
    confidence: best.confidence,
    evidenceIds: collectEvidenceIds(evidenceEntries),
  }
}
