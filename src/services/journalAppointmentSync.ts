import { parseISO } from 'date-fns'
import {
  combinedEntryText,
  getEntryClassificationLabel,
  isClinicalVisit,
  isHospitalCare,
  isProcedureOrSurgery,
} from '@/services/healthAnalysis'
import {
  formatWeightBaselineLine,
} from '@/services/patientVisitBasics'
import {
  journalBodyForExport,
  journalDescriptionAddsDetail,
} from '@/services/journalEntryText'
import { suggestSpecialist } from '@/services/specialistSuggestion'
import type {
  DoctorAppointment,
  DoctorAppointmentInput,
  HealthEntry,
} from '@/models/types'

const JOURNAL_NOTES_PREFIX = 'Synced from health journal.'

const JOURNAL_VISIT_CLASSIFICATIONS =
  /clinical visit|diagnosis|specialist|surgery|procedure|hospital|post-procedure/i

const APPOINTMENT_TEXT =
  /\b(appointment|follow-?up|consult(?:ation)?|referred\s+to|saw\s+(?:the\s+)?(?:doctor|dr\.?)|visited\s+(?:the\s+)?(?:doctor|dr\.?|specialist|clinic|hospital))\b/i

const SPECIALTY_RULES: { pattern: RegExp; specialty: string }[] = [
  { pattern: /\bneurolog/i, specialty: 'Neurology' },
  { pattern: /\borthoped|\borthopaedic/i, specialty: 'Orthopedics' },
  { pattern: /\bcardiolog/i, specialty: 'Cardiology' },
  { pattern: /\bdermatolog/i, specialty: 'Dermatology' },
  { pattern: /\bgastroenterolog|\bgi\s+specialist/i, specialty: 'Gastroenterology' },
  { pattern: /\brheumatolog/i, specialty: 'Rheumatology' },
  { pattern: /\bphysiatrist/i, specialty: 'Physical medicine' },
  { pattern: /\boncolog/i, specialty: 'Oncology' },
  { pattern: /\burolog/i, specialty: 'Urology' },
  { pattern: /\bgynecolog|\bob-?gyn/i, specialty: 'Gynecology' },
  { pattern: /\bendocrinolog/i, specialty: 'Endocrinology' },
  { pattern: /\bpulmonolog/i, specialty: 'Pulmonology' },
  { pattern: /\bnephrolog/i, specialty: 'Nephrology' },
  { pattern: /\bpsychiatr/i, specialty: 'Psychiatry' },
  { pattern: /\bsurgeon|\bsurgical\b/i, specialty: 'Surgery' },
  { pattern: /\bgeneral\s+practitioner|\bprimary\s+care|\bGP\b/i, specialty: 'Primary care' },
]

const DEFAULT_ADDRESS = 'See health journal entry for location details'

export function isJournalVisitEntry(entry: HealthEntry): boolean {
  if (entry.entryType === 'doctor_visit') return true

  const label = getEntryClassificationLabel(entry)
  if (JOURNAL_VISIT_CLASSIFICATIONS.test(label)) return true

  const text = combinedEntryText(entry)
  if (isProcedureOrSurgery(text) || isHospitalCare(text)) return true
  if (isClinicalVisit(text) && APPOINTMENT_TEXT.test(text)) return true
  if (APPOINTMENT_TEXT.test(text)) return true

  return false
}

function extractSpecialty(text: string, conditionArea: string): string {
  for (const rule of SPECIALTY_RULES) {
    if (rule.pattern.test(text)) return rule.specialty
  }
  const suggested = suggestSpecialist(conditionArea, text)
  if (suggested) return suggested.specialty
  const area = conditionArea.trim()
  if (area && !/^(general|overall)\s+health$/i.test(area)) {
    return `${area} — clinical care`
  }
  return 'General practice'
}

function extractYear(text: string, title: string, fallbackDate: string): string | undefined {
  return (
    text.match(/\b(19|20)\d{2}\b/)?.[0] ??
    title.match(/\b(19|20)\d{2}\b/)?.[0] ??
    (fallbackDate.length >= 4 ? fallbackDate.slice(0, 4) : undefined)
  )
}

