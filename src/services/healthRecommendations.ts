import { differenceInYears, parseISO } from 'date-fns'
import type {
  DashboardStats,
  HealthRecommendation,
  HealthRecommendationPriority,
  PatientProfile,
} from '@/models/types'

const PRIORITY_ORDER: Record<HealthRecommendationPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

function getAge(dateOfBirth: string | undefined): number | null {
  if (!dateOfBirth) return null
  try {
    const dob = parseISO(dateOfBirth)
    if (Number.isNaN(dob.getTime())) return null
    const age = differenceInYears(new Date(), dob)
    return age >= 0 && age < 130 ? age : null
  } catch {
    return null
  }
}

function add(
  list: HealthRecommendation[],
  rec: Omit<HealthRecommendation, 'id'> & { id: string }
): void {
  if (list.some((r) => r.id === rec.id)) return
  list.push(rec)
}

export function getHealthRecommendations(
  profile: PatientProfile | null,
  stats: DashboardStats | null
): HealthRecommendation[] {
  const recs: HealthRecommendation[] = []
  const age = getAge(profile?.dateOfBirth)
  const sex = profile?.biologicalSex

  if (!profile?.dateOfBirth) {
    add(recs, {
      id: 'profile-dob',
      title: 'Complete your profile',
      detail:
        'Add your date of birth so Monday can suggest age-appropriate screenings and checkups.',
      category: 'profile',
      priority: 'medium',
    })
  }

  if (age !== null) {
    if (age >= 18) {
      add(recs, {
        id: 'wellness-visit',
        title: 'Routine wellness visit',
        detail:
          'Schedule a preventive visit with your clinician every 1–3 years, or annually if you have ongoing conditions.',
        category: 'preventive',
        priority: 'low',
      })
    }

    if (age >= 35) {
      add(recs, {
        id: 'annual-blood-panel',
        title: 'Annual blood panel',
        detail:
          'Consider a yearly blood test (CBC, metabolic panel, and lipids) to monitor baseline health and catch early changes.',
        category: 'screening',
        priority: 'medium',
      })
    }

    if (age >= 40) {
      add(recs, {
        id: 'bp-monitoring',
        title: 'Blood pressure monitoring',
        detail:
          'Have your blood pressure checked at least once a year—or more often if you have risk factors or elevated readings.',
        category: 'screening',
        priority: 'medium',
      })
      add(recs, {
        id: 'vision-exam',
        title: 'Vision exam',
        detail:
          'An eye exam every 1–2 years helps detect glaucoma, cataracts, and vision changes early.',
        category: 'screening',
        priority: 'low',
      })
    }

    if (age >= 45) {
      add(recs, {
        id: 'colorectal-screening',
        title: 'Colorectal cancer screening',
        detail:
          'Discuss screening options (stool test, colonoscopy, or other methods) with your clinician—typically starting between ages 45 and 50.',
        category: 'screening',
        priority: 'medium',
      })
    }

    if (age >= 50) {
      add(recs, {
        id: 'cardiovascular-risk',
        title: 'Heart health review',
        detail:
          'Review cardiovascular risk factors with your clinician, including lipids, blood pressure, family history, and lifestyle.',
        category: 'screening',
        priority: 'medium',
      })
    }

    if (age >= 65) {
      add(recs, {
        id: 'senior-wellness',
        title: 'Older adult wellness',
        detail:
          'Annual wellness visits, medication review, fall-risk assessment, and hearing or cognitive screening are often recommended after 65.',
        category: 'preventive',
        priority: 'medium',
      })
    }
  }

  if (age !== null && sex === 'female') {
    if (age >= 21 && age <= 65) {
      add(recs, {
        id: 'cervical-screening',
        title: 'Cervical cancer screening',
        detail:
          'Pap smear and/or HPV testing on a schedule your clinician recommends—often every 3–5 years depending on age and prior results.',
        category: 'screening',
        priority: 'medium',
      })
    }
    if (age >= 40) {
      add(recs, {
        id: 'mammography',
        title: 'Breast cancer screening',
        detail:
          'Discuss mammography timing with your clinician—many guidelines suggest starting between ages 40 and 50.',
        category: 'screening',
        priority: 'medium',
      })
    }
    if (age >= 65) {
      add(recs, {
        id: 'bone-density',
        title: 'Bone density screening',
        detail:
          'A DEXA scan may be appropriate to assess osteoporosis risk, especially with fractures, low body weight, or long-term steroid use.',
        category: 'screening',
        priority: 'low',
      })
    }
  }

  if (age !== null && sex === 'male' && age >= 50) {
    add(recs, {
      id: 'prostate-screening',
      title: 'Prostate cancer screening',
      detail:
        'PSA testing is a shared decision with your clinician—weigh benefits and harms based on your age and risk factors.',
      category: 'screening',
      priority: 'low',
    })
  }

  add(recs, {
    id: 'dental-annual',
    title: 'Dental checkup',
    detail: 'A dental exam and cleaning once a year supports oral health and can flag systemic issues early.',
    category: 'preventive',
    priority: 'low',
  })

  add(recs, {
    id: 'flu-vaccine',
    title: 'Seasonal flu vaccine',
    detail: 'An annual influenza vaccine is widely recommended for adults, especially during flu season.',
    category: 'preventive',
    priority: 'low',
  })

  add(recs, {
    id: 'physical-activity',
    title: 'Regular physical activity',
    detail:
      'Aim for at least 150 minutes of moderate activity per week, plus strength training twice weekly, unless your clinician advises otherwise.',
    category: 'lifestyle',
    priority: 'low',
  })

  if (stats) {
    if (stats.attentionRequired > 0) {
      add(recs, {
        id: 'journal-attention',
        title: 'Review urgent journal entries',
        detail: `You have ${stats.attentionRequired} journal ${stats.attentionRequired === 1 ? 'entry' : 'entries'} flagged as needing attention. Discuss these with a clinician promptly.`,
        category: 'journal',
        priority: 'high',
      })
    }

    if (stats.totalJournalEntries === 0) {
      add(recs, {
        id: 'start-journaling',
        title: 'Start your health journal',
        detail:
          'Log symptoms, medications, and visits so Monday can track patterns and tailor recommendations over time.',
        category: 'journal',
        priority: 'medium',
      })
    } else if (stats.entriesLast30Days === 0) {
      add(recs, {
        id: 'journal-recent',
        title: 'Log recent health updates',
        detail:
          'You have not added journal entries in the last 30 days. Brief updates help keep your timeline and insights current.',
        category: 'journal',
        priority: 'low',
      })
    }

    if (stats.conditions.length > 0) {
      add(recs, {
        id: 'condition-followup',
        title: 'Follow up on tracked conditions',
        detail: `You are tracking ${stats.conditions.length} condition${stats.conditions.length === 1 ? '' : 's'}. Share your journal summary with your care team at your next visit.`,
        category: 'journal',
        priority: 'medium',
      })
    }
  }

  return recs.sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )
}
