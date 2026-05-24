import { suggestSpecialist } from '@/services/specialistSuggestion'
import type {
  ConditionSummary,
  DoctorAppointment,
  HealthEntry,
} from '@/models/types'

export type DoctorSpecialtyId =
  | 'primary_care'
  | 'orthopedics'
  | 'dermatology'
  | 'cardiology'
  | 'gastroenterology'
  | 'neurology'
  | 'endocrinology'
  | 'pulmonology'
  | 'urology'
  | 'gynecology'
  | 'ophthalmology'
  | 'ent'
  | 'psychiatry'
  | 'rheumatology'

export const DOCTOR_SPECIALTY_IDS: DoctorSpecialtyId[] = [
  'primary_care',
  'orthopedics',
  'dermatology',
  'cardiology',
  'gastroenterology',
  'neurology',
  'endocrinology',
  'pulmonology',
  'urology',
  'gynecology',
  'ophthalmology',
  'ent',
  'psychiatry',
  'rheumatology',
]

const SPECIALTY_NAME_TO_ID: Record<string, DoctorSpecialtyId> = {
  'primary care': 'primary_care',
  orthopedics: 'orthopedics',
  dermatology: 'dermatology',
  cardiology: 'cardiology',
  gastroenterology: 'gastroenterology',
  neurology: 'neurology',
  endocrinology: 'endocrinology',
  pulmonology: 'pulmonology',
  urology: 'urology',
  gynecology: 'gynecology',
  ophthalmology: 'ophthalmology',
  ent: 'ent',
  psychiatry: 'psychiatry',
  rheumatology: 'rheumatology',
}

/** LLM instructions per specialty (English; output language set separately). */
const SPECIALTY_LLM_FOCUS: Record<DoctorSpecialtyId, string> = {
  primary_care:
    'Emphasize overall health trajectory, medications, preventive care, care coordination, and which specialist referrals may be needed.',
  orthopedics:
    'Emphasize musculoskeletal symptoms, pain location, functional limits, imaging/procedures, physical therapy, and joint or spine timeline.',
  dermatology:
    'Emphasize skin lesions, rashes, distribution, triggers, topical/systemic treatments tried, and progression with photos or descriptions if logged.',
  cardiology:
    'Emphasize chest symptoms, palpitations, blood pressure context, exertional limits, cardiac meds, and cardiovascular risk factors.',
  gastroenterology:
    'Emphasize abdominal/GI symptoms, bowel habits, diet triggers, reflux, nausea, and digestive medication trials.',
  neurology:
    'Emphasize headaches, numbness, weakness, dizziness, seizure-like events, cognitive symptoms, and neurologic exam concerns to request.',
  endocrinology:
    'Emphasize weight changes, glucose/thyroid context, metabolic labs mentioned, hormone-related symptoms, and endocrine medications.',
  pulmonology:
    'Emphasize cough, shortness of breath, wheeze, sleep/breathing, inhalers, and respiratory infection patterns.',
  urology:
    'Emphasize urinary symptoms, flank pain, infections, continence, and urologic procedures or meds.',
  gynecology:
    "Emphasize pelvic symptoms, menstrual cycle, pregnancy context if logged, and women's health screening gaps.",
  ophthalmology:
    'Emphasize vision changes, eye pain, redness, discharge, and ocular treatments tried.',
  ent:
    'Emphasize ear/hearing, sinus, throat, voice, and allergy or infection patterns.',
  psychiatry:
    'Emphasize mood, anxiety, sleep, stressors, functional impact, and mental health treatments — use supportive, non-stigmatizing language.',
  rheumatology:
    'Emphasize inflammatory joint patterns, morning stiffness, autoimmune context, and response to NSAIDs or DMARDs if mentioned.',
}

