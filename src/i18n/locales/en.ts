export default {
  nav: {
    dashboard: 'Dashboard',
    hypotheses: 'Hypotheses',
    appointments: 'Appointments',
    journal: 'Journal',
  },
  language: {
    label: 'Language',
    en: 'English',
    de: 'German',
    ru: 'Russian',
  },
  theme: {
    dark: 'Dark',
    light: 'Light',
    darkHint: 'Dark mode — click to switch to light',
    lightHint: 'Light mode — click to switch to dark',
  },
  common: {
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading…',
    saving: 'Saving…',
    add: 'Add',
    edit: 'Edit',
    remove: 'Remove',
    preview: 'Preview',
    import: 'Import',
    importing: 'Importing…',
    goToJournal: 'Go to Journal',
    goToDashboard: 'Go to Dashboard',
    viewAll: 'View all',
    priority: 'Priority',
    see: 'See',
    expandToSeeAll: '+{count} more — expand to see all',
  },
  dashboard: {
    eyebrow: 'Health overview',
    title: 'Dashboard',
    subtitle: 'Your health overview — patient profile, statistics, and trends',
    loading: 'Loading dashboard…',
    overviewTitle: 'Overview',
    overviewSubtitle: 'Key metrics from your health journal',
    stats: {
      journalEntries: 'Journal entries',
      allTime: 'All time',
      last30Days: 'Last 30 days',
      recentActivity: 'Recent activity',
      trackedConditions: 'Tracked conditions',
      bodyAreasHint: 'Body areas / issues',
      avgSeverity: 'Avg severity',
      severityHint: 'When reported (1–10)',
      timelineEvents: 'Timeline events',
      hypotheses: 'Hypotheses',
      needsAttention: 'Needs attention',
      attentionHint: 'Urgent or emergency flags',
    },
    severityTrendTitle: 'Severity trend',
    severityTrendBase:
      'By event date (when symptoms happened), not when you logged the entry.',
    severityTrendEstimated:
      'Estimated from entry urgency until you add 1–10 ratings.',
    severityTrendSomeUrgency: 'Some points use urgency when no rating was logged.',
    severityTrendParsed:
      'Parsed from pain scores in your notes (e.g. 7/10).',
    severityTrendEmpty: 'Add journal entries to see severity trends.',
    severityTrendEmptyDetail:
      'You have {count} journal {entries}, but none have a severity rating or text we can read (e.g. "pain 7/10"). Use the severity slider when logging.',
    entryOne: 'entry',
    entryMany: 'entries',
    classificationTitle: 'Entry classification',
    classificationSubtitle:
      'How journal entries were categorized from your descriptions',
    entriesByTypeTitle: 'Entries by type',
    entriesByTypeSubtitle: 'Symptoms, medications, visits, and more',
    hypothesisConfidenceTitle: 'Hypothesis confidence',
    hypothesisConfidenceSubtitle: 'Distribution of active hypotheses',
    noHypothesesYet: 'No hypotheses yet',
    conditionsTitle: 'Tracked conditions',
    conditionsSubtitle: 'Body areas you have logged in your journal',
    noConditionsTitle: 'No conditions yet',
    noConditionsText: 'Add an entry in the Journal to start tracking body areas.',
    table: {
      condition: 'Condition / area',
      entries: 'Entries',
      lastUpdate: 'Last update',
      classification: 'Latest classification',
    },
    clinicalModelTitle: 'Current clinical model',
    clinicalModelSubtitle: 'Synthesized from your health journal',
    clinicalModelHint:
      'Log symptoms and visits in the Journal to populate condition-specific factors.',
  },
  profile: {
    yearsOld: '{years} years old',
    currentWeight: 'Current weight',
    weightDown: '−{value} kg vs last log',
    weightUp: '+{value} kg vs last log',
    weightFlat: 'unchanged vs last log',
    weightDownTitle: 'Down from {label} ({date})',
    weightUpTitle: 'Up from {label} ({date})',
    weightFlatTitle: 'Same as {label} ({date})',
    previousEntry: 'previous entry',
    trackingStart: 'Start your health journal to begin tracking',
    trackingSpan: 'Health journal spans {span} · records since {since}',
    appointmentTitle: 'Next appointment — click to view',
    appointmentNone: 'Appointments — none upcoming',
    recommendationsTitle: 'Recommendations for you',
    recommendationsCount: 'Recommendations for you ({count})',
    addHealthHistory: 'Add health history',
    addHealthHistoryHint: 'Add health history (anamnesis)',
    editProfile: 'Edit profile',
    cancelEdit: 'Cancel',
    saveProfile: 'Save profile',
    displayName: 'Display name',
    dateOfBirth: 'Date of birth',
    biologicalSex: 'Biological sex',
    bloodType: 'Blood type',
    sexNotSpecified: 'Not specified',
    sexFemale: 'Female',
    sexMale: 'Male',
    sexOther: 'Other',
    sexPreferNot: 'Prefer not to say',
    profileCreated: 'Profile created',
    sexLabel: 'Biological sex',
  },
  recommendations: {
    eyebrow: 'Recommendations for you',
    headlineNone: 'No suggestions yet',
    headlineOne: '1 suggestion',
    headlineMany: '{count} suggestions',
    summary:
      'Preventive care suggestions based on your age, profile, and journal',
    disclaimer:
      'General guidance—not a substitute for advice from your clinician.',
    empty:
      'Add your date of birth in your profile to unlock personalized screening suggestions.',
    categories: {
      screening: 'Screening',
      preventive: 'Preventive',
      lifestyle: 'Lifestyle',
      profile: 'Profile',
      journal: 'Your data',
    },
    items: {
      'profile-dob': {
        title: 'Complete your profile',
        detail:
          'Add your date of birth so Monday can suggest age-appropriate screenings and checkups.',
      },
      'wellness-visit': {
        title: 'Routine wellness visit',
        detail:
          'Schedule a preventive visit with your clinician every 1–3 years, or annually if you have ongoing conditions.',
      },
      'annual-blood-panel': {
        title: 'Annual blood panel',
        detail:
          'Consider a yearly blood test (CBC, metabolic panel, and lipids) to monitor baseline health and catch early changes.',
      },
      'bp-monitoring': {
        title: 'Blood pressure monitoring',
        detail:
          'Have your blood pressure checked at least once a year—or more often if you have risk factors or elevated readings.',
      },
      'vision-exam': {
        title: 'Vision exam',
        detail:
          'An eye exam every 1–2 years helps detect glaucoma, cataracts, and vision changes early.',
      },
      'colorectal-screening': {
        title: 'Colorectal cancer screening',
        detail:
          'Discuss screening options (stool test, colonoscopy, or other methods) with your clinician—typically starting between ages 45 and 50.',
      },
      'cardiovascular-risk': {
        title: 'Heart health review',
        detail:
          'Review cardiovascular risk factors with your clinician, including lipids, blood pressure, family history, and lifestyle.',
      },
      'senior-wellness': {
        title: 'Older adult wellness',
        detail:
          'Annual wellness visits, medication review, fall-risk assessment, and hearing or cognitive screening are often recommended after 65.',
      },
      'cervical-screening': {
        title: 'Cervical cancer screening',
        detail:
          'Pap smear and/or HPV testing on a schedule your clinician recommends—often every 3–5 years depending on age and prior results.',
      },
      mammography: {
        title: 'Breast cancer screening',
        detail:
          'Discuss mammography timing with your clinician—many guidelines suggest starting between ages 40 and 50.',
      },
      'bone-density': {
        title: 'Bone density screening',
        detail:
          'A DEXA scan may be appropriate to assess osteoporosis risk, especially with fractures, low body weight, or long-term steroid use.',
      },
      'prostate-screening': {
        title: 'Prostate cancer screening',
        detail:
          'PSA testing is a shared decision with your clinician—weigh benefits and harms based on your age and risk factors.',
      },
      'dental-annual': {
        title: 'Dental checkup',
        detail:
          'A dental exam and cleaning once a year supports oral health and can flag systemic issues early.',
      },
      'flu-vaccine': {
        title: 'Seasonal flu vaccine',
        detail:
          'An annual influenza vaccine is widely recommended for adults, especially during flu season.',
      },
      'physical-activity': {
        title: 'Regular physical activity',
        detail:
          'Aim for at least 150 minutes of moderate activity per week, plus strength training twice weekly, unless your clinician advises otherwise.',
      },
      'journal-attention': {
        title: 'Review urgent journal entries',
        detail:
          'You have {count} journal {entries} flagged as needing attention. Discuss these with a clinician promptly.',
      },
      'start-journaling': {
        title: 'Start your health journal',
        detail:
          'Log symptoms, medications, and visits so Monday can track patterns and tailor recommendations over time.',
      },
      'journal-recent': {
        title: 'Log recent health updates',
        detail:
          'You have not added journal entries in the last 30 days. Brief updates help keep your timeline and insights current.',
      },
      'condition-followup': {
        title: 'Follow up on tracked conditions',
        detail:
          'You are tracking {count} condition(s). Share your journal summary with your care team at your next visit.',
      },
    },
  },
  appointment: {
    eyebrow: 'Next appointment',
    eyebrowEmpty: 'Appointments',
    badgeToday: 'Today',
    badgeTomorrow: 'Tomorrow',
    badgeInDays: 'In {days} days',
    datetimeToday: 'Today at {time}',
    datetimeTomorrow: 'Tomorrow at {time}',
    datetimeDefault: '{date} at {time}',
    doctor: 'Doctor',
    specialty: 'Specialty',
    location: 'Location',
    viewAll: 'View all appointments',
    nothingScheduled: 'Nothing scheduled',
    emptyText:
      'You do not have an upcoming visit on your calendar yet.',
    goToAppointments: 'Go to Appointments',
  },
  appointmentsPage: {
    eyebrow: 'Scheduling',
    title: 'Doctor appointments',
    subtitle: 'Calendar plus upcoming and past visits.',
    addAppointment: 'Add appointment',
    saved: 'Appointment saved — {doctor}, {specialty}.',
    calendarTitle: 'Calendar',
    calendarSubtitle: 'Tap a day to see visits on that date.',
    upcomingTitle: 'Upcoming',
    upcomingSubtitle: 'Soonest first.',
    pastTitle: 'Past visits',
    pastSubtitle: 'Newest first.',
    loading: 'Loading…',
    noUpcoming: 'No upcoming appointments.',
    noPast: 'No past appointments yet.',
    addModalTitle: 'Add appointment',
    modalIntro: 'Doctor, clinic, specialty, address, date and time.',
  },
  appointmentForm: {
    date: 'Date',
    time: 'Time',
    doctorName: 'Doctor name',
    clinicName: 'Clinic / hospital (optional)',
    specialty: 'Specialty',
    address: 'Address',
    notes: 'Notes (optional)',
    saving: 'Saving…',
    addAppointment: 'Add appointment',
    clearForm: 'Clear form',
  },
  appointmentCard: {
    fromJournal: 'From health journal',
    past: 'Past',
    upcoming: 'Upcoming',
    removing: 'Removing…',
    remove: 'Remove',
  },
  healthEntryCard: {
    medications: 'Medications:',
    severity: 'Severity:',
    clinicalSummary: 'Clinical summary:',
  },
  hypothesesPage: {
    eyebrow: 'Clinical insights',
    title: 'Hypotheses & diagnoses',
    subtitle:
      'Regenerate pulls the latest journal data into possible conditions and hypotheses.',
    regenerate: 'Regenerate hypotheses & conditions',
    regenerating: 'Regenerating…',
    loading: 'Loading insights…',
    tabDiagnoses: 'Diagnoses',
    tabHypotheses: 'Hypotheses',
    noHypothesesTitle: 'No hypotheses yet',
    noHypothesesText:
      'Add journal entries, then use Regenerate hypotheses & conditions in the header.',
    regenerateConfirm:
      'Replace all hypotheses with new ones from your current journal? Possible conditions will be recalculated from the same records.',
    regenerateTitleEmpty: 'Add journal entries first',
    regenerateTitle: 'Regenerate from current journal',
    regenerateFailed: 'Regeneration failed.',
    regenerateMessages: {
      needEntries:
        'Add journal entries first, then regenerate hypotheses and possible conditions.',
      success:
        'Regenerated {hypothesisCount} hypotheses from {journalEntryCount} journal entries across {areaCount} areas. Possible conditions use the same records.',
      noHypotheses:
        'Reviewed {journalEntryCount} journal entries but could not derive hypotheses — add more detail per body area and try again.',
    },
  },
  journalPage: {
    eyebrow: 'Journal',
    title: 'Health journal',
    subtitle:
      'Record symptoms, medications, and changes. Each entry is analyzed and linked to your health timeline.',
    newEntry: 'New entry',
    recordsTitle: 'Your records',
    recordsSubtitle: 'Longitudinal notes for your conditions, newest first.',
    loading: 'Loading records…',
    noRecordsTitle: 'No records yet',
    noRecordsText:
      'Click New entry in the header to log your first note.',
    entrySaved: 'Entry saved — classified as {classification}.',
    entrySavedTimeline: 'Added to your timeline.',
    newEntryModalTitle: 'New journal entry',
    newEntryModalIntro:
      'Log symptoms, medications, or visits. Monday classifies each entry and adds it to your timeline.',
  },
  diagnosis: {
    loading: 'Analyzing your journal for possible conditions…',
    empty:
      'Add journal entries describing your symptoms, body area, and medications to see possible conditions with percentages.',
    disclaimer:
      'Conditions are inferred from your full journal (including related entries in other body areas). Always confirm with a qualified clinician.',
    certaintyHigh: 'Likely',
    certaintyModerate: 'Leading',
    certaintyLow: 'Uncertain',
    seeSpecialist: 'See: {name}',
    whoToSee: 'Who to see:',
    crossBodyNote:
      'Scoring includes journal entries from other body areas when they may relate to the same condition.',
    uncertainNote:
      'No single match is dominant — compare variants and discuss with a clinician.',
    historyFit: 'History fit {score}/100',
    whySuggested: 'Why this was suggested',
    criteriaSupport: 'Criteria that support this diagnosis',
    criteriaAgainst: 'Criteria that argue against it',
    suggestedWorkup: 'Suggested workup to confirm or exclude',
    evidenceJournal: 'Evidence from your journal',
    notDocumented: 'Not yet documented — discuss with your clinician',
    certaintyReportHigh: 'Most likely match',
    certaintyReportModerate: 'Leading possibility',
    certaintyReportLow: 'Several possibilities — review all variants',
    rationale: {
      primaryScope: '{count} {entries} in {area}',
      crossScope: '{count} cross-area {entries}',
      scopeAnd: 'and',
      fullHistory: 'your full medical history',
      criteriaMet: ' {met} of {total} supporting criteria met in your journal.',
      exclusions: ' {count} exclusion {factors} present.',
      factor: 'factor',
      factors: 'factors',
      body: 'Precision score {score}/100 from {scope}, symptom patterns, and clinical criteria.{criteriaNote} Not a confirmed diagnosis — use confirm/exclude criteria below with your clinician.',
    },
    variantFooter: {
      journalIn: '{count} journal {entries} in {area}',
      crossFrom: '+ {count} from other body {areas}',
      hypothesisLine: 'Hypothesis: {pattern} · {confidence}',
    },
  },
  anamnesis: {
    title: 'Health history (anamnesis)',
    intro:
      'Describe your illness history in your own words—when symptoms started, tests, treatments, and changes over time. Monday will split this into journal entries and timeline events.',
    mainArea: 'Main body area / condition',
    mainAreaPlaceholder: 'e.g. Legs, lower back, left knee',
    mainAreaHint:
      'Used when a paragraph does not mention a specific area.',
    historyLabel: 'Your health history',
    historyHint:
      'Use paragraphs or bullet points—one item per event or time period works best.',
    previewTitle: 'Preview — {count} {entries}',
    previewEntry: 'journal entry',
    previewEntries: 'journal entries',
    importToJournal: 'Import to journal',
    noEntriesDetected:
      'No entries detected. Add more detail or use bullet points for separate events.',
    parseError: 'Could not parse text.',
    importSuccess: 'Imported {count} journal entries.',
    importFailed: 'Import failed.',
  },
  entryForm: {
    langHint:
      'English and Russian (Русский) are supported. Russian text is translated to English for analysis when you save.',
    translating: 'Translating and saving…',
    eventDate: 'When did this happen?',
    conditionArea: 'Body area / condition',
    entryType: 'What are you recording?',
    description: 'Full details',
    descriptionHint:
      'Write the full story here — what happened, when, and any test or treatment details.',
    title: 'Short title',
    titleHint:
      'A few words for quick scanning (e.g. “MRI — knee”). We can shorten this from your details when you save.',
    medications: 'Medications (name, dose, how often)',
    severity: 'Severity (optional)',
    clearSeverity: 'Clear',
    saveEntry: 'Save entry',
    saveHealthRecord: 'Save health record',
    savingAnalyzing: 'Saving & analyzing…',
    clearForm: 'Clear form',
    optionSymptom: 'Symptoms',
    optionChange: 'Change in condition',
    optionMedication: 'Medication / prescription',
    optionDoctorVisit: 'Doctor visit or advice',
    optionImaging: 'Test or imaging',
    optionOther: 'Other health note',
  },
  entryTypes: {
    symptom: 'Symptom report',
    medication: 'Medication update',
    change: 'Condition change',
    doctor_visit: 'Doctor visit',
    imaging: 'Imaging / test',
    other: 'Health note',
  },
  urgency: {
    monitor: 'Monitor',
    urgent: 'Urgent',
    emergency: 'Emergency',
    routine: 'Routine',
  },
  confidenceHypothesis: {
    exploratory: 'Exploratory',
    supported: 'Supported',
    stronglySupported: 'Strongly supported',
  },
  chartEntryTypes: {
    symptom: 'Symptoms',
    medication: 'Medication',
    change: 'Changes',
    doctor_visit: 'Doctor visits',
    imaging: 'Tests / imaging',
    other: 'Other notes',
  },
  classification: {
    emergencySeekCare: 'Emergency — seek care now',
    urgentContact: 'Urgent — contact clinician',
    postProcedureConcern: 'Post-procedure concern',
    surgeryProcedure: 'Surgery / procedure',
    hospitalCare: 'Hospital / ER care',
    testImaging: 'Test or imaging',
    medicationUpdate: 'Medication update',
    diagnosisVisit: 'Diagnosis / specialist visit',
    clinicalVisit: 'Clinical visit',
    weightLossSymptom: 'Weight loss (symptom)',
    weightBody: 'Weight / body composition',
    conditionImproving: 'Condition improving',
    conditionWorsening: 'Condition worsening',
    conditionChange: 'Condition change',
    symptomsFollowUp: 'Symptoms — follow up',
    persistentWorsening: 'Persistent or worsening symptoms',
    chronicOngoing: 'Ongoing / chronic condition',
    symptomLog: 'Symptom log',
    healthRecord: 'Health record',
  },
  journalFlags: {
    possible_emergency: 'Possible emergency',
    needs_attention: 'Needs attention',
    procedure_or_surgery: 'Procedure or surgery',
    hospital_care: 'Hospital care',
    worsening_or_persistent: 'Worsening or persistent',
    medication_started_or_changed: 'Medication change',
    clinical_encounter: 'Clinical encounter',
    high_severity_reported: 'High severity reported',
  },
  journalEntry: {
    severitySnippet: ' · severity {value}/10',
  },
  hypothesisPatterns: {
    urgent: 'Clinical attention',
    treatment_improvement: 'Treatment response',
    worsening: 'Worsening trend',
    recurring: 'Recurring symptoms',
    treatment_unclear: 'Treatment unclear',
    general: 'General pattern',
  },
  hypothesisCard: {
    journalMeta: '{count} journal {entries}',
    revisions: '{count} revisions',
    needsClinician: 'Needs clinician',
    prepareNotes: 'Prepare notes for doctor',
    whatThisMeans: 'What this means',
    whatToDoNext: 'What to do next',
    history: 'History',
    historyCreated: 'Created',
    historyUpdated: 'Updated',
    historyEntries: '+{count} journal {entries}',
    supportingEntries: 'Supporting journal entries ({count})',
    entry: 'entry',
    entries: 'entries',
    record: 'record',
    records: 'records',
  },
  hypothesisContent: {
    dateRangeJournal: 'your journal',
    summary: {
      urgent:
        'Based on {count} journal {entries} ({range}) for {area}, there are signals that may need prompt clinical attention. Confidence: {confidence}. This is generated from your self-reported data, not a diagnosis.',
      worsening:
        'Your logged symptoms for {area} suggest a possible worsening trend across {count} {records} ({range}). Confidence: {confidence}.',
      treatment_improvement:
        'Medication or treatment changes for {area} appear alongside improvement notes in {count} related {entries} ({range}). Confidence: {confidence}.',
      recurring:
        'Repeated symptom or change entries for {area} ({count} items, {range}) suggest an ongoing pattern worth discussing with a clinician. Confidence: {confidence}.',
      treatment_unclear:
        'You started or changed treatment for {area}, but outcomes are not yet clear in {count} related {entries} ({range}). Confidence: {confidence}.',
      general:
        'Monday identified a trackable pattern for {area} from {count} journal {entries} ({range}). Confidence: {confidence}.',
    },
    recommendations: {
      emergencyUnshift:
        'At least one journal entry was flagged as emergency-level — seek immediate care if still applicable.',
      urgent: [
        'Contact your doctor, urgent care, or emergency services if symptoms are severe or sudden.',
        'Bring this summary and your journal printout to your appointment.',
        'Do not delay care if you feel unsafe or symptoms are rapidly worsening.',
      ],
      worsening: [
        'Schedule a clinician visit to review whether treatment should be adjusted.',
        'Continue logging severity daily until your appointment.',
        'Note any new triggers, medications, or limitations in your journal.',
      ],
      treatment_improvement: [
        'Keep tracking symptoms to confirm improvement is sustained.',
        'Share positive and negative effects of treatment at your next visit.',
        'Avoid stopping prescribed medication without medical advice.',
      ],
      recurring: [
        'Discuss frequency, triggers, and impact on daily life with your clinician.',
        'Consider a structured symptom diary for the next 2–4 weeks.',
        'Review prior tests or imaging mentioned in your journal at follow-up.',
      ],
      treatment_unclear: [
        'Log weekly updates on symptoms and side effects while on new treatment.',
        'Book a follow-up to assess whether the treatment is working.',
        'Record exact medication names, doses, and start dates in the journal.',
      ],
      general: [
        'Continue regular journaling for this body area.',
        'Discuss this pattern at your next routine or scheduled visit.',
        'Add doctor visits, test results, and medication changes when they occur.',
      ],
    },
    critical: {
      emergency: 'Journal includes emergency-level entries.',
      urgent: 'Urgent signals detected in your health journal.',
      worseningUrgent: 'Worsening trend with elevated urgency in recent logs.',
    },
  },
  diagnosisFlagKinds: {
    body_area: 'Body area',
    keyword: 'Symptom',
    medication: 'Medication',
    named_condition: 'Named',
    hypothesis: 'Hypothesis',
    urgency: 'Urgency',
    journal_flag: 'Journal flag',
    cross_body: 'Cross-area',
  },
  specialist: {
    areaPhrase: ' for {area}',
    visitAdvice:
      'Consider seeing a {clinician} ({specialty}){areaPhrase} — {reason}. This is a routing suggestion only, not a diagnosis.',
    bullet:
      'Consider a visit with a {clinician} ({specialty}): {reason}.',
    orthopedics: {
      clinician: 'Orthopedist',
      specialty: 'Orthopedics',
      reason: 'bones, joints, or limb symptoms',
    },
    dermatology: {
      clinician: 'Dermatologist',
      specialty: 'Dermatology',
      reason: 'skin symptoms',
    },
    cardiology: {
      clinician: 'Cardiologist',
      specialty: 'Cardiology',
      reason: 'chest or heart-related symptoms',
    },
    gastroenterology: {
      clinician: 'Gastroenterologist',
      specialty: 'Gastroenterology',
      reason: 'digestive or abdominal symptoms',
    },
    neurology: {
      clinician: 'Neurologist',
      specialty: 'Neurology',
      reason: 'headache or neurologic symptoms',
    },
    endocrinology: {
      clinician: 'Endocrinologist',
      specialty: 'Endocrinology',
      reason: 'metabolic or weight-related concerns',
    },
    pulmonology: {
      clinician: 'Pulmonologist',
      specialty: 'Pulmonology',
      reason: 'breathing or lung symptoms',
    },
    urology: {
      clinician: 'Urologist',
      specialty: 'Urology',
      reason: 'urinary or kidney-related symptoms',
    },
    gynecology: {
      clinician: 'Gynecologist',
      specialty: 'Gynecology',
      reason: "women's health or pelvic symptoms",
    },
    ophthalmology: {
      clinician: 'Ophthalmologist',
      specialty: 'Ophthalmology',
      reason: 'eye or vision symptoms',
    },
    ent: {
      clinician: 'ENT specialist',
      specialty: 'ENT',
      reason: 'ear, nose, or throat symptoms',
    },
    psychiatry: {
      clinician: 'Psychiatrist or mental health clinician',
      specialty: 'Psychiatry',
      reason: 'mental health or mood symptoms',
    },
    primaryCare: {
      clinician: 'Primary care physician',
      specialty: 'Primary care',
      reason: 'ongoing concerns tracked for this area',
    },
  },
  doctorNotes: {
    title: 'Notes for your doctor',
    intro:
      'Review and edit before printing. This summary is built from your journal entries related to this hypothesis.',
    copy: 'Copy text',
    copied: 'Copied',
    print: 'Print',
    notesLabel: 'Doctor visit notes',
    summaryTitle: 'SUMMARY FOR CLINICIAN',
    preparedWith: 'Prepared with Monday Health Journal',
    generated: 'Generated: {date}',
    baselineTitle: 'PATIENT BASELINE',
    reasonTitle: 'REASON FOR THIS SUMMARY',
    suggestedDoctorTitle: 'SUGGESTED TYPE OF DOCTOR',
    contextTitle: 'PATIENT-REPORTED CONTEXT',
    discussionTitle: 'SUGGESTED DISCUSSION POINTS',
    journalSectionTitle: 'HEALTH JOURNAL — {area}',
    journalSectionMeta: '({count} {entries}, chronological)',
    noEntries: '(No journal entries found for this area.)',
    patternConfidence: 'Pattern confidence: {confidence}',
    disclaimerTitle: 'DISCLAIMER',
    disclaimerBody:
      'This document was generated from self-reported journal entries stored locally on the patient\'s device. It is not a medical diagnosis and does not replace clinical assessment.',
    signatureLine: 'Signature / date: _______________________________',
  },
  hypothesisTitles: {
    urgent: '{area}: clinical attention may be needed based on urgent journal signals',
    treatment_improvement:
      '{area}: treatment may be contributing to reported improvement',
    worsening: '{area}: symptoms may be worsening over the tracked period',
    recurring: '{area}: recurring symptoms suggest ongoing monitoring',
    treatment_unclear: '{area}: new treatment started — response still unclear',
    general:
      '{area}: health pattern worth tracking based on journal activity',
  },
  clinicalModel: {
    title: 'Your clinical model',
    emptySummary:
      'No journal data yet. As you log symptoms, medications, visits, and tests, Monday will build a longitudinal clinical model summarizing patterns across the body areas you track.',
    keyFactors: 'Key factors',
    summary: {
      intro:
        'Synthesized from {count} journal {entries} ({range}) across {areas} tracked {areasLabel}.',
      area: 'area',
      areas: 'areas',
      rangeThrough: '{start} through {end}',
      mostActivity: 'Most activity: {topAreas}.',
      urgentFlags:
        '{count} {entries} urgent or emergency-level attention—review those records with a clinician.',
      entryFlags: 'entry flags',
      entriesFlag: 'entries flag',
      noUrgent: 'No urgent or emergency flags in the current journal snapshot.',
      disclaimer:
        'This model summarizes patterns in your logged data; it is not a medical diagnosis.',
    },
    entryTypes: {
      symptom: 'symptoms',
      medication: 'medication updates',
      change: 'condition changes',
      doctorVisit: 'doctor visits',
      imaging: 'tests / imaging',
      other: 'notes',
    },
    factor: {
      clusterIntro: '{count} journal {entries} ({range}).',
      latestUrgency: 'Latest assessed urgency: {urgency}.',
      avgSeverity: 'Average self-reported severity: {avg}/10.',
      trendRising: 'Severity scores trend upward over this period.',
      trendImproving: 'Severity scores trend downward over this period.',
      trendStable: 'Reported severity has been relatively stable.',
      worseningNotes: '{count} {entries} worsening or persistence.',
      entryNotes: 'entry notes',
      entriesNote: 'entries note',
      activityMix: 'Activity mix: {mix}.',
    },
    factors: {
      attentionName: 'Attention signals',
      attentionDesc:
        '{count} journal {has} urgent or emergency-level urgency{including}{areas}. Prioritize follow-up with a care provider for these logs.',
      entryHas: 'entry has',
      entriesHave: 'entries have',
      includingAreas: ' (including {areas})',
      medicationName: 'Medication activity',
      medicationDesc:
        '{count} medication-related {entries} logged. Track dose changes, side effects, and timing alongside symptom entries for clearer treatment response patterns.',
      encountersName: 'Clinical encounters',
      encountersDesc:
        '{count} doctor {visits} recorded. Visit notes help anchor timeline context when correlating tests, treatments, and symptom changes.',
      visit: 'visit',
      visits: 'visits',
    },
  },
}
