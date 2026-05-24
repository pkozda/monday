import type {
  HealthEntryInput,
  HealthEntryAnalysis,
  HealthEntryType,
  HealthUrgency,
  TimelineEventType,
} from '@/models/types'
import { WEIGHT_LOSS_EXPLICIT } from '@/services/weightClinicalSignals'

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
  /\b911\b/i,
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

const PROCEDURE_PATTERNS = [
  /\bsurger(y|ies|ical)\b/i,
  /\boperation\b/i,
  /\boperated\b/i,
  /\bunderwent\b/i,
  /\bpost-?op(erative)?\b/i,
  /\bpre-?op\b/i,
  /\banesthesia\b/i,
  /\banaesthesia\b/i,
  /\bappendectomy\b/i,
  /\bhip\s+replacement\b/i,
  /\bknee\s+replacement\b/i,
  /\btransplant\b/i,
  /\bbiopsy\b/i,
  /\bendoscopy\b/i,
  /\bcolonoscopy\b/i,
  /\barthroscop/i,
  /\blaparoscop/i,
  /\bstent\b/i,
  /\bimplant\b/i,
]

const HOSPITAL_CARE_PATTERNS = [
  /\bhospitalized\b/i,
  /\bhospitalization\b/i,
  /\badmitted\s+(to\s+)?(the\s+)?hospital\b/i,
  /\binpatient\b/i,
  /\bicu\b/i,
  /\bdischarged\s+from\b/i,
  /\ber\s+visit\b/i,
  /\bemergency\s+department\b/i,
]

const IMPROVEMENT_PATTERNS =
  /\b(improv|better|easier|reduced|less|easing|recover|progress|healing|resolved)\w*/i

const DIAGNOSIS_PATTERNS =
  /\b(diagnosed|diagnosis|confirmed|found\s+to\s+have|tested\s+positive)\b/i

const LAB_TEST_PATTERNS = [
  /\b(blood\s+test|blood\s+work|blood\s+panel|lab\s+results?)\b/i,
  /\b(cbc|cmp|bmp|lipid\s+panel|metabolic\s+panel)\b/i,
  /\b(hemoglobin|hematocrit|platelet|glucose\s+level|a1c|hba1c)\b/i,
  /\b(urinalysis|urine\s+test|thyroid\s+panel|tsh|psa)\b/i,
  /\b(анализ\s+крови|биохимия|общий\s+анализ)\b/i,
  /\b(cholesterol|triglyceride|creatinine|bun|alt|ast|bilirubin)\b/i,
]

const IMAGING_PATTERNS = [
  /\bmri\b/i,
  /\b(ct\s+scan|cat\s+scan|computed\s+tomography)\b/i,
  /\b(x-?ray|radiograph)\b/i,
  /\b(ultrasound|sonograph|echocardiogram)\b/i,
  /\b(pet\s+scan|pet-?ct)\b/i,
  /\b(mammogram|arthroscop)\b/i,
  /\b(imaging|scan\s+showed|scan\s+revealed|imaging\s+showed)\b/i,
  /\b(biopsy\s+results?|pathology\s+report)\b/i,
  /\b(fluoroscopy|dexa|bone\s+density)\b/i,
]

const MEDICATION_CONTEXT_PATTERNS = [
  /\b(prescribed|prescription|medication|medicine)\b/i,
  /\b(started\s+taking|taking\s+\w+|switched\s+to)\b/i,
  /\b(mg\b|mcg\b|tablet|capsule|injection|infusion|dose)\b/i,
  /\b(ibuprofen|aspirin|antibiotic|pregabalin|gabapentin|opioid)\b/i,
]

const CLINICAL_VISIT_PATTERNS = [
  /\b(doctor|physician|specialist|neurologist|orthopedist|surgeon)\b/i,
  /\b(clinic|hospital|appointment|consult|referred|follow-?up\s+visit)\b/i,
  /\b(er\s+visit|emergency\s+department)\b/i,
]

const ENTRY_TYPE_LABELS: Record<HealthEntryType, string> = {
  symptom: 'Symptom report',
  medication: 'Medication update',
  change: 'Condition change',
  doctor_visit: 'Doctor visit',
  imaging: 'Imaging study',
  lab_test: 'Lab results',
  surgery: 'Surgery / procedure',
  other: 'Health note',
}

function isLabTest(text: string): boolean {
  return LAB_TEST_PATTERNS.some((p) => p.test(text))
}

interface ClassificationResult {
  urgency: HealthUrgency
  label: string
}

function hasEmergencySignal(text: string): boolean {
  return EMERGENCY_PATTERNS.some((p) => p.test(text))
}