const SPECIALTY_ENTRY_PATTERNS: Record<DoctorSpecialtyId, RegExp | null> = {
  primary_care: null,
  orthopedics:
    /\b(knee|ankle|hip|shoulder|elbow|wrist|foot|feet|leg|arm|joint|joints|back|spine|neck|lumbar|orthop|fracture|meniscus|ligament|артро|колен|спина|сустав)\b/i,
  dermatology: /\b(skin|rash|dermat|itch|eczema|psoriasis|кожа|сыпь)\b/i,
  cardiology: /\b(chest|heart|cardiac|palpitat|pressure|груд|сердц)\b/i,
  gastroenterology:
    /\b(stomach|abdomen|gut|bowel|colon|digest|reflux|nausea|живот|желудок|кишечник)\b/i,
  neurology:
    /\b(headache|migraine|neurolog|numbness|tingling|dizz|seizure|голов)\b/i,
  endocrinology:
    /\b(diabetes|thyroid|endocrine|metabolic|glucose|hormon|вес|weight)\b/i,
  pulmonology: /\b(asthma|lung|pulmon|breath|cough|wheeze|лёгк|дыхани)\b/i,
  urology: /\b(kidney|renal|bladder|urolog|urin|почк|мочев)\b/i,
  gynecology: /\b(gynec|ob-?gyn|pregnancy|menstrual|pelvic|матк|гинекол)\b/i,
  ophthalmology: /\b(eye|vision|ophthalm|глаз)\b/i,
  ent: /\b(ear|hearing|ent|sinus|throat|tonsil|ухо|горл|нос)\b/i,
  psychiatry:
    /\b(psych|anxiety|depression|mood|panic|stress|sleep\s+and\s+mood|тревог|депресс)\b/i,
  rheumatology: /\b(rheumat|autoimmune|arthritis|stiffness)\b/i,
}

const CLINICIAN_HINT_TO_ID: Record<string, DoctorSpecialtyId> = {
  orthopedist: 'orthopedics',
  dermatologist: 'dermatology',
  cardiologist: 'cardiology',
  gastroenterologist: 'gastroenterology',
  neurologist: 'neurology',
  endocrinologist: 'endocrinology',
  pulmonologist: 'pulmonology',
  urologist: 'urology',
  gynecologist: 'gynecology',
  ophthalmologist: 'ophthalmology',
  rheumatologist: 'rheumatology',
  psychiatrist: 'psychiatry',
  'primary care physician': 'primary_care',
  'family doctor': 'primary_care',
  'ent specialist': 'ent',
}

export function specialtyIdFromName(name: string): DoctorSpecialtyId | null {
  const key = name.trim().toLowerCase()
  if (SPECIALTY_NAME_TO_ID[key]) return SPECIALTY_NAME_TO_ID[key]
  for (const [hint, id] of Object.entries(CLINICIAN_HINT_TO_ID)) {
    if (key.includes(hint)) return id
  }
  return null
}

export function getSpecialtyLlmFocus(id: DoctorSpecialtyId): string {
  return SPECIALTY_LLM_FOCUS[id]
}

export function filterEntriesForSpecialty(
  entries: HealthEntry[],
  specialtyId: DoctorSpecialtyId
): HealthEntry[] {
  const pattern = SPECIALTY_ENTRY_PATTERNS[specialtyId]
  if (!pattern) return entries

  const matched = entries.filter((e) =>
    pattern.test(
      `${e.conditionArea} ${e.title} ${e.description} ${e.medications ?? ''}`
    )
  )
  return matched.length > 0 ? matched : entries
}

export function inferDoctorSpecialtyFromAppointment(
  appointment: DoctorAppointment,
  entries: HealthEntry[],
  conditions: ConditionSummary[] = []
): DoctorSpecialtyId {
  const fromField = specialtyIdFromName(appointment.specialty)
  if (fromField) return fromField

  const context = `${appointment.specialty} ${appointment.doctorName} ${appointment.notes ?? ''}`
  const suggestion = suggestSpecialist(appointment.specialty, context)
  if (suggestion) {
    const id = specialtyIdFromName(suggestion.specialty)
    if (id) return id
  }

  return inferDefaultDoctorSpecialty(entries, conditions)
}

export function inferDefaultDoctorSpecialty(
  entries: HealthEntry[],
  conditions: ConditionSummary[] = []
): DoctorSpecialtyId {
  const journalContext = entries
    .map((e) => `${e.conditionArea} ${e.title} ${e.description}`)
    .join('\n')
  const topArea = conditions[0]?.name ?? entries[0]?.conditionArea ?? ''
  const suggestion = suggestSpecialist(topArea, journalContext)
  if (suggestion) {
    const id = specialtyIdFromName(suggestion.specialty)
    if (id) return id
  }
  return 'primary_care'
}
