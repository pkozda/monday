import { combinedEntryText } from '@/services/healthAnalysis'
import {
  buildJournalFocusPlan,
  collectFocusAreaLabels,
} from '@/services/journalFocusAreas'
import { isWeightRelatedText } from '@/services/weightEntry'
import type { HealthEntry, Hypothesis } from '@/models/types'

/** Ordered most-specific first so “left ankle” wins before “ankle” / “leg”. */
export const BODY_AREA_RULES: { pattern: RegExp; area: string }[] = [
  { pattern: /\b(left|right)\s+ankle\b/i, area: 'Ankle' },
  { pattern: /\b(left|right)\s+knee\b/i, area: 'Knee' },
  { pattern: /\b(left|right)\s+hip\b/i, area: 'Hip' },
  { pattern: /\b(left|right)\s+shoulder\b/i, area: 'Shoulder' },
  { pattern: /\b(left|right)\s+wrist\b/i, area: 'Wrist' },
  { pattern: /\b(left|right)\s+elbow\b/i, area: 'Elbow' },
  { pattern: /\b(left|right)\s+foot\b/i, area: 'Foot' },
  { pattern: /\b(left|right)\s+leg\b/i, area: 'Left leg' },
  { pattern: /\b(left|right)\s+arm\b/i, area: 'Arm' },
  { pattern: /\b(left|right)\s+hand\b/i, area: 'Hand' },
  { pattern: /\blower\s+back|lumbar\s+spine|lumbar\b/i, area: 'Lower back' },
  { pattern: /\bupper\s+back|thoracic\b/i, area: 'Upper back' },
  { pattern: /\blower\s+abdomen|pelvis|pelvic\b/i, area: 'Pelvis' },
  { pattern: /\bforehead|temples?\b/i, area: 'Head' },
  { pattern: /\blower\s+leg|calf\b/i, area: 'Lower leg' },
  { pattern: /\bupper\s+leg|thigh\b/i, area: 'Upper leg' },
  { pattern: /\bspine|spinal\b/i, area: 'Spine' },
  { pattern: /\bneck|cervical\b/i, area: 'Neck' },
  { pattern: /\bback\b/i, area: 'Back' },
  { pattern: /\bankles?\b/i, area: 'Ankle' },
  { pattern: /\bknees?\b/i, area: 'Knee' },
  { pattern: /\bhips?\b/i, area: 'Hip' },
  { pattern: /\bshoulders?\b/i, area: 'Shoulder' },
  { pattern: /\bwrists?\b/i, area: 'Wrist' },
  { pattern: /\belbows?\b/i, area: 'Elbow' },
  { pattern: /\bfeet|foot\b/i, area: 'Foot' },
  { pattern: /\blegs?\b/i, area: 'Legs' },
  { pattern: /\barms?\b/i, area: 'Arm' },
  { pattern: /\bhands?\b/i, area: 'Hand' },
  { pattern: /\bfingers?\b/i, area: 'Hand' },
  { pattern: /\btoes?\b/i, area: 'Foot' },
  { pattern: /\bjoints?\b/i, area: 'Joints' },
  { pattern: /\bchest|breastbone|sternum\b/i, area: 'Chest' },
  { pattern: /\babdomen|abdominal|stomach|belly|gut\b/i, area: 'Abdomen' },
  { pattern: /\bhead|headache|migraine\b/i, area: 'Head' },
  { pattern: /\bskin|rash|dermatitis\b/i, area: 'Skin' },
  { pattern: /\beyes?|vision\b/i, area: 'Eyes' },
  { pattern: /\bear|ears?\b/i, area: 'Ear' },
  { pattern: /\bnose|sinus\b/i, area: 'Nose' },
  { pattern: /\bthroat|neck\s+pain\b/i, area: 'Throat' },
]

export const GENERAL_HEALTH_AREA = 'General health'

export function normalizeAreaKey(area: string): string {
  return area.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function isGeneralHealthArea(area: string): boolean {
  const key = normalizeAreaKey(area)
  return key === 'general health' || key === 'general' || key === ''
}

export function areasMatch(a: string, b: string): boolean {
  return normalizeAreaKey(a) === normalizeAreaKey(b)
}

/** First matching body region in text (anamnesis / single-area default). */
export function detectConditionArea(text: string, fallback = ''): string {
  if (isWeightRelatedText(text)) return 'Body weight'
  for (const rule of BODY_AREA_RULES) {
    if (rule.pattern.test(text)) return rule.area
  }
  const trimmed = fallback.trim()
  return trimmed || GENERAL_HEALTH_AREA
}

/** All body regions mentioned in text (title, description, etc.). */
export function detectAllBodyAreasFromText(text: string): string[] {
  if (isWeightRelatedText(text)) return ['Body weight']
  const found: string[] = []
  const seen = new Set<string>()
  for (const rule of BODY_AREA_RULES) {
    if (!rule.pattern.test(text)) continue
    const key = normalizeAreaKey(rule.area)
    if (seen.has(key)) continue
    seen.add(key)
    found.push(rule.area)
  }
  return found
}

export function areasForEntry(entry: HealthEntry): string[] {
  const text = combinedEntryText(entry)
  const fromText = detectAllBodyAreasFromText(text)
  const map = new Map<string, string>()

  const field = entry.conditionArea.trim()
  if (field) {
    map.set(normalizeAreaKey(field), field)
  }

  for (const area of fromText) {
    map.set(normalizeAreaKey(area), area)
  }

  if (map.size === 0) {
    map.set(normalizeAreaKey(GENERAL_HEALTH_AREA), GENERAL_HEALTH_AREA)
  }

  return [...map.values()]
}

export function entryRelatesToArea(entry: HealthEntry, area: string): boolean {
  if (isGeneralHealthArea(area)) return true
  return areasForEntry(entry).some((candidate) => areasMatch(candidate, area))
}

export function collectConditionAreas(
  entries: HealthEntry[],
  hypotheses: Hypothesis[]
): string[] {
  const plan = buildJournalFocusPlan(entries)
  return collectFocusAreaLabels(plan, hypotheses)
}

