import { MEDICAL_DISEASE_CATALOG } from '@/data/medicalDiseaseCatalog'

export interface DiseaseEducation {
  diseaseId: string
  /** Plain-language description (not medical advice). */
  overview: string
  /** Typical symptoms or features clinicians look for. */
  commonSymptoms: string[]
  /** When to seek care — red flags or routine follow-up. */
  whenToSeekCare: string
}

const EDUCATION: DiseaseEducation[] = [
  {
    diseaseId: 'migraine',
    overview:
      'Migraine is a recurring neurological condition that often causes moderate to severe headache, sometimes with nausea, sensitivity to light or sound, and visual changes (aura) before pain starts. Episodes can last hours to days.',
    commonSymptoms: [
      'Throbbing or pulsing headache, often on one side',
      'Nausea or vomiting',
      'Sensitivity to light (photophobia) or sound',
      'Visual aura (zigzag lines, blind spots) before headache',
      'Worse with routine activity',
    ],
    whenToSeekCare:
      'Seek emergency care for sudden “worst headache of life,” fever with stiff neck, confusion, weakness, or headache after head injury. See a clinician if headaches are new, frequent, or changing.',
  },
  {
    diseaseId: 'lumbar_disc_herniation',
    overview:
      'A lumbar disc herniation (“slipped disc”) occurs when cushioning material between vertebrae in the lower back presses on nearby nerves. It often causes back pain with leg pain, numbness, or weakness along the sciatic nerve.',
    commonSymptoms: [
      'Low back pain',
      'Leg pain shooting below the knee (sciatica)',
      'Numbness, tingling, or weakness in leg or foot',
      'Pain worse when bending, coughing, or sitting',
      'Relief when lying down in some positions',
    ],
    whenToSeekCare:
      'Emergency care if you lose bladder/bowel control, have saddle numbness, or sudden severe bilateral leg weakness (possible cauda equina). Otherwise see a clinician for persistent sciatica or weakness.',
  },
  {
    diseaseId: 'type2_diabetes',
    overview:
      'Type 2 diabetes is a condition where the body has difficulty using insulin effectively, leading to elevated blood sugar over time. It develops gradually and is often linked to weight, activity, and family history.',
    commonSymptoms: [
      'Increased thirst and urination',
      'Fatigue',
      'Blurred vision',
      'Slow-healing cuts or infections',
      'Sometimes no symptoms early on',
    ],
    whenToSeekCare:
      'Seek care if you have very high thirst, vomiting, confusion, or fruity breath (possible high blood sugar emergency). Routine screening and A1c testing help catch it early.',
  },
  {
    diseaseId: 'asthma',
    overview:
      'Asthma is a chronic lung condition where airways become inflamed and narrow, causing wheezing, cough, and shortness of breath. Symptoms often flare with triggers such as cold air, exercise, or allergens.',
    commonSymptoms: [
      'Wheezing or whistling when breathing',
      'Shortness of breath',
      'Chest tightness',
      'Cough, especially at night or with exercise',
      'Symptoms that improve with inhalers',
    ],
    whenToSeekCare:
      'Emergency care if lips turn blue, you cannot speak in full sentences, or rescue inhaler does not help. See a clinician for frequent night symptoms or declining peak flow.',
  },
  {
    diseaseId: 'gerd',
    overview:
      'Gastroesophageal reflux disease (GERD) is chronic acid reflux from the stomach into the esophagus. It causes heartburn and sometimes chest discomfort, cough, or sour taste, often worse after meals or lying down.',
    commonSymptoms: [
      'Heartburn (burning behind breastbone)',
      'Regurgitation of acid or food',
      'Chest discomfort after eating',
      'Chronic cough or hoarse voice',
      'Symptoms worse when lying flat',
    ],
    whenToSeekCare:
      'Seek urgent care for severe chest pain, trouble swallowing, vomiting blood, or black stools. See a clinician if symptoms persist despite lifestyle changes.',
  },
  {
    diseaseId: 'rheumatoid_arthritis',
    overview:
      'Rheumatoid arthritis (RA) is an autoimmune disease that causes joint inflammation, often symmetrically (both hands, both wrists). Morning stiffness lasting more than an hour is typical.',
    commonSymptoms: [
      'Joint pain and swelling in multiple joints',
      'Morning stiffness lasting over an hour',
      'Fatigue',
      'Symmetrical involvement (both sides)',
      'Gradual joint damage if untreated',
    ],
    whenToSeekCare:
      'See a rheumatologist for persistent swollen joints. Seek urgent care for sudden hot swollen joint with fever (possible infection).',
  },
  {
    diseaseId: 'appendicitis',
    overview:
      'Appendicitis is inflammation of the appendix, usually causing abdominal pain that often starts near the belly button and moves to the lower right. It typically needs prompt surgical evaluation.',
    commonSymptoms: [
      'Abdominal pain, often starting centrally then right lower side',
      'Loss of appetite',
      'Nausea or vomiting',
      'Low-grade fever',
      'Pain worse with movement or coughing',
    ],
    whenToSeekCare:
      'Emergency care if you have worsening right lower abdominal pain, fever, and cannot keep food down—do not wait.',
  },
  {
    diseaseId: 'angina',
    overview:
      'Angina is chest pain or pressure caused by reduced blood flow to the heart muscle, often during exertion or stress. It can be a warning sign of underlying coronary artery disease.',
    commonSymptoms: [
      'Chest pressure, squeezing, or heaviness',
      'Pain may spread to arm, jaw, or back',
      'Shortness of breath with exertion',
      'Symptoms triggered by activity, relieved by rest',
      'Nausea or sweating with episodes',
    ],
    whenToSeekCare:
      'Call emergency services for chest pain lasting more than a few minutes, pain at rest, or pain with sweating and nausea—treat as possible heart attack until evaluated.',
  },
  {
    diseaseId: 'osteoarthritis',
    overview:
      'Osteoarthritis is “wear-and-tear” joint disease where cartilage breaks down over time. It causes joint pain and stiffness, often in knees, hips, hands, or spine, worse after activity.',
    commonSymptoms: [
      'Joint pain worse with use, better with rest',
      'Morning stiffness under 30 minutes',
      'Grinding or limited range of motion',
      'Swelling in some joints',
      'Gradual progression over months or years',
    ],
    whenToSeekCare:
      'See a clinician if pain limits daily life. Seek care for sudden very hot swollen joint (rule out infection or gout).',
  },
  {
    diseaseId: 'mechanical_low_back_pain',
    overview:
      'Mechanical low back pain is common muscle or ligament strain in the lower back without nerve compression. It often follows lifting, poor posture, or prolonged sitting and usually improves within weeks.',
    commonSymptoms: [
      'Localized low back ache',
      'Pain worse with bending or lifting',
      'Muscle spasm',
      'No leg numbness or weakness (typically)',
      'Improves with movement and time',
    ],
    whenToSeekCare:
      'Seek care if pain lasts beyond 6 weeks, radiates down leg, or you have numbness, weakness, or bowel/bladder changes.',
  },
  {
    diseaseId: 'ibs',
    overview:
      'Irritable bowel syndrome (IBS) is a functional gut disorder with abdominal pain related to bowel habits, bloating, and diarrhea and/or constipation without structural damage seen on routine tests.',
    commonSymptoms: [
      'Cramping abdominal pain relieved by bowel movement',
      'Bloating',
      'Diarrhea, constipation, or alternating',
      'Mucus in stool',
      'Symptoms linked to stress or certain foods',
    ],
    whenToSeekCare:
      'See a clinician for new bowel habit change after age 50, blood in stool, weight loss, or waking at night to stool—these need other causes ruled out.',
  },
  {
    diseaseId: 'hypertension',
    overview:
      'Hypertension (high blood pressure) means sustained elevated pressure in arteries. It often has no symptoms but raises risk for stroke, heart disease, and kidney problems over time.',
    commonSymptoms: [
      'Often no symptoms (“silent”)',
      'Sometimes headache (not reliable)',
      'Detected on blood pressure readings',
      'May coexist with kidney disease or diabetes',
    ],
    whenToSeekCare:
      'Emergency care for very high readings with chest pain, severe headache, or vision changes. Routine monitoring and treatment reduce long-term risk.',
  },
  {
    diseaseId: 'influenza',
    overview:
      'Influenza (flu) is a viral respiratory infection causing fever, body aches, cough, and fatigue. It spreads seasonally and can be serious in older adults or those with chronic conditions.',
    commonSymptoms: [
      'Sudden fever and chills',
      'Muscle and body aches',
      'Dry cough',
      'Fatigue and weakness',
      'Sore throat or headache',
    ],
    whenToSeekCare:
      'Seek care for difficulty breathing, chest pain, confusion, or dehydration. Antivirals work best if started early in high-risk people.',
  },
  {
    diseaseId: 'fibromyalgia',
    overview:
      'Fibromyalgia is a chronic condition with widespread pain, fatigue, sleep problems, and cognitive “fog.” Pain is often out of proportion to exam findings and may coexist with mood or sleep disorders.',
    commonSymptoms: [
      'Widespread aching pain for months',
      'Fatigue and unrefreshing sleep',
      'Tender points or generalized sensitivity',
      'Brain fog or poor concentration',
      'Headaches or irritable bowel symptoms',
    ],
    whenToSeekCare:
      'See a clinician to exclude other causes. Seek care if new focal weakness, fever, or weight loss appears (not typical of fibromyalgia alone).',
  },
  {
    diseaseId: 'uti',
    overview:
      'A urinary tract infection (UTI) is bacterial infection of the bladder or kidneys. Bladder infections cause burning with urination and urgency; kidney involvement adds fever and back pain.',
    commonSymptoms: [
      'Burning with urination',
      'Frequent or urgent need to urinate',
      'Cloudy or strong-smelling urine',
      'Lower abdominal discomfort',
      'Fever and flank pain if kidney involved',
    ],
    whenToSeekCare:
      'Seek urgent care for fever, back pain, vomiting, or blood in urine. Mild bladder symptoms still warrant testing and treatment.',
  },
]