function hasUrgentSignal(text: string, severity?: number): boolean {
  if (severity !== undefined && severity >= 9) return true
  if (URGENT_PATTERNS.some((p) => p.test(text))) return true
  if (severity !== undefined && severity >= 7) return true
  return false
}

function hasWorseningSignal(text: string): boolean {
  return WORSENING_PATTERNS.some((p) => p.test(text))
}

export function isProcedureOrSurgery(text: string): boolean {
  return PROCEDURE_PATTERNS.some((p) => p.test(text))
}

export function isHospitalCare(text: string): boolean {
  return HOSPITAL_CARE_PATTERNS.some((p) => p.test(text))
}

function isImagingStudy(text: string): boolean {
  return IMAGING_PATTERNS.some((p) => p.test(text))
}

function isMedicationContext(text: string): boolean {
  return MEDICATION_CONTEXT_PATTERNS.some((p) => p.test(text))
}

export function isClinicalVisit(text: string): boolean {
  return CLINICAL_VISIT_PATTERNS.some((p) => p.test(text))
}

/** Infer record type from free text (used on save and when reclassifying imports). */
export function inferEntryTypeFromText(text: string): HealthEntryType {
  const lower = text.toLowerCase()

  if (isLabTest(lower)) return 'lab_test'

  if (isProcedureOrSurgery(lower)) return 'surgery'

  if (isImagingStudy(lower)) return 'imaging'

  if (isHospitalCare(lower)) return 'doctor_visit'

  if (isClinicalVisit(lower) || DIAGNOSIS_PATTERNS.test(lower)) {
    return 'doctor_visit'
  }

  if (isMedicationContext(lower)) return 'medication'

  if (WEIGHT_LOSS_EXPLICIT.test(lower)) {
    return 'symptom'
  }

  if (
    /\b(weight|weigh|weighed|body\s+weight|вес|масса\s+тела)\b/i.test(lower) &&
    /\b\d{2,3}\s*(?:[–—-]\s*\d{2,3}\s*)?(?:kg|кг)\b/i.test(lower)
  ) {
    return 'change'
  }

  if (
    /\b(improved|improving|better|worse|worsening|flare|relapse|recovered|deteriorat|declin)\b/i.test(
      lower
    )
  ) {
    return 'change'
  }

  return 'symptom'
}

export function combinedEntryText(input: {
  title: string
  description: string
  medications?: string
  conditionArea?: string
}): string {
  return [
    input.title,
    input.description,
    input.medications ?? '',
    input.conditionArea ?? '',
  ].join(' ')
}

/** Prefer specific types inferred from note text over generic symptom/other. */
export function resolveEntryType(
  entryType: HealthEntryType,
  combinedText: string
): HealthEntryType {
  const inferred = inferEntryTypeFromText(combinedText)
  if (entryType === 'symptom' || entryType === 'other') {
    if (inferred !== 'symptom' && inferred !== 'other') return inferred
  }
  return entryType
}

function classifyHealthEntry(
  input: HealthEntryInput,
  combinedText: string
): ClassificationResult {
  if (hasEmergencySignal(combinedText)) {
    return { urgency: 'emergency', label: 'Emergency — seek care now' }
  }

  if (hasUrgentSignal(combinedText, input.severity)) {
    if (isProcedureOrSurgery(combinedText) && hasWorseningSignal(combinedText)) {
      return { urgency: 'urgent', label: 'Post-procedure concern' }
    }
    return { urgency: 'urgent', label: 'Urgent — contact clinician' }
  }

  if (input.entryType === 'surgery' || isProcedureOrSurgery(combinedText)) {
    return { urgency: 'monitor', label: 'Surgery / procedure' }
  }

  if (isHospitalCare(combinedText)) {
    return { urgency: 'monitor', label: 'Hospital / ER care' }
  }

  if (input.entryType === 'lab_test' || isLabTest(combinedText)) {
    return { urgency: 'monitor', label: 'Lab results' }
  }

  if (isImagingStudy(combinedText) || input.entryType === 'imaging') {
    return { urgency: 'monitor', label: 'Test or imaging' }
  }

  if (
    isMedicationContext(combinedText) ||
    input.entryType === 'medication' ||
    Boolean(input.medications?.trim())
  ) {
    return { urgency: 'monitor', label: 'Medication update' }
  }

  if (input.entryType === 'doctor_visit' || isClinicalVisit(combinedText)) {
    if (DIAGNOSIS_PATTERNS.test(combinedText)) {
      return { urgency: 'monitor', label: 'Diagnosis / specialist visit' }
    }
    return { urgency: 'monitor', label: 'Clinical visit' }
  }

  if (WEIGHT_LOSS_EXPLICIT.test(combinedText)) {
    return { urgency: 'monitor', label: 'Weight loss (symptom)' }
  }

  if (
    /\b(weight|вес)\b/i.test(combinedText) &&
    /\b\d{2,3}\s*(?:[–—-]\s*\d{2,3}\s*)?(?:kg|кг)\b/i.test(combinedText)
  ) {
    return { urgency: 'routine', label: 'Weight / body composition' }
  }

  if (input.entryType === 'change') {
    if (IMPROVEMENT_PATTERNS.test(combinedText)) {
      return { urgency: 'routine', label: 'Condition improving' }
    }
    if (hasWorseningSignal(combinedText)) {
      return { urgency: 'monitor', label: 'Condition worsening' }
    }
    return { urgency: 'monitor', label: 'Condition change' }
  }

  if (input.severity !== undefined && input.severity >= 4) {
    return { urgency: 'monitor', label: 'Symptoms — follow up' }
  }

  if (hasWorseningSignal(combinedText)) {
    return { urgency: 'monitor', label: 'Persistent or worsening symptoms' }
  }

  if (/\b(chronic|long-?standing|for\s+years|ongoing)\b/i.test(combinedText)) {
    return { urgency: 'routine', label: 'Ongoing / chronic condition' }
  }

  if (input.entryType === 'symptom') {
    return { urgency: 'routine', label: 'Symptom log' }
  }

  return { urgency: 'routine', label: 'Health record' }
}

