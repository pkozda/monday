import type {
  HealthEntryInput,
  HealthEntryAnalysis,
  HealthEntryType,
  HealthUrgency,
  TimelineEventType,
} from '@/models/types'

const EMERGENCY_PATTERNS = [
  /\bchest\s+pain\b/i,
  /\bcan'?t\s+breathe\b/i,
  /\bcannot\s+breathe\b/i,
  /\bdifficulty\s+breathing\b/i,
  /\bshortness\s+of\s+breath\b/i,
  /\bpassed\s+out\b/i,
  /\blost\s+consciousness\b/i,
  /\bunconscious\b/i,
  /\bstroke\b/i,
  /\bface\s+drooping\b/i,
  /\bslurred\s+speech\b/i,
  /\bsevere\s+bleeding\b/i,
  /\bsuicidal\b/i,
  /\b911\b/,
  /\bemergency\s+room\b/i,
  /\bgo\s+to\s+(the\s+)?er\b/i,
]

const URGENT_PATTERNS = [
  /\bsevere\b/i,
  /\bintense\b/i,
  /\bunbearable\b/i,
  /\bworsening\b/i,
  /\bmuch\s+worse\b/i,
  /\bgetting\s+worse\b/i,
  /\bspreading\b/i,
  /\bnumbness\b/i,
  /\btingling\b/i,
  /\bweakness\b/i,
  /\bswelling\b/i,
  /\bfever\b/i,
  /\binfection\b/i,
  /\bcan'?t\s+walk\b/i,
  /\bunable\s+to\s+walk\b/i,
  /\bcan'?t\s+move\b/i,
  /\bred\s+flag\b/i,
]

const WORSENING_PATTERNS = [
  /\bworse\b/i,
  /\bdeteriorat/i,
  /\bdeclin/i,
  /\bnot\s+improv/i,
  /\bno\s+improvement\b/i,
  /\bpersist/i,
  /\bchronic\b/i,
]

const ENTRY_TYPE_LABELS: Record<HealthEntryType, string> = {
  symptom: 'Symptom report',
  medication: 'Medication update',
  change: 'Condition change',
  doctor_visit: 'Doctor visit',
  imaging: 'Imaging / test',
  other: 'Health note',
}

function resolveUrgency(
  input: HealthEntryInput,
  combinedText: string
): HealthUrgency {
  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(combinedText)) return 'emergency'
  }

  if (input.severity !== undefined && input.severity >= 9) return 'urgent'

  for (const pattern of URGENT_PATTERNS) {
    if (pattern.test(combinedText)) return 'urgent'
  }

  if (input.severity !== undefined && input.severity >= 7) return 'urgent'
  if (input.severity !== undefined && input.severity >= 4) return 'monitor'

  for (const pattern of WORSENING_PATTERNS) {
    if (pattern.test(combinedText)) return 'monitor'
  }

  return 'routine'
}

function buildFlags(input: HealthEntryInput, combinedText: string): string[] {
  const flags: string[] = []

  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.test(combinedText)) flags.push('possible_emergency')
    break
  }

  for (const pattern of URGENT_PATTERNS) {
    if (pattern.test(combinedText)) {
      flags.push('needs_attention')
      break
    }
  }

  for (const pattern of WORSENING_PATTERNS) {
    if (pattern.test(combinedText)) {
      flags.push('worsening_or_persistent')
      break
    }
  }

  if (input.entryType === 'medication' && input.medications?.trim()) {
    flags.push('medication_started_or_changed')
  }

  if (input.entryType === 'doctor_visit') {
    flags.push('clinical_encounter')
  }

  if (input.severity !== undefined && input.severity >= 7) {
    flags.push('high_severity_reported')
  }

  return [...new Set(flags)]
}

function buildSummary(input: HealthEntryInput): string {
  const typeLabel = ENTRY_TYPE_LABELS[input.entryType]
  const area = input.conditionArea.trim()
  const parts = [
    `${typeLabel} for ${area} on ${input.eventDate}: ${input.title.trim()}.`,
    input.description.trim(),
  ]

  if (input.medications?.trim()) {
    parts.push(`Medications: ${input.medications.trim()}.`)
  }

  if (input.severity !== undefined) {
    parts.push(`Self-reported severity: ${input.severity}/10.`)
  }

  return parts.join(' ')
}

export function analyzeHealthEntry(input: HealthEntryInput): HealthEntryAnalysis {
  const combinedText = [
    input.title,
    input.description,
    input.medications ?? '',
    input.conditionArea,
  ].join(' ')

  const flags = buildFlags(input, combinedText)
  const urgency = resolveUrgency(input, combinedText)

  let summary = buildSummary(input)

  if (urgency === 'emergency') {
    summary += ' Consider seeking emergency care immediately.'
  } else if (urgency === 'urgent') {
    summary += ' Consider contacting a clinician soon.'
  } else if (urgency === 'monitor') {
    summary += ' Continue monitoring; follow up if symptoms persist or worsen.'
  }

  return { urgency, flags, summary }
}

export function entryTypeToTimelineType(
  entryType: HealthEntryType
): TimelineEventType {
  switch (entryType) {
    case 'medication':
      return 'treatment'
    case 'doctor_visit':
      return 'diagnosis'
    case 'imaging':
      return 'imaging'
    case 'symptom':
    case 'change':
    default:
      return 'symptom'
  }
}

export function buildTimelineTitle(
  conditionArea: string,
  entryType: HealthEntryType,
  title: string
): string {
  const prefix = ENTRY_TYPE_LABELS[entryType]
  return `${prefix}: ${title} (${conditionArea})`
}

export function buildTimelineDescription(
  description: string,
  medications?: string,
  analysisSummary?: string
): string {
  const parts = [description.trim()]
  if (medications?.trim()) {
    parts.push(`Medications: ${medications.trim()}`)
  }
  if (analysisSummary) {
    parts.push(`Clinical note: ${analysisSummary}`)
  }
  return parts.join('\n\n')
}
