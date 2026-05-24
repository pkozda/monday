export default {
  nav: {
    dashboard: 'Обзор',
    hypotheses: 'Гипотезы',
    appointments: 'Приёмы',
    journal: 'Журнал',
  },
  language: {
    label: 'Язык',
    en: 'Английский',
    de: 'Немецкий',
    ru: 'Русский',
  },
  theme: {
    dark: 'Тёмная',
    light: 'Светлая',
    darkHint: 'Тёмная тема — переключить на светлую',
    lightHint: 'Светлая тема — переключить на тёмную',
  },
  common: {
    close: 'Закрыть',
    cancel: 'Отмена',
    save: 'Сохранить',
    loading: 'Загрузка…',
    saving: 'Сохранение…',
    add: 'Добавить',
    edit: 'Изменить',
    remove: 'Удалить',
    preview: 'Просмотр',
    import: 'Импорт',
    importing: 'Импорт…',
    goToJournal: 'В журнал',
    goToDashboard: 'На обзор',
    viewAll: 'Показать все',
    priority: 'Приоритет',
    see: 'См.',
    expandToSeeAll: 'ещё {count} — развернуть все',
  },
  dashboard: {
    eyebrow: 'Обзор здоровья',
    title: 'Обзор',
    subtitle: 'Профиль, статистика и динамика по журналу здоровья',
    loading: 'Загрузка обзора…',
    overviewTitle: 'Сводка',
    overviewSubtitle: 'Ключевые показатели из журнала',
    stats: {
      journalEntries: 'Записи в журнале',
      allTime: 'Всего',
      last30Days: 'За 30 дней',
      recentActivity: 'Недавняя активность',
      trackedConditions: 'Отслеживаемые состояния',
      bodyAreasHint: 'Области тела / темы',
      avgSeverity: 'Сред. тяжесть',
      severityHint: 'При указании (1–10)',
      timelineEvents: 'События на линии',
      hypotheses: 'Гипотезы',
      needsAttention: 'Требует внимания',
      attentionHint: 'Срочно или экстренно',
    },
    severityTrendTitle: 'Динамика тяжести',
    severityTrendBase:
      'По дате события (когда были симптомы), а не дате записи.',
    severityTrendEstimated:
      'Оценка по срочности, пока не указана шкала 1–10.',
    severityTrendSomeUrgency:
      'Часть точек по срочности без числовой оценки.',
    severityTrendParsed:
      'Из текста записей (напр. боль 7/10).',
    severityTrendEmpty:
      'Добавьте записи, чтобы увидеть динамику тяжести.',
    severityTrendEmptyDetail:
      'У вас {count} {entries}, но нет оценки или читаемого текста (напр. «боль 7/10»). Укажите тяжесть при записи.',
    entryOne: 'запись',
    entryMany: 'записей',
    classificationTitle: 'Классификация записей',
    classificationSubtitle:
      'Как записи были отнесены по вашим описаниям',
    entriesByTypeTitle: 'Записи по типу',
    entriesByTypeSubtitle: 'Симптомы, лекарства, визиты и др.',
    hypothesisConfidenceTitle: 'Уверенность гипотез',
    hypothesisConfidenceSubtitle: 'Распределение активных гипотез',
    noHypothesesYet: 'Гипотез пока нет',
    conditionsTitle: 'Отслеживаемые состояния',
    conditionsSubtitle: 'Области тела из журнала',
    noConditionsTitle: 'Состояний пока нет',
    noConditionsText:
      'Добавьте запись в журнал, чтобы отслеживать области тела.',
    table: {
      condition: 'Состояние / область',
      entries: 'Записи',
      lastUpdate: 'Обновлено',
      classification: 'Последняя классификация',
    },
    clinicalModelTitle: 'Текущая клиническая модель',
    clinicalModelSubtitle: 'На основе журнала здоровья',
    clinicalModelHint:
      'Записывайте симптомы и визиты в журнале для факторов по состояниям.',
  },
  profile: {
    yearsOld: '{years} лет',
    currentWeight: 'Текущий вес',
    weightDown: '−{value} кг с прошлой записи',
    weightUp: '+{value} кг с прошлой записи',
    weightFlat: 'без изменений с прошлой записи',
    weightDownTitle: 'Ниже {label} ({date})',
    weightUpTitle: 'Выше {label} ({date})',
    weightFlatTitle: 'Как {label} ({date})',
    previousEntry: 'предыдущая запись',
    trackingStart: 'Начните журнал для отслеживания',
    trackingSpan: 'Журнал: {span} · с {since}',
    appointmentTitle: 'Следующий приём — нажмите',
    appointmentNone: 'Приёмы — нет ближайших',
    recommendationsTitle: 'Рекомендации для вас',
    recommendationsCount: 'Рекомендации ({count})',
    addHealthHistory: 'Добавить историю болезни',
    addHealthHistoryHint: 'История болезни (анамнез)',
    editProfile: 'Изменить профиль',
    cancelEdit: 'Отмена',
    saveProfile: 'Сохранить профиль',
    displayName: 'Имя',
    dateOfBirth: 'Дата рождения',
    biologicalSex: 'Биологический пол',
    bloodType: 'Группа крови',
    sexNotSpecified: 'Не указан',
    sexFemale: 'Женский',
    sexMale: 'Мужской',
    sexOther: 'Другой',
    sexPreferNot: 'Предпочитаю не указывать',
    profileCreated: 'Профиль создан',
    sexLabel: 'Биологический пол',
  },
  recommendations: {
    eyebrow: 'Рекомендации для вас',
    headlineNone: 'Пока нет советов',
    headlineOne: '1 рекомендация',
    headlineMany: '{count} рекомендаций',
    summary:
      'Профилактика по возрасту, профилю и журналу',
    disclaimer:
      'Общие советы — не замена консультации врача.',
    empty:
      'Укажите дату рождения в профиле для персональных рекомендаций.',
    categories: {
      screening: 'Скрининг',
      preventive: 'Профилактика',
      lifestyle: 'Образ жизни',
      profile: 'Профиль',
      journal: 'Ваши данные',
    },
    items: {
      'profile-dob': {
        title: 'Заполните профиль',
        detail:
          'Добавьте дату рождения для рекомендаций по возрасту.',
      },
      'wellness-visit': {
        title: 'Профилактический осмотр',
        detail:
          'Осмотр раз в 1–3 года или ежегодно при хронических состояниях.',
      },
      'annual-blood-panel': {
        title: 'Ежегодный анализ крови',
        detail:
          'ОАК, биохимия, липиды — для контроля базового состояния.',
      },
      'bp-monitoring': {
        title: 'Контроль давления',
        detail:
          'Измеряйте давление минимум раз в год — чаще при факторах риска.',
      },
      'vision-exam': {
        title: 'Проверка зрения',
        detail:
          'Раз в 1–2 года — глаукома, катаракта, изменения зрения.',
      },
      'colorectal-screening': {
        title: 'Скрининг рака кишечника',
        detail:
          'Обсудите с врачом — обычно с 45–50 лет.',
      },
      'cardiovascular-risk': {
        title: 'Сердечно-сосудистый риск',
        detail:
          'Обсудите факторы риска с врачом.',
      },
      'senior-wellness': {
        title: 'Здоровье после 65',
        detail:
          'Ежегодные осмотры, обзор лекарств, риск падений.',
      },
      'cervical-screening': {
        title: 'Скрининг шейки матки',
        detail: 'Пап-тест/ВПЧ по плану врача.',
      },
      mammography: {
        title: 'Маммография',
        detail: 'Сроки обсудите с врачом — часто с 40–50 лет.',
      },
      'bone-density': {
        title: 'Плотность костей',
        detail: 'ДЭКСА при риске остеопороза.',
      },
      'prostate-screening': {
        title: 'Скрининг простаты',
        detail: 'ПСА — совместное решение с врачом.',
      },
      'dental-annual': {
        title: 'Стоматолог',
        detail: 'Осмотр и чистка раз в год.',
      },
      'flu-vaccine': {
        title: 'Прививка от гриппа',
        detail: 'Ежегодная вакцинация рекомендуется.',
      },
      'physical-activity': {
        title: 'Физическая активность',
        detail:
          'Около 150 мин умеренной нагрузки в неделю плюс силовые.',
      },
      'journal-attention': {
        title: 'Срочные записи в журнале',
        detail:
          '{count} {entries} требуют внимания — обсудите с врачом.',
      },
      'start-journaling': {
        title: 'Начните журнал',
        detail:
          'Записывайте симптомы, лекарства и визиты для анализа.',
      },
      'journal-recent': {
        title: 'Недавние обновления',
        detail: 'Нет записей за последние 30 дней.',
      },
      'condition-followup': {
        title: 'Контроль состояний',
        detail:
          'Отслеживаете {count} состояние(й) — покажите журнал на приёме.',
      },
    },
  },
  appointment: {
    eyebrow: 'Следующий приём',
    eyebrowEmpty: 'Приёмы',
    badgeToday: 'Сегодня',
    badgeTomorrow: 'Завтра',
    badgeInDays: 'Через {days} дн.',
    datetimeToday: 'Сегодня в {time}',
    datetimeTomorrow: 'Завтра в {time}',
    datetimeDefault: '{date} в {time}',
    doctor: 'Врач',
    specialty: 'Специальность',
    location: 'Адрес',
    viewAll: 'Все приёмы',
    nothingScheduled: 'Ничего не запланировано',
    emptyText: 'Ближайших визитов в календаре нет.',
    goToAppointments: 'К приёмам',
  },
  appointmentsPage: {
    eyebrow: 'Планирование',
    title: 'Приёмы врача',
    subtitle: 'Календарь, предстоящие и прошедшие визиты.',
    addAppointment: 'Добавить приём',
    saved: 'Приём сохранён — {doctor}, {specialty}.',
    calendarTitle: 'Календарь',
    calendarSubtitle: 'Выберите день для визитов.',
    upcomingTitle: 'Предстоящие',
    upcomingSubtitle: 'Ближайшие первыми.',
    pastTitle: 'Прошедшие',
    pastSubtitle: 'Новые первыми.',
    loading: 'Загрузка…',
    noUpcoming: 'Нет предстоящих приёмов.',
    noPast: 'Прошедших приёмов пока нет.',
    addModalTitle: 'Добавить приём',
    modalIntro: 'Врач, клиника, специальность, адрес, дата и время.',
  },
  appointmentForm: {
    date: 'Дата',
    time: 'Время',
    doctorName: 'Имя врача',
    clinicName: 'Клиника / больница (необязательно)',
    specialty: 'Специальность',
    address: 'Адрес',
    notes: 'Заметки (необязательно)',
    saving: 'Сохранение…',
    addAppointment: 'Добавить приём',
    clearForm: 'Очистить форму',
  },
  appointmentCard: {
    fromJournal: 'Из журнала здоровья',
    past: 'Прошедший',
    upcoming: 'Предстоящий',
    removing: 'Удаление…',
    remove: 'Удалить',
  },
  healthEntryCard: {
    medications: 'Лекарства:',
    severity: 'Тяжесть:',
    clinicalSummary: 'Клиническое резюме:',
  },
  hypothesesPage: {
    eyebrow: 'Клинические выводы',
    title: 'Гипотезы и диагнозы',
    subtitle:
      'Пересоздание обновляет журнал в возможных диагнозах и гипотезах.',
    regenerate: 'Пересоздать гипотезы и диагнозы',
    regenerating: 'Создание…',
    loading: 'Загрузка…',
    tabDiagnoses: 'Диагнозы',
    tabHypotheses: 'Гипотезы',
    noHypothesesTitle: 'Гипотез пока нет',
    noHypothesesText:
      'Добавьте записи в журнал, затем «Пересоздать» в шапке.',
    regenerateConfirm:
      'Заменить все гипотезы новыми из текущего журнала?',
    regenerateTitleEmpty: 'Сначала добавьте записи в журнал',
    regenerateTitle: 'Пересоздать из текущего журнала',
    regenerateFailed: 'Не удалось пересоздать.',
    regenerateMessages: {
      needEntries:
        'Сначала добавьте записи в журнал, затем пересоздайте гипотезы и диагнозы.',
      success:
        'Пересоздано гипотез: {hypothesisCount} из {journalEntryCount} записей журнала по {areaCount} зонам. Диагнозы используют те же данные.',
      noHypotheses:
        'Просмотрено записей: {journalEntryCount}, гипотезы не выведены — добавьте деталей по зонам и повторите.',
    },
  },
  journalPage: {
    eyebrow: 'Журнал',
    title: 'Журнал здоровья',
    subtitle:
      'Симптомы, лекарства и изменения — с привязкой к линии событий.',
    newEntry: 'Новая запись',
    recordsTitle: 'Ваши записи',
    recordsSubtitle: 'Заметки по состояниям, новые сверху.',
    loading: 'Загрузка записей…',
    noRecordsTitle: 'Записей пока нет',
    noRecordsText:
      'Нажмите «Новая запись» в шапке для первой заметки.',
    entrySaved: 'Запись сохранена — классификация: {classification}.',
    entrySavedTimeline: 'Добавлено на линию событий.',
    newEntryModalTitle: 'Новая запись в журнале',
    newEntryModalIntro:
      'Симптомы, лекарства или визиты — с классификацией и линией событий.',
  },
  diagnosis: {
    loading: 'Анализ журнала на возможные состояния…',
    empty:
      'Опишите симптомы, область тела и лекарства для списка с процентами.',
    disclaimer:
      'Вывод из всего журнала — всегда уточняйте у врача.',
    certaintyHigh: 'Вероятно',
    certaintyModerate: 'Лидирует',
    certaintyLow: 'Неясно',
    seeSpecialist: 'См.: {name}',
    whoToSee: 'К кому обратиться:',
    crossBodyNote:
      'Мы также учли связанные записи из других зон тела, если они могут относиться к тому же состоянию.',
    uncertainNote:
      'Ни одно состояние не выделяется явно — сравните варианты ниже и обсудите с врачом.',
    journalMatch: {
      strong: 'Хорошо совпадает с вашим журналом',
      partial: 'Частично совпадает с журналом',
      limited: 'Пока слабое совпадение с журналом',
    },
    whySuggested: 'Почему мы это предложили',
    criteriaSupport: 'Критерии «за»',
    criteriaAgainst: 'Критерии «против»',
    suggestedWorkup: 'Рекомендуемое обследование',
    evidenceJournal: 'Данные из журнала',
    variantTabsLabel: 'Возможные состояния для зоны «{area}»',
    notDocumented: 'Ещё не задокументировано — обсудите с врачом',
    certaintyReportHigh: 'Наиболее вероятное совпадение',
    certaintyReportModerate: 'Ведущая возможность',
    certaintyReportLow: 'Несколько вариантов — просмотрите все',
    rationale: {
      primaryScope: '{count} {entries} журнала о {area}',
      crossScope: '{count} связанных {entries} из других зон тела',
      scopeAnd: 'и',
      fullHistory: 'ваш журнал здоровья',
      intro: 'Мы оценили {scope}.',
      symptoms_all:
        'Типичные признаки этого состояния есть в ваших записях ({typicalMet} из {typicalTotal} частых признаков и поддерживающие записи).',
      symptoms_some:
        'В журнале только часть картины ({typicalMet} из {typicalTotal} типичных признаков; {met} из {total} проверок). Новые записи могут изменить проценты.',
      symptoms_none:
        'Мало типичных признаков отражено в журнале — проценты могут измениться, если добавите записи.',
      exclusions:
        '{count} записей в журнале скорее против этой возможности — обсудите с врачом.',
      disclaimer:
        'Это подсказка для обсуждения с врачом, а не подтверждённый диагноз.',
    },
    variantFooter: {
      journalIn: '{count} {entries} журнала в {area}',
      crossFrom: '+ {count} из других зон ({areas})',
      hypothesisLine: 'Гипотеза: {pattern} · {confidence}',
    },
  },
  diseaseInsight: {
    aboutTitle: 'Что это за состояние?',
    whatYouLoggedTitle: 'Что вы записали и что поддерживает это',
    whatYouLoggedIntro:
      'Ваши реальные записи в журнале, которые мы связали с этой возможностью — не общие формулировки.',
    whyThisSupports: 'Почему это связано',
    supportReason: {
      symptom_logged:
        'Вы описали симптомы или изменения, которые подходят под эту возможность.',
      imaging_or_test:
        'В записи есть обследование, анализы или результаты — не только визит.',
      finding_in_visit_note:
        'В записи о визите есть конкретные результаты, а не только факт визита.',
      medication_change:
        'Запись о лекарствах относится к отслеживанию этого состояния.',
      explicit_diagnosis:
        'В журнале указан диагноз или подтверждённое состояние.',
      journal_pattern: 'Запись соответствует признакам этой возможности.',
    },
    noJournalProofYet:
      'Пока нет явной записи в журнале. Добавьте детали симптомов или смотрите типичные признаки ниже.',
    typicalSymptomsTitle: 'Типичные признаки этого состояния',
    typicalSymptomsIntro:
      'Для справки — на что часто смотрят врачи. Для оценки важны ваши записи выше.',
    journalCompareTitle: 'Чего нет в вашем журнале',
    journalCompareIntro:
      'Типичные признаки этого состояния, которые вы ещё не записали.',
    missingToConfirmTitle: 'Пока нет в вашем журнале',
    missingToConfirmHint:
      'Эти признаки часто встречаются при этом состоянии, но не отражены в записях. Если они у вас есть — скажите врачу или добавьте запись в журнал.',
    cautionTitle: 'Противоречивые сигналы в журнале',
    whenToSeekTitle: 'Когда обращаться за помощью',
    possibleConditionsTitle: 'Возможные состояния для обсуждения',
    possibleConditionsHint:
      'По журналу и области тела — проценты это оценка, а не диагноз.',
    variantPercent: 'совпадение {percent}%',
  },
  anamnesis: {
    title: 'История болезни (анамнез)',
    intro:
      'Опишите историю болезни — Monday разобьёт на записи журнала и события.',
    mainArea: 'Основная область / состояние',
    mainAreaPlaceholder: 'напр. ноги, поясница, левое колено',
    mainAreaHint: 'Если в абзаце область не указана.',
    historyLabel: 'Ваша история болезни',
    historyHint: 'Абзацы или пункты по событию или периоду.',
    previewTitle: 'Просмотр — {count} {entries}',
    previewEntry: 'запись в журнале',
    previewEntries: 'записей в журнале',
    importToJournal: 'Импорт в журнал',
    noEntriesDetected:
      'Записи не найдены. Добавьте деталей или используйте списки по событиям.',
    parseError: 'Не удалось разобрать текст.',
    importSuccess: 'Импортировано записей: {count}.',
    importFailed: 'Импорт не удался.',
  },
  entryForm: {
    langHint:
      'Поддерживаются английский и русский. Русский текст при сохранении переводится для анализа.',
    translating: 'Перевод и сохранение…',
    eventDate: 'Когда это произошло?',
    conditionArea: 'Зона тела / состояние',
    entryType: 'Что вы записываете?',
    description: 'Подробности',
    descriptionHint:
      'Полный рассказ — что случилось, когда, обследования и лечение.',
    title: 'Краткий заголовок',
    titleHint:
      'Несколько слов для обзора (напр. «МРТ — колено»). Можно сократить при сохранении.',
    medications: 'Лекарства (название, доза, как часто)',
    severity: 'Тяжесть (необязательно)',
    clearSeverity: 'Сбросить',
    saveEntry: 'Сохранить запись',
    saveHealthRecord: 'Сохранить запись о здоровье',
    savingAnalyzing: 'Сохранение и анализ…',
    clearForm: 'Очистить форму',
    optionSymptom: 'Симптомы',
    optionChange: 'Изменение состояния',
    optionMedication: 'Лекарство / рецепт',
    optionDoctorVisit: 'Визит к врачу или совет',
    optionImaging: 'Анализ или снимок',
    optionOther: 'Другая запись о здоровье',
  },
  entryTypes: {
    symptom: 'Симптом',
    medication: 'Лекарства',
    change: 'Изменение состояния',
    doctor_visit: 'Визит к врачу',
    imaging: 'Обследование',
    other: 'Заметка',
  },
  urgency: {
    monitor: 'Наблюдение',
    urgent: 'Срочно',
    emergency: 'Экстренно',
    routine: 'Планово',
  },
  confidenceHypothesis: {
    exploratory: 'Предварительная',
    supported: 'Поддержана',
    stronglySupported: 'Сильно поддержана',
  },
  chartEntryTypes: {
    symptom: 'Симптомы',
    medication: 'Лекарства',
    change: 'Изменения',
    doctor_visit: 'Визиты к врачу',
    imaging: 'Обследования',
    other: 'Прочие заметки',
  },
  classification: {
    emergencySeekCare: 'Неотложно — обратитесь за помощью',
    urgentContact: 'Срочно — свяжитесь с врачом',
    postProcedureConcern: 'Опасения после процедуры',
    surgeryProcedure: 'Операция / процедура',
    hospitalCare: 'Стационар / неотложная помощь',
    testImaging: 'Анализ или снимок',
    medicationUpdate: 'Изменение лекарств',
    diagnosisVisit: 'Диагноз / визит к специалисту',
    clinicalVisit: 'Клинический визит',
    weightLossSymptom: 'Потеря веса (симптом)',
    weightBody: 'Вес / состав тела',
    conditionImproving: 'Состояние улучшается',
    conditionWorsening: 'Состояние ухудшается',
    conditionChange: 'Изменение состояния',
    symptomsFollowUp: 'Симптомы — наблюдение',
    persistentWorsening: 'Стойкие или усиливающиеся симптомы',
    chronicOngoing: 'Хроническое / длительное',
    symptomLog: 'Запись симптомов',
    healthRecord: 'Запись о здоровье',
  },
  journalFlags: {
    possible_emergency: 'Возможная неотложность',
    needs_attention: 'Требует внимания',
    procedure_or_surgery: 'Процедура или операция',
    hospital_care: 'Стационарная помощь',
    worsening_or_persistent: 'Ухудшение или стойкость',
    medication_started_or_changed: 'Изменение лекарств',
    clinical_encounter: 'Клинический контакт',
    high_severity_reported: 'Высокая тяжесть',
  },
  journalEntry: {
    severitySnippet: ' · тяжесть {value}/10',
  },
  hypothesisPatterns: {
    urgent: 'Клиническое внимание',
    treatment_improvement: 'Ответ на лечение',
    worsening: 'Тренд ухудшения',
    recurring: 'Повторяющиеся симптомы',
    treatment_unclear: 'Лечение неясно',
    general: 'Общий паттерн',
  },
  hypothesisCard: {
    journalMeta: '{count} {entries} в журнале',
    revisions: '{count} пересмотров',
    needsClinician: 'Нужен врач',
    prepareNotes: 'Подготовить заметки для врача',
    whatThisMeans: 'Что это значит',
    whatToDoNext: 'Что делать дальше',
    history: 'История',
    historyCreated: 'Создано',
    historyUpdated: 'Обновлено',
    historyEntries: '+{count} {entries} в журнале',
    supportingEntries: 'Поддерживающие записи журнала ({count})',
    entry: 'запись',
    entries: 'записей',
    record: 'запись',
    records: 'записей',
  },
  hypothesisContent: {
    dateRangeJournal: 'ваш журнал',
    summary: {
      urgent:
        'По {count} {entries} журнала ({range}) для {area}: сигналы, требующие быстрого внимания. Уверенность: {confidence}. Из самоотчётов, не диагноз.',
      worsening:
        'Симптомы для {area} могут указывать на ухудшение по {count} {records} ({range}). Уверенность: {confidence}.',
      treatment_improvement:
        'Изменения лечения для {area} рядом с отметками улучшения в {count} {entries} ({range}). Уверенность: {confidence}.',
      recurring:
        'Повторяющиеся записи для {area} ({count}, {range}) — устойчивый паттерн. Уверенность: {confidence}.',
      treatment_unclear:
        'Лечение для {area} начато или изменено; исход в {count} {entries} ({range}) пока неясен. Уверенность: {confidence}.',
      general:
        'Monday выявил паттерн для {area} из {count} {entries} журнала ({range}). Уверенность: {confidence}.',
    },
    recommendations: {
      emergencyUnshift:
        'Есть запись уровня неотложности — при необходимости срочно обратитесь за помощью.',
      urgent: [
        'Свяжитесь с врачом, неотложной помощью или скорой при тяжёлых или внезапных симптомах.',
        'Возьмите эту сводку и распечатку журнала на приём.',
        'Не откладывайте помощь при ухудшении или опасности.',
      ],
      worsening: [
        'Запишитесь к врачу для пересмотра лечения.',
        'Фиксируйте тяжесть ежедневно до визита.',
        'Отмечайте новые триггеры, лекарства и ограничения в журнале.',
      ],
      treatment_improvement: [
        'Продолжайте отслеживать симптомы для подтверждения улучшения.',
        'Обсудите эффекты лечения на следующем визите.',
        'Не прекращайте назначенные лекарства без консультации.',
      ],
      recurring: [
        'Обсудите частоту, триггеры и влияние на жизнь с врачом.',
        'Ведите структурированный дневник симптомов 2–4 недели.',
        'Упомяните прошлые анализы и снимки из журнала на приёме.',
      ],
      treatment_unclear: [
        'Еженедельно записывайте симптомы и побочные эффекты.',
        'Запланируйте повторный визит для оценки лечения.',
        'Фиксируйте названия, дозы и даты начала лекарств.',
      ],
      general: [
        'Продолжайте вести журнал для этой зоны тела.',
        'Обсудите паттерн на плановом или следующем визите.',
        'Добавляйте визиты, результаты анализов и смену лекарств.',
      ],
    },
    critical: {
      emergency: 'В журнале есть записи уровня неотложности.',
      urgent: 'В журнале обнаружены срочные сигналы.',
      worseningUrgent: 'Тренд ухудшения с повышенной срочностью.',
    },
  },
  diagnosisFlagKinds: {
    body_area: 'Зона тела',
    keyword: 'Симптом',
    medication: 'Лекарство',
    named_condition: 'Названное',
    hypothesis: 'Гипотеза',
    urgency: 'Срочность',
    journal_flag: 'Метка журнала',
    cross_body: 'Межзонально',
  },
  specialist: {
    areaPhrase: ' для {area}',
    visitAdvice:
      'Рассмотрите визит к {clinician} ({specialty}){areaPhrase} — {reason}. Только ориентир, не диагноз.',
    bullet: 'Рассмотрите визит к {clinician} ({specialty}): {reason}.',
    orthopedics: {
      clinician: 'Ортопед',
      specialty: 'Ортопедия',
      reason: 'кости, суставы или конечности',
    },
    dermatology: {
      clinician: 'Дерматолог',
      specialty: 'Дерматология',
      reason: 'кожные симптомы',
    },
    cardiology: {
      clinician: 'Кардиолог',
      specialty: 'Кардиология',
      reason: 'грудь или сердце',
    },
    gastroenterology: {
      clinician: 'Гастроэнтеролог',
      specialty: 'Гастроэнтерология',
      reason: 'ЖКТ или живот',
    },
    neurology: {
      clinician: 'Невролог',
      specialty: 'Неврология',
      reason: 'головная боль или неврология',
    },
    endocrinology: {
      clinician: 'Эндокринолог',
      specialty: 'Эндокринология',
      reason: 'обмен веществ или вес',
    },
    pulmonology: {
      clinician: 'Пульмонолог',
      specialty: 'Пульмонология',
      reason: 'дыхание или лёгкие',
    },
    urology: {
      clinician: 'Уролог',
      specialty: 'Урология',
      reason: 'мочевыводящие или почки',
    },
    gynecology: {
      clinician: 'Гинеколог',
      specialty: 'Гинекология',
      reason: 'женское здоровье или таз',
    },
    ophthalmology: {
      clinician: 'Офтальмолог',
      specialty: 'Офтальмология',
      reason: 'глаза или зрение',
    },
    ent: {
      clinician: 'ЛОР-врач',
      specialty: 'ЛОР',
      reason: 'ухо, нос или горло',
    },
    psychiatry: {
      clinician: 'Психиатр или психотерапевт',
      specialty: 'Психиатрия',
      reason: 'психическое здоровье или настроение',
    },
    primaryCare: {
      clinician: 'Терапевт',
      specialty: 'Первичная помощь',
      reason: 'текущие жалобы по этой зоне',
    },
  },
  doctorNotes: {
    title: 'Заметки для врача',
    intro:
      'Проверьте и отредактируйте перед печатью. Сводка из записей журнала по этой гипотезе.',
    copy: 'Копировать текст',
    copied: 'Скопировано',
    print: 'Печать',
    notesLabel: 'Заметки к визиту',
    summaryTitle: 'СВОДКА ДЛЯ КЛИНИЦИСТА',
    preparedWith: 'Подготовлено в Monday Health Journal',
    generated: 'Создано: {date}',
    baselineTitle: 'БАЗОВЫЕ ДАННЫЕ ПАЦИЕНТА',
    reasonTitle: 'ПОВОД ЭТОЙ СВОДКИ',
    suggestedDoctorTitle: 'РЕКОМЕНДУЕМЫЙ ТИП ВРАЧА',
    contextTitle: 'КОНТЕКСТ ОТ ПАЦИЕНТА',
    discussionTitle: 'ТЕМЫ ДЛЯ ОБСУЖДЕНИЯ',
    journalSectionTitle: 'ЖУРНАЛ ЗДОРОВЬЯ — {area}',
    journalSectionMeta: '({count} {entries}, хронологически)',
    noEntries: '(Нет записей журнала для этой зоны.)',
    patternConfidence: 'Уверенность паттерна: {confidence}',
    disclaimerTitle: 'ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ',
    disclaimerBody:
      'Создано из самоотчётов, хранящихся на устройстве. Не является диагнозом и не заменяет клиническую оценку.',
    signatureLine: 'Подпись / дата: _______________________________',
  },
  hypothesisTitles: {
    urgent: '{area}: срочные сигналы в журнале — может потребоваться внимание врача',
    treatment_improvement: '{area}: лечение может способствовать улучшению',
    worsening: '{area}: симптомы могут ухудшаться по ходу наблюдения',
    recurring: '{area}: повторяющиеся симптомы — нужен мониторинг',
    treatment_unclear: '{area}: новое лечение — ответ пока неясен',
    general: '{area}: паттерн здоровья по активности в журнале',
  },
  clinicalModel: {
    title: 'Ваша клиническая модель',
    emptySummary:
      'Пока нет данных журнала. Записывайте симптомы, лекарства, визиты и анализы — Monday соберёт обзор по зонам тела.',
    keyFactors: 'Ключевые факторы',
    summary: {
      intro:
        'На основе {count} {entries} журнала ({range}) по {areas} отслеживаемым {areasLabel}.',
      area: 'зоне',
      areas: 'зонам',
      rangeThrough: '{start} — {end}',
      mostActivity: 'Больше всего активности: {topAreas}.',
      urgentFlags:
        '{count} {entries} с срочной или неотложной пометкой — обсудите с врачом.',
      entryFlags: 'запись помечена',
      entriesFlag: 'записей помечено',
      noUrgent: 'Нет срочных или неотложных пометок в текущем журнале.',
      disclaimer:
        'Модель отражает ваши записи; это не медицинский диагноз.',
    },
    entryTypes: {
      symptom: 'симптомы',
      medication: 'лекарства',
      change: 'изменения',
      doctorVisit: 'визиты к врачу',
      imaging: 'обследования',
      other: 'заметки',
    },
    factor: {
      clusterIntro: '{count} {entries} журнала ({range}).',
      latestUrgency: 'Последняя срочность: {urgency}.',
      avgSeverity: 'Средняя тяжесть: {avg}/10.',
      trendRising: 'Тяжесть растёт за период.',
      trendImproving: 'Тяжесть снижается за период.',
      trendStable: 'Тяжесть относительно стабильна.',
      worseningNotes: '{count} {entries} об ухудшении или стойкости.',
      entryNotes: 'запись',
      entriesNote: 'записей',
      activityMix: 'Состав активности: {mix}.',
    },
    factors: {
      attentionName: 'Сигналы внимания',
      attentionDesc:
        '{count} {has} в журнале срочную или неотложную пометку{including}. Обратитесь к врачу.',
      entryHas: 'запись имеет',
      entriesHave: 'записей имеют',
      includingAreas: ' (в т. ч. {areas})',
      medicationName: 'Лекарственная активность',
      medicationDesc:
        '{count} записей о лекарствах. Фиксируйте дозы, побочные эффекты и сроки.',
      encountersName: 'Клинические визиты',
      encountersDesc:
        '{count} визитов к врачу. Заметки связывают анализы, лечение и симптомы.',
      visit: 'визит',
      visits: 'визитов',
    },
  },
}
