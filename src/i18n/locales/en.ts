export default {
  nav: {
    main: 'Main navigation',
    dashboard: 'Dashboard',
    hypotheses: 'Hypotheses',
    appointments: 'Appointments',
    journal: 'Journal',
    openMenu: 'Open menu',
    settings: 'Preferences',
    preferences: 'Preferences',
  },
  language: {
    label: 'Language',
    en: 'English',
    de: 'German',
    ru: 'Russian',
  },
  theme: {
    appearance: 'Appearance',
    dark: 'Dark',
    light: 'Light',
    darkHint: 'Dark mode — click to switch to light',
    lightHint: 'Light mode — click to switch to dark',
  },
  aiInsights: {
    toggle: 'AI insights',
    on: 'On',
    hintOn:
      'Journal analysis, hypotheses, and diagnosis text use AI when you regenerate or add entries.',
    hintOff: 'Enable to send journal text to your configured LLM (dev proxy).',
    banner:
      'AI insights are on — symptom analysis runs on new entries; regenerate to refresh hypotheses; diagnoses are ranked and explained by AI from your journal.',
    unavailable:
      'AI insights need LLM_API_KEY in .env.local and npm run dev (see .env.example).',
  },
  notifications: {
    title: 'Notifications',
    bellLabel: 'Notifications ({count} unread)',
    empty: 'No notifications yet.',
    markAllRead: 'Mark all read',
    dismiss: 'Dismiss',
    regeneration: {
      slowToastTitle: 'Still working…',
      slowToastMessage:
        'Regeneration can take a while. You can use other pages — we will notify you when it is finished.',
      slowNotificationTitle: 'Regenerating insights',
      slowNotificationMessage:
        'Hypotheses and diagnoses are being rebuilt from your journal.',
      successTitle: 'Insights ready',
      successToastMessage:
        'Hypotheses and diagnoses are ready. Open Hypotheses & diagnoses to review.',
      errorTitle: 'Regeneration failed',
    },
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
      journalEntriesDetail:
        'Symptoms, visits, medications, and notes you have logged — {days} days of tracking on Monday.',
      last30Days: 'Last 30 days',
      recentActivity: 'Recent activity',
      last30DaysDetail:
        'Entries dated in the rolling past month — useful for spotting short-term changes.',
      daysTracked: 'Days tracked',
      daysTrackedHint: 'Since first entry',
      daysTrackedDetail:
        'Calendar span from your earliest logged event ({date}) through today.',
      daysTrackedEmpty:
        'Starts counting once you add your first journal entry.',
      trackedConditions: 'Tracked conditions',
      bodyAreasHint: 'Body areas / issues',
      trackedConditionsDetail: 'Areas with journal activity: {areas}.',
      trackedConditionsEmpty:
        'Condition areas appear here as you log entries with body-region tags.',
      avgSeverity: 'Avg severity',
      severityHint: 'When reported (1–10)',
      avgSeverityDetail:
        'Mean of explicit 1–10 ratings across entries (currently {avg}).',
      avgSeverityEmpty:
        'Add severity scores in journal entries to see an average here.',
      timelineEvents: 'Timeline events',
      timelineEventsHint: 'From your journal',
      timelineEventsDetail:
        'Structured events extracted from entries for your longitudinal timeline.',
      hypotheses: 'Hypotheses',
      hypothesesHint: 'Possible conditions',
      hypothesesDetail:
        'AI- or rules-based possibilities generated from patterns in your journal.',
      needsAttention: 'Needs attention',
      attentionHint: 'Urgent or emergency',
      attentionDetail:
        'Flagged entries below — open each link or view all flagged records.',
      attentionEmptyDetail:
        'No urgent or emergency-level entries right now. Keep logging if symptoms change.',
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
    clinicalModelRefreshing: 'Refreshing clinical model with AI…',
    clinicalModelHint:
      'Log symptoms and visits in the Journal to populate condition-specific factors.',
    generateDoctorNotes: 'Generate notes for your doctor',
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
    height: 'Height (cm)',
    weight: 'Weight (kg)',
    heightPlaceholder: 'e.g. 175',
    weightPlaceholder: 'e.g. 72',
    heightValue: '{value} cm',
    weightValue: '{value} kg',
    bodyMetricsTitle: 'Body metrics & BMI',
    bmiAddHeightWeight: 'Add height and weight in Edit profile to see BMI.',
    bmiUnavailable: 'BMI could not be calculated from your height and weight.',
    bmi: 'BMI',
    bmiValue: '{value}',
    bmiScaleAria: 'BMI {value}, {category}',
    bmiCategory: {
      underweight: 'Underweight',
      normal: 'Healthy range',
      overweight: 'Overweight',
      obese: 'Obese',
    },
    bmiCategoryShort: {
      underweight: 'Low',
      normal: 'Healthy',
      overweight: 'High',
      obese: 'Very high',
    },
    bmiHint: {
      underweight:
        'Below the usual healthy range for adults. Worth discussing with a clinician if unintended.',
      normal: 'Within the usual healthy range for adults (BMI 18.5–24.9).',
      overweight:
        'Above the usual healthy range. Lifestyle or clinical review may help.',
      obese:
        'Well above the usual healthy range. A clinician can help plan next steps.',
    },
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
    heroSubtitle:
      'Personal tips to stay on top of screenings, habits, and your journal.',
    statPriority: 'priority',
    statTotal: 'tips for you',
    summaryBold: 'Tailored for you.',
    summary:
      ' Based on your age, profile, and what you have logged in your journal.',
    disclaimer:
      'General guidance—not a substitute for advice from your clinician.',
    sectionPriority: 'Worth doing soon',
    sectionMore: 'Also good to know',
    gotIt: 'Got it, thanks',
    viewEntries: 'Open in your journal',
    viewAllAttention: 'View all flagged entries',
    viewAllAttentionCount: 'View all {count} flagged entries',
    openAttentionJournal: 'Open flagged entries in journal',
    viewInJournal: 'Go to journal',
    emptyTitle: 'We need a bit more about you',
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
    backToDetails: 'Appointment',
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
    edit: 'Edit',
    medications: 'Medications:',
    severity: 'Severity:',
    clinicalSummary: 'Clinical summary:',
  },
  hypothesesPage: {
    eyebrow: 'Clinical insights',
    title: 'Hypotheses & diagnoses',
    subtitle:
      'Regenerate pulls the latest journal data into possible conditions and hypotheses.',
    generate: 'Generate hypotheses & conditions',
    generateTitle: 'Build hypotheses and possible conditions from your journal',
    regenerate: 'Regenerate hypotheses & conditions',
    regenerating: 'Regenerating…',
    loading: 'Loading insights…',
    notGeneratedTitle: 'Nothing generated yet',
    notGeneratedText:
      'Hypotheses and possible conditions are built from your journal when you run Generate. Nothing is created automatically when you open this page.',
    tabDiagnoses: 'Diagnoses',
    tabHypotheses: 'Hypotheses',
    noHypothesesTitle: 'No hypotheses yet',
    noHypothesesText:
      'Add journal entries, then use Regenerate hypotheses & conditions in the header.',
    regenerateConfirmTitle: 'Regenerate insights?',
    regenerateConfirmMessage:
      'This replaces all hypotheses with new ones from your current journal. Possible conditions will be recalculated from the same records.',
    regenerateConfirmAction: 'Regenerate',
    regenerateSlowHint:
      'Regeneration is still running. You can leave this page — we will notify you when hypotheses and diagnoses are ready.',
    regenerateTitleEmpty: 'Add journal entries first',
    regenerateTitle: 'Regenerate from current journal',
    regenerateFailed: 'Regeneration failed.',
    regenerateMessages: {
      aiRequired:
        'Turn on AI insights in the navigation bar and configure your LLM API key to generate hypotheses and diagnoses.',
      needEntries:
        'Add journal entries first, then regenerate hypotheses and possible conditions.',
      success:
        'Regenerated {hypothesisCount} hypotheses from {journalEntryCount} journal entries across {areaCount} areas. Possible conditions use the same records.',
      noHypotheses:
        'Reviewed {journalEntryCount} journal entries but could not derive hypotheses — add more detail per body area and try again.',
      successNoDiagnoses:
        'Created {hypothesisCount} hypotheses from {journalEntryCount} journal entries, but the AI could not suggest possible conditions to discuss — add more journal detail or try Generate possible conditions on the Diagnoses tab.',
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
    entryUpdated: 'Entry updated — classified as {classification}.',
    newEntryModalTitle: 'New journal entry',
    newEntryModalIntro:
      'Log symptoms, medications, or visits. Monday classifies each entry and adds it to your timeline.',
    editEntryModalTitle: 'Edit journal entry',
    editEntryModalIntro:
      'Change the date or text. Monday re-analyzes the entry and updates your timeline.',
    attentionFilterBanner:
      'Showing journal entries flagged as urgent or emergency — the same records counted under Needs attention on your dashboard.',
    showAllEntries: 'Show all entries',
    backNavLabel: 'Leave single entry view',
    backToAllEntries: 'Back to all entries',
    backToAttentionEntries: 'Back to flagged entries',
    singleEntryHint: 'You are viewing one journal entry. Use the link above to see your full journal.',
    singleEntryTitle: 'Journal entry',
    singleEntrySubtitle: 'Opened from a recommendation or link — return to the full list to browse other records.',
    entryNotFoundTitle: 'Entry not found',
    entryNotFoundText:
      'This journal entry may have been removed or the link is outdated. Go back to see all records.',
    attentionRecordsTitle: 'Entries needing attention',
    attentionRecordsSubtitle:
      '{count} urgent or emergency-level records from your journal.',
    noAttentionTitle: 'No urgent entries right now',
    noAttentionText:
      'None of your journal records are currently flagged as urgent or emergency. You can view all entries instead.',
  },
  diagnosis: {
    loading: 'Analyzing your journal for possible conditions…',
    refreshing: 'Updating possible conditions…',
    generateAction: 'Generate possible conditions',
    generatedSuccess:
      'Generated possible conditions for {count} body area(s) from your journal.',
    empty:
      'Use Generate on this page (with AI insights on) to build possible conditions from your journal.',
    emptyNotGeneratedTitle: 'Possible conditions not generated yet',
    emptyNotGeneratedHint:
      'Use Generate in the page header (with AI insights on) to build hypotheses and possible conditions together.',
    emptyIncompleteTitle: 'Possible conditions were not saved',
    emptyIncompleteHint:
      'Your hypotheses are saved, but possible conditions did not finish generating (for example after an interrupted run). Use the button below or Regenerate in the header.',
    emptyAiOffTitle: 'AI insights are off',
    emptyAiOffHint:
      'Turn on AI insights in the navigation bar to generate possible conditions from your journal.',
    emptyNeedEntriesTitle: 'Add journal entries first',
    emptyNeedEntriesHint:
      'Possible conditions are built from your health journal. Log symptoms, visits, or test results, then generate again.',
    emptyNoSuggestionsTitle: 'No possible conditions suggested',
    emptyNoSuggestionsHint:
      'The AI reviewed your journal and hypotheses but could not name exploratory conditions to discuss with a clinician. This is not a diagnosis — try adding more specific symptoms, timing, and test results, then generate again.',
    emptyNeedsMoreJournalTitle: 'More journal detail may help',
    emptyNeedsMoreJournalHint:
      'With only a brief journal record, the AI may not suggest ranked possible conditions. Add entries for symptoms, medications, imaging, or visits, then tap Generate possible conditions.',
    emptyFailedTitle: 'Could not generate possible conditions',
    emptyFailedHint:
      'Something went wrong while calling the AI. Check your API key and network, then try again.',
    outcomeBanner: {
      no_suggestions:
        'No possible conditions were suggested from your current journal. Add more detail and try again.',
      needs_more_journal:
        'Add more journal entries or richer symptom notes, then generate possible conditions again.',
      failed: 'Possible conditions could not be generated. Check AI settings and try again.',
    },
    disclaimer:
      'Possible conditions are exploratory suggestions from AI based on your journal text. Always confirm with a qualified clinician.',
    aiRankedNote:
      'Percentages and condition names were generated by AI from your de-identified journal entries only.',
    ruleBasedNote:
      'Turn on AI insights and use Generate to create possible conditions.',
    aiBadge: 'AI ranked',
    certaintyHigh: 'Likely',
    certaintyModerate: 'Leading',
    certaintyLow: 'Uncertain',
    seeSpecialist: 'See: {name}',
    whoToSee: 'Who to see:',
    crossBodyNote:
      'We also used related journal entries from other body areas when they may fit the same condition.',
    uncertainNote:
      'No single condition stands out — compare the options below and discuss with a clinician.',
    journalMatch: {
      strong: 'Closely matches your journal',
      partial: 'Partly matches your journal',
      limited: 'Limited match in your journal so far',
    },
    whySuggested: 'Why we suggested this',
    criteriaSupport: 'Criteria that support this diagnosis',
    criteriaAgainst: 'Criteria that argue against it',
    suggestedWorkup: 'Suggested workup to confirm or exclude',
    evidenceJournal: 'Evidence from your journal',
    variantTabsLabel: 'Possible conditions for {area}',
    notDocumented: 'Not yet documented — discuss with your clinician',
    certaintyReportHigh: 'Most likely match',
    certaintyReportModerate: 'Leading possibility',
    certaintyReportLow: 'Several possibilities — review all variants',
    rationale: {
      primaryScope: '{count} journal {entries} about {area}',
      crossScope: '{count} related {entries} from other body areas',
      scopeAnd: 'and',
      fullHistory: 'your health journal',
      intro: 'We looked at {scope}.',
      symptoms_all:
        'Typical signs for this condition show up in what you logged ({typicalMet} of {typicalTotal} common signs, plus supporting journal checks).',
      symptoms_some:
        'Only part of the picture is in your journal ({typicalMet} of {typicalTotal} typical signs; {met} of {total} supporting checks). Log more detail if you can.',
      symptoms_none:
        'Few typical signs for this condition appear in your journal so far — percentages may change if you add more entries.',
      exclusions:
        '{count} journal notes may point away from this condition—worth discussing with your clinician.',
      disclaimer:
        'This is a suggestion to explore with a clinician, not a confirmed diagnosis.',
    },
    variantFooter: {
      journalIn: '{count} journal {entries} in {area}',
      crossFrom: '+ {count} from other body {areas}',
      hypothesisLine: 'Hypothesis: {pattern} · {confidence}',
    },
  },
  diseaseInsight: {
    aboutTitle: 'What is this condition?',
    whatYouLoggedTitle: 'What you logged that supports this',
    whatYouLoggedIntro:
      'Your journal entries linked to this possible condition. Each note includes an AI explanation of what in your text connects to this disease — not a confirmed diagnosis.',
    whyThisSupports: 'Why this supports this possibility',
    supportReason: {
      symptom_logged:
        'You logged symptoms or changes that match what we look for with this condition.',
      imaging_or_test:
        'Your note documents imaging, labs, or test results — not just an appointment.',
      finding_in_visit_note:
        'Your visit note includes specific findings or results, not only that you went.',
      medication_change:
        'Your medication note is relevant to how this condition is tracked.',
      explicit_diagnosis:
        'Your journal mentions a diagnosis or confirmed condition name.',
      journal_pattern: 'Your journal entry matches patterns for this condition.',
    },
    noJournalProofYet:
      'None of your journal entries clearly match yet. Add symptom detail or see typical signs below.',
    typicalSymptomsTitle: 'Typical signs for this condition',
    typicalSymptomsIntro:
      'For reference — what doctors often look for. Your own notes above are what we used to score this match.',
    journalCompareTitle: 'Gaps in your journal',
    journalCompareIntro:
      'Common signs for this condition that you have not logged yet (you may still have them).',
    missingToConfirmTitle: 'Not in your journal yet',
    missingToConfirmHint:
      'These signs are often seen with this condition but are not in your logged entries. If you have them, mention them at your visit or add a journal note.',
    notReportedTitle: 'Not in your journal yet',
    notReportedHint:
      'Absence in your log does not rule out a symptom — mention anything relevant at your visit.',
    cautionTitle: 'Conflicting signals in your journal',
    whenToSeekTitle: 'When to seek care',
    possibleConditionsTitle: 'Possible conditions to discuss',
    possibleConditionsHint:
      'From your journal and body area — percentages are estimates, not a diagnosis.',
    variantPercent: '{percent}% match',
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
  translation: {
    skippedTitle: 'Saved in Russian',
    skippedMessage:
      'Translation was unavailable (AI rate limit or offline). Your entry was saved in Russian. Wait a few minutes or check your OpenAI quota, then try again.',
  },
  entryForm: {
    langHint:
      'English and Russian (Русский) are supported. With the app in English, English entries are saved as-is. Russian text is translated when you save.',
    translating: 'AI translating and saving…',
    eventDate: 'When did this happen?',
    conditionArea: 'Body area / condition',
    conditionAreaOptional: 'Body area (optional)',
    conditionAreaHintRequired: 'Which part of the body is affected?',
    conditionAreaHintOptional:
      'Optional — leave blank for whole-body records like blood tests, or note a region (e.g. knee).',
    entryType: 'What are you recording?',
    entryTypeHint: 'Pick the option that best matches — this helps organize your journal.',
    typeGroupFeel: 'How you feel',
    typeGroupCare: 'Care & treatment',
    typeGroupTests: 'Tests & procedures',
    typeGroupOther: 'Other',
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
    saveChanges: 'Save changes',
    savingAnalyzing: 'Saving & analyzing…',
    clearForm: 'Clear form',
    validationMissingBody: 'Please enter the body area or condition affected.',
    validationMissingCore: 'Please fill in the short title and full details.',
    validationMedication: 'Please list the medication name and dosage.',
    types: {
      symptom: {
        label: 'Symptoms',
        hint: 'Pain, discomfort, or how you feel in a body area',
      },
      change: {
        label: 'Change in condition',
        hint: 'Getting better, worse, or a new development',
      },
      medication: {
        label: 'Medication',
        hint: 'Started, stopped, or changed a drug',
      },
      doctor_visit: {
        label: 'Doctor visit',
        hint: 'Appointment, advice, or follow-up (not surgery)',
      },
      lab_test: {
        label: 'Blood test / lab results',
        hint: 'Blood work, panels, or other lab values — body area optional',
      },
      imaging: {
        label: 'Imaging scan',
        hint: 'MRI, X-ray, CT, ultrasound, etc.',
      },
      surgery: {
        label: 'Surgery or procedure',
        hint: 'Operation, procedure, or hospital treatment',
      },
      other: {
        label: 'Other note',
        hint: 'Only if nothing else fits',
      },
    },
  },
  entryTypes: {
    symptom: 'Symptom report',
    medication: 'Medication update',
    change: 'Condition change',
    doctor_visit: 'Doctor visit',
    imaging: 'Imaging study',
    lab_test: 'Lab results',
    surgery: 'Surgery / procedure',
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
    imaging: 'Imaging',
    lab_test: 'Lab results',
    surgery: 'Surgery',
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
  doctorSpecialty: {
    primary_care: 'Family / primary care doctor',
    orthopedics: 'Orthopedist (bones & joints)',
    dermatology: 'Dermatologist (skin)',
    cardiology: 'Cardiologist (heart)',
    gastroenterology: 'Gastroenterologist (digestive)',
    neurology: 'Neurologist',
    endocrinology: 'Endocrinologist (hormones & metabolism)',
    pulmonology: 'Pulmonologist (lungs)',
    urology: 'Urologist',
    gynecology: 'Gynecologist',
    ophthalmology: 'Ophthalmologist (eyes)',
    ent: 'ENT specialist (ear, nose, throat)',
    psychiatry: 'Psychiatrist / mental health',
    rheumatology: 'Rheumatologist (joints & autoimmune)',
  },
  doctorNotes: {
    title: 'Notes for your doctor',
    specialtyLabel: 'Which doctor is this for?',
    preparedForSpecialty: 'Prepared for: {specialty}',
    specialtyFocus: {
      primary_care:
        'Notes emphasize overall care, medications, prevention, and referrals.',
      orthopedics:
        'Notes emphasize pain, mobility, joints, spine, imaging, and physical therapy.',
      dermatology: 'Notes emphasize skin symptoms, rashes, and treatments tried.',
      cardiology: 'Notes emphasize chest/heart symptoms and cardiovascular risk.',
      gastroenterology: 'Notes emphasize GI symptoms, diet, and digestive meds.',
      neurology: 'Notes emphasize headache, numbness, dizziness, and neurologic symptoms.',
      endocrinology: 'Notes emphasize weight, glucose, thyroid, and metabolic concerns.',
      pulmonology: 'Notes emphasize cough, breathlessness, and lung treatments.',
      urology: 'Notes emphasize urinary symptoms and kidney/bladder concerns.',
      gynecology: "Notes emphasize pelvic and women's health topics.",
      ophthalmology: 'Notes emphasize vision and eye symptoms.',
      ent: 'Notes emphasize ear, nose, throat, and sinus symptoms.',
      psychiatry: 'Notes emphasize mood, anxiety, sleep, and mental health care.',
      rheumatology: 'Notes emphasize inflammatory joint symptoms and stiffness.',
    },
    clinicalTitle: 'Visit brief from your clinical model',
    clinicalIntro:
      'A clinician-oriented summary from your whole journal and clinical model. Review and edit before printing.',
    clinicalGenerating: 'Building your visit brief with AI…',
    clinicalModelBadge: '(From your clinical model and journal)',
    clinicalModelSectionTitle: 'CLINICAL MODEL SUMMARY',
    clinicalModelFactorsTitle: 'KEY FACTORS',
    clinicalModelAiFactorsTitle: 'PRIORITY THEMES (AI)',
    clinicalJournalSectionTitle: 'RECENT JOURNAL ENTRIES ({count} total)',
    clinicalJournalTruncated:
      '(Showing {shown} most recent entries of {total} — full journal in Monday.)',
    clinicalNoJournal: 'Add journal entries before generating doctor notes.',
    clinicalDiscussReview: 'Review the clinical model themes above against current symptoms.',
    clinicalDiscussTrajectory: 'Discuss whether patterns are improving, stable, or worsening.',
    generating: 'Building a clinician-oriented summary with AI…',
    intro:
      'Review and edit before printing. With AI insights on, this is a synthesized visit brief—not a raw journal export.',
    aiSynthesized: '(AI-synthesized visit brief — verify against your journal)',
    aiChiefConcernTitle: 'CHIEF CONCERN',
    aiHypothesisTitle: 'FOCUS HYPOTHESIS',
    aiClinicalPictureTitle: 'CLINICAL PICTURE (synthesized)',
    aiTimelineTitle: 'KEY TIMELINE',
    aiMedicationsTitle: 'MEDICATIONS & TREATMENTS (from journal)',
    aiRedFlagsTitle: 'RED FLAGS / URGENCY',
    aiQuestionsTitle: 'QUESTIONS FOR THE CLINICIAN',
    aiEvidenceNote:
      'Based on {count} journal entries for {area}. Full entries remain in Monday if needed during the visit.',
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
    aiBadge: 'AI-refined from your journal',
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
      imaging: 'imaging',
      labTest: 'lab results',
      surgery: 'surgeries / procedures',
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
