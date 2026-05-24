import { combinedEntryText } from '@/services/healthAnalysis'
import {
  areasForEntry,
  areasMatch,
  BODY_AREA_RULES,
  detectAllBodyAreasFromText,
  GENERAL_HEALTH_AREA,
  isGeneralHealthArea,
  normalizeAreaKey,
} from '@/services/bodyAreaDetection'
import { shouldUseAiInsights } from '@/services/llm/config'
import { chatCompletionJson } from '@/services/llm/llmClient'
import { CLINICAL_SAFETY_SYSTEM, journalBundleUserPayload } from '@/services/llm/prompts'
import type { HealthEntry, Hypothesis } from '@/models/types'

export interface JournalFocusArea {
  area: string
  areaKey: string
  entryIds: string[]
  themes: string[]
  rationale?: string
}

export interface JournalFocusPlan {
  areas: JournalFocusArea[]
  generalEntryIds: string[]
  includeGeneralHealth: boolean
  source: 'rule' | 'llm' | 'hybrid'
}

/** Maps loose labels to a single canonical body-region name. */
const CANONICAL_AREA_LABELS: Record<string, string> = {
  'left leg': 'Legs',
  'right leg': 'Legs',
  leg: 'Legs',
  legs: 'Legs',
  'lower leg': 'Legs',
  'upper leg': 'Legs',
  calf: 'Lower leg',
  thigh: 'Upper leg',
  'left arm': 'Arm',
  'right arm': 'Arm',
  arm: 'Arm',
  'left hand': 'Hand',
  'right hand': 'Hand',
  hand: 'Hand',
  hands: 'Hand',
  finger: 'Hand',
  fingers: 'Hand',
  'left foot': 'Foot',
  'right foot': 'Foot',
  foot: 'Foot',
  feet: 'Foot',
  toe: 'Foot',
  toes: 'Foot',
  'left ankle': 'Ankle',
  'right ankle': 'Ankle',
  ankle: 'Ankle',
  ankles: 'Ankle',
  'left knee': 'Knee',
  'right knee': 'Knee',
  knee: 'Knee',
  knees: 'Knee',
  'left hip': 'Hip',
  'right hip': 'Hip',
  hip: 'Hip',
  hips: 'Hip',
  'left shoulder': 'Shoulder',
  'right shoulder': 'Shoulder',
  shoulder: 'Shoulder',
  shoulders: 'Shoulder',
  'left wrist': 'Wrist',
  'right wrist': 'Wrist',
  wrist: 'Wrist',
  wrists: 'Wrist',
  'left elbow': 'Elbow',
  'right elbow': 'Elbow',
  elbow: 'Elbow',
  elbows: 'Elbow',
  lumbar: 'Lower back',
  'lumbar spine': 'Lower back',
  cervical: 'Neck',
  spine: 'Spine',
  spinal: 'Spine',
  back: 'Back',
  abdomen: 'Abdomen',
  stomach: 'Abdomen',
  belly: 'Abdomen',
  gut: 'Abdomen',
  chest: 'Chest',
  head: 'Head',
  headache: 'Head',
  migraine: 'Head',
  skin: 'Skin',
  joint: 'Joints',
  joints: 'Joints',
  pelvis: 'Pelvis',
  pelvic: 'Pelvis',
  'body weight': 'Body weight',
  weight: 'Body weight',
}

const SYSTEMIC_PATTERNS =
  /\b(fatigue|tired|exhaustion|fever|chills|weight\s+loss|weight\s+gain|insomnia|sleep|anxiety|depression|mood|stress|overall\s+health|general\s+health|whole\s+body|everywhere|allergies|immune)\b/i

const BACK_FAMILY = new Set(
  ['back', 'lower back', 'upper back', 'spine', 'neck'].map(normalizeAreaKey)
)

function areaSpecificityRank(area: string): number {
  const key = normalizeAreaKey(area)
  const idx = BODY_AREA_RULES.findIndex(
    (rule) => normalizeAreaKey(rule.area) === key
  )
  if (idx >= 0) return idx
  if (BACK_FAMILY.has(key)) return 20 + key.length
  return 80 + key.length
}