function extractDoctorName(
  text: string,
  title: string,
  eventDate: string
): string {
  const dr =
    text.match(
      /\bDr\.?\s+([A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){0,2})/i
    )?.[1] ?? text.match(/\bdoctor\s+([A-Z][a-zA-Z.'-]+)/i)?.[1]

  if (dr) return `Dr. ${dr.replace(/^dr\.?\s*/i, '').trim()}`

  const year = extractYear(text, title, eventDate)

  if (/\barthroscop/i.test(text)) {
    let body = 'Ankle'
    if (/\bleft\s+ankle/i.test(text)) body = 'Left ankle'
    else if (/\bright\s+ankle/i.test(text)) body = 'Right ankle'
    const details: string[] = []
    if (/\bnecrosis/i.test(text)) details.push('necrosis')
    if (/\btransplant|bone\s+marrow/i.test(text)) details.push('bone marrow transplant')
    const suffix = details.length ? ` — ${details.join(', ')}` : ''
    return year
      ? `${body} arthroscopy${suffix} (${year})`
      : `${body} arthroscopy${suffix}`
  }

  if (/\bthrombos/i.test(text) && /\bvein/i.test(text)) {
    return year ? `Vein surgery — thrombosis (${year})` : 'Vein surgery — thrombosis'
  }

  if (/\bsurger(y|ies|ical)\b/i.test(text)) {
    return year ? `Surgery (${year})` : 'Surgery (from journal)'
  }

  for (const rule of SPECIALTY_RULES) {
    if (rule.pattern.test(text)) {
      const match = text.match(rule.pattern)
      if (match) {
        const word = match[0]
        const label = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        return year ? `${label} (${year})` : label
      }
    }
  }

  const cleanTitle = title.trim()
  if (cleanTitle.length >= 4 && cleanTitle.length <= 80) {
    return cleanTitle
  }

  return year ? `Clinical visit (${year})` : 'Clinical visit (from journal)'
}

function extractClinicName(text: string): string | undefined {
  const atClinic = text.match(
    /\b(?:at|@)\s+([A-Z0-9][^.!?\n]{2,50}(?:Hospital|Clinic|Medical Center|Centre|Health System))\b/i
  )
  if (atClinic) return atClinic[1].trim()

  const named = text.match(
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4}\s+(?:Hospital|Clinic|Medical Center|Centre))\b/
  )
  if (named) return named[1].trim()

  if (/\bhospitalized\b|\bhospital\b/i.test(text)) return 'Hospital'
  if (/\b(emergency\s+room|ER)\b/i.test(text)) return 'Emergency department'

  return undefined
}

function extractAddress(text: string, clinicName?: string): string {
  const street = text.match(
    /\b(\d+\s+[A-Za-z0-9\s.,'-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln))\b/i
  )
  if (street) return street[1].trim().slice(0, 120)
  if (clinicName) return clinicName
  return DEFAULT_ADDRESS
}

function extractTimeFromText(text: string): string | undefined {
  const twelve = text.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i
  )
  if (twelve) {
    let hour = Number(twelve[1])
    const minute = twelve[2] ? Number(twelve[2]) : 0
    const meridiem = twelve[3].toLowerCase()
    if (meridiem === 'pm' && hour < 12) hour += 12
    if (meridiem === 'am' && hour === 12) hour = 0
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  const twentyFour = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/)
  if (twentyFour) {
    return `${twentyFour[1].padStart(2, '0')}:${twentyFour[2]}`
  }

  return undefined
}

export function eventDateToScheduledAt(
  eventDate: string,
  text?: string
): string {
  const time = text ? extractTimeFromText(text) : undefined
  const datePart = eventDate.includes('T')
    ? eventDate.slice(0, 10)
    : eventDate.slice(0, 10)
  const timePart = time ?? '12:00'
  const local = new Date(`${datePart}T${timePart}:00`)
  if (Number.isNaN(local.getTime())) {
    const fallback = parseISO(eventDate)
    return Number.isNaN(fallback.getTime())
      ? new Date().toISOString()
      : fallback.toISOString()
  }
  return local.toISOString()
}

export function isJournalSyncedAppointment(appt: DoctorAppointment): boolean {
  if (appt.source === 'journal' || appt.linkedJournalEntryId) return true
  return appt.notes?.startsWith(JOURNAL_NOTES_PREFIX) ?? false
}

const PROCEDURE_TAGS: [RegExp, string][] = [
  [/\barthroscop/i, 'arthroscopy'],
  [/\bsurger|\boperation\b/i, 'surgery'],
  [/\bthrombos/i, 'thrombosis'],
  [/\bnecrosis/i, 'necrosis'],
  [/\btransplant|bone\s+marrow/i, 'transplant'],
  [/\bmeniscectomy|\bmeniscus/i, 'meniscus'],
]

function extractProcedureTags(text: string): string[] {
  const tags: string[] = []
  for (const [pattern, tag] of PROCEDURE_TAGS) {
    if (pattern.test(text)) tags.push(tag)
  }
  return [...new Set(tags)].sort()
}

function extractBodySites(text: string): string[] {
  const lower = text.toLowerCase()
  const sites: string[] = []
  if (/\bankles?\b/i.test(lower)) {
    if (/\bleft/i.test(lower)) sites.push('left-ankle')
    else if (/\bright/i.test(lower)) sites.push('right-ankle')
    else sites.push('ankle')
  }
  if (/\bleft\s+knee/i.test(lower)) sites.push('left-knee')
  else if (/\bright\s+knee/i.test(lower)) sites.push('right-knee')
  else if (/\bknee/i.test(lower)) sites.push('knee')
  if (/\bvein/i.test(lower)) sites.push('vein')
  if (/\bleg/i.test(lower)) sites.push('leg')
  return [...new Set(sites)].sort()
}

/**
 * Identity for one real-world visit: year + procedure type + body site.
 * Merges duplicate journal imports that phrase the same surgery differently.
 */
export function procedureVisitFingerprint(
  text: string,
  specialty: string,
  dateFallback: string
): string {
  const yearMatch = text.match(/\b(19|20)\d{2}\b/)
  const year = yearMatch?.[0] ?? dateFallback.slice(0, 4)
  const tags = extractProcedureTags(text)
  const sites = extractBodySites(text)
  const proc =
    tags.length > 0
      ? tags.join('+')
      : specialty.toLowerCase().replace(/\s+/g, '-').slice(0, 32)
  const body = sites.length > 0 ? sites.join('+') : 'general'
  return `${year}|${proc}|${body}`
}

export function journalVisitFingerprintFromEntry(
  entry: HealthEntry,
  input: DoctorAppointmentInput
): string {
  return procedureVisitFingerprint(
    combinedEntryText(entry),
    input.specialty,
    entry.eventDate
  )
}

export function appointmentFingerprint(
  appt: Pick<DoctorAppointment, 'scheduledAt' | 'doctorName' | 'specialty' | 'notes'>
): string {
  const blob = [appt.doctorName, appt.notes ?? '', appt.specialty].join(' ')
  return procedureVisitFingerprint(blob, appt.specialty, appt.scheduledAt)
}

export interface JournalAppointmentContext {
  allEntries?: HealthEntry[]
}

function buildNotes(
  entry: HealthEntry,
  context: JournalAppointmentContext = {}
): string {
  const classification = getEntryClassificationLabel(entry)
  const parts = [
    JOURNAL_NOTES_PREFIX,
    `Classification: ${classification}.`,
  ]

  const entries = context.allEntries ?? []
  const weightLine = formatWeightBaselineLine(entries)
  if (weightLine) {
    parts.push(`Patient baseline: ${weightLine}`)
  }

  const specialist = suggestSpecialist(
    entry.conditionArea,
    combinedEntryText(entry)
  )
  if (specialist) {
    parts.push(
      `Suggested clinician: ${specialist.clinicianTitle} (${specialist.specialty}) — ${specialist.reason}.`
    )
  }

  parts.push(entry.title.trim())

  const body = journalBodyForExport(entry)
  if (journalDescriptionAddsDetail(entry.title, entry.description)) {
    const clipped = body.length > 400 ? `${body.slice(0, 397)}…` : body
    parts.push(clipped)
  }
  return parts.join('\n\n')
}

export function buildAppointmentFromJournalEntry(
  entry: HealthEntry,
  context: JournalAppointmentContext = {}
): DoctorAppointmentInput | null {
  if (!isJournalVisitEntry(entry)) return null

  const text = combinedEntryText(entry)
  const clinicName = extractClinicName(text)
  const doctorName = extractDoctorName(text, entry.title, entry.eventDate)
  const specialty = extractSpecialty(text, entry.conditionArea)

  return {
    scheduledAt: eventDateToScheduledAt(entry.eventDate, text),
    doctorName,
    clinicName,
    specialty,
    address: extractAddress(text, clinicName),
    notes: buildNotes(entry, context),
  }
}
