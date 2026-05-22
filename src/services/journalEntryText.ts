import { format, parseISO } from 'date-fns'
import type { HealthEntry, HealthEntryInput, HealthEntryType } from '@/models/types'
import { getEntryClassificationLabel, inferEntryTypeFromText } from '@/services/healthAnalysis'
import { buildWeightTitle, isWeightRelatedText } from '@/services/weightEntry'

const MAX_TITLE_LEN = 52

const DEFAULT_TITLES: Record<HealthEntryType, string> = {
  symptom: 'Symptom',
  medication: 'Medication',
  change: 'Condition change',
  doctor_visit: 'Doctor visit',
  imaging: 'Imaging',
  other: 'Health note',
}

const IMAGING_LABELS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bmri\b/i, label: 'MRI' },
  { pattern: /\b(ct\s+scan|cat\s+scan|computed\s+tomography)\b/i, label: 'CT scan' },
  { pattern: /\b(x-?ray|radiograph)\b/i, label: 'X-ray' },
  { pattern: /\bultrasound|sonograph/i, label: 'Ultrasound' },
  { pattern: /\bendoscopy|colonoscopy\b/i, label: 'Endoscopy' },
  { pattern: /\bbiopsy\b/i, label: 'Biopsy' },
]

const VISIT_LABELS: { pattern: RegExp; label: string }[] = [
  { pattern: /\barthroscop/i, label: 'Arthroscopy' },
  { pattern: /\bsurger(y|ies|ical)\b/i, label: 'Surgery' },
  { pattern: /\boperation\b/i, label: 'Surgery' },
  { pattern: /\bhospitalized|admitted\b/i, label: 'Hospital stay' },
  { pattern: /\bneurolog/i, label: 'Neurologist' },
  { pattern: /\borthoped/i, label: 'Orthopedist' },
  { pattern: /\bcardiolog/i, label: 'Cardiologist' },
  { pattern: /\bgastroenterolog/i, label: 'Gastroenterologist' },
  { pattern: /\brheumatolog/i, label: 'Rheumatologist' },
  { pattern: /\bdermatolog/i, label: 'Dermatologist' },
  { pattern: /\bendocrinolog/i, label: 'Endocrinologist' },
  { pattern: /\bphysio|physical\s+therap/i, label: 'Physiotherapy' },
  { pattern: /\bemergency\s+room|\ber\s+visit\b/i, label: 'ER visit' },
]

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** Remove leading dated prefixes from imported lines (2021 — …, In 2019, …). */
export function stripJournalDatePrefix(text: string): string {
  return text
    .replace(
      /^(?:(?:20|19)\d{2})(?:-\d{1,2}(?:-\d{1,2})?)?\s*[—–\-:]\s*/i,
      ''
    )
    .replace(/^(?:in\s+)?(?:20|19)\d{2}\s*[—–\-:,]?\s*/i, '')
    .trim()
}

function clipTitle(text: string): string {
  const t = normalizeWhitespace(text)
  if (t.length <= MAX_TITLE_LEN) return t
  const cut = t.slice(0, MAX_TITLE_LEN - 1)
  const lastSpace = cut.lastIndexOf(' ')
  if (lastSpace >= 18) return `${cut.slice(0, lastSpace)}…`
  return `${cut}…`
}

function extractBodySnippet(text: string): string | undefined {
  const rules: { pattern: RegExp; label: string }[] = [
    { pattern: /\b(left|right)\s+(knee|ankle|hip|shoulder|leg|arm)\b/i, label: '' },
    { pattern: /\blower\s+back|lumbar\b/i, label: 'lower back' },
    { pattern: /\bupper\s+back|thoracic\b/i, label: 'upper back' },
    { pattern: /\bneck|cervical\b/i, label: 'neck' },
    { pattern: /\bknee\b/i, label: 'knee' },
    { pattern: /\bspine\b/i, label: 'spine' },
    { pattern: /\babdomen|stomach\b/i, label: 'abdomen' },
  ]
  for (const rule of rules) {
    const match = text.match(rule.pattern)
    if (match) {
      const phrase = match[0].toLowerCase()
      return phrase.charAt(0).toUpperCase() + phrase.slice(1)
    }
  }
  return undefined
}

