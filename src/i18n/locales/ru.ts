export default {
  nav: {
    main: 'Главная навигация',
    dashboard: 'Обзор',
    hypotheses: 'Гипотезы',
    appointments: 'Приёмы',
    journal: 'Журнал',
    openMenu: 'Открыть меню',
    settings: 'Настройки',
    preferences: 'Настройки',
  },
  language: {
    label: 'Язык',
    en: 'Английский',
    de: 'Немецкий',
    ru: 'Русский',
  },
  theme: {
    appearance: 'Оформление',
    dark: 'Тёмная',
    light: 'Светлая',
    darkHint: 'Тёмная тема — переключить на светлую',
    lightHint: 'Светлая тема — переключить на тёмную',
  },
  aiInsights: {
    toggle: 'ИИ-анализ',
    on: 'Вкл',
    hintOn:
      'При добавлении записей и пересборке используется ИИ для симптомов, гипотез и формулировок диагнозов.',
    hintOff: 'Включите, чтобы отправлять текст журнала в настроенную LLM (через dev-прокси).',
    banner:
      'ИИ включён — новые записи анализируются; пересборка обновляет гипотезы; диагнозы ранжируются ИИ по журналу.',
    unavailable:
      'Нужен LLM_API_KEY в .env.local и npm run dev (см. .env.example).',
  },
  notifications: {
    title: 'Уведомления',
    bellLabel: 'Уведомления ({count} непрочитанных)',
    empty: 'Уведомлений пока нет.',
    markAllRead: 'Прочитать все',
    dismiss: 'Закрыть',
    regeneration: {
      slowToastTitle: 'Ещё выполняется…',
      slowToastMessage:
        'Пересборка может занять время. Можно перейти на другие страницы — мы уведомим по завершении.',
      slowNotificationTitle: 'Пересборка анализа',
      slowNotificationMessage:
        'Гипотезы и диагнозы пересобираются из вашего журнала.',
      successTitle: 'Анализ готов',
      successToastMessage:
        'Гипотезы и диагнозы готовы. Откройте раздел «Гипотезы и диагнозы».',
      errorTitle: 'Ошибка пересборки',
    },
    doctorNotes: {
      progressToastTitle: 'Готовим заметки для врача…',
      progressToastMessage:
        'Можно продолжать работу — мы уведомим, когда заметки будут готовы.',
      progressNotificationTitle: 'Заметки для врача готовятся',
      progressNotificationMessage:
        'Краткий обзор визита создаётся из журнала и клинической модели.',
      readyTitle: 'Заметки для врача готовы',
      readyToastMessage:
        'Откройте уведомление, чтобы просмотреть и скопировать заметки.',
      errorTitle: 'Не удалось подготовить заметки для врача',
    },
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
      journalEntriesDetail:
        'Симптомы, визиты, лекарства и заметки — {days} дней отслеживания в Monday.',
      last30Days: 'За 30 дней',
      recentActivity: 'Недавняя активность',
      last30DaysDetail:
        'Записи за последний месяц — удобно для краткосрочных изменений.',
      daysTracked: 'Дней отслеживания',
      daysTrackedHint: 'С первой записи',
      daysTrackedDetail:
        'Период от самой ранней записи ({date}) до сегодня.',
      daysTrackedEmpty:
        'Начнёт считаться после первой записи в журнале.',
      trackedConditions: 'Отслеживаемые состояния',
      bodyAreasHint: 'Области тела / темы',
      trackedConditionsDetail: 'Области с активностью в журнале: {areas}.',
      trackedConditionsEmpty:
        'Области появятся, когда вы добавите записи с регионами тела.',
      avgSeverity: 'Сред. тяжесть',
      severityHint: 'При указании (1–10)',
      avgSeverityDetail:
        'Среднее явных оценок 1–10 (сейчас {avg}).',
      avgSeverityEmpty:
        'Добавьте оценки тяжести в записи, чтобы увидеть среднее здесь.',
      timelineEvents: 'События на линии',
      timelineEventsHint: 'Из журнала',
      timelineEventsDetail:
        'Структурированные события из записей для хронологии.',
      hypotheses: 'Гипотезы',
      hypothesesHint: 'Возможные состояния',
      hypothesesDetail:
        'Варианты на основе ИИ или правил по паттернам в журнале.',
      needsAttention: 'Требует внимания',
      attentionHint: 'Срочно или неотложно',
      attentionDetail:
        'Отмеченные записи ниже — откройте ссылку или все отмеченные.',
      attentionEmptyDetail:
        'Сейчас нет срочных/неотложных записей. Продолжайте вести журнал при изменениях.',
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
    clinicalModelRefreshing: 'Обновление клинической модели с ИИ…',
    clinicalModelHint:
      'Записывайте симптомы и визиты в журнале для факторов по состояниям.',
    generateDoctorNotes: 'Создать заметки для врача',
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
    quickActions: 'Быстрые действия профиля',
    sectionAbout: 'О вас',
    cancelEdit: 'Отмена',
    saveProfile: 'Сохранить профиль',
    displayName: 'Имя',
    dateOfBirth: 'Дата рождения',
    biologicalSex: 'Биологический пол',
    bloodType: 'Группа крови',
    height: 'Рост (см)',
    weight: 'Вес (кг)',
    heightPlaceholder: 'напр. 175',
    weightPlaceholder: 'напр. 72',
    heightValue: '{value} см',
    weightValue: '{value} кг',
    bodyMetricsTitle: 'Параметры тела и ИМТ',
    bmiAddHeightWeight:
      'Укажите рост и вес в «Изменить профиль», чтобы увидеть ИМТ.',
    bmiUnavailable: 'Не удалось рассчитать ИМТ по росту и весу.',
    bmi: 'ИМТ',
    bmiValue: '{value}',
    bmiScaleAria: 'ИМТ {value}, {category}',
    bmiCategory: {
      underweight: 'Недостаточный вес',
      normal: 'Норма',
      overweight: 'Избыточный вес',
      obese: 'Ожирение',
    },
    bmiCategoryShort: {
      underweight: 'Низкий',
      normal: 'Норма',
      overweight: 'Повыш.',
      obese: 'Высокий',
    },
    bmiHint: {
      underweight:
        'Ниже обычного здорового диапазона для взрослых. При нежелательной потере веса стоит обсудить с врачом.',
      normal: 'В обычном здоровом диапазоне для взрослых (ИМТ 18,5–24,9).',
      overweight:
        'Выше обычного диапазона. Могут помочь образ жизни или консультация врача.',
      obese:
        'Значительно выше обычного диапазона. Врач поможет определить дальнейшие шаги.',
    },
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
    heroSubtitle:
      'Советы по скринингу, привычкам и ведению журнала — для вас.',
    statPriority: 'срочных',
    statTotal: 'советов',
    summaryBold: 'Подобрано для вас.',
    summary:
      ' По возрасту, профилю и записям в журнале здоровья.',
    disclaimer:
      'Общие советы — не замена консультации врача.',
    sectionPriority: 'Стоит сделать в первую очередь',
    sectionMore: 'Тоже полезно',
    gotIt: 'Понятно, спасибо',
    viewEntries: 'Открыть в журнале',
    viewAllAttention: 'Все отмеченные записи',
    viewAllAttentionCount: 'Все {count} отмеченных записей',
    openAttentionJournal: 'Открыть отмеченные записи',
    viewInJournal: 'Перейти в журнал',
    emptyTitle: 'Нужно чуть больше данных',
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
    backToDetails: 'Приём',
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
    edit: 'Изменить',
    medications: 'Лекарства:',
    severity: 'Тяжесть:',
    clinicalSummary: 'Клиническое резюме:',
  },
  hypothesesPage: {
    eyebrow: 'Клинические выводы',
    title: 'Гипотезы и диагнозы',
    subtitle:
      'Пересоздание обновляет журнал в возможных диагнозах и гипотезах.',
    generate: 'Создать гипотезы и диагнозы',
    generateTitle: 'Построить гипотезы и возможные диагнозы по журналу',
    regenerate: 'Пересоздать гипотезы и диагнозы',
    regenerating: 'Создание…',
    loading: 'Загрузка…',
    notGeneratedTitle: 'Пока ничего не создано',
    notGeneratedText:
      'Гипотезы и возможные диагнозы создаются по журналу только после нажатия «Создать». При открытии страницы ничего не запускается автоматически.',
    tabDiagnoses: 'Диагнозы',
    tabHypotheses: 'Гипотезы',
    noHypothesesTitle: 'Гипотез пока нет',
    noHypothesesText:
      'Добавьте записи в журнал, затем «Пересоздать» в шапке.',
    regenerateConfirmTitle: 'Пересоздать выводы?',
    regenerateConfirmMessage:
      'Все гипотезы будут заменены новыми на основе текущего журнала. Возможные состояния будут пересчитаны по тем же записям.',
    regenerateConfirmAction: 'Пересоздать',
    regenerateSlowHint:
      'Пересборка ещё идёт. Можно уйти со страницы — мы уведомим, когда гипотезы и диагнозы будут готовы.',
    regenerateTitleEmpty: 'Сначала добавьте записи в журнал',
    regenerateTitle: 'Пересоздать из текущего журнала',
    regenerateFailed: 'Не удалось пересоздать.',
    regenerateMessages: {
      aiRequired:
        'Включите ИИ-анализ в навигации и настройте ключ LLM API.',
      needEntries:
        'Сначала добавьте записи в журнал, затем пересоздайте гипотезы и диагнозы.',
      success:
        'Пересоздано гипотез: {hypothesisCount} из {journalEntryCount} записей журнала по {areaCount} зонам. Диагнозы используют те же данные.',
      noHypotheses:
        'Просмотрено записей: {journalEntryCount}, гипотезы не выведены — добавьте деталей по зонам и повторите.',
      successNoDiagnoses:
        'Создано гипотез: {hypothesisCount} из {journalEntryCount} записей, но ИИ не предложил возможные состояния — добавьте деталей в журнал или нажмите «Сгенерировать возможные состояния» на вкладке «Диагнозы».',
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
    entryUpdated: 'Запись обновлена — классификация: {classification}.',
    newEntryModalTitle: 'Новая запись в журнале',
    newEntryModalIntro:
      'Симптомы, лекарства или визиты — с классификацией и линией событий.',
    editEntryModalTitle: 'Редактировать запись',
    editEntryModalIntro:
      'Измените дату или текст. Monday заново проанализирует запись и обновит линию событий.',
    attentionFilterBanner:
      'Записи с уровнем «Срочно» или «Неотложно» — те же, что в «Требует внимания» на панели.',
    showAllEntries: 'Показать все записи',
    backNavLabel: 'Выйти из просмотра одной записи',
    backToAllEntries: 'Ко всем записям',
    backToAttentionEntries: 'К отмеченным записям',
    singleEntryHint:
      'Открыта одна запись. Ссылка выше вернёт к полному журналу.',
    singleEntryTitle: 'Запись журнала',
    singleEntrySubtitle:
      'Открыто по ссылке — вернитесь к списку, чтобы увидеть остальные записи.',
    entryNotFoundTitle: 'Запись не найдена',
    entryNotFoundText:
      'Запись удалена или ссылка устарела. Вернитесь ко всем записям.',
    attentionRecordsTitle: 'Записи, требующие внимания',
    attentionRecordsSubtitle:
      '{count} записей с уровнем срочности срочно/неотложно.',
    noAttentionTitle: 'Нет срочных записей',
    noAttentionText:
      'Сейчас нет записей с уровнем срочно/неотложно. Можно показать все записи.',
  },
  diagnosis: {
    loading: 'Анализ журнала на возможные состояния…',
    refreshing: 'Обновление возможных состояний…',
    generateAction: 'Сгенерировать возможные состояния',
    generatedSuccess:
      'Сгенерированы возможные состояния для {count} зон(ы) тела по журналу.',
    empty:
      'Опишите симптомы, область тела и лекарства для списка с процентами.',
    emptyNotGeneratedTitle: 'Возможные состояния ещё не созданы',
    emptyNotGeneratedHint:
      'Нажмите «Создать» в шапке страницы (с включённым ИИ-анализом), чтобы построить гипотезы и возможные состояния вместе.',
    emptyIncompleteTitle: 'Возможные состояния не сохранены',
    emptyIncompleteHint:
      'Гипотезы сохранены, но возможные состояния не были догенерированы (например, после прерванного запуска). Кнопка ниже или «Пересоздать» в шапке.',
    emptyAiOffTitle: 'ИИ-анализ выключен',
    emptyAiOffHint:
      'Включите ИИ-анализ в навигации, чтобы генерировать возможные состояния из журнала.',
    emptyNeedEntriesTitle: 'Сначала добавьте записи в журнал',
    emptyNeedEntriesHint:
      'Возможные состояния строятся из журнала здоровья. Запишите симптомы, визиты или анализы и сгенерируйте снова.',
    emptyNoSuggestionsTitle: 'ИИ не предложил возможные состояния',
    emptyNoSuggestionsHint:
      'ИИ просмотрел журнал и гипотезы, но не смог назвать варианты для обсуждения с врачом. Добавьте симптомы, сроки и результаты обследований и попробуйте снова.',
    emptyNeedsMoreJournalTitle: 'Нужно больше деталей в журнале',
    emptyNeedsMoreJournalHint:
      'При короткой записи ИИ часто не формирует список. Добавьте симптомы, лекарства, снимки или визиты и нажмите «Сгенерировать возможные состояния».',
    emptyFailedTitle: 'Не удалось сгенерировать возможные состояния',
    emptyFailedHint:
      'Ошибка при обращении к ИИ. Проверьте ключ API и сеть и повторите попытку.',
    outcomeBanner: {
      no_suggestions:
        'По текущему журналу возможные состояния не предложены. Добавьте деталей и повторите.',
      needs_more_journal:
        'Добавьте записи или более подробные заметки в журнал и сгенерируйте снова.',
      failed:
        'Не удалось сгенерировать возможные состояния. Проверьте настройки ИИ и повторите.',
    },
    disclaimer:
      'Вывод из всего журнала — всегда уточняйте у врача.',
    aiRankedNote:
      'Проценты и порядок вариантов ранжированы ИИ по журналу; критерии по-прежнему из ваших записей.',
    ruleBasedNote:
      'Ранжирование по встроенному каталогу и журналу (без ИИ). Включите «ИИ-анализ» в шапке для ранжирования через LLM.',
    aiBadge: 'ИИ-ранж.',
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
      'Записи журнала с пояснением ИИ, что в вашем тексте указывает на это возможное состояние — не подтверждённый диагноз.',
    whyThisSupports: 'Почему это поддерживает эту возможность',
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
  translation: {
    skippedTitle: 'Сохранено на русском',
    skippedMessage:
      'Перевод недоступен (лимит ИИ или офлайн). Запись сохранена на русском. Подождите несколько минут или проверьте квоту OpenAI.',
  },
  entryForm: {
    langHint:
      'Поддерживаются английский и русский. При сохранении русский текст переводит ИИ (учитывает опечатки). Нужен LLM_API_KEY в .env.local.',
    translating: 'ИИ переводит и сохраняет…',
    eventDate: 'Когда это произошло?',
    conditionArea: 'Зона тела / состояние',
    conditionAreaOptional: 'Зона тела (необязательно)',
    conditionAreaHintRequired: 'Какая часть тела затронута?',
    conditionAreaHintOptional:
      'Необязательно — оставьте пустым для анализов крови и т.п., или укажите зону (напр. колено).',
    entryType: 'Что вы записываете?',
    entryTypeHint: 'Выберите наиболее подходящий тип записи.',
    typeGroupFeel: 'Самочувствие',
    typeGroupCare: 'Лечение и визиты',
    typeGroupTests: 'Анализы и процедуры',
    typeGroupOther: 'Прочее',
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
    saveChanges: 'Сохранить изменения',
    savingAnalyzing: 'Сохранение и анализ…',
    clearForm: 'Очистить форму',
    validationMissingBody: 'Укажите зону тела или состояние.',
    validationMissingCore: 'Заполните краткий заголовок и подробности.',
    validationMedication: 'Укажите название лекарства и дозу.',
    types: {
      symptom: {
        label: 'Симптомы',
        hint: 'Боль, дискомфорт в какой-то части тела',
      },
      change: {
        label: 'Изменение состояния',
        hint: 'Стало лучше, хуже или новое развитие',
      },
      medication: {
        label: 'Лекарство',
        hint: 'Начали, отменили или изменили препарат',
      },
      doctor_visit: {
        label: 'Визит к врачу',
        hint: 'Приём, совет, наблюдение (не операция)',
      },
      lab_test: {
        label: 'Анализ крови / лаборатория',
        hint: 'Анализы, панели — зона тела необязательна',
      },
      imaging: {
        label: 'Снимок / визуализация',
        hint: 'МРТ, рентген, КТ, УЗИ и т.д.',
      },
      surgery: {
        label: 'Операция или процедура',
        hint: 'Операция, вмешательство, стационар',
      },
      other: {
        label: 'Другая заметка',
        hint: 'Только если ничего не подходит',
      },
    },
  },
  entryTypes: {
    symptom: 'Симптом',
    medication: 'Лекарства',
    change: 'Изменение состояния',
    doctor_visit: 'Визит к врачу',
    imaging: 'Снимок / обследование',
    lab_test: 'Лабораторные результаты',
    surgery: 'Операция / процедура',
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
    imaging: 'Снимки',
    lab_test: 'Анализы',
    surgery: 'Операции',
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
  doctorSpecialty: {
    primary_care: 'Семейный / участковый врач',
    orthopedics: 'Ортопед (кости и суставы)',
    dermatology: 'Дерматолог',
    cardiology: 'Кардиолог',
    gastroenterology: 'Гастроэнтеролог',
    neurology: 'Невролог',
    endocrinology: 'Эндокринолог',
    pulmonology: 'Пульмонолог',
    urology: 'Уролог',
    gynecology: 'Гинеколог',
    ophthalmology: 'Офтальмолог',
    ent: 'ЛОР-врач',
    psychiatry: 'Психиатр / ментальное здоровье',
    rheumatology: 'Ревматолог',
  },
  doctorNotes: {
    title: 'Заметки для врача',
    specialtyLabel: 'Для какого врача?',
    preparedForSpecialty: 'Подготовлено для: {specialty}',
    specialtyFocus: {
      primary_care: 'Акцент: общее состояние, лекарства, профилактика, направления.',
      orthopedics: 'Акцент: боль, подвижность, суставы, позвоночник, снимки.',
      dermatology: 'Акцент: кожа, сыпь, лечение.',
      cardiology: 'Акцент: сердце, грудь, факторы риска.',
      gastroenterology: 'Акцент: ЖКТ, живот, питание.',
      neurology: 'Акцент: головная боль, онемение, головокружение.',
      endocrinology: 'Акцент: вес, обмен веществ, щитовидная железа.',
      pulmonology: 'Акцент: кашель, одышка, лёгкие.',
      urology: 'Акцент: мочевыводящая система, почки.',
      gynecology: 'Акцент: гинекология, цикл, таз.',
      ophthalmology: 'Акцент: зрение, глаза.',
      ent: 'Акцент: ухо, горло, нос.',
      psychiatry: 'Акцент: настроение, тревога, сон.',
      rheumatology: 'Акцент: воспалительные суставы, скованность.',
    },
    clinicalTitle: 'Брифинг по клинической модели',
    clinicalIntro:
      'Клиническое резюме по всему журналу и модели. Проверьте и отредактируйте перед печатью.',
    clinicalGenerating: 'ИИ готовит брифинг для визита…',
    clinicalModelBadge: '(Из клинической модели и журнала)',
    clinicalModelSectionTitle: 'КЛИНИЧЕСКАЯ МОДЕЛЬ',
    clinicalModelFactorsTitle: 'КЛЮЧЕВЫЕ ФАКТОРЫ',
    clinicalModelAiFactorsTitle: 'ПРИОРИТЕТЫ (ИИ)',
    clinicalJournalSectionTitle: 'НЕДАВНИЕ ЗАПИСИ ЖУРНАЛА (всего {count})',
    clinicalJournalTruncated:
      '(Показаны {shown} последних из {total} — полный журнал в Monday.)',
    clinicalNoJournal: 'Сначала добавьте записи в журнал.',
    clinicalDiscussReview: 'Сверить темы модели с текущими симптомами.',
    clinicalDiscussTrajectory: 'Обсудить: улучшение, стабильно или ухудшение.',
    generating: 'ИИ готовит сводку для врача…',
    intro:
      'Проверьте и отредактируйте перед печатью. С ИИ: синтез для визита, а не копия журнала.',
    aiSynthesized: '(Сводка с ИИ — сверьте с журналом)',
    aiChiefConcernTitle: 'ОСНОВНАЯ ЖАЛОБА',
    aiHypothesisTitle: 'ФОКУС ГИПОТЕЗЫ',
    aiClinicalPictureTitle: 'КЛИНИЧЕСКАЯ КАРТИНА (синтез)',
    aiTimelineTitle: 'КЛЮЧЕВАЯ ХРОНОЛОГИЯ',
    aiMedicationsTitle: 'ЛЕКАРСТВА И ЛЕЧЕНИЕ (из журнала)',
    aiRedFlagsTitle: 'ТРЕВОЖНЫЕ СИГНАЛЫ / СРОЧНОСТЬ',
    aiQuestionsTitle: 'ВОПРОСЫ К ВРАЧУ',
    aiEvidenceNote:
      'На основе {count} записей по зоне {area}. Полные записи остаются в Monday.',
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
    aiBadge: 'Уточнено ИИ по вашему журналу',
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
      imaging: 'снимки / обследования',
      labTest: 'лабораторные анализы',
      surgery: 'операции / процедуры',
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
