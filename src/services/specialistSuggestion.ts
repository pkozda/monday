/** Map tracked body areas / journal text to a sensible clinician type (not a diagnosis). */

export interface SpecialistSuggestion {
  specialty: string
  clinicianTitle: string
  reason: string
}

interface SpecialtyRule {
  pattern: RegExp
  specialty: string
  clinicianTitle: string
  reason: string
}

const AREA_RULES: SpecialtyRule[] = [
  {
    pattern: /\b(knee|колен|колено)\b/i,
    specialty: 'Orthopedics',
    clinicianTitle: 'Orthopedist',
    reason: 'joint and knee symptoms',
  },
  {
    pattern:
      /\b(ankle|hip|shoulder|elbow|wrist|foot|feet|leg|legs|arm|arms|joint|joints|спина|позвоночник)\b/i,
    specialty: 'Orthopedics',
    clinicianTitle: 'Orthopedist',
    reason: 'bones, joints, or limb symptoms',
  },
  {
    pattern: /\b(lower\s+back|upper\s+back|lumbar|thoracic|spine|back|neck|шея|спина)\b/i,
    specialty: 'Orthopedics',
    clinicianTitle: 'Orthopedist or spine specialist',
    reason: 'back or spine-related symptoms',
  },
  {
    pattern: /\b(skin|rash|dermat|кожа|сыпь)\b/i,
    specialty: 'Dermatology',
    clinicianTitle: 'Dermatologist',
    reason: 'skin symptoms',
  },
  {
    pattern: /\b(chest|heart|cardiac|cardio|грудь|сердце)\b/i,
    specialty: 'Cardiology',
    clinicianTitle: 'Cardiologist',
    reason: 'chest or heart-related symptoms',
  },
  {
    pattern:
      /\b(stomach|belly|abdomen|gut|bowel|colon|digest|желудок|живот|кишечник)\b/i,
    specialty: 'Gastroenterology',
    clinicianTitle: 'Gastroenterologist',
    reason: 'digestive or abdominal symptoms',
  },
  {
    pattern: /\b(head|headache|migraine|neurolog|numbness|tingling|голов)\b/i,
    specialty: 'Neurology',
    clinicianTitle: 'Neurologist',
    reason: 'headache or neurologic symptoms',
  },
  {
    pattern: /\b(diabetes|thyroid|endocrine|metabolic|вес|weight|glucose)\b/i,
    specialty: 'Endocrinology',
    clinicianTitle: 'Endocrinologist',
    reason: 'metabolic or weight-related concerns',
  },
  {
    pattern: /\b(asthma|lung|pulmon|breath|sob|лёгк|дыхани)\b/i,
    specialty: 'Pulmonology',
    clinicianTitle: 'Pulmonologist',
    reason: 'breathing or lung symptoms',
  },
  {
    pattern: /\b(kidney|renal|bladder|urolog|почк|мочев)\b/i,
    specialty: 'Urology',
    clinicianTitle: 'Urologist',
    reason: 'urinary or kidney-related symptoms',
  },
  {
    pattern: /\b(gynec|ob-?gyn|pregnancy|menstrual|матк|гинекол)\b/i,
    specialty: 'Gynecology',
    clinicianTitle: 'Gynecologist',
    reason: "women's health or pelvic symptoms",
  },
  {
    pattern: /\b(eye|vision|ophthalm|глаз)\b/i,
    specialty: 'Ophthalmology',
    clinicianTitle: 'Ophthalmologist',
    reason: 'eye or vision symptoms',
  },
  {
    pattern: /\b(ear|hearing|ent|ухо)\b/i,
    specialty: 'ENT',
    clinicianTitle: 'ENT specialist',
    reason: 'ear, nose, or throat symptoms',
  },
  {
    pattern: /\b(psych|anxiety|depression|sleep\s+and\s+mood)\b/i,
    specialty: 'Psychiatry',
    clinicianTitle: 'Psychiatrist or mental health clinician',
    reason: 'mental health concerns',
  },
  {
    pattern: /\b(rheumat|autoimmune|arthritis)\b/i,
    specialty: 'Rheumatology',
    clinicianTitle: 'Rheumatologist',
    reason: 'inflammatory or autoimmune joint disease',
  },
]

const TEXT_RULES: SpecialtyRule[] = [
  {
    pattern: /\barthroscop|\bfracture\b|\bmeniscus\b|\bligament\b/i,
    specialty: 'Orthopedics',
    clinicianTitle: 'Orthopedist',
    reason: 'musculoskeletal procedure or injury in your journal',
  },
  {
    pattern: /\bmri\b.*\b(spine|lumbar|knee|joint)\b/i,
    specialty: 'Orthopedics',
    clinicianTitle: 'Orthopedist',
    reason: 'musculoskeletal imaging',
  },
]

function matchRules(
  rules: SpecialtyRule[],
  haystack: string
): SpecialistSuggestion | null {
  for (const rule of rules) {
    if (!rule.pattern.test(haystack)) continue
    return {
      specialty: rule.specialty,
      clinicianTitle: rule.clinicianTitle,
      reason: rule.reason,
    }
  }
  return null
}

function normalizeConditionArea(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (
    value &&
    typeof value === 'object' &&
    'name' in value &&
    typeof (value as { name: unknown }).name === 'string'
  ) {
    return (value as { name: string }).name.trim()
  }
  return String(value ?? '').trim()
}

export function suggestSpecialist(
  conditionArea: string | { name: string },
  journalContext = ''
): SpecialistSuggestion | null {
  const area = normalizeConditionArea(conditionArea)
  const haystack = `${area} ${journalContext}`.trim()
  if (!haystack) return null

  return (
    matchRules(AREA_RULES, haystack) ??
    matchRules(TEXT_RULES, haystack) ??
    (area.length >= 3 && !/^(general|overall)\s+health$/i.test(area)
      ? {
          specialty: 'Primary care',
          clinicianTitle: 'Primary care physician',
          reason: `ongoing concerns tracked for ${area}`,
        }
      : null)
  )
}

export function formatSpecialistVisitAdvice(
  suggestion: SpecialistSuggestion,
  conditionArea: string | { name: string }
): string {
  const area = normalizeConditionArea(conditionArea)
  const areaPhrase = area ? ` for ${area}` : ''
  return `Consider seeing a ${suggestion.clinicianTitle} (${suggestion.specialty})${areaPhrase} — ${suggestion.reason}. This is a routing suggestion only, not a diagnosis.`
}

export function formatSpecialistBullet(suggestion: SpecialistSuggestion): string {
  return `Consider a visit with a ${suggestion.clinicianTitle} (${suggestion.specialty}): ${suggestion.reason}.`
}