export function resolveCanonicalArea(area: string): string {
  const trimmed = area.trim()
  if (!trimmed) return GENERAL_HEALTH_AREA
  const key = normalizeAreaKey(trimmed)
  if (isGeneralHealthArea(trimmed)) return GENERAL_HEALTH_AREA
  return CANONICAL_AREA_LABELS[key] ?? trimmed
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  if (setA.size === 0 && setB.size === 0) return 1
  let intersection = 0
  for (const id of setA) {
    if (setB.has(id)) intersection += 1
  }
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

function pickMergedLabel(a: string, b: string): string {
  const rankA = areaSpecificityRank(a)
  const rankB = areaSpecificityRank(b)
  if (rankA !== rankB) return rankA < rankB ? a : b
  return a.length >= b.length ? a : b
}

function mergeFocusAreas(a: JournalFocusArea, b: JournalFocusArea): JournalFocusArea {
  const area = pickMergedLabel(a.area, b.area)
  return {
    area,
    areaKey: normalizeAreaKey(area),
    entryIds: [...new Set([...a.entryIds, ...b.entryIds])],
    themes: [...new Set([...a.themes, ...b.themes])],
    rationale: [a.rationale, b.rationale].filter(Boolean).join(' '),
  }
}

function mergeOverlappingFocusAreas(areas: JournalFocusArea[]): JournalFocusArea[] {
  let result = [...areas]
  let changed = true

  while (changed) {
    changed = false
    outer: for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const a = result[i]!
        const b = result[j]!
        const overlap = jaccard(a.entryIds, b.entryIds)
        const aSubsumed = a.entryIds.every((id) => b.entryIds.includes(id))
        const bSubsumed = b.entryIds.every((id) => a.entryIds.includes(id))
        const sameBackFamily =
          BACK_FAMILY.has(a.areaKey) && BACK_FAMILY.has(b.areaKey) && overlap >= 0.35

        if (overlap >= 0.55 || aSubsumed || bSubsumed || sameBackFamily) {
          result[i] = mergeFocusAreas(a, b)
          result.splice(j, 1)
          changed = true
          break outer
        }
      }
    }
  }

  return result
}

function extractThemes(text: string): string[] {
  const themes: string[] = []
  if (/\bpain|ache|hurt\b/i.test(text)) themes.push('pain')
  if (/\bworse|worsen|deteriorat/i.test(text)) themes.push('worsening')
  if (/\bbetter|improv|easier/i.test(text)) themes.push('improvement')
  if (/\bmedication|prescri|dose\b/i.test(text)) themes.push('medication')
  if (/\bvisit|doctor|clinic|er\b/i.test(text)) themes.push('clinical visit')
  return themes
}

function collectRawAreaCandidates(entries: HealthEntry[]): Map<string, JournalFocusArea> {
  const map = new Map<string, JournalFocusArea>()

  for (const entry of entries) {
    const text = combinedEntryText(entry)
    const candidates = new Set<string>()

    const fieldCanonical = resolveCanonicalArea(entry.conditionArea)
    if (!isGeneralHealthArea(fieldCanonical)) {
      candidates.add(fieldCanonical)
    }

    for (const detected of areasForEntry(entry)) {
      const canonical = resolveCanonicalArea(detected)
      if (!isGeneralHealthArea(canonical)) {
        candidates.add(canonical)
      }
    }

    for (const fromAi of entry.analysis.ai?.suggestedBodyAreas ?? []) {
      const canonical = resolveCanonicalArea(fromAi)
      if (!isGeneralHealthArea(canonical)) {
        candidates.add(canonical)
      }
    }

    const themes = extractThemes(text)

    for (const area of candidates) {
      const areaKey = normalizeAreaKey(area)
      const existing = map.get(areaKey)
      if (existing) {
        existing.entryIds.push(entry.id)
        for (const theme of themes) {
          if (!existing.themes.includes(theme)) existing.themes.push(theme)
        }
      } else {
        map.set(areaKey, {
          area,
          areaKey,
          entryIds: [entry.id],
          themes: [...themes],
        })
      }
    }
  }

  for (const focus of map.values()) {
    focus.entryIds = [...new Set(focus.entryIds)]
  }

  return map
}