/** Display label — always derived from text so MRI/surgery/etc. are not stuck as symptoms. */
export function getEntryClassificationLabel(entry: {
  eventDate: string
  conditionArea: string
  entryType: HealthEntryType
  title: string
  description: string
  medications?: string
  severity?: number
  analysis: HealthEntryAnalysis
}): string {
  const combinedText = combinedEntryText({
    title: entry.title,
    description: entry.description,
    medications: entry.medications,
    conditionArea: entry.conditionArea,
  })
  const input: HealthEntryInput = {
    eventDate: entry.eventDate,
    conditionArea: entry.conditionArea,
    entryType: resolveEntryType(entry.entryType, combinedText),
    title: entry.title,
    description: entry.description,
    medications: entry.medications,
    severity: entry.severity,
  }
  return classifyHealthEntry(input, combinedText).label
}

function buildFlags(
  input: HealthEntryInput,
  combinedText: string,
  classification: ClassificationResult
): string[] {
  const flags: string[] = []

  if (classification.urgency === 'emergency') {
    flags.push('possible_emergency')
  }

  if (classification.urgency === 'urgent') {
    flags.push('needs_attention')
  }

  if (isProcedureOrSurgery(combinedText)) {
    flags.push('procedure_or_surgery')
  }

  if (isHospitalCare(combinedText)) {
    flags.push('hospital_care')
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

  if (input.entryType === 'surgery') {
    flags.push('procedure_or_surgery')
  }

  if (input.entryType === 'lab_test') {
    flags.push('lab_results')
  }

  if (input.severity !== undefined && input.severity >= 7) {
    flags.push('high_severity_reported')
  }

  return [...new Set(flags)]
}

function buildSummary(
  input: HealthEntryInput,
  classification: ClassificationResult
): string {
  const typeLabel = ENTRY_TYPE_LABELS[input.entryType]
  const area = input.conditionArea.trim()
  const areaPhrase =
    area && !/^general\s+health$/i.test(area) ? ` for ${area}` : ''
  const parts = [
    `${typeLabel}${areaPhrase} on ${input.eventDate}: ${input.title.trim()}.`,
    `Classification: ${classification.label}.`,
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
  const combinedText = combinedEntryText(input)
  const resolvedType = resolveEntryType(input.entryType, combinedText)
  const resolvedInput = { ...input, entryType: resolvedType }

  const classification = classifyHealthEntry(resolvedInput, combinedText)
  const flags = buildFlags(resolvedInput, combinedText, classification)

  let summary = buildSummary(resolvedInput, classification)

  if (classification.urgency === 'emergency') {
    summary += ' Consider seeking emergency care immediately.'
  } else if (classification.urgency === 'urgent') {
    summary += ' Consider contacting a clinician soon.'
  } else if (classification.urgency === 'monitor') {
    summary += ' Continue monitoring and follow your care plan.'
  }

  return {
    urgency: classification.urgency,
    classification: classification.label,
    flags,
    summary,
  }
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
    case 'lab_test':
      return 'imaging'
    case 'surgery':
      return 'diagnosis'
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