function firstMeaningfulPhrase(text: string, maxWords: number): string {
  const cleaned = stripJournalDatePrefix(text)
  const chunk =
    cleaned.match(/^[^.!?\n]+/)?.[0]?.trim() ??
    cleaned.split(/[,;]/)[0]?.trim() ??
    cleaned
  const words = chunk.split(/\s+/).filter(Boolean).slice(0, maxWords)
  return words.join(' ')
}

function titleFromMedication(text: string): string | undefined {
  const named = text.match(
    /\b([A-Z][a-z]{3,}(?:in|ol|ide|ate|ine|pam|zole|mab|cillin))\b/
  )?.[1]
  if (named) {
    const action = /\b(started|began|prescribed|taking)\b/i.test(text)
      ? 'started'
      : /\b(stopped|discontinued)\b/i.test(text)
        ? 'stopped'
        : ''
    return clipTitle(
      action ? `${named} ${action}` : named
    )
  }
  if (/\bprescribed\b/i.test(text)) return 'New prescription'
  return undefined
}

function titleFromSymptom(text: string): string | undefined {
  const body = extractBodySnippet(text)
  if (/\b(pain|ache|hurt)\b/i.test(text)) {
    return clipTitle(body ? `Pain — ${body}` : 'Pain')
  }
  if (/\b(swelling|swollen)\b/i.test(text)) {
    return clipTitle(body ? `Swelling — ${body}` : 'Swelling')
  }
  if (/\b(numbness|tingling|weakness)\b/i.test(text)) {
    return clipTitle(body ? `Neurologic symptoms — ${body}` : 'Neurologic symptoms')
  }
  if (/\b(fever|fatigue|nausea)\b/i.test(text)) {
    const word = text.match(/\b(fever|fatigue|nausea)\b/i)?.[1]
    if (word) return clipTitle(body ? `${word} — ${body}` : word)
  }
  const phrase = firstMeaningfulPhrase(text, 5)
  if (phrase.length >= 10) return clipTitle(phrase)
  return undefined
}

/** Build a short scan-friendly title; full narrative stays in description. */
export function buildJournalShortTitle(
  text: string,
  entryType: HealthEntryType,
  eventDate?: string
): string {
  const raw = normalizeWhitespace(text)
  if (!raw) return DEFAULT_TITLES[entryType]

  if (isWeightRelatedText(raw) && eventDate) {
    return buildWeightTitle(raw, eventDate)
  }

  const body = stripJournalDatePrefix(raw)

  if (entryType === 'imaging' || IMAGING_LABELS.some((r) => r.pattern.test(body))) {
    for (const rule of IMAGING_LABELS) {
      if (!rule.pattern.test(body)) continue
      const site = extractBodySnippet(body)
      return clipTitle(site ? `${rule.label} — ${site}` : rule.label)
    }
  }

  if (
    entryType === 'doctor_visit' ||
    VISIT_LABELS.some((r) => r.pattern.test(body))
  ) {
    for (const rule of VISIT_LABELS) {
      if (!rule.pattern.test(body)) continue
      const site = extractBodySnippet(body)
      const year = body.match(/\b(20|19)\d{2}\b/)?.[0]
      const parts = [rule.label, site, year].filter(Boolean)
      return clipTitle(parts.join(' · '))
    }
    return 'Clinical visit'
  }

  if (entryType === 'medication') {
    return titleFromMedication(body) ?? DEFAULT_TITLES.medication
  }

  if (entryType === 'change') {
    if (/\b(improv|better|easier)\b/i.test(body)) return 'Improving'
    if (/\b(worse|worsen|flare)\b/i.test(body)) return 'Worsening'
    if (isWeightRelatedText(body)) {
      return eventDate ? buildWeightTitle(body, eventDate) : 'Weight change'
    }
  }

  const symptomTitle = titleFromSymptom(body)
  if (symptomTitle) return symptomTitle

  const phrase = firstMeaningfulPhrase(body, 6)
  if (phrase.length >= 8) return clipTitle(phrase)

  return DEFAULT_TITLES[entryType]
}

