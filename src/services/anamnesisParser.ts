import {
  format,
  parseISO,
  subMonths,
  subYears,
  isValid,
} from 'date-fns'
import type { HealthEntryInput, HealthEntryType } from '@/models/types'
import { extractSeverityFromText } from '@/services/entrySeverity'
import { inferEntryTypeFromText } from '@/services/healthAnalysis'
import { buildJournalShortTitle } from '@/services/journalEntryText'
import { isWeightRelatedText } from '@/services/weightEntry'

export interface ParsedAnamnesisRecord {
  eventDate: string
  conditionArea: string
  entryType: HealthEntryType
  title: string
  description: string
  medications?: string
  severity?: number
}

const BODY_AREA_RULES: { pattern: RegExp; area: string }[] = [
  { pattern: /\b(left|right)\s+leg\b/i, area: 'Left leg' },
  { pattern: /\b(left|right)\s+knee\b/i, area: 'Knee' },
  { pattern: /\b(left|right)\s+arm\b/i, area: 'Arm' },
  { pattern: /\b(left|right)\s+shoulder\b/i, area: 'Shoulder' },
  { pattern: /\b(left|right)\s+hip\b/i, area: 'Hip' },
  { pattern: /\b(left|right)\s+foot\b/i, area: 'Foot' },
  { pattern: /\b(left|right)\s+ankle\b/i, area: 'Ankle' },
  { pattern: /\blower\s+back\b/i, area: 'Lower back' },
  { pattern: /\bupper\s+back\b/i, area: 'Upper back' },
  { pattern: /\bback\b/i, area: 'Back' },
  { pattern: /\bneck\b/i, area: 'Neck' },
  { pattern: /\bspine\b/i, area: 'Spine' },
  { pattern: /\bknees?\b/i, area: 'Knee' },
  { pattern: /\blegs?\b/i, area: 'Legs' },
  { pattern: /\bhips?\b/i, area: 'Hip' },
  { pattern: /\bshoulders?\b/i, area: 'Shoulder' },
  { pattern: /\barms?\b/i, area: 'Arm' },
  { pattern: /\bhands?\b/i, area: 'Hand' },
  { pattern: /\bfeet|foot\b/i, area: 'Foot' },
  { pattern: /\bjoints?\b/i, area: 'Joints' },
  { pattern: /\bchest\b/i, area: 'Chest' },
  { pattern: /\babdomen|stomach\b/i, area: 'Abdomen' },
  { pattern: /\bhead\b/i, area: 'Head' },
]

const MONTH_NAMES: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
}

function clampDate(d: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const candidate = new Date(d)
  candidate.setHours(0, 0, 0, 0)
  if (candidate > today) return format(today, 'yyyy-MM-dd')
  return format(candidate, 'yyyy-MM-dd')
}

function parseDateFromSegment(text: string, reference = new Date()): string {
  const iso = text.match(/\b(20\d{2}|19\d{2})-(\d{2})-(\d{2})\b/)
  if (iso) {
    const d = parseISO(iso[0])
    if (isValid(d)) return clampDate(d)
  }

  const yearMonthDay = text.match(
    /\b(20\d{2}|19\d{2})-(\d{1,2})-(\d{1,2})\b/
  )
  if (yearMonthDay) {
    const d = new Date(
      Number(yearMonthDay[1]),
      Number(yearMonthDay[2]) - 1,
      Number(yearMonthDay[3])
    )
    if (isValid(d)) return clampDate(d)
  }

  const yearMonth = text.match(/\b(20\d{2}|19\d{2})-(\d{1,2})\b/)
  if (yearMonth) {
    const d = new Date(Number(yearMonth[1]), Number(yearMonth[2]) - 1, 15)
    if (isValid(d)) return clampDate(d)
  }

  const slashDate = text.match(/\b(\d{1,2})[./](\d{1,2})[./](20\d{2}|19\d{2})\b/)
  if (slashDate) {
    const [, day, month, year] = slashDate
    const d = new Date(Number(year), Number(month) - 1, Number(day))
    if (isValid(d)) return clampDate(d)
  }

  const monthYear = text.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+(20\d{2}|19\d{2})\b/i
  )
  if (monthYear) {
    const month = MONTH_NAMES[monthYear[1].toLowerCase()]
    const d = new Date(Number(monthYear[2]), month, 15)
    if (isValid(d)) return clampDate(d)
  }

  const yearsAgo = text.match(/\b(\d{1,2})\s+years?\s+ago\b/i)
  if (yearsAgo) {
    return clampDate(subYears(reference, Number(yearsAgo[1])))
  }

  const monthsAgo = text.match(/\b(\d{1,2})\s+months?\s+ago\b/i)
  if (monthsAgo) {
    return clampDate(subMonths(reference, Number(monthsAgo[1])))
  }

  const yearOnly =
    text.match(/\b(?:in|since|from|around|circa)\s+(20\d{2}|19\d{2})\b/i) ||
    text.match(/\b(20\d{2}|19\d{2})\b/)
  if (yearOnly) {
    const y = Number(yearOnly[1] || yearOnly[0])
    return clampDate(new Date(y, 5, 15))
  }

  if (/\blast\s+year\b/i.test(text)) {
    return clampDate(subYears(reference, 1))
  }

  if (/\blast\s+(few\s+)?months?\b/i.test(text)) {
    return clampDate(subMonths(reference, 4))
  }

  if (
    /\b(for\s+years|many\s+years|long\s+time|chronic|since\s+childhood|lifelong)\b/i.test(
      text
    )
  ) {
    return clampDate(subYears(reference, 3))
  }

  return clampDate(reference)
}

