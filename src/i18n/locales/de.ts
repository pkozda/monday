export default {
  nav: {
    main: 'Hauptnavigation',
    dashboard: 'Dashboard',
    hypotheses: 'Hypothesen',
    appointments: 'Termine',
    journal: 'Journal',
    openMenu: 'Menü öffnen',
    settings: 'Einstellungen',
    preferences: 'Einstellungen',
  },
  language: {
    label: 'Sprache',
    en: 'Englisch',
    de: 'Deutsch',
    ru: 'Russisch',
  },
  theme: {
    appearance: 'Darstellung',
    dark: 'Dunkel',
    light: 'Hell',
    darkHint: 'Dunkelmodus — zum Hellmodus wechseln',
    lightHint: 'Hellmodus — zum Dunkelmodus wechseln',
  },
  aiInsights: {
    toggle: 'KI-Einblicke',
    on: 'An',
    hintOn:
      'Tagebuch und Hypothesen nutzen KI bei Regenerieren oder neuen Einträgen.',
    hintOff: 'Aktivieren, um Tagebuchtext an das konfigurierte LLM zu senden (Dev-Proxy).',
    banner:
      'KI-Einblicke sind aktiv — neue Einträge werden analysiert; Regenerieren aktualisiert Hypothesen aus dem Tagebuch.',
    unavailable:
      'KI benötigt LLM_API_KEY in .env.local und npm run dev (siehe .env.example).',
  },
  notifications: {
    title: 'Benachrichtigungen',
    bellLabel: 'Benachrichtigungen ({count} ungelesen)',
    empty: 'Noch keine Benachrichtigungen.',
    markAllRead: 'Alle gelesen',
    dismiss: 'Schließen',
    regeneration: {
      slowToastTitle: 'Noch in Arbeit…',
      slowToastMessage:
        'Die Neu-Generierung kann dauern. Sie können andere Seiten nutzen — wir benachrichtigen Sie nach Abschluss.',
      slowNotificationTitle: 'Einblicke werden neu generiert',
      slowNotificationMessage:
        'Hypothesen werden aus Ihrem Tagebuch neu erstellt.',
      successTitle: 'Hypothesen bereit',
      successToastMessage:
        'Hypothesen sind fertig. Öffnen Sie die Seite Hypothesen.',
      errorTitle: 'Neu-Generierung fehlgeschlagen',
    },
    doctorNotes: {
      progressToastTitle: 'Arztnotizen werden erstellt…',
      progressToastMessage:
        'Sie können weiter browsen — wir benachrichtigen Sie, sobald die Notizen fertig sind.',
      progressNotificationTitle: 'Arztnotizen in Arbeit',
      progressNotificationMessage:
        'Ihr Besuchsüberblick wird aus Tagebuch und klinischem Modell erstellt.',
      readyTitle: 'Arztnotizen bereit',
      readyToastMessage:
        'Öffnen Sie die Benachrichtigung, um Ihre Notizen anzuzeigen und zu kopieren.',
      errorTitle: 'Arztnotizen konnten nicht erstellt werden',
    },
  },
  common: {
    close: 'Schließen',
    cancel: 'Abbrechen',
    save: 'Speichern',
    loading: 'Laden…',
    saving: 'Speichern…',
    add: 'Hinzufügen',
    edit: 'Bearbeiten',
    remove: 'Entfernen',
    preview: 'Vorschau',
    import: 'Importieren',
    importing: 'Importieren…',
    goToJournal: 'Zum Journal',
    goToDashboard: 'Zum Dashboard',
    viewAll: 'Alle anzeigen',
    priority: 'Priorität',
    see: 'Siehe',
    expandToSeeAll: '+{count} weitere — aufklappen für alle',
  },
  dashboard: {
    eyebrow: 'Gesundheitsübersicht',
    title: 'Dashboard',
    subtitle: 'Ihre Gesundheitsübersicht — Profil, Statistiken und Trends',
    loading: 'Dashboard wird geladen…',
    overviewTitle: 'Übersicht',
    overviewSubtitle: 'Wichtige Kennzahlen aus Ihrem Gesundheitsjournal',
    stats: {
      journalEntries: 'Journal-Einträge',
      allTime: 'Gesamt',
      journalEntriesDetail:
        'Symptome, Besuche, Medikamente und Notizen — {days} Tage Tracking mit Monday.',
      last30Days: 'Letzte 30 Tage',
      recentActivity: 'Aktuelle Aktivität',
      last30DaysDetail:
        'Einträge im rollierenden letzten Monat — gut für kurzfristige Veränderungen.',
      daysTracked: 'Tage erfasst',
      daysTrackedHint: 'Seit erstem Eintrag',
      daysTrackedDetail:
        'Zeitspanne vom frühesten Ereignis ({date}) bis heute.',
      daysTrackedEmpty:
        'Zählt ab dem ersten Journal-Eintrag.',
      trackedConditions: 'Verfolgte Beschwerden',
      bodyAreasHint: 'Körperregionen / Themen',
      trackedConditionsDetail: 'Bereiche mit Journal-Aktivität: {areas}.',
      trackedConditionsEmpty:
        'Beschwerdebereiche erscheinen, sobald Sie Einträge mit Regionen loggen.',
      avgSeverity: 'Ø Schweregrad',
      severityHint: 'Wenn angegeben (1–10)',
      avgSeverityDetail:
        'Mittelwert expliziter 1–10-Bewertungen (aktuell {avg}).',
      avgSeverityEmpty:
        'Schweregrade in Einträgen ergänzen, um hier einen Durchschnitt zu sehen.',
      timelineEvents: 'Timeline-Ereignisse',
      timelineEventsHint: 'Aus Ihrem Journal',
      timelineEventsDetail:
        'Strukturierte Ereignisse aus Einträgen für Ihre Verlaufs-Timeline.',
      hypotheses: 'Hypothesen',
      hypothesesHint: 'Mögliche Zustände',
      hypothesesDetail:
        'KI- oder regelbasierte Möglichkeiten aus Mustern im Journal.',
      needsAttention: 'Erfordert Aufmerksamkeit',
      attentionHint: 'Dringend oder Notfall',
      attentionDetail:
        'Markierte Einträge unten — Link öffnen oder alle markierten anzeigen.',
      attentionEmptyDetail:
        'Derzeit keine dringenden/notfall Einträge. Bei Verschlechterung weiter loggen.',
    },
    severityTrendTitle: 'Schweregrad-Verlauf',
    severityTrendBase:
      'Nach Ereignisdatum (wann Symptome auftraten), nicht nach dem Log-Datum.',
    severityTrendEstimated:
      'Geschätzt aus der Dringlichkeit, bis Sie 1–10 Bewertungen hinzufügen.',
    severityTrendSomeUrgency:
      'Einige Punkte nutzen die Dringlichkeit ohne numerische Bewertung.',
    severityTrendParsed:
      'Aus Schmerzangaben im Text gelesen (z. B. 7/10).',
    severityTrendEmpty:
      'Fügen Sie Journal-Einträge hinzu, um den Verlauf zu sehen.',
    severityTrendEmptyDetail:
      'Sie haben {count} Journal-{entries}, aber keine Bewertung oder auslesbaren Text (z. B. „Schmerz 7/10“). Nutzen Sie den Schweregrad-Schieberegler.',
    entryOne: 'Eintrag',
    entryMany: 'Einträge',
    classificationTitle: 'Eintrags-Klassifikation',
    classificationSubtitle:
      'Wie Journal-Einträge aus Ihren Beschreibungen kategorisiert wurden',
    entriesByTypeTitle: 'Einträge nach Typ',
    entriesByTypeSubtitle: 'Symptome, Medikamente, Besuche und mehr',
    hypothesisConfidenceTitle: 'Hypothesen-Konfidenz',
    hypothesisConfidenceSubtitle: 'Verteilung aktiver Hypothesen',
    noHypothesesYet: 'Noch keine Hypothesen',
    conditionsTitle: 'Verfolgte Beschwerden',
    conditionsSubtitle: 'Körperregionen in Ihrem Journal',
    noConditionsTitle: 'Noch keine Beschwerden',
    noConditionsText:
      'Erstellen Sie einen Eintrag im Journal, um Körperregionen zu verfolgen.',
    table: {
      condition: 'Beschwerde / Region',
      entries: 'Einträge',
      lastUpdate: 'Letzte Aktualisierung',
      classification: 'Letzte Klassifikation',
    },
    clinicalModelTitle: 'Aktuelles klinisches Modell',
    clinicalModelSubtitle: 'Aus Ihrem Gesundheitsjournal abgeleitet',
    clinicalModelRefreshing: 'Klinisches Modell wird mit KI aktualisiert…',
    clinicalModelHint:
      'Protokollieren Sie Symptome und Besuche im Journal für spezifische Faktoren.',
    generateDoctorNotes: 'Notizen für den Arzt erstellen',
  },
  profile: {
    yearsOld: '{years} Jahre alt',
    currentWeight: 'Aktuelles Gewicht',
    weightDown: '−{value} kg seit letztem Eintrag',
    weightUp: '+{value} kg seit letztem Eintrag',
    weightFlat: 'unverändert seit letztem Eintrag',
    weightDownTitle: 'Gesunken von {label} ({date})',
    weightUpTitle: 'Gestiegen von {label} ({date})',
    weightFlatTitle: 'Gleich wie {label} ({date})',
    previousEntry: 'vorheriger Eintrag',
    trackingStart: 'Starten Sie Ihr Journal, um zu tracken',
    trackingSpan: 'Journal umfasst {span} · seit {since}',
    appointmentTitle: 'Nächster Termin — zum Anzeigen tippen',
    appointmentNone: 'Termine — keiner anstehend',
    recommendationsTitle: 'Empfehlungen für Sie',
    recommendationsCount: 'Empfehlungen für Sie ({count})',
    addHealthHistory: 'Gesundheitsgeschichte hinzufügen',
    addHealthHistoryHint: 'Gesundheitsgeschichte (Anamnese)',
    editProfile: 'Profil bearbeiten',
    quickActions: 'Schnellaktionen Profil',
    sectionAbout: 'Über Sie',
    cancelEdit: 'Abbrechen',
    saveProfile: 'Profil speichern',
    displayName: 'Anzeigename',
    dateOfBirth: 'Geburtsdatum',
    biologicalSex: 'Biologisches Geschlecht',
    bloodType: 'Blutgruppe',
    height: 'Größe (cm)',
    weight: 'Gewicht (kg)',
    heightPlaceholder: 'z. B. 175',
    weightPlaceholder: 'z. B. 72',
    heightValue: '{value} cm',
    weightValue: '{value} kg',
    bodyMetricsTitle: 'Körpermaße & BMI',
    bmiAddHeightWeight:
      'Größe und Gewicht unter „Profil bearbeiten“ hinzufügen, um den BMI zu sehen.',
    bmiUnavailable: 'BMI konnte aus Größe und Gewicht nicht berechnet werden.',
    bmi: 'BMI',
    bmiValue: '{value}',
    bmiScaleAria: 'BMI {value}, {category}',
    bmiCategory: {
      underweight: 'Untergewicht',
      normal: 'Normalbereich',
      overweight: 'Übergewicht',
      obese: 'Adipositas',
    },
    bmiCategoryShort: {
      underweight: 'Niedrig',
      normal: 'Normal',
      overweight: 'Erhöht',
      obese: 'Hoch',
    },
    bmiHint: {
      underweight:
        'Unter dem üblichen Normalbereich für Erwachsene. Bei ungewolltem Gewichtsverlust ärztlich besprechen.',
      normal: 'Im üblichen Normalbereich für Erwachsene (BMI 18,5–24,9).',
      overweight:
        'Über dem üblichen Normalbereich. Lebensstil oder ärztliche Beratung können helfen.',
      obese:
        'Deutlich über dem üblichen Normalbereich. Ärztliche Begleitung kann sinnvoll sein.',
    },
    sexNotSpecified: 'Nicht angegeben',
    sexFemale: 'Weiblich',
    sexMale: 'Männlich',
    sexOther: 'Divers',
    sexPreferNot: 'Keine Angabe',
    profileCreated: 'Profil erstellt',
    sexLabel: 'Biologisches Geschlecht',
  },
  recommendations: {
    eyebrow: 'Empfehlungen für Sie',
    headlineNone: 'Noch keine Vorschläge',
    headlineOne: '1 Vorschlag',
    headlineMany: '{count} Vorschläge',
    heroSubtitle:
      'Persönliche Tipps zu Vorsorge, Gewohnheiten und Ihrem Journal.',
    statPriority: 'prioritär',
    statTotal: 'Tipps für Sie',
    summaryBold: 'Für Sie zusammengestellt.',
    summary:
      ' Basierend auf Alter, Profil und Ihren Journal-Einträgen.',
    disclaimer:
      'Allgemeine Orientierung — kein Ersatz für ärztlichen Rat.',
    sectionPriority: 'Bald erledigen',
    sectionMore: 'Auch hilfreich',
    gotIt: 'Alles klar',
    viewEntries: 'Im Journal öffnen',
    viewAllAttention: 'Alle markierten Einträge anzeigen',
    viewAllAttentionCount: 'Alle {count} markierten Einträge anzeigen',
    openAttentionJournal: 'Markierte Einträge im Journal',
    viewInJournal: 'Zum Journal',
    emptyTitle: 'Noch etwas mehr über Sie',
    empty:
      'Geburtsdatum im Profil ergänzen für personalisierte Vorschläge.',
    categories: {
      screening: 'Vorsorge',
      preventive: 'Prävention',
      lifestyle: 'Lebensstil',
      profile: 'Profil',
      journal: 'Ihre Daten',
    },
    items: {
      'profile-dob': {
        title: 'Profil vervollständigen',
        detail:
          'Geburtsdatum hinzufügen für altersgerechte Vorsorge-Empfehlungen.',
      },
      'wellness-visit': {
        title: 'Routine-Untersuchung',
        detail:
          'Vorsorge alle 1–3 Jahre oder jährlich bei chronischen Erkrankungen.',
      },
      'annual-blood-panel': {
        title: 'Jährliches Blutbild',
        detail:
          'Jährliche Laborwerte (BB, Metabolik, Lipide) für Basisgesundheit.',
      },
      'bp-monitoring': {
        title: 'Blutdruck kontrollieren',
        detail:
          'Mindestens jährlich messen — öfter bei Risikofaktoren.',
      },
      'vision-exam': {
        title: 'Augenuntersuchung',
        detail:
          'Alle 1–2 Jahre für Glaukom, Katarakt und Sehveränderungen.',
      },
      'colorectal-screening': {
        title: 'Darmkrebs-Vorsorge',
        detail:
          'Screening-Optionen mit dem Arzt besprechen — oft ab 45–50 Jahren.',
      },
      'cardiovascular-risk': {
        title: 'Herzgesundheit prüfen',
        detail:
          'Kardiovaskuläre Risikofaktoren mit dem Arzt besprechen.',
      },
      'senior-wellness': {
        title: 'Gesundheit im Alter',
        detail:
          'Jährliche Vorsorge, Medikamenten-Review und Sturzrisiko ab 65.',
      },
      'cervical-screening': {
        title: 'Gebärmutterhals-Vorsorge',
        detail: 'Pap-Abstrich/HPV nach ärztlichem Plan.',
      },
      mammography: {
        title: 'Brustkrebs-Vorsorge',
        detail: 'Mammographie-Timing mit dem Arzt besprechen.',
      },
      'bone-density': {
        title: 'Knochendichte',
        detail: 'DEXA bei Osteoporose-Risiko erwägen.',
      },
      'prostate-screening': {
        title: 'Prostata-Vorsorge',
        detail: 'PSA gemeinsam mit dem Arzt abwägen.',
      },
      'dental-annual': {
        title: 'Zahnarztbesuch',
        detail: 'Jährliche Kontrolle und Reinigung.',
      },
      'flu-vaccine': {
        title: 'Grippeimpfung',
        detail: 'Jährliche Influenza-Impfung empfohlen.',
      },
      'physical-activity': {
        title: 'Regelmäßige Bewegung',
        detail:
          'Ca. 150 Min. moderate Aktivität/Woche plus Krafttraining.',
      },
      'journal-attention': {
        title: 'Dringende Journal-Einträge prüfen',
        detail:
          '{count} Journal-{entries} erfordern Aufmerksamkeit — zeitnah besprechen.',
      },
      'start-journaling': {
        title: 'Journal starten',
        detail:
          'Symptome, Medikamente und Besuche loggen für bessere Einblicke.',
      },
      'journal-recent': {
        title: 'Aktuelle Updates loggen',
        detail: 'Keine Einträge in den letzten 30 Tagen.',
      },
      'condition-followup': {
        title: 'Verfolgte Beschwerden nachverfolgen',
        detail:
          'Sie verfolgen {count} Beschwerde(n) — Journal beim nächsten Besuch teilen.',
      },
    },
  },
  appointment: {
    eyebrow: 'Nächster Termin',
    eyebrowEmpty: 'Termine',
    badgeToday: 'Heute',
    badgeTomorrow: 'Morgen',
    badgeInDays: 'In {days} Tagen',
    datetimeToday: 'Heute um {time}',
    datetimeTomorrow: 'Morgen um {time}',
    datetimeDefault: '{date} um {time}',
    doctor: 'Arzt',
    specialty: 'Fachrichtung',
    location: 'Adresse',
    viewAll: 'Alle Termine',
    nothingScheduled: 'Nichts geplant',
    emptyText: 'Kein anstehender Besuch im Kalender.',
    goToAppointments: 'Zu Terminen',
    backToDetails: 'Termin',
  },
  appointmentsPage: {
    eyebrow: 'Planung',
    title: 'Arzttermine',
    subtitle: 'Kalender sowie anstehende und vergangene Besuche.',
    addAppointment: 'Termin hinzufügen',
    saved: 'Termin gespeichert — {doctor}, {specialty}.',
    calendarTitle: 'Kalender',
    calendarSubtitle: 'Tag wählen für Besuche an diesem Datum.',
    upcomingTitle: 'Anstehend',
    upcomingSubtitle: 'Nächster zuerst.',
    pastTitle: 'Vergangene Besuche',
    pastSubtitle: 'Neueste zuerst.',
    loading: 'Laden…',
    noUpcoming: 'Keine anstehenden Termine.',
    noPast: 'Noch keine vergangenen Termine.',
    addModalTitle: 'Termin hinzufügen',
    modalIntro: 'Arzt, Klinik, Fachrichtung, Adresse, Datum und Uhrzeit.',
  },
  appointmentForm: {
    date: 'Datum',
    time: 'Uhrzeit',
    doctorName: 'Arztname',
    clinicName: 'Klinik / Krankenhaus (optional)',
    specialty: 'Fachrichtung',
    address: 'Adresse',
    notes: 'Notizen (optional)',
    saving: 'Speichern…',
    addAppointment: 'Termin hinzufügen',
    clearForm: 'Formular leeren',
  },
  appointmentCard: {
    fromJournal: 'Aus dem Gesundheitsjournal',
    past: 'Vergangen',
    upcoming: 'Anstehend',
    removing: 'Wird entfernt…',
    remove: 'Entfernen',
  },
  healthEntryCard: {
    edit: 'Bearbeiten',
    medications: 'Medikamente:',
    severity: 'Schweregrad:',
    clinicalSummary: 'Klinische Zusammenfassung:',
  },
  hypothesesPage: {
    eyebrow: 'Klinische Einblicke',
    title: 'Hypothesen',
    subtitle:
      'Neu generieren lädt aktuelle Journal-Daten in KI-Hypothesen pro Körperregion.',
    generate: 'Hypothesen erstellen',
    generateTitle: 'Hypothesen aus dem Journal erstellen',
    regenerate: 'Hypothesen neu generieren',
    regenerating: 'Wird generiert…',
    loading: 'Hypothesen werden geladen…',
    notGeneratedTitle: 'Noch nichts generiert',
    notGeneratedText:
      'Hypothesen werden erstellt, wenn Sie auf Erstellen klicken. Beim Öffnen dieser Seite läuft nichts automatisch.',
    noHypothesesTitle: 'Noch keine Hypothesen',
    noHypothesesText:
      'Journal-Einträge hinzufügen, dann „Neu generieren“ in der Kopfzeile.',
    regenerateConfirmTitle: 'Hypothesen neu generieren?',
    regenerateConfirmMessage:
      'Alle Hypothesen werden durch neue aus dem aktuellen Journal ersetzt.',
    regenerateConfirmAction: 'Neu generieren',
    regenerateSlowHint:
      'Die Neu-Generierung läuft noch. Sie können die Seite verlassen — wir benachrichtigen Sie, wenn die Hypothesen fertig sind.',
    regenerateTitleEmpty: 'Zuerst Journal-Einträge hinzufügen',
    regenerateTitle: 'Aus aktuellem Journal neu generieren',
    regenerateFailed: 'Neu-Generierung fehlgeschlagen.',
    regenerateMessages: {
      aiRequired:
        'Aktivieren Sie KI-Einblicke in der Navigation und konfigurieren Sie den LLM-API-Schlüssel.',
      needEntries:
        'Zuerst Journal-Einträge hinzufügen, dann Hypothesen neu generieren.',
      success:
        '{hypothesisCount} Hypothesen aus {journalEntryCount} Journal-Einträgen über {areaCount} Bereiche neu generiert.',
      noHypotheses:
        '{journalEntryCount} Einträge geprüft, keine Hypothesen ableitbar — mehr Details pro Körperregion und erneut versuchen.',
    },
    assistant: {
      open: 'Assistent',
      close: 'Assistent schließen',
      hasHistory: 'Gespeicherter Verlauf',
      title: 'KI-Assistent',
      subtitle:
        'Fragen zu Ihrem Journal und den generierten Hypothesen. Antworten über Ihr konfiguriertes LLM.',
      emptyHint:
        'Fragen Sie nach Mustern, was Sie als Nächstes dokumentieren sollten oder zum Arztbesuch.',
      starters: [
        'Fasse meine wichtigsten Hypothesen in einfacher Sprache zusammen',
        'Was soll ich mit meinem Arzt besprechen?',
        'Welcher Körperbereich braucht mehr Journal-Details?',
      ],
      you: 'Sie',
      assistant: 'Assistent',
      thinking: 'Denkt nach…',
      placeholder: 'Frage zu Journal oder Hypothesen…',
      inputLabel: 'Nachricht an den Assistenten',
      send: 'Senden',
      clear: 'Chat löschen',
      aiOff: 'Aktivieren Sie KI-Einblicke in der Navigation, um den Assistenten zu nutzen.',
      needJournal: 'Fügen Sie mindestens einen Journal-Eintrag hinzu, bevor Sie chatten.',
      disclaimer:
        'Antworten des Assistenten sind nur zur Information und keine medizinische Beratung oder Diagnose.',
    },
  },
  journalPage: {
    eyebrow: 'Journal',
    title: 'Gesundheitsjournal',
    subtitle:
      'Symptome, Medikamente und Veränderungen — verknüpft mit der Timeline.',
    newEntry: 'Neuer Eintrag',
    recordsTitle: 'Ihre Einträge',
    recordsSubtitle: 'Verlaufsnotizen, neueste zuerst.',
    loading: 'Einträge werden geladen…',
    noRecordsTitle: 'Noch keine Einträge',
    noRecordsText:
      '„Neuer Eintrag“ in der Kopfzeile für die erste Notiz.',
    entrySaved: 'Eintrag gespeichert — klassifiziert als {classification}.',
    entrySavedTimeline: 'Zur Timeline hinzugefügt.',
    entryUpdated: 'Eintrag aktualisiert — klassifiziert als {classification}.',
    newEntryModalTitle: 'Neuer Journal-Eintrag',
    newEntryModalIntro:
      'Symptome, Medikamente oder Besuche loggen — mit Timeline-Verknüpfung.',
    editEntryModalTitle: 'Journal-Eintrag bearbeiten',
    editEntryModalIntro:
      'Datum oder Text ändern. Monday analysiert den Eintrag neu und aktualisiert die Timeline.',
    attentionFilterBanner:
      'Einträge mit Dringlichkeit „Dringend“ oder „Notfall“ — dieselben wie unter „Braucht Aufmerksamkeit“ auf dem Dashboard.',
    showAllEntries: 'Alle Einträge anzeigen',
    backNavLabel: 'Einzelansicht verlassen',
    backToAllEntries: 'Zurück zu allen Einträgen',
    backToAttentionEntries: 'Zurück zu markierten Einträgen',
    singleEntryHint:
      'Sie sehen einen Eintrag. Über den Link oben gelangen Sie zurück zur vollständigen Liste.',
    singleEntryTitle: 'Tagebucheintrag',
    singleEntrySubtitle:
      'Über einen Link geöffnet — zur Liste zurückkehren, um weitere Einträge zu sehen.',
    entryNotFoundTitle: 'Eintrag nicht gefunden',
    entryNotFoundText:
      'Dieser Eintrag wurde entfernt oder der Link ist veraltet. Zurück zur Gesamtliste.',
    attentionRecordsTitle: 'Einträge mit Aufmerksamkeitsbedarf',
    attentionRecordsSubtitle:
      '{count} Einträge mit Dringlichkeit Dringend/Notfall.',
    noAttentionTitle: 'Keine dringenden Einträge',
    noAttentionText:
      'Aktuell keine Einträge mit Dringend/Notfall. Alle Einträge anzeigen?',
  },
  anamnesis: {
    title: 'Gesundheitsgeschichte (Anamnese)',
    intro:
      'Krankheitsverlauf in eigenen Worten — Monday erstellt Journal-Einträge und Timeline-Ereignisse.',
    mainArea: 'Haupt-Körperregion / Beschwerde',
    mainAreaPlaceholder: 'z. B. Beine, unterer Rücken, linkes Knie',
    mainAreaHint: 'Wenn ein Absatz keine Region nennt.',
    historyLabel: 'Ihre Gesundheitsgeschichte',
    historyHint: 'Absätze oder Stichpunkte pro Ereignis/Zeitraum.',
    previewTitle: 'Vorschau — {count} {entries}',
    previewEntry: 'Journal-Eintrag',
    previewEntries: 'Journal-Einträge',
    importToJournal: 'Ins Journal importieren',
    noEntriesDetected:
      'Keine Einträge erkannt. Mehr Details oder Stichpunkte pro Ereignis.',
    parseError: 'Text konnte nicht geparst werden.',
    importSuccess: '{count} Journal-Einträge importiert.',
    importFailed: 'Import fehlgeschlagen.',
  },
  translation: {
    skippedTitle: 'Auf Russisch gespeichert',
    skippedMessage:
      'Übersetzung nicht verfügbar (KI-Limit oder offline). Eintrag auf Russisch gespeichert. Einige Minuten warten oder OpenAI-Kontingent prüfen.',
  },
  entryForm: {
    langHint:
      'Englisch und Russisch werden unterstützt. Russischer Text wird beim Speichern per KI übersetzt (auch bei Tippfehlern). LLM_API_KEY in .env.local.',
    translating: 'KI übersetzt und speichert…',
    eventDate: 'Wann ist es passiert?',
    conditionArea: 'Körperregion / Beschwerde',
    conditionAreaOptional: 'Körperregion (optional)',
    conditionAreaHintRequired: 'Welcher Körperbereich ist betroffen?',
    conditionAreaHintOptional:
      'Optional — leer lassen bei Blutwerten o. Ä., oder Region angeben (z. B. Knie).',
    entryType: 'Was möchten Sie erfassen?',
    entryTypeHint: 'Wählen Sie die passendste Kategorie.',
    typeGroupFeel: 'Wie Sie sich fühlen',
    typeGroupCare: 'Behandlung & Besuche',
    typeGroupTests: 'Tests & Eingriffe',
    typeGroupOther: 'Sonstiges',
    description: 'Ausführliche Details',
    descriptionHint:
      'Vollständiger Verlauf — was passiert ist, wann, Tests und Behandlung.',
    title: 'Kurztitel',
    titleHint:
      'Kurz zur Übersicht (z. B. „MRT — Knie“). Kann beim Speichern gekürzt werden.',
    medications: 'Medikamente (Name, Dosis, Häufigkeit)',
    severity: 'Schweregrad (optional)',
    clearSeverity: 'Löschen',
    saveEntry: 'Eintrag speichern',
    saveHealthRecord: 'Gesundheitsdaten speichern',
    saveChanges: 'Änderungen speichern',
    savingAnalyzing: 'Speichern & analysieren…',
    clearForm: 'Formular leeren',
    validationMissingBody: 'Bitte Körperregion oder Beschwerde angeben.',
    validationMissingCore: 'Bitte Kurztitel und Details ausfüllen.',
    validationMedication: 'Bitte Medikament und Dosis angeben.',
    types: {
      symptom: {
        label: 'Symptome',
        hint: 'Schmerz, Beschwerden in einer Körperregion',
      },
      change: {
        label: 'Veränderung',
        hint: 'Besser, schlechter oder neue Entwicklung',
      },
      medication: {
        label: 'Medikament',
        hint: 'Begonnen, abgesetzt oder geändert',
      },
      doctor_visit: {
        label: 'Arztbesuch',
        hint: 'Termin, Beratung, Nachsorge (keine Operation)',
      },
      lab_test: {
        label: 'Bluttest / Labor',
        hint: 'Blutwerte, Labor — Körperregion optional',
      },
      imaging: {
        label: 'Bildgebung',
        hint: 'MRT, Röntgen, CT, Ultraschall usw.',
      },
      surgery: {
        label: 'Operation / Eingriff',
        hint: 'OP, Eingriff oder stationäre Behandlung',
      },
      other: {
        label: 'Sonstige Notiz',
        hint: 'Nur wenn nichts anderes passt',
      },
    },
  },
  entryTypes: {
    symptom: 'Symptombericht',
    medication: 'Medikamenten-Update',
    change: 'Veränderung',
    doctor_visit: 'Arztbesuch',
    imaging: 'Bildgebung',
    lab_test: 'Laborergebnisse',
    surgery: 'Operation / Eingriff',
    other: 'Gesundheitsnotiz',
  },
  urgency: {
    monitor: 'Beobachten',
    urgent: 'Dringend',
    emergency: 'Notfall',
    routine: 'Routine',
  },
  confidenceHypothesis: {
    exploratory: 'Erkundend',
    supported: 'Gestützt',
    stronglySupported: 'Stark gestützt',
  },
  chartEntryTypes: {
    symptom: 'Symptome',
    medication: 'Medikamente',
    change: 'Veränderungen',
    doctor_visit: 'Arztbesuche',
    imaging: 'Bildgebung',
    lab_test: 'Labor',
    surgery: 'Operationen',
    other: 'Sonstige Notizen',
  },
  classification: {
    emergencySeekCare: 'Notfall — sofort Hilfe suchen',
    urgentContact: 'Dringend — Klinik kontaktieren',
    postProcedureConcern: 'Besorgnis nach Eingriff',
    surgeryProcedure: 'Operation / Eingriff',
    hospitalCare: 'Krankenhaus / Notaufnahme',
    testImaging: 'Test oder Bildgebung',
    medicationUpdate: 'Medikamenten-Update',
    diagnosisVisit: 'Diagnose / Facharztbesuch',
    clinicalVisit: 'Klinischer Besuch',
    weightLossSymptom: 'Gewichtsverlust (Symptom)',
    weightBody: 'Gewicht / Körperzusammensetzung',
    conditionImproving: 'Zustand verbessert sich',
    conditionWorsening: 'Zustand verschlechtert sich',
    conditionChange: 'Zustandsänderung',
    symptomsFollowUp: 'Symptome — Nachverfolgung',
    persistentWorsening: 'Anhaltende oder zunehmende Symptome',
    chronicOngoing: 'Chronisch / anhaltend',
    symptomLog: 'Symptomprotokoll',
    healthRecord: 'Gesundheitsdatensatz',
  },
  journalFlags: {
    possible_emergency: 'Möglicher Notfall',
    needs_attention: 'Beachtung nötig',
    procedure_or_surgery: 'Eingriff oder Operation',
    hospital_care: 'Krankenhausversorgung',
    worsening_or_persistent: 'Verschlechterung oder anhaltend',
    medication_started_or_changed: 'Medikament geändert',
    clinical_encounter: 'Klinischer Kontakt',
    high_severity_reported: 'Hoher Schweregrad',
  },
  journalEntry: {
    severitySnippet: ' · Schweregrad {value}/10',
  },
  hypothesisPatterns: {
    urgent: 'Klinische Aufmerksamkeit',
    treatment_improvement: 'Therapieansprechen',
    worsening: 'Verschlechterungstrend',
    recurring: 'Wiederkehrende Symptome',
    treatment_unclear: 'Therapie unklar',
    general: 'Allgemeines Muster',
  },
  hypothesisCard: {
    journalMeta: '{count} Journal-{entries}',
    revisions: '{count} Überarbeitungen',
    needsClinician: 'Ärztliche Einschätzung',
    prepareNotes: 'Notizen für den Arzt',
    whatThisMeans: 'Was das bedeutet',
    whatToDoNext: 'Nächste Schritte',
    history: 'Verlauf',
    historyCreated: 'Erstellt',
    historyUpdated: 'Aktualisiert',
    historyEntries: '+{count} Journal-{entries}',
    supportingEntries: 'Stützende Journal-Einträge ({count})',
    entry: 'Eintrag',
    entries: 'Einträge',
    record: 'Eintrag',
    records: 'Einträge',
  },
  hypothesisContent: {
    dateRangeJournal: 'Ihr Journal',
    summary: {
      urgent:
        'Aus {count} Journal-{entries} ({range}) für {area}: Signale, die zeitnahe klinische Aufmerksamkeit erfordern können. Konfidenz: {confidence}. Aus Selbstangaben, keine Diagnose.',
      worsening:
        'Ihre Symptome für {area} deuten auf einen möglichen Verschlechterungstrend über {count} {records} ({range}). Konfidenz: {confidence}.',
      treatment_improvement:
        'Medikamenten- oder Therapieänderungen für {area} stehen neben Verbesserungsnotizen in {count} {entries} ({range}). Konfidenz: {confidence}.',
      recurring:
        'Wiederholte Einträge für {area} ({count}, {range}) deuten auf ein anhaltendes Muster hin. Konfidenz: {confidence}.',
      treatment_unclear:
        'Therapie für {area} begonnen oder geändert; Ergebnis in {count} {entries} ({range}) noch unklar. Konfidenz: {confidence}.',
      general:
        'Monday erkannte ein Muster für {area} aus {count} Journal-{entries} ({range}). Konfidenz: {confidence}.',
    },
    recommendations: {
      emergencyUnshift:
        'Mindestens ein Eintrag mit Notfall-Stufe — bei Bedarf sofort Hilfe suchen.',
      urgent: [
        'Arzt, Notaufnahme oder Rettungsdienst bei schweren oder plötzlichen Symptomen.',
        'Diese Zusammenfassung und den Journal-Ausdruck zum Termin mitbringen.',
        'Bei Unsicherheit oder rascher Verschlechterung nicht zögern.',
      ],
      worsening: [
        'Termin zur Überprüfung der Therapie vereinbaren.',
        'Schweregrad bis zum Termin täglich dokumentieren.',
        'Neue Auslöser, Medikamente oder Einschränkungen im Journal notieren.',
      ],
      treatment_improvement: [
        'Symptome weiter tracken, ob die Besserung anhält.',
        'Positive und negative Therapieeffekte beim nächsten Besuch besprechen.',
        'Verschreibungspflichtige Medikamente nicht ohne Rücksprache absetzen.',
      ],
      recurring: [
        'Häufigkeit, Auslöser und Alltagseinschränkung mit der Ärztin/dem Arzt besprechen.',
        'Strukturiertes Symptomtagebuch für 2–4 Wochen erwägen.',
        'Frühere Tests oder Bildgebung aus dem Journal beim Follow-up erwähnen.',
      ],
      treatment_unclear: [
        'Wöchentliche Updates zu Symptomen und Nebenwirkungen loggen.',
        'Follow-up-Termin zur Wirksamkeit der Therapie.',
        'Medikamentennamen, Dosen und Startdaten exakt erfassen.',
      ],
      general: [
        'Regelmäßig für diese Körperregion journalisieren.',
        'Muster beim nächsten Routine- oder geplanten Besuch besprechen.',
        'Arztbesuche, Testergebnisse und Medikamentenänderungen erfassen.',
      ],
    },
    critical: {
      emergency: 'Journal enthält Einträge mit Notfall-Stufe.',
      urgent: 'Dringende Signale im Gesundheitsjournal.',
      worseningUrgent: 'Verschlechterungstrend mit erhöhter Dringlichkeit.',
    },
  },
  specialist: {
    areaPhrase: ' für {area}',
    visitAdvice:
      'Erwägen Sie einen Besuch bei {clinician} ({specialty}){areaPhrase} — {reason}. Nur Orientierung, keine Diagnose.',
    bullet: 'Besuch bei {clinician} ({specialty}) erwägen: {reason}.',
    orthopedics: {
      clinician: 'Orthopäde',
      specialty: 'Orthopädie',
      reason: 'Knochen, Gelenke oder Gliedmaßen',
    },
    dermatology: {
      clinician: 'Dermatologe',
      specialty: 'Dermatologie',
      reason: 'Hautsymptome',
    },
    cardiology: {
      clinician: 'Kardiologe',
      specialty: 'Kardiologie',
      reason: 'Brust- oder Herzsymptome',
    },
    gastroenterology: {
      clinician: 'Gastroenterologe',
      specialty: 'Gastroenterologie',
      reason: 'Verdauungs- oder Bauchsymptome',
    },
    neurology: {
      clinician: 'Neurologe',
      specialty: 'Neurologie',
      reason: 'Kopfschmerz oder neurologische Symptome',
    },
    endocrinology: {
      clinician: 'Endokrinologe',
      specialty: 'Endokrinologie',
      reason: 'Stoffwechsel oder Gewicht',
    },
    pulmonology: {
      clinician: 'Pneumologe',
      specialty: 'Pneumologie',
      reason: 'Atem- oder Lungensymptome',
    },
    urology: {
      clinician: 'Urologe',
      specialty: 'Urologie',
      reason: 'Harnwege oder Nieren',
    },
    gynecology: {
      clinician: 'Gynäkologe',
      specialty: 'Gynäkologie',
      reason: 'Frauengesundheit oder Becken',
    },
    ophthalmology: {
      clinician: 'Augenarzt',
      specialty: 'Augenheilkunde',
      reason: 'Augen oder Sehen',
    },
    ent: {
      clinician: 'HNO-Arzt',
      specialty: 'HNO',
      reason: 'Ohr, Nase oder Hals',
    },
    psychiatry: {
      clinician: 'Psychiater oder Psychotherapeut',
      specialty: 'Psychiatrie',
      reason: 'Psychische Gesundheit oder Stimmung',
    },
    primaryCare: {
      clinician: 'Hausarzt',
      specialty: 'Hausarzt',
      reason: 'laufende Beschwerden in dieser Region',
    },
  },
  doctorSpecialty: {
    primary_care: 'Haus- / Hausarzt',
    orthopedics: 'Orthopäde (Knochen & Gelenke)',
    dermatology: 'Hautarzt',
    cardiology: 'Kardiologe',
    gastroenterology: 'Gastroenterologe',
    neurology: 'Neurologe',
    endocrinology: 'Endokrinologe',
    pulmonology: 'Pneumologe',
    urology: 'Urologe',
    gynecology: 'Gynäkologe',
    ophthalmology: 'Augenarzt',
    ent: 'HNO-Arzt',
    psychiatry: 'Psychiater / Psychische Gesundheit',
    rheumatology: 'Rheumatologe',
  },
  doctorNotes: {
    title: 'Notizen für Ihren Arzt',
    specialtyLabel: 'Für welche Ärztin / welchen Arzt?',
    preparedForSpecialty: 'Vorbereitet für: {specialty}',
    specialtyFocus: {
      primary_care: 'Schwerpunkt: Gesamtversorgung, Medikamente, Vorsorge, Überweisungen.',
      orthopedics: 'Schwerpunkt: Schmerz, Bewegung, Gelenke, Wirbelsäule, Bildgebung.',
      dermatology: 'Schwerpunkt: Hautsymptome, Ausschläge, Behandlungen.',
      cardiology: 'Schwerpunkt: Herz-/Brustsymptome und Risikofaktoren.',
      gastroenterology: 'Schwerpunkt: Verdauung, Bauch, Ernährung, Medikamente.',
      neurology: 'Schwerpunkt: Kopfschmerz, Taubheit, Schwindel, neurologische Symptome.',
      endocrinology: 'Schwerpunkt: Gewicht, Stoffwechsel, Schilddrüse, Hormone.',
      pulmonology: 'Schwerpunkt: Husten, Atemnot, Lungenbehandlung.',
      urology: 'Schwerpunkt: Harntrakt, Nieren, Blase.',
      gynecology: 'Schwerpunkt: Becken, Zyklus, Frauengesundheit.',
      ophthalmology: 'Schwerpunkt: Sehen, Augenbeschwerden.',
      ent: 'Schwerpunkt: Ohr, Nase, Hals, Nebenhöhlen.',
      psychiatry: 'Schwerpunkt: Stimmung, Angst, Schlaf, psychische Gesundheit.',
      rheumatology: 'Schwerpunkt: Entzündliche Gelenke, Steifigkeit.',
    },
    clinicalTitle: 'Besuchsbriefing aus dem klinischen Modell',
    clinicalIntro:
      'Arztorientierte Zusammenfassung aus Journal und klinischem Modell. Vor dem Druck prüfen und bearbeiten.',
    clinicalGenerating: 'Besuchsbriefing wird mit KI erstellt…',
    clinicalModelBadge: '(Aus klinischem Modell und Journal)',
    clinicalModelSectionTitle: 'KLINISCHES MODELL',
    clinicalModelFactorsTitle: 'SCHLÜSSELFAKTOREN',
    clinicalModelAiFactorsTitle: 'PRIORITÄTEN (KI)',
    clinicalJournalSectionTitle: 'AKTUELLE JOURNAL-EINTRÄGE ({count} gesamt)',
    clinicalJournalTruncated:
      '(Die {shown} neuesten von {total} Einträgen — vollständiges Journal in Monday.)',
    clinicalNoJournal: 'Zuerst Journal-Einträge hinzufügen.',
    clinicalDiscussReview: 'Klinische Modell-Themen mit aktuellen Symptomen abgleichen.',
    clinicalDiscussTrajectory: 'Verlauf: Besserung, stabil oder Verschlechterung?',
    generating: 'KI erstellt eine arztorientierte Zusammenfassung…',
    intro:
      'Vor dem Drucken prüfen und bearbeiten. Mit KI-Einblicken: synthetisiertes Besuchsbriefing — kein Journal-Export.',
    aiSynthesized: '(KI-Besuchsbriefing — bitte mit dem Journal abgleichen)',
    aiChiefConcernTitle: 'HAUPTBESCHWERDE',
    aiHypothesisTitle: 'FOKUS-HYPOTHESE',
    aiClinicalPictureTitle: 'KLINISCHES BILD (synthetisiert)',
    aiTimelineTitle: 'ZEITACHSE (wichtigste Punkte)',
    aiMedicationsTitle: 'MEDIKAMENTE & BEHANDLUNG (aus dem Journal)',
    aiRedFlagsTitle: 'WARNHINWEISE / DRINGLICHKEIT',
    aiQuestionsTitle: 'FRAGEN AN DIE ÄRZTIN / DEN ARZT',
    aiEvidenceNote:
      'Basierend auf {count} Journal-Einträgen für {area}. Vollständige Einträge bleiben in Monday verfügbar.',
    copy: 'Text kopieren',
    copied: 'Kopiert',
    print: 'Drucken',
    notesLabel: 'Arztbesuchsnotizen',
    summaryTitle: 'ZUSAMMENFASSUNG FÜR KLINIK',
    preparedWith: 'Erstellt mit Monday Health Journal',
    generated: 'Erstellt: {date}',
    baselineTitle: 'PATIENTEN-BASIS',
    reasonTitle: 'GRUND DIESER ZUSAMMENFASSUNG',
    suggestedDoctorTitle: 'VORGESCHLAGENER ARZTYP',
    contextTitle: 'PATIENTENBERICHTETER KONTEXT',
    discussionTitle: 'VORGESCHLAGENE GESPRÄCHSPUNKTE',
    journalSectionTitle: 'GESUNDHEITSJOURNAL — {area}',
    journalSectionMeta: '({count} {entries}, chronologisch)',
    noEntries: '(Keine Journal-Einträge für diese Region.)',
    patternConfidence: 'Muster-Konfidenz: {confidence}',
    disclaimerTitle: 'HINWEIS',
    disclaimerBody:
      'Aus lokal gespeicherten Selbstangaben erstellt. Keine medizinische Diagnose und kein Ersatz für klinische Beurteilung.',
    signatureLine: 'Unterschrift / Datum: _______________________________',
  },
  hypothesisTitles: {
    urgent: '{area}: dringliche Signale im Journal — klinische Aufmerksamkeit möglich',
    treatment_improvement: '{area}: Therapie könnte zu gemeldeter Besserung beitragen',
    worsening: '{area}: Symptome könnten sich im Verlauf verschlechtern',
    recurring: '{area}: wiederkehrende Symptome — laufende Beobachtung',
    treatment_unclear: '{area}: neue Therapie — Ansprechen noch unklar',
    general: '{area}: Gesundheitsmuster aus Journalaktivität',
  },
  clinicalModel: {
    aiBadge: 'KI-verfeinert aus Ihrem Journal',
    title: 'Ihr klinisches Modell',
    emptySummary:
      'Noch keine Journal-Daten. Mit Symptomen, Medikamenten, Besuchen und Tests baut Monday ein longitudinalen Überblick über Ihre Körperregionen.',
    keyFactors: 'Schlüsselfaktoren',
    summary: {
      intro:
        'Aus {count} Journal-{entries} ({range}) über {areas} erfasste {areasLabel}.',
      area: 'Region',
      areas: 'Regionen',
      rangeThrough: '{start} bis {end}',
      mostActivity: 'Meiste Aktivität: {topAreas}.',
      urgentFlags:
        '{count} {entries} mit dringender oder Notfall-Stufe — mit Ärztin/Arzt besprechen.',
      entryFlags: 'Eintrag markiert',
      entriesFlag: 'Einträge markieren',
      noUrgent: 'Keine dringenden oder Notfall-Markierungen im aktuellen Journal.',
      disclaimer:
        'Zusammenfassung Ihrer Daten — keine medizinische Diagnose.',
    },
    entryTypes: {
      symptom: 'Symptome',
      medication: 'Medikamenten-Updates',
      change: 'Veränderungen',
      doctorVisit: 'Arztbesuche',
      imaging: 'Bildgebung',
      labTest: 'Laborergebnisse',
      surgery: 'Operationen / Eingriffe',
      other: 'Notizen',
    },
    factor: {
      clusterIntro: '{count} Journal-{entries} ({range}).',
      latestUrgency: 'Letzte Dringlichkeit: {urgency}.',
      avgSeverity: 'Durchschnittlicher Schweregrad: {avg}/10.',
      trendRising: 'Schweregrad steigt in diesem Zeitraum.',
      trendImproving: 'Schweregrad sinkt in diesem Zeitraum.',
      trendStable: 'Schweregrad relativ stabil.',
      worseningNotes: '{count} {entries} Verschlechterung oder Anhalt.',
      entryNotes: 'Eintrag vermerkt',
      entriesNote: 'Einträge vermerken',
      activityMix: 'Aktivitätsmix: {mix}.',
    },
    factors: {
      attentionName: 'Aufmerksamkeitssignale',
      attentionDesc:
        '{count} Journal-{has} dringende oder Notfall-Stufe{including}. Priorisieren Sie die Nachsorge.',
      entryHas: 'Eintrag hat',
      entriesHave: 'Einträge haben',
      includingAreas: ' (u. a. {areas})',
      medicationName: 'Medikamentenaktivität',
      medicationDesc:
        '{count} medikamentenbezogene {entries} erfasst. Dosis, Nebenwirkungen und Timing mit Symptomen dokumentieren.',
      encountersName: 'Klinische Kontakte',
      encountersDesc:
        '{count} Arzt-{visits} dokumentiert. Besuchsnotizen verankern Tests, Therapie und Symptome.',
      visit: 'besuch',
      visits: 'besuche',
    },
  },
}