/** True when description adds meaningful detail beyond the title. */
export function journalDescriptionAddsDetail(
  title: string,
  description: string
): boolean {
  const t = normalizeWhitespace(title).toLowerCase()
  const d = normalizeWhitespace(description).toLowerCase()
  if (!d) return false
  if (!t) return true
  if (t === d) return false

  const tLower = t.toLowerCase()
  const dLower = d.toLowerCase()
  if (dLower.startsWith(tLower)) {
    const rest = d.slice(t.length).replace(/^[\s.,;:!?—–-]+/, '').trim()
    if (rest.length < 20) return false
  }

  return true
}

/** Body text for clinician exports — description when it adds detail, otherwise title only. */
export function journalBodyForExport(entry: Pick<HealthEntry, 'title' | 'description'>): string {
  const title = entry.title.trim()
  const description = entry.description.trim()
  if (journalDescriptionAddsDetail(title, description)) return description
  return title || description
}

export function polishJournalEntryInput(
  input: HealthEntryInput
): HealthEntryInput {
  const description = input.description.trim()
  let title = input.title.trim()
  const entryType = input.entryType

  if (!description) return { ...input, title, description }

  const needsShortTitle =
    !title ||
    title.length > MAX_TITLE_LEN + 8 ||
    !journalDescriptionAddsDetail(title, description)

  if (needsShortTitle) {
    title = buildJournalShortTitle(
      description,
      entryType,
      input.eventDate
    )
  } else {
    title = clipTitle(title)
  }

  return { ...input, title, description }
}

/** Rebuild title from description when an entry still duplicates title/body. */
export function shouldRebuildJournalTitle(
  entry: Pick<HealthEntry, 'title' | 'description'>
): boolean {
  const title = entry.title.trim()
  const description = entry.description.trim()
  if (!description) return false
  if (!title) return true
  if (!journalDescriptionAddsDetail(title, description)) return true
  if (title.length > MAX_TITLE_LEN + 10) return true
  return false
}

export function rebuildJournalTitleFromEntry(
  entry: Pick<HealthEntry, 'title' | 'description' | 'entryType' | 'eventDate'>
): string {
  const source = entry.description.trim() || entry.title.trim()
  const entryType =
    entry.entryType === 'other' && source
      ? inferEntryTypeFromText(source)
      : entry.entryType
  return buildJournalShortTitle(source, entryType, entry.eventDate)
}

/** One-line header for lists and clinician summaries. */
export function formatJournalEntryHeader(entry: HealthEntry): string {
  const date = format(parseISO(entry.eventDate), 'MMM d, yyyy')
  const label = getEntryClassificationLabel(entry)
  const severity =
    entry.severity !== undefined ? ` · severity ${entry.severity}/10` : ''
  return `${date} · ${label}${severity} · ${entry.title.trim()}`
}

/** Indented lines for doctor export (no duplicate title + full text). */
export function formatJournalEntryClinicianLines(entry: HealthEntry): string[] {
  const lines = [`  ${formatJournalEntryHeader(entry)}`]
  const title = entry.title.trim()
  const description = entry.description.trim()
  if (journalDescriptionAddsDetail(title, description)) {
    lines.push(`  ${description}`)
  }
  if (entry.medications?.trim()) {
    lines.push(`  Medications: ${entry.medications.trim()}`)
  }
  return lines
}