const BY_ID = new Map(EDUCATION.map((e) => [e.diseaseId, e]))

const PLACEHOLDER_SYMPTOM_PATTERNS = [
  /^symptoms vary widely/i,
  /^see ["“]compared with your journal/i,
  /^your clinician can explain/i,
  /below for signs you have/i,
]

export function isPlaceholderEducationSymptom(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return true
  return PLACEHOLDER_SYMPTOM_PATTERNS.some((p) => p.test(trimmed))
}

export function filterEducationSymptoms(symptoms: string[]): string[] {
  return symptoms.filter((s) => !isPlaceholderEducationSymptom(s))
}

export function getDiseaseEducation(diseaseId: string): DiseaseEducation {
  const custom = BY_ID.get(diseaseId)
  if (custom) return custom

  const disease = MEDICAL_DISEASE_CATALOG.find((d) => d.id === diseaseId)
  const name = disease?.name ?? diseaseId.replace(/_/g, ' ')

  return {
    diseaseId,
    overview: `${name} is one possible condition that can match patterns in your health journal. Monday compares your notes to typical features of this illness—this is educational only, not a diagnosis.`,
    commonSymptoms: [],
    whenToSeekCare:
      'Seek emergency care for severe, sudden, or rapidly worsening symptoms. Discuss ongoing concerns with a qualified clinician.',
  }
}

export function parseDiseaseIdFromVariantId(variantId: string): string {
  const dash = variantId.indexOf('-')
  if (dash === -1) return variantId
  return variantId.slice(dash + 1)
}