function assignPrimaryFocusAreas(
  rawAreas: JournalFocusArea[],
  entries: HealthEntry[]
): { areas: JournalFocusArea[]; generalEntryIds: string[] } {
  const entryById = new Map(entries.map((e) => [e.id, e]))
  const assignment = new Map<string, string>()

  for (const entry of entries) {
    const text = combinedEntryText(entry)
    const candidates = rawAreas
      .filter((a) => a.entryIds.includes(entry.id))
      .map((a) => a.area)

    if (candidates.length === 0) {
      if (SYSTEMIC_PATTERNS.test(text) || isGeneralHealthArea(entry.conditionArea)) {
        assignment.set(entry.id, GENERAL_HEALTH_AREA)
      }
      continue
    }

    const fieldPreferred = resolveCanonicalArea(entry.conditionArea)
    let chosen = candidates.find((c) => areasMatch(c, fieldPreferred))

    if (!chosen) {
      chosen = [...candidates].sort(
        (a, b) => areaSpecificityRank(a) - areaSpecificityRank(b)
      )[0]
    }

    assignment.set(entry.id, chosen!)
  }

  const areas: JournalFocusArea[] = []
  const generalEntryIds: string[] = []

  for (const raw of rawAreas) {
    const entryIds = raw.entryIds.filter((id) => assignment.get(id) === raw.area)
    if (entryIds.length === 0) continue
    areas.push({ ...raw, entryIds: [...new Set(entryIds)] })
  }

  for (const entry of entries) {
    const assigned = assignment.get(entry.id)
    if (assigned === GENERAL_HEALTH_AREA) {
      generalEntryIds.push(entry.id)
    } else if (!assigned) {
      const text = combinedEntryText(entry)
      if (
        isGeneralHealthArea(entry.conditionArea) ||
        SYSTEMIC_PATTERNS.test(text) ||
        detectAllBodyAreasFromText(text).length === 0
      ) {
        generalEntryIds.push(entry.id)
      }
    }
  }

  return { areas, generalEntryIds: [...new Set(generalEntryIds)] }
}

/**
 * Rule-based holistic pass: infer deduplicated body regions from the full journal.
 */
export function buildJournalFocusPlan(entries: HealthEntry[]): JournalFocusPlan {
  if (entries.length === 0) {
    return {
      areas: [],
      generalEntryIds: [],
      includeGeneralHealth: false,
      source: 'rule',
    }
  }

  const raw = [...collectRawAreaCandidates(entries).values()]
  const merged = mergeOverlappingFocusAreas(raw)
  const { areas, generalEntryIds } = assignPrimaryFocusAreas(merged, entries)

  const sortedAreas = areas.sort((a, b) => b.entryIds.length - a.entryIds.length)
  const includeGeneralHealth =
    generalEntryIds.length > 0 ||
    (sortedAreas.length === 0 && entries.length > 0)

  return {
    areas: sortedAreas,
    generalEntryIds,
    includeGeneralHealth,
    source: 'rule',
  }
}

interface AiFocusAreaItem {
  area: string
  entryIds: string[]
  themes?: string[]
  rationale?: string
}

interface AiFocusPlanResponse {
  focusAreas: AiFocusAreaItem[]
  generalEntryIds: string[]
  includeGeneralHealth: boolean
}

