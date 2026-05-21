import type { HypothesisPattern } from '@/models/types'

export interface DiseaseDefinition {
  id: string
  /** Display name of the medical condition */
  name: string
  /** Keywords / phrases in journal text */
  keywords: RegExp[]
  /** Condition-area labels this disease applies to (substring match, case-insensitive) */
  areaHints: RegExp[]
  /** Hypothesis patterns that increase plausibility */
  relatedPatterns?: HypothesisPattern[]
  /** Medication names that support this disease */
  medicationHints?: RegExp[]
}

export const MEDICAL_DISEASE_CATALOG: DiseaseDefinition[] = [
  // —— Head / neurological ——
  {
    id: 'migraine',
    name: 'Migraine',
    keywords: [
      /\bmigraine\b/i,
      /\bthrobbing\s+headache\b/i,
      /\bheadache\b/i,
      /\bphotophobia\b/i,
      /\blight\s+sensitivity\b/i,
      /\baura\b/i,
      /\bnausea\b/i,
    ],
    areaHints: [/head/i, /neurolog/i],
    relatedPatterns: ['recurring', 'general'],
  },
  {
    id: 'tension_headache',
    name: 'Tension-type headache',
    keywords: [
      /\btension\s+headache\b/i,
      /\bheadache\b/i,
      /\bband-?like\b/i,
      /\bneck\s+tension\b/i,
      /\bstress\s+headache\b/i,
    ],
    areaHints: [/head/i, /neck/i],
    relatedPatterns: ['recurring', 'general'],
  },
  {
    id: 'sinusitis',
    name: 'Acute sinusitis',
    keywords: [
      /\bsinus\b/i,
      /\bfacial\s+pain\b/i,
      /\bnasal\s+congestion\b/i,
      /\bpost-?nasal\b/i,
      /\bpressure\s+behind\s+eyes\b/i,
    ],
    areaHints: [/head/i, /sinus/i, /face/i],
    relatedPatterns: ['recurring', 'general'],
  },
  {
    id: 'concussion',
    name: 'Concussion (mild traumatic brain injury)',
    keywords: [
      /\bconcussion\b/i,
      /\bhead\s+injury\b/i,
      /\bhit\s+my\s+head\b/i,
      /\bdizziness\b/i,
      /\bconfusion\b/i,
      /\bpost-?concuss/i,
    ],
    areaHints: [/head/i],
    relatedPatterns: ['urgent', 'worsening'],
  },

  // —— Chest / respiratory / cardiac ——
  {
    id: 'asthma',
    name: 'Asthma',
    keywords: [
      /\basthma\b/i,
      /\bwheez/i,
      /\binhaler\b/i,
      /\balbuterol\b/i,
      /\bshortness\s+of\s+breath\b/i,
      /\bcoughing\b/i,
    ],
    areaHints: [/chest/i, /lung/i, /respirat/i],
    medicationHints: [/\balbuterol\b/i, /\bsalbutamol\b/i, /\bbudesonide\b/i],
    relatedPatterns: ['recurring', 'worsening'],
  },
  {
    id: 'pneumonia',
    name: 'Pneumonia',
    keywords: [
      /\bpneumonia\b/i,
      /\bchest\s+infection\b/i,
      /\bproductive\s+cough\b/i,
      /\bfever\b/i,
      /\bpleuritic\b/i,
    ],
    areaHints: [/chest/i, /lung/i],
    relatedPatterns: ['urgent', 'worsening'],
  },
  {
    id: 'gerd',
    name: 'Gastroesophageal reflux disease (GERD)',
    keywords: [
      /\bacid\s+reflux\b/i,
      /\bheartburn\b/i,
      /\bgerd\b/i,
      /\bindigestion\b/i,
      /\breflux\b/i,
    ],
    areaHints: [/chest/i, /abdomen/i, /stomach/i, /esophag/i],
    medicationHints: [/\bomeprazole\b/i, /\bpantoprazole\b/i, /\besomeprazole\b/i],
    relatedPatterns: ['recurring', 'general'],
  },
  {
    id: 'angina',
    name: 'Angina pectoris',
    keywords: [
      /\bangina\b/i,
      /\bchest\s+pain\b/i,
      /\bchest\s+tightness\b/i,
      /\bpain\s+radiating\s+to\s+(left\s+)?arm\b/i,
      /\bexertional\s+chest\b/i,
    ],
    areaHints: [/chest/i, /heart/i],
    relatedPatterns: ['urgent', 'worsening'],
  },
  {
    id: 'costochondritis',
    name: 'Costochondritis',
    keywords: [
      /\bcostochondritis\b/i,
      /\bchest\s+wall\s+pain\b/i,
      /\brib\s+cage\s+pain\b/i,
      /\btender\s+chest\b/i,
    ],
    areaHints: [/chest/i, /rib/i],
    relatedPatterns: ['recurring', 'general'],
  },

  // —— Abdomen / GI ——
  {
    id: 'ibs',
    name: 'Irritable bowel syndrome (IBS)',
    keywords: [
      /\bibs\b/i,
      /\birritable\s+bowel\b/i,
      /\bbloating\b/i,
      /\balternating\s+(diarrhea|constipation)\b/i,
      /\babdominal\s+cramp/i,
    ],
    areaHints: [/abdomen/i, /stomach/i, /bowel/i, /gut/i],
    relatedPatterns: ['recurring', 'general'],
  },
  {
    id: 'gastritis',
    name: 'Gastritis',
    keywords: [
      /\bgastritis\b/i,
      /\bstomach\s+pain\b/i,
      /\bnausea\b/i,
      /\bvomiting\b/i,
      /\bupper\s+abdominal\b/i,
    ],
    areaHints: [/abdomen/i, /stomach/i],
    relatedPatterns: ['worsening', 'recurring'],
  },
  {
    id: 'appendicitis',
    name: 'Acute appendicitis',
    keywords: [
      /\bappendic/i,
      /\bright\s+lower\s+quadrant\b/i,
      /\brlq\b/i,
      /\bperiumbilical\b/i,
      /\bmcburney\b/i,
    ],
    areaHints: [/abdomen/i, /appendix/i],
    relatedPatterns: ['urgent', 'worsening'],
  },
  {
    id: 'cholecystitis',
    name: 'Cholecystitis / biliary colic',
    keywords: [
      /\bgall\s*bladder\b/i,
      /\bcholecyst/i,
      /\bbiliary\b/i,
      /\bright\s+upper\s+quadrant\b/i,
      /\bruq\b/i,
      /\bgallstone/i,
    ],
    areaHints: [/abdomen/i, /gall/i],
    relatedPatterns: ['urgent', 'worsening'],
  },

  // —— Back / spine ——
  {
    id: 'lumbar_disc_herniation',
    name: 'Lumbar disc herniation',
    keywords: [
      /\bherniat/i,
      /\bslipped\s+disc\b/i,
      /\bbulging\s+disc\b/i,
      /\bsciatica\b/i,
      /\bradiating\s+leg\s+pain\b/i,
      /\bnumbness\s+in\s+leg\b/i,
    ],
    areaHints: [/lower\s+back/i, /back/i, /spine/i, /lumbar/i],
    relatedPatterns: ['worsening', 'recurring', 'urgent'],
  },
  {
    id: 'mechanical_low_back_pain',
    name: 'Mechanical low back pain',
    keywords: [
      /\blow\s+back\s+pain\b/i,
      /\blumbar\s+pain\b/i,
      /\bmuscle\s+strain\b/i,
      /\bpulled\s+back\b/i,
      /\bstiffness\b/i,
    ],
    areaHints: [/lower\s+back/i, /back/i, /lumbar/i],
    relatedPatterns: ['recurring', 'general', 'treatment_improvement'],
  },
  {
    id: 'spinal_stenosis',
    name: 'Lumbar spinal stenosis',
    keywords: [
      /\bspinal\s+stenosis\b/i,
      /\bstenosis\b/i,
      /\bneurogenic\s+claudication\b/i,
      /\bwalking\s+limited\s+by\s+back\b/i,
    ],
    areaHints: [/back/i, /spine/i, /lumbar/i],
    relatedPatterns: ['recurring', 'worsening'],
  },
  {
    id: 'cervical_radiculopathy',
    name: 'Cervical radiculopathy',
    keywords: [
      /\bneck\s+pain\b/i,
      /\bpinched\s+nerve\b/i,
      /\bradiating\s+arm\s+pain\b/i,
      /\bcervical\b/i,
    ],
    areaHints: [/neck/i, /cervical/i, /upper\s+back/i],
    relatedPatterns: ['worsening', 'recurring'],
  },

  // —— Musculoskeletal / joints ——
  {
    id: 'osteoarthritis',
    name: 'Osteoarthritis',
    keywords: [
      /\bosteoarthritis\b/i,
      /\bdegenerative\s+joint\b/i,
      /\bjoint\s+stiffness\b/i,
      /\bcreaking\s+joint\b/i,
      /\bwear\s+and\s+tear\b/i,
    ],
    areaHints: [/knee/i, /hip/i, /joint/i, /hand/i, /shoulder/i],
    relatedPatterns: ['recurring', 'worsening'],
  },
  {
    id: 'rheumatoid_arthritis',
    name: 'Rheumatoid arthritis',
    keywords: [
      /\brheumatoid\b/i,
      /\bra\b/i,
      /\bswollen\s+joints\b/i,
      /\bmorning\s+stiffness\b/i,
      /\bsymmetric\s+joint\b/i,
    ],
    areaHints: [/joint/i, /hand/i, /wrist/i],
    medicationHints: [/\bmethotrexate\b/i, /\bplaquenil\b/i, /\bhydroxychloroquine\b/i],
    relatedPatterns: ['recurring', 'worsening'],
  },
  {
    id: 'gout',
    name: 'Gout',
    keywords: [
      /\bgout\b/i,
      /\buric\s+acid\b/i,
      /\btophus\b/i,
      /\bsudden\s+joint\s+swelling\b/i,
      /\bbig\s+toe\s+pain\b/i,
    ],
    areaHints: [/foot/i, /toe/i, /joint/i],
    relatedPatterns: ['urgent', 'recurring'],
  },
  {
    id: 'bursitis',
    name: 'Bursitis',
    keywords: [/\bbursitis\b/i, /\bbursa\b/i, /\blocalized\s+swelling\b/i],
    areaHints: [/shoulder/i, /hip/i, /knee/i, /elbow/i],
    relatedPatterns: ['recurring', 'general'],
  },
  {
    id: 'tendinitis',
    name: 'Tendinitis',
    keywords: [
      /\btendinitis\b/i,
      /\btendonitis\b/i,
      /\boveruse\s+injury\b/i,
      /\brepetitive\s+strain\b/i,
    ],
    areaHints: [/shoulder/i, /elbow/i, /wrist/i, /achilles/i, /knee/i],
    relatedPatterns: ['recurring', 'treatment_improvement'],
  },

  // —— Skin ——
  {
    id: 'eczema',
    name: 'Atopic dermatitis (eczema)',
    keywords: [
      /\beczema\b/i,
      /\batopic\s+dermatitis\b/i,
      /\bitchy\s+rash\b/i,
      /\bdry\s+skin\b/i,
      /\bflaring\s+skin\b/i,
    ],
    areaHints: [/skin/i, /rash/i, /dermat/i],
    relatedPatterns: ['recurring'],
  },
  {
    id: 'psoriasis',
    name: 'Psoriasis',
    keywords: [
      /\bpsoriasis\b/i,
      /\bscaly\s+patches\b/i,
      /\bplaques\b/i,
      /\bsilvery\s+scale\b/i,
    ],
    areaHints: [/skin/i],
    relatedPatterns: ['recurring'],
  },
  {
    id: 'cellulitis',
    name: 'Cellulitis',
    keywords: [
      /\bcellulitis\b/i,
      /\bred\s+warm\s+skin\b/i,
      /\bskin\s+infection\b/i,
      /\bspreading\s+redness\b/i,
    ],
    areaHints: [/skin/i, /leg/i, /arm/i],
    relatedPatterns: ['urgent', 'worsening'],
  },

  // —— Systemic / metabolic / endocrine ——
  {
    id: 'type2_diabetes',
    name: 'Type 2 diabetes mellitus',
    keywords: [
      /\bdiabetes\b/i,
      /\btype\s*2\b/i,
      /\bhigh\s+blood\s+sugar\b/i,
      /\bhyperglycemia\b/i,
      /\bpolyuria\b/i,
      /\bthirsty\b/i,
      /\bglucose\b/i,
    ],
    areaHints: [/diabetes/i, /metabolic/i, /general/i, /systemic/i],
    medicationHints: [/\bmetformin\b/i, /\bglipizide\b/i, /\bsemaglutide\b/i, /\binsulin\b/i],
    relatedPatterns: ['recurring', 'general'],
  },
  {
    id: 'hypothyroidism',
    name: 'Hypothyroidism',
    keywords: [
      /\bhypothyroid/i,
      /\bunderactive\s+thyroid\b/i,
      /\bfatigue\b/i,
      /\bweight\s+gain\b/i,
      /\bcold\s+intolerance\b/i,
      /\bthyroid\b/i,
    ],
    areaHints: [/thyroid/i, /endocrine/i, /general/i],
    medicationHints: [/\blevothyroxine\b/i, /\bsynthroid\b/i],
    relatedPatterns: ['recurring'],
  },
  {
    id: 'hyperthyroidism',
    name: 'Hyperthyroidism',
    keywords: [
      /\bhyperthyroid/i,
      /\boveractive\s+thyroid\b/i,
      /\bweight\s+loss\b/i,
      /\bpalpitations\b/i,
      /\bheat\s+intolerance\b/i,
    ],
    areaHints: [/thyroid/i, /endocrine/i],
    relatedPatterns: ['worsening', 'recurring'],
  },
  {
    id: 'hypertension',
    name: 'Hypertension',
    keywords: [
      /\bhypertension\b/i,
      /\bhigh\s+blood\s+pressure\b/i,
      /\bbp\s+elevated\b/i,
      /\bblood\s+pressure\b/i,
    ],
    areaHints: [/cardiovascular/i, /heart/i, /general/i],
    medicationHints: [/\blisinopril\b/i, /\bamlodipine\b/i, /\blosartan\b/i],
    relatedPatterns: ['recurring', 'general'],
  },
  {
    id: 'anemia',
    name: 'Anemia',
    keywords: [
      /\banemia\b/i,
      /\banaemia\b/i,
      /\bfatigue\b/i,
      /\bpale\b/i,
      /\blow\s+hemoglobin\b/i,
      /\biron\s+deficiency\b/i,
    ],
    areaHints: [/blood/i, /general/i, /systemic/i],
    relatedPatterns: ['recurring', 'worsening'],
  },
  {
    id: 'fibromyalgia',
    name: 'Fibromyalgia',
    keywords: [
      /\bfibromyalgia\b/i,
      /\bwidespread\s+pain\b/i,
      /\btender\s+points\b/i,
      /\bsleep\s+disturbance\b/i,
      /\bbrain\s+fog\b/i,
    ],
    areaHints: [/general/i, /systemic/i, /muscle/i, /joint/i],
    relatedPatterns: ['recurring'],
  },

  // —— Mental health ——
  {
    id: 'major_depression',
    name: 'Major depressive disorder',
    keywords: [
      /\bdepression\b/i,
      /\bdepressed\b/i,
      /\blow\s+mood\b/i,
      /\bloss\s+of\s+interest\b/i,
      /\banhedonia\b/i,
      /\bhopeless\b/i,
    ],
    areaHints: [/mental/i, /mood/i, /psych/i, /general/i],
    relatedPatterns: ['recurring', 'worsening'],
  },
  {
    id: 'generalized_anxiety',
    name: 'Generalized anxiety disorder',
    keywords: [
      /\banxiety\b/i,
      /\banxious\b/i,
      /\bpanic\b/i,
      /\bworry\b/i,
      /\brestless\b/i,
    ],
    areaHints: [/mental/i, /mood/i, /anxiety/i, /general/i],
    relatedPatterns: ['recurring'],
  },

  // —— Infections / other ——
  {
    id: 'uti',
    name: 'Urinary tract infection',
    keywords: [
      /\buti\b/i,
      /\burinary\s+tract\b/i,
      /\bburning\s+urination\b/i,
      /\bdysuria\b/i,
      /\bfrequent\s+urination\b/i,
      /\bbladder\s+infection\b/i,
    ],
    areaHints: [/urinar/i, /bladder/i, /pelvic/i],
    relatedPatterns: ['urgent', 'worsening'],
  },
  {
    id: 'kidney_stone',
    name: 'Nephrolithiasis (kidney stone)',
    keywords: [
      /\bkidney\s+stone\b/i,
      /\bnephrolith/i,
      /\bflank\s+pain\b/i,
      /\brenal\s+colic\b/i,
    ],
    areaHints: [/kidney/i, /flank/i, /abdomen/i],
    relatedPatterns: ['urgent', 'worsening'],
  },
  {
    id: 'influenza',
    name: 'Influenza',
    keywords: [
      /\bflu\b/i,
      /\binfluenza\b/i,
      /\bfever\b/i,
      /\bbody\s+aches\b/i,
      /\bmyalgia\b/i,
    ],
    areaHints: [/general/i, /systemic/i, /respirat/i],
    relatedPatterns: ['urgent', 'worsening'],
  },
  {
    id: 'covid19',
    name: 'COVID-19',
    keywords: [
      /\bcovid\b/i,
      /\bcoronavirus\b/i,
      /\bsars-cov/i,
      /\bpositive\s+test\b/i,
    ],
    areaHints: [/general/i, /respirat/i, /chest/i],
    relatedPatterns: ['urgent', 'worsening'],
  },

  // —— Leg / vascular ——
  {
    id: 'dvt',
    name: 'Deep vein thrombosis',
    keywords: [
      /\bdvt\b/i,
      /\bdeep\s+vein\s+thrombosis\b/i,
      /\bcalf\s+swelling\b/i,
      /\bleg\s+swelling\b/i,
      /\bunilateral\s+leg\b/i,
    ],
    areaHints: [/leg/i, /calf/i, /vein/i],
    relatedPatterns: ['urgent', 'worsening'],
  },
  {
    id: 'peripheral_neuropathy',
    name: 'Peripheral neuropathy',
    keywords: [
      /\bneuropathy\b/i,
      /\btingling\b/i,
      /\bnumbness\b/i,
      /\bburning\s+feet\b/i,
      /\bpins\s+and\s+needles\b/i,
    ],
    areaHints: [/foot/i, /leg/i, /hand/i, /nerve/i],
    relatedPatterns: ['recurring', 'worsening'],
  },
]
