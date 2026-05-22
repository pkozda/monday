import { MEDICAL_DISEASE_CATALOG, type DiseaseDefinition } from '@/data/medicalDiseaseCatalog'

export interface CriterionRule {
  id: string
  text: string
  patterns: RegExp[]
}

export interface DiseaseDiagnosisCriteria {
  diseaseId: string
  confirm: CriterionRule[]
  exclude: CriterionRule[]
  workup: string[]
}

const CRITERIA: DiseaseDiagnosisCriteria[] = [
  {
    diseaseId: 'migraine',
    confirm: [
      {
        id: 'migr-unilateral-throb',
        text: 'Unilateral throbbing headache with nausea or light sensitivity',
        patterns: [
          /\bthrobbing\b/i,
          /\b(one|1)\s+side\b/i,
          /\bunilateral\b/i,
          /\bphotophobia\b/i,
          /\bnausea\b/i,
        ],
      },
      {
        id: 'migr-recurrent',
        text: 'Recurrent headache episodes documented over time',
        patterns: [/\brecurr/i, /\bepisodes?\b/i, /\breturns?\b/i, /\bmigraine\b/i],
      },
      {
        id: 'migr-aura',
        text: 'Aura or visual disturbance before headache',
        patterns: [/\baura\b/i, /\bvisual\b/i, /\bzigzag/i],
      },
    ],
    exclude: [
      {
        id: 'migr-fever',
        text: 'High fever with headache (consider infection)',
        patterns: [/\bhigh\s+fever\b/i, /\b104\b/i, /\b40\s*°/i],
      },
      {
        id: 'migr-thunderclap',
        text: 'Sudden “worst ever” thunderclap onset',
        patterns: [
          /\bworst\s+(headache|pain)\b/i,
          /\bthunderclap\b/i,
          /\bsudden\s+severe\s+head/i,
        ],
      },
      {
        id: 'migr-neck-stiff',
        text: 'Neck stiffness with fever (consider meningitis)',
        patterns: [/\bneck\s+stiff/i, /\bmeningitis\b/i, /\bcan't\s+flex\s+neck/i],
      },
    ],
    workup: [
      'Neurology review if new or changing pattern',
      'Consider brain MRI if red flags or atypical features',
      'Headache diary for frequency and triggers',
    ],
  },
  {
    diseaseId: 'lumbar_disc_herniation',
    confirm: [
      {
        id: 'disc-sciatica',
        text: 'Leg pain radiating below knee (sciatica pattern)',
        patterns: [
          /\bsciatica\b/i,
          /\bradiat/i,
          /\bshooting\s+(leg|pain)\b/i,
          /\bnumbness\s+in\s+leg\b/i,
        ],
      },
      {
        id: 'disc-nerve',
        text: 'Nerve root symptoms (numbness, weakness, tingling in leg)',
        patterns: [/\bnumbness\b/i, /\btingling\b/i, /\bweakness\b/i, /\bpins\s+and\s+needles\b/i],
      },
      {
        id: 'disc-imaging',
        text: 'Imaging mentions disc, herniation, or nerve compression',
        patterns: [/\bherniat/i, /\bmri\b/i, /\bdisc\b/i, /\bbulging\b/i],
      },
    ],
    exclude: [
      {
        id: 'disc-cauda',
        text: 'Saddle anesthesia, urinary retention, or bilateral leg weakness (cauda equina emergency)',
        patterns: [
          /\bcauda\s+equina\b/i,
          /\bcan't\s+urinate\b/i,
          /\bsaddle\b/i,
          /\bboth\s+legs\s+weak\b/i,
        ],
      },
      {
        id: 'disc-fever-weight',
        text: 'Fever or unexplained weight loss with back pain (consider malignancy/infection)',
        patterns: [/\bweight\s+loss\b/i, /\bnight\s+sweats\b/i, /\bfever\b/i],
      },
    ],
    workup: [
      'Lumbar spine MRI if persistent radiculopathy or neurologic deficit',
      'Straight leg raise and neurologic exam in clinic',
      'Urgent care if bowel/bladder changes or progressive weakness',
    ],
  },
  {
    diseaseId: 'type2_diabetes',
    confirm: [
      {
        id: 'dm-symptoms',
        text: 'Polyuria, polydipsia, or unexplained weight change',
        patterns: [
          /\bthirsty\b/i,
          /\bfrequent\s+urination\b/i,
          /\bglucose\b/i,
          /\bhigh\s+blood\s+sugar\b/i,
          /\bweight\s+loss\b/i,
          /\bunexplained\s+weight\b/i,
          /\b(losing|lost)\s+weight\b/i,
          /\bweight\s+gain\b/i,
        ],
      },
      {
        id: 'dm-meds',
        text: 'Diabetes medication or insulin documented',
        patterns: [/\bmetformin\b/i, /\binsulin\b/i, /\bsemaglutide\b/i, /\bdiabetes\b/i],
      },
      {
        id: 'dm-labs',
        text: 'Abnormal glucose or HbA1c mentioned',
        patterns: [/\bhba1c\b/i, /\ba1c\b/i, /\bglucose\b/i, /\bdiabetic\b/i],
      },
    ],
    exclude: [
      {
        id: 'dm-type1-only',
        text: 'Type 1 diabetes only (autoimmune, typically younger onset)',
        patterns: [/\btype\s*1\s+diabetes\b/i, /\bdka\b/i, /\bketoacidosis\b/i],
      },
    ],
    workup: [
      'Fasting glucose and HbA1c if not done in past 3 months',
      'Urinalysis for glucose/ketones if symptomatic',
      'Foot and retinal screening per diabetes care guidelines',
    ],
  },
  {
    diseaseId: 'asthma',
    confirm: [
      {
        id: 'asthma-wheeze',
        text: 'Wheezing or reversible airway obstruction',
        patterns: [/\bwheez/i, /\bbronchospasm\b/i, /\basthma\b/i],
      },
      {
        id: 'asthma-inhaler',
        text: 'Relief with bronchodilator/inhaler',
        patterns: [/\balbuterol\b/i, /\binhaler\b/i, /\bnebulizer\b/i],
      },
      {
        id: 'asthma-sob',
        text: 'Episodic shortness of breath or chest tightness',
        patterns: [
          /\bshortness\s+of\s+breath\b/i,
          /\bchest\s+tight/i,
          /\bsob\b/i,
        ],
      },
    ],
    exclude: [
      {
        id: 'asthma-fever-productive',
        text: 'High fever with purulent sputum (consider pneumonia)',
        patterns: [/\bfever\b/i, /\bproductive\s+cough\b/i, /\bgreen\s+phlegm\b/i],
      },
      {
        id: 'asthma-pe',
        text: 'Sudden pleuritic pain and dyspnea (consider pulmonary embolism)',
        patterns: [/\bpulmonary\s+embol/i, /\bpe\b/i, /\bpleuritic\b/i],
      },
    ],
    workup: [
      'Spirometry with bronchodilator response',
      'Peak flow monitoring during symptoms',
      'Chest X-ray if fever or focal findings',
    ],
  },
  {
    diseaseId: 'gerd',
    confirm: [
      {
        id: 'gerd-heartburn',
        text: 'Heartburn or acid regurgitation after meals or lying down',
        patterns: [/\bheartburn\b/i, /\bacid\s+reflux\b/i, /\bregurgit/i],
      },
      {
        id: 'gerd-ppi',
        text: 'Improvement on PPI or antacid',
        patterns: [/\bomeprazole\b/i, /\bpantoprazole\b/i, /\bantacid\b/i],
      },
    ],
    exclude: [
      {
        id: 'gerd-cardiac',
        text: 'Exertional chest pain radiating to arm/jaw (consider cardiac cause)',
        patterns: [
          /\bexertional\s+chest\b/i,
          /\bradiating\s+to\s+(arm|jaw)\b/i,
          /\bangina\b/i,
        ],
      },
      {
        id: 'gerd-dysphagia',
        text: 'Progressive dysphagia or weight loss (consider esophageal pathology)',
        patterns: [/\bdysphagia\b/i, /\bcan't\s+swallow\b/i, /\bweight\s+loss\b/i],
      },
    ],
    workup: [
      'Trial of PPI for 4–8 weeks if typical symptoms',
      'EGD if alarm features, refractory symptoms, or long duration',
    ],
  },
  {
    diseaseId: 'rheumatoid_arthritis',
    confirm: [
      {
        id: 'ra-symmetric',
        text: 'Symmetric joint swelling/stiffness (hands, wrists)',
        patterns: [
          /\bsymmetric\b/i,
          /\bboth\s+hands\b/i,
          /\bwrists?\b/i,
          /\bmorning\s+stiffness\b/i,
        ],
      },
      {
        id: 'ra-meds',
        text: 'DMARD or rheumatology treatment',
        patterns: [/\bmethotrexate\b/i, /\bplaquenil\b/i, /\brheumatoid\b/i],
      },
    ],
    exclude: [
      {
        id: 'ra-mono',
        text: 'Single hot swollen joint only (consider septic arthritis or gout)',
        patterns: [/\bsingle\s+joint\b/i, /\bseptic\s+arthritis\b/i],
      },
    ],
    workup: [
      'RF and anti-CCP antibodies',
      'Inflammatory markers (ESR, CRP)',
      'Rheumatology referral if persistent synovitis',
    ],
  },
  {
    diseaseId: 'appendicitis',
    confirm: [
      {
        id: 'app-rlq',
        text: 'Right lower quadrant pain',
        patterns: [/\brlq\b/i, /\bright\s+lower\b/i, /\bappendic/i],
      },
      {
        id: 'app-periumbilical',
        text: 'Pain migration from periumbilical to RLQ',
        patterns: [/\bperiumbilical\b/i, /\bmigration\b/i, /\bworse\s+right\b/i],
      },
    ],
    exclude: [
      {
        id: 'app-chronic',
        text: 'Chronic pain > 2 weeks without acute worsening',
        patterns: [/\bmonths?\b/i, /\byears?\b/i, /\bchronic\b/i],
      },
    ],
    workup: [
      'Urgent surgical evaluation if acute RLQ pain',
      'CT abdomen/pelvis or ultrasound if diagnosis uncertain',
    ],
  },
  {
    diseaseId: 'angina',
    confirm: [
      {
        id: 'angina-exertion',
        text: 'Chest pain triggered by exertion, relieved by rest',
        patterns: [
          /\bexertion\b/i,
          /\bexercise\b/i,
          /\bwalking\b/i,
          /\bchest\s+pain\b/i,
        ],
      },
      {
        id: 'angina-radiation',
        text: 'Pain radiating to arm, jaw, or back',
        patterns: [/\bradiat/i, /\bleft\s+arm\b/i, /\bjaw\b/i],
      },
    ],
    exclude: [
      {
        id: 'angina-pleuritic',
        text: 'Sharp pleuritic pain with breathing (consider pulmonary cause)',
        patterns: [/\bpleuritic\b/i, /\bwith\s+breath/i, /\bwhen\s+i\s+cough\b/i],
      },
    ],
    workup: [
      'ECG and troponin if acute chest pain',
      'Cardiology stress testing if stable exertional pattern',
      'Call emergency services if pain is severe or ongoing',
    ],
  },
]

const CRITERIA_BY_ID = new Map(CRITERIA.map((c) => [c.diseaseId, c]))

export function getDiagnosisCriteria(
  diseaseId: string
): DiseaseDiagnosisCriteria {
  const existing = CRITERIA_BY_ID.get(diseaseId)
  if (existing) return existing

  const disease = MEDICAL_DISEASE_CATALOG.find((d) => d.id === diseaseId)
  return buildFallbackCriteria(disease)
}

function buildFallbackCriteria(
  disease: DiseaseDefinition | undefined
): DiseaseDiagnosisCriteria {
  const id = disease?.id ?? 'unknown'
  const name = disease?.name ?? 'condition'

  return {
    diseaseId: id,
    confirm: [
      {
        id: `${id}-named`,
        text: `Journal documents "${name}" or equivalent terms`,
        patterns: disease?.keywords.slice(0, 3) ?? [/.^/],
      },
      {
        id: `${id}-repeat`,
        text: 'Multiple related symptom entries over time',
        patterns: [/\bsymptom\b/i, /\bpain\b/i, /\breturn/i],
      },
      {
        id: `${id}-visit`,
        text: 'Clinician visit or test result supports this direction',
        patterns: [
          /\bdoctor\b/i,
          /\bdiagnos/i,
          /\bvisit\b/i,
          /\bimaging\b/i,
          /\btest\s+result\b/i,
        ],
      },
    ],
    exclude: [
      {
        id: `${id}-emergency-other`,
        text: 'Active emergency presentation pointing to a different acute cause',
        patterns: [
          /\bemergency\b/i,
          /\b911\b/i,
          /\bpassed\s+out\b/i,
          /\bsevere\s+bleeding\b/i,
        ],
      },
    ],
    workup: [
      'Discuss this possibility with your clinician using your journal summary',
      'Request appropriate labs or imaging based on symptom duration and severity',
      'Track symptoms for 1–2 weeks to clarify pattern before reassessment',
    ],
  }
}