async function inferJournalFocusAreasWithAi(
  entries: HealthEntry[],
  rulePlan: JournalFocusPlan
): Promise<JournalFocusPlan> {
  const bundle = journalBundleUserPayload(
    entries.map((e) => ({
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

  const response = await chatCompletionJson<AiFocusPlanResponse>(
    [
      { role: 'system', content: CLINICAL_SAFETY_SYSTEM },
      {
        role: 'user',
        content: `Analyze the ENTIRE health journal and decide which body regions deserve separate clinical focus (hypotheses + possible diagnoses).

Return JSON:
{
  "focusAreas": [
    {
      "area": string,
      "entryIds": string[],
      "themes": string[],
      "rationale": string
    }
  ],
  "generalEntryIds": string[],
  "includeGeneralHealth": boolean
}

Rules:
- Merge duplicates (e.g. "left leg" + "legs" → one "Legs" focus).
- Each journal entryId should appear in AT MOST ONE focus area OR generalEntryIds.
- Use clear clinician-friendly region names (Lower back, Head, Abdomen, etc.).
- Only create a focus area when the journal supports it (symptoms, visits, meds, or trends).
- Put systemic/whole-body notes in generalEntryIds.
- includeGeneralHealth true only if generalEntryIds is non-empty or no specific regions exist.
- ruleBasedHint is a starting point — improve merges and assignments.

ruleBasedHint:
${JSON.stringify(rulePlan, null, 2)}

Journal:
${bundle}`,
      },
    ],
    { temperature: 0.2, maxTokens: 3500 }
  )

  const validIds = new Set(entries.map((e) => e.id))
  const usedIds = new Set<string>()
  const areas: JournalFocusArea[] = []

  for (const item of response.focusAreas ?? []) {
    const area = resolveCanonicalArea(item.area)
    if (isGeneralHealthArea(area)) continue

    const entryIds = (item.entryIds ?? []).filter((id) => {
      if (!validIds.has(id) || usedIds.has(id)) return false
      usedIds.add(id)
      return true
    })

    if (entryIds.length === 0) continue

    areas.push({
      area,
      areaKey: normalizeAreaKey(area),
      entryIds,
      themes: (item.themes ?? []).filter(Boolean).slice(0, 8),
      rationale: item.rationale?.trim(),
    })
  }

  const generalEntryIds = (response.generalEntryIds ?? []).filter((id) => {
    if (!validIds.has(id) || usedIds.has(id)) return false
    usedIds.add(id)
    return true
  })

  for (const entry of entries) {
    if (!usedIds.has(entry.id)) {
      generalEntryIds.push(entry.id)
      usedIds.add(entry.id)
    }
  }

  const merged = mergeOverlappingFocusAreas(areas)
  const includeGeneralHealth =
    response.includeGeneralHealth === true || generalEntryIds.length > 0

  return {
    areas: merged.sort((a, b) => b.entryIds.length - a.entryIds.length),
    generalEntryIds: [...new Set(generalEntryIds)],
    includeGeneralHealth,
    source: 'hybrid',
  }
}

/** Full journal focus plan — AI when enabled, otherwise rules. */
export async function resolveJournalFocusPlan(
  entries: HealthEntry[],
  options: { useAi?: boolean } = {}
): Promise<JournalFocusPlan> {
  const rulePlan = buildJournalFocusPlan(entries)
  const useAi = options.useAi ?? shouldUseAiInsights()

  if (!useAi || entries.length === 0) {
    return rulePlan
  }

  try {
    return await inferJournalFocusAreasWithAi(entries, rulePlan)
  } catch (err) {
    console.warn('[Monday] AI journal focus areas failed; using rule-based plan.', err)
    return rulePlan
  }
}

export function collectFocusAreaLabels(
  plan: JournalFocusPlan,
  hypotheses: Hypothesis[] = []
): string[] {
  const labels: string[] = []

  if (plan.includeGeneralHealth) {
    labels.push(GENERAL_HEALTH_AREA)
  }

  for (const focus of plan.areas) {
    if (!labels.some((l) => areasMatch(l, focus.area))) {
      labels.push(focus.area)
    }
  }

  for (const hypothesis of hypotheses) {
    const canonical = resolveCanonicalArea(
      hypothesis.conditionArea?.trim() ||
        hypothesis.title.split(':')[0]?.trim() ||
        ''
    )
    if (isGeneralHealthArea(canonical)) continue
    if (!labels.some((l) => areasMatch(l, canonical))) {
      labels.push(canonical)
    }
  }

  return labels
}

export function entriesForFocusArea(
  area: string,
  entries: HealthEntry[],
  plan: JournalFocusPlan
): HealthEntry[] {
  if (isGeneralHealthArea(area)) {
    const ids = new Set(plan.generalEntryIds)
    return entries
      .filter((e) => ids.has(e.id))
      .sort(
        (a, b) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      )
  }

  const focus = plan.areas.find((f) => areasMatch(f.area, area))
  if (!focus) return []

  const idSet = new Set(focus.entryIds)
  return entries
    .filter((e) => idSet.has(e.id))
    .sort(
      (a, b) =>
        new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    )
}

export function entryIdsForArea(plan: JournalFocusPlan, area: string): string[] {
  if (isGeneralHealthArea(area)) return plan.generalEntryIds
  return plan.areas.find((f) => areasMatch(f.area, area))?.entryIds ?? []
}