function detectConditionArea(text: string, fallback: string): string {
  if (isWeightRelatedText(text)) return 'Body weight'
  for (const rule of BODY_AREA_RULES) {
    if (rule.pattern.test(text)) return rule.area
  }
  return fallback.trim() || 'General health'
}

function extractMedications(text: string): string | undefined {
  const medLine = text
    .split(/[.!?\n]/)
    .find((line) =>
      /\b(prescribed|taking|medication|medicine|mg\b|tablet|capsule)\b/i.test(line)
    )
  return medLine?.trim().slice(0, 240) || undefined
}

const DATED_LINE_START =
  /^(?:(?:20|19)\d{2})(?:-\d{1,2}(?:-\d{1,2})?)?\s*[—–\-:]/i

function splitDatedLines(normalized: string): string[] | null {
  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length >= 8)
  if (lines.length < 2) return null
  const dated = lines.filter((line) => DATED_LINE_START.test(line))
  if (dated.length >= 2 && dated.length >= Math.ceil(lines.length / 2)) {
    return dated
  }
  return null
}

function splitIntoSegments(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const datedLines = splitDatedLines(normalized)
  if (datedLines) return datedLines

  const segments: string[] = []
  let current: string[] = []

  for (const line of normalized.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (current.length) {
        segments.push(current.join(' '))
        current = []
      }
      continue
    }

    const isBullet = /^([-•*–—]|\d+[.)])\s+/.test(trimmed)
    const content = trimmed.replace(/^([-•*–—]|\d+[.)])\s+/, '')

    if (isBullet) {
      if (current.length) segments.push(current.join(' '))
      current = [content]
    } else if (current.length) {
      current.push(trimmed)
    } else {
      current = [trimmed]
    }
  }
  if (current.length) segments.push(current.join(' '))

  const fromBullets = segments.filter((s) => s.length >= 15)
  if (fromBullets.length > 1) return fromBullets

  const paragraphs = normalized
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter((p) => p.length >= 15)
  if (paragraphs.length > 1) return paragraphs

  const temporal = normalized
    .split(
      /(?=(?:^|[.!?]\s+)(?:In\s+\d{4}|Since\s+\d{4}|Since\s+then|Later|Then|After\s+that|Afterwards|Before\s+that|During\s+this|When\s+I|At\s+that\s+time|\d+\s+years?\s+ago))/i
    )
    .map((s) => s.trim())
    .filter((s) => s.length >= 15)
  if (temporal.length > 1) return temporal

  if (normalized.length >= 15) return [normalized]
  return []
}

function segmentToRecord(
  segment: string,
  primaryConditionArea: string
): ParsedAnamnesisRecord {
  const eventDate = parseDateFromSegment(segment)
  const isWeight = isWeightRelatedText(segment)
  const entryType = isWeight ? 'change' : inferEntryTypeFromText(segment)
  const conditionArea = detectConditionArea(segment, primaryConditionArea)
  const severity = extractSeverityFromText(segment)
  const medications =
    entryType === 'medication' ? extractMedications(segment) : undefined

  return {
    eventDate,
    conditionArea,
    entryType,
    title: buildJournalShortTitle(segment, entryType, eventDate),
    description: segment.trim(),
    medications,
    severity,
  }
}

export function parseAnamnesis(
  text: string,
  primaryConditionArea = ''
): ParsedAnamnesisRecord[] {
  const segments = splitIntoSegments(text)
  const fallback = primaryConditionArea.trim() || 'General health'

  return segments.map((segment) => segmentToRecord(segment, fallback))
}

export function toHealthEntryInput(record: ParsedAnamnesisRecord): HealthEntryInput {
  return {
    eventDate: record.eventDate,
    conditionArea: record.conditionArea,
    entryType: record.entryType,
    title: record.title,
    description: record.description,
    medications: record.medications,
    severity: record.severity,
  }
}
