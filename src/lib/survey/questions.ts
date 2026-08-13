import type { Category, Question, QuestionSeries, SelectOption } from "./types";

export const SETTLEMENT_TYPES: SelectOption[] = [
  { code: "megapolis", label: "Мегаполис (1 млн+)" },
  { code: "large_city", label: "Крупный город (250 тыс – 1 млн)" },
  { code: "medium_city", label: "Средний город (50–250 тыс)" },
  { code: "small_city", label: "Малый город и ниже" },
  { code: "village", label: "Село" },
];

const INTERESTS_COMMON: SelectOption[] = [
  { code: "technology", label: "Технологии и IT" },
  { code: "science", label: "Естественные науки" },
  { code: "humanities", label: "Гуманитарные науки и языки" },
  { code: "creativity", label: "Творчество и искусство" },
  { code: "sport", label: "Спорт" },
  { code: "engineering", label: "Техника и инженерия" },
  { code: "psychology", label: "Психология и общение с людьми" },
  { code: "business", label: "Предпринимательство и бизнес" },
  { code: "medicine", label: "Медицина и здоровье" },
  { code: "security", label: "Право и безопасность (силовые структуры)" },
  { code: "production", label: "Производство и рабочие специальности" },
  { code: "public_service", label: "Госслужба и социальная сфера" },
  { code: "service", label: "Сфера услуг и сервис" },
];

function scaleOptions(): SelectOption[] {
  return [1, 2, 3, 4, 5].map((n) => ({ code: String(n), label: String(n) }));
}

const THINKING_STYLES: SelectOption[] = [
  { code: "people", label: "Работа с людьми" },
  { code: "data_systems", label: "Работа с данными и системами" },
  { code: "creativity_images", label: "Творчество и образы" },
  { code: "hands_objects", label: "Работа руками и объектами" },
  { code: "words_texts", label: "Работа со словами и текстами" },
];

const WORK_FORMATS: SelectOption[] = [
  { code: "office", label: "Офис" },
  { code: "remote", label: "Удалёнка" },
  { code: "travel", label: "Разъездной" },
  { code: "hybrid", label: "Смешанный" },
];

const VALUES: SelectOption[] = [
  { code: "income", label: "Доход" },
  { code: "stability", label: "Стабильность" },
  { code: "creative_freedom", label: "Творческая свобода" },
  { code: "impact", label: "Влияние на людей/общество" },
  { code: "balance", label: "Баланс работы и жизни" },
  { code: "career_growth", label: "Карьерный рост" },
  { code: "intellectual_challenge", label: "Интеллектуальный вызов" },
  { code: "duty", label: "Чувство долга / служение обществу" },
];

const SPECIALIZATION_AREAS: SelectOption[] = [
  { code: "it", label: "IT и программирование" },
  { code: "medicine", label: "Медицина и здоровье" },
  { code: "engineering", label: "Инженерия и техника" },
  { code: "creative", label: "Творчество и дизайн" },
  { code: "business", label: "Бизнес и экономика" },
  { code: "humanities", label: "Гуманитарные науки и языки" },
  { code: "pedagogy", label: "Педагогика и психология" },
  { code: "law", label: "Право и безопасность" },
  { code: "working", label: "Рабочие специальности" },
  { code: "service", label: "Сфера услуг и сервис" },
  { code: "science", label: "Естественные науки" },
  { code: "sport", label: "Спорт и физическая культура" },
];

const ATTRACTIVE_PROFESSIONS: SelectOption[] = [
  { code: "programmer", label: "Программист / разработчик" },
  { code: "doctor", label: "Врач / медсестра" },
  { code: "engineer", label: "Инженер / конструктор" },
  { code: "designer", label: "Дизайнер / художник" },
  { code: "teacher", label: "Учитель / преподаватель" },
  { code: "psychologist", label: "Психолог" },
  { code: "lawyer", label: "Юрист" },
  { code: "entrepreneur", label: "Предприниматель" },
  { code: "military", label: "Военный / силовые структуры" },
  { code: "worker", label: "Рабочая профессия (сварщик, электрик и т.д.)" },
  { code: "journalist", label: "Журналист / блогер" },
  { code: "sportsman", label: "Спортсмен / тренер" },
  { code: "not_sure", label: "Пока не знаю" },
];


const COMMON_SERIES: QuestionSeries[] = [
  {
    id: "common-geo",
    title: "География",
    questions: [
      { key: "country", label: "Страна", type: "text" },
      { key: "region", label: "Регион / область", type: "text" },
      {
        key: "settlementType",
        label: "Тип и численность населённого пункта",
        type: "single",
        options: SETTLEMENT_TYPES,
      },
      {
        key: "vahtaReadiness",
        label: "Готовы ли вы к вахтовому методу работы?",
        type: "single",
        options: [
          { code: "yes", label: "Да" },
          { code: "no", label: "Нет" },
          { code: "maybe", label: "Рассмотрю" },
        ],
      },
      {
        key: "relocationReadiness",
        label:
          "Готовы ли вы рассмотреть переезд в другой регион ради более высокого дохода или подходящей профессии?",
        type: "single",
        options: [
          { code: "yes", label: "Да, готов(а) к переезду" },
          { code: "maybe", label: "Возможно, в зависимости от условий" },
          { code: "no", label: "Нет, хочу остаться в своём регионе" },
        ],
      },
    ],
  },
  {
    id: "common-personality",
    title: "Личностный профиль",
    questions: [
      {
        key: "energySource",
        label: "Где вы восстанавливаете силы — в общении с людьми или наедине?",
        type: "single",
        options: [
          { code: "people", label: "В общении с людьми" },
          { code: "alone", label: "Наедине" },
          { code: "depends", label: "Зависит от ситуации" },
        ],
      },
      {
        key: "teamOrSolo",
        label: "Вам комфортнее работать в команде или самостоятельно?",
        type: "single",
        options: [
          { code: "team", label: "В команде" },
          { code: "solo", label: "Самостоятельно" },
          { code: "both", label: "И то, и другое" },
        ],
      },
      {
        key: "stressReaction",
        label: "Как вы ведёте себя под давлением сроков?",
        type: "single",
        options: [
          { code: "mobilize", label: "Мобилизуюсь и работаю быстрее" },
          { code: "lost", label: "Теряюсь, мне нужно время" },
          { code: "own_pace", label: "Работаю в своём темпе, не поддаюсь давлению" },
        ],
      },
      {
        key: "detailOrBigPicture",
        label: "Что вам ближе — прорабатывать детали или видеть общую картину?",
        type: "single",
        options: [
          { code: "details", label: "Детали и точность" },
          { code: "big_picture", label: "Общая картина" },
          { code: "both", label: "И то, и другое" },
        ],
      },
      {
        key: "workPace",
        label: "Какой темп работы вам комфортен?",
        type: "single",
        options: [
          { code: "fast", label: "Быстрый, динамичный" },
          { code: "measured", label: "Размеренный, спокойный" },
          { code: "flexible", label: "Гибкий, меняющийся" },
        ],
      },
    ],
  },
  {
    id: "common-interests",

    title: "Интересы и мышление",
    questions: [
      {
        key: "interests",
        label: "Какие сферы вам интересны?",
        hint: "Выберите один или несколько вариантов",
        type: "multi",
        options: INTERESTS_COMMON,
      },
      {
        key: "thinkingStyle",
        label: "Как вам комфортнее работать?",
        hint: "Выберите 1–2 варианта",
        type: "multi",
        options: THINKING_STYLES,
      },
      {
        key: "helpingUrgentImportance",
        label:
          "Насколько вам важно напрямую помогать людям в сложных или экстренных ситуациях?",
        hint: "1 — совсем не важно, 5 — очень важно",
        type: "single",
        options: scaleOptions(),
      },
      {
        key: "riskResponsibilityWillingness",
        label:
          "Готовы ли вы к работе, связанной с физическим риском или высокой ответственностью за здоровье/жизнь других, ради ощущения значимости?",
        hint: "1 — совсем не готов(а), 5 — полностью готов(а)",
        type: "single",
        options: scaleOptions(),
      },
      {
        key: "hierarchyComfort",
        label:
          "Комфортно ли вам в структурах со строгой иерархией и дисциплиной (армия, полиция, госслужба)?",
        type: "single",
        options: [
          { code: "yes", label: "Да" },
          { code: "neutral", label: "Нейтрально" },
          { code: "no", label: "Нет" },
        ],
      },
      {
        key: "physicalLaborEnjoyment",
        label:
          "Насколько вам нравится физический труд и работа руками (ремонт, сборка, стройка, обслуживание техники)?",
        hint: "1 — совсем не нравится, 5 — очень нравится",
        type: "single",
        options: scaleOptions(),
      },
    ],
  },
  {
    id: "common-format-values",
    title: "Формат работы и ценности",
    questions: [
      {
        key: "workFormatPreference",
        label: "Предпочитаемый формат работы",
        type: "single",
        options: WORK_FORMATS,
      },
      {
        key: "shiftWorkReadiness",
        label: "Готовность к посменной работе / суткам через трое",
        type: "single",
        options: [
          { code: "yes", label: "Да" },
          { code: "no", label: "Нет" },
          { code: "maybe", label: "Рассмотрю" },
        ],
      },
      {
        key: "valuesRanking",
        label: "Расставьте ценности по важности",
        hint: "Первая в списке — самая важная",
        type: "ranking",
        options: VALUES,
      },
    ],
  },
];

const RELOCATION_SERIES: QuestionSeries = {
  id: "common-relocation",
  title: "Уточнение",
  questions: [
    {
      key: "relocationReadiness",
      label:
        "Вы отметили разъездной формат работы и проживание в селе. Готовы ли вы к переезду в город ради подходящей профессии?",
      type: "single",
      options: [
        { code: "yes", label: "Да, готов(а) к переезду" },
        { code: "maybe", label: "Возможно, в зависимости от условий" },
        { code: "no", label: "Нет, хочу остаться в своём населённом пункте" },
      ],
    },
  ],
};

const TEEN_COMMON_SERIES: QuestionSeries[] = [
  {
    id: "teen-geo",
    title: "География",
    questions: [
      { key: "country", label: "Страна", type: "text" },
      { key: "region", label: "Регион / область", type: "text" },
      {
        key: "settlementType",
        label: "Тип и численность населённого пункта",
        type: "single",
        options: SETTLEMENT_TYPES,
      },
      {
        key: "teenEducationRelocation",
        label:
          "Готовы ли вы рассмотреть обучение в другом регионе или городе, если там есть подходящий вуз или колледж?",
        type: "single",
        options: [
          { code: "yes", label: "Да, готов(а) уехать учиться" },
          { code: "maybe", label: "Возможно, в зависимости от условий" },
          { code: "no", label: "Нет, хочу учиться рядом с домом" },
        ],
      },
      {
        key: "teenDormReadiness",
        label:
          "Готовы ли вы к переезду в общежитие или к самостоятельной жизни в другом городе?",
        type: "single",
        options: [
          { code: "yes", label: "Да, готов(а)" },
          { code: "maybe", label: "Возможно, если будет поддержка" },
          { code: "no", label: "Нет, пока не готов(а)" },
        ],
      },
    ],
  },
  {
    id: "teen-personality",
    title: "Личностный профиль",
    questions: [
      {
        key: "energySource",
        label: "Где вы восстанавливаете силы — в общении с людьми или наедине?",
        type: "single",
        options: [
          { code: "people", label: "В общении с людьми" },
          { code: "alone", label: "Наедине" },
          { code: "depends", label: "Зависит от ситуации" },
        ],
      },
      {
        key: "teamOrSolo",
        label: "Вам комфортнее заниматься в команде или самостоятельно?",
        type: "single",
        options: [
          { code: "team", label: "В команде" },
          { code: "solo", label: "Самостоятельно" },
          { code: "both", label: "И то, и другое" },
        ],
      },
      {
        key: "stressReaction",
        label: "Как вы ведёте себя, когда нужно сдать что-то в срок?",
        type: "single",
        options: [
          { code: "mobilize", label: "Собираюсь и делаю быстрее" },
          { code: "lost", label: "Теряюсь, мне нужно время" },
          { code: "own_pace", label: "Делаю в своём темпе, не поддаюсь давлению" },
        ],
      },
      {
        key: "detailOrBigPicture",
        label: "Что вам ближе — прорабатывать детали или видеть общую картину?",
        type: "single",
        options: [
          { code: "details", label: "Детали и точность" },
          { code: "big_picture", label: "Общая картина" },
          { code: "both", label: "И то, и другое" },
        ],
      },
      {
        key: "workPace",
        label: "Какой темп занятий вам комфортен?",
        type: "single",
        options: [
          { code: "fast", label: "Быстрый, динамичный" },
          { code: "measured", label: "Размеренный, спокойный" },
          { code: "flexible", label: "Гибкий, меняющийся" },
        ],
      },
      {
        key: "decisionStyle",
        label: "Как вы чаще принимаете решения — сердцем или головой?",
        type: "single",
        options: [
          { code: "heart", label: "Сердцем, по ощущениям" },
          { code: "head", label: "Головой, логически" },
          { code: "both", label: "И так, и так" },
        ],
      },
      {
        key: "noveltyOrPerfection",
        label: "Вам интереснее придумывать новое или доводить до идеала уже готовое?",
        type: "single",
        options: [
          { code: "novelty", label: "Придумывать новое" },
          { code: "perfection", label: "Доводить до идеала" },
          { code: "both", label: "И то, и другое" },
        ],
      },
      {
        key: "leaderOrTeam",
        label: "Что вам ближе: быть лидером, быть в команде или работать одному?",
        type: "single",
        options: [
          { code: "leader", label: "Быть лидером" },
          { code: "team", label: "Быть в команде" },
          { code: "solo", label: "Работать одному" },
        ],
      },
    ],
  },
  {
    id: "teen-interests",
    title: "Интересы и эмпатия",
    questions: [
      {
        key: "interests",
        label: "Какие сферы вам интересны?",
        hint: "Выберите один или несколько вариантов",
        type: "multi",
        options: INTERESTS_COMMON,
      },
      {
        key: "thinkingStyle",
        label: "Что вам больше нравится делать?",
        hint: "Выберите 1–2 варианта",
        type: "multi",
        options: THINKING_STYLES,
      },
      {
        key: "empathyFriendReaction",
        label: "Когда ваш друг расстроен, вы обычно...",
        type: "single",
        options: [
          { code: "comfort", label: "Успокаиваете и поддерживаете" },
          { code: "advice", label: "Даёте совет, как решить проблему" },
          { code: "space", label: "Оставляете его в покое" },
        ],
      },
      {
        key: "empathyImportance",
        label: "Насколько вам важно, что чувствуют другие люди?",
        hint: "1 — совсем не важно, 5 — очень важно",
        type: "single",
        options: scaleOptions(),
      },
      {
        key: "empathyNotice",
        label: "Вы легко замечаете, когда человеку плохо, даже если он не говорит об этом?",
        type: "single",
        options: [
          { code: "yes", label: "Да, почти всегда" },
          { code: "sometimes", label: "Иногда" },
          { code: "rarely", label: "Редко" },
        ],
      },
      {
        key: "empathyHelpOrTech",
        label: "Что вам ближе: помогать людям или решать технические задачи?",
        type: "single",
        options: [
          { code: "help", label: "Помогать людям" },
          { code: "tech", label: "Решать технические задачи" },
          { code: "both", label: "И то, и другое" },
        ],
      },
      {
        key: "empathyHelpReaction",
        label: "Как вы реагируете, когда видите, что кому-то нужна помощь?",
        type: "single",
        options: [
          { code: "help_immediately", label: "Сразу предлагаю помощь" },
          { code: "help_if_asked", label: "Помогаю, если попросят" },
          { code: "not_notice", label: "Часто не замечаю" },
        ],
      },
    ],
  },
  {
    id: "teen-education",
    title: "Образование и специальности",
    questions: [
      {
        key: "attractiveProfessions",
        label: "Какие профессии вам кажутся привлекательными?",
        hint: "Выберите один или несколько вариантов",
        type: "multi",
        options: ATTRACTIVE_PROFESSIONS,
      },
      {
        key: "specializationAreas",
        label: "Какие направления специальностей вам интересны?",
        hint: "Выберите один или несколько вариантов",
        type: "multi",
        options: SPECIALIZATION_AREAS,
      },
      {
        key: "dreamProfession",
        label: "Есть ли профессия, о которой вы мечтаете?",
        type: "text",
        optional: true,
      },
      {
        key: "educationType",
        label: "Какое образование вам ближе: вуз (высшее) или колледж/техникум (среднеспециальное)?",
        type: "single",
        options: [
          { code: "university", label: "Вуз (высшее)" },
          { code: "college", label: "Колледж / техникум (среднеспециальное)" },
          { code: "not_sure", label: "Пока не знаю" },
        ],
      },
      {
        key: "educationSpeed",
        label: "Что для вас важнее: быстрее начать работать или получить фундаментальное образование?",
        type: "single",
        options: [
          { code: "fast", label: "Быстрее начать работать" },
          { code: "fundamental", label: "Фундаментальное образование" },
          { code: "not_sure", label: "Пока не знаю" },
        ],
      },
      {
        key: "examReadiness",
        label: "Готовы ли вы к ЕГЭ/ОГЭ и длительной учёбе в вузе?",
        type: "single",
        options: [
          { code: "yes", label: "Да, готов(а)" },
          { code: "maybe", label: "Возможно, но это пугает" },
          { code: "no", label: "Нет, хочу более короткий путь" },
        ],
      },
    ],
  },
];

const TEEN_SERIES: QuestionSeries[] = [
  {
    id: "teen-subjects",
    title: "Учёба и уверенность",

    questions: [
      {
        key: "favoriteSubjects",
        label: "Любимые школьные предметы и кружки",
        type: "multi",
        options: [
          { code: "math", label: "Математика" },
          { code: "physics", label: "Физика" },
          { code: "chemistry_biology", label: "Химия / биология" },
          { code: "history_social", label: "История и обществознание" },
          { code: "literature_languages", label: "Литература и языки" },
          { code: "informatics", label: "Информатика" },
          { code: "art_music", label: "Изобразительное искусство / музыка" },
          { code: "technology_labor", label: "Технология / труд" },
          { code: "sport", label: "Физкультура / спорт" },
          { code: "clubs", label: "Кружки и допзанятия" },
        ],
      },
      {
        key: "confidenceLevels",
        label: "Насколько вы уверены в себе в этих направлениях?",
        hint: "Оцените от 1 до 5",
        type: "scale-group",
        scaleMax: 5,
        scaleItems: [
          { key: "math", label: "Математика" },
          { key: "languages", label: "Языки" },
          { key: "creativity", label: "Творчество" },
          { key: "technical", label: "Техника" },
        ],
      },
      {
        key: "extracurricularActivities",
        label:
          "Участвовали ли вы в спортивных секциях, военно-патриотических или волонтёрских кружках?",
        type: "multi",
        options: [
          { code: "sport_section", label: "Спортивная секция" },
          { code: "military_patriotic", label: "Военно-патриотический кружок" },
          { code: "volunteering", label: "Волонтёрство" },
          { code: "none", label: "Ничего из перечисленного" },
        ],
      },
      {
        key: "handsOnAttitude",
        label:
          "Как вы относитесь к работе руками (техническое творчество, ремонт, конструирование)?",
        hint: "1 — совсем не нравится, 5 — очень нравится",
        type: "single",
        options: scaleOptions(),
      },
    ],
  },
  {
    id: "teen-plans",
    title: "Успехи и планы",
    questions: [
      {
        key: "successExperience",
        label: "Расскажите о проекте, олимпиаде или хобби, где у вас был реальный успех",
        type: "text",
      },
      {
        key: "studyAttitude",
        label: "Отношение к учёбе после школы",
        type: "single",
        options: [
          { code: "college", label: "Колледж" },
          { code: "university", label: "Вуз" },
          { code: "self_education", label: "Самообразование" },
          { code: "not_sure", label: "Пока не знаю" },
        ],
      },
      {
        key: "languagePlans",
        label: "Планы по изучению иностранных языков",
        type: "text",
        optional: true,
      },
    ],
  },
];

const ADULT_SERIES: QuestionSeries[] = [
  {
    id: "adult-experience",
    title: "Текущий опыт",
    questions: [
      { key: "currentProfession", label: "Текущая / последняя профессия и сфера", type: "text" },
      {
        key: "yearsOfExperience",
        label: "Стаж работы",
        type: "single",
        options: [
          { code: "0-1", label: "Менее 1 года" },
          { code: "1-3", label: "1–3 года" },
          { code: "3-6", label: "3–6 лет" },
          { code: "6-10", label: "6–10 лет" },
          { code: "10+", label: "Более 10 лет" },
        ],
      },
      {
        key: "likedAboutCurrentJob",
        label: "Что нравилось в текущей профессии?",
        type: "multi",
        options: [
          { code: "structure", label: "Структурированность" },
          { code: "numbers", label: "Работа с цифрами" },
          { code: "people", label: "Общение с людьми" },
          { code: "creative_part", label: "Творческая часть" },
          { code: "autonomy", label: "Самостоятельность" },
          { code: "stability", label: "Стабильность" },
          { code: "recognition", label: "Признание" },
          { code: "variety", label: "Разнообразие задач" },
        ],
      },
      {
        key: "dislikedAboutCurrentJob",
        label: "Что не нравилось в текущей профессии?",
        type: "multi",
        options: [
          { code: "routine", label: "Рутина" },
          { code: "no_growth", label: "Нет роста" },
          { code: "low_income", label: "Низкий доход" },
          { code: "high_stress", label: "Высокий стресс" },
          { code: "bad_team", label: "Плохой коллектив" },
          { code: "no_balance", label: "Нет баланса работы и жизни" },
          { code: "outdated_tech", label: "Устаревшие технологии" },
          { code: "no_recognition", label: "Нет признания" },
        ],
      },
    ],
  },
  {
    id: "adult-change",
    title: "Смена профессии",
    questions: [
      {
        key: "reasonForChange",
        label: "Причина желания сменить профессию",
        type: "multi",
        options: [
          { code: "burnout", label: "Выгорание" },
          { code: "automation", label: "Автоматизация профессии" },
          { code: "low_income", label: "Низкий доход" },
          { code: "meaning", label: "Хочу больше смысла" },
          { code: "learning", label: "Хочу учиться новому" },
          { code: "relocation", label: "Переезд / смена региона" },
          { code: "no_growth", label: "Нет карьерного роста" },
          { code: "meaningful_service", label: "Хочу более значимую/социально полезную работу" },
        ],
      },
      {
        key: "reasonForChangeComment",
        label: "Комментарий к причине смены профессии",
        type: "text",
        optional: true,
      },
      {
        key: "educationLevel",
        label: "Уровень образования",
        type: "single",
        options: [
          { code: "secondary", label: "Среднее" },
          { code: "vocational", label: "Среднее специальное" },
          { code: "higher", label: "Высшее" },
          { code: "degree", label: "Учёная степень" },
        ],
      },
      {
        key: "certifications",
        label:
          "Дополнительное профессиональное образование (например, «сертификат Google Ads», «курс Python со Stepik», «права категории С», «аттестация по охране труда»)",
        type: "text",
        optional: true,
      },
    ],
  },
  {
    id: "adult-readiness",
    title: "Готовность к переходу",
    questions: [
      {
        key: "retrainingTimeframe",
        label: "Готовность к переобучению — сроки",
        type: "single",
        options: [
          { code: "3-12_months", label: "До 3 месяцев" },
          { code: "up_to_year", label: "До года" },
          { code: "over_year", label: "Более года" },
        ],
      },
      {
        key: "retrainingFormat",
        label: "Готовность к переобучению — формат",
        type: "multi",
        options: [
          { code: "courses", label: "Курсы" },
          { code: "university", label: "Вуз" },
          { code: "self_study", label: "Самообучение" },
          { code: "mentorship", label: "Менторство" },
        ],
      },
      {
        key: "financialCushionCategory",
        label: "Финансовая «подушка» на время смены профессии",
        type: "single",
        options: [
          { code: "under_1_month", label: "Менее 1 месяца" },
          { code: "1-3_months", label: "1–3 месяца" },
          { code: "3-6_months", label: "3–6 месяцев" },
          { code: "6-12_months", label: "6–12 месяцев" },
          { code: "over_year", label: "Более года" },
        ],
      },
      {
        key: "familyLoad",
        label: "Семейное положение / нагрузка",
        type: "single",
        optional: true,
        options: [
          { code: "no_dependents", label: "Без иждивенцев" },
          { code: "with_dependents", label: "Есть дети / иждивенцы" },
          { code: "prefer_not_say", label: "Предпочитаю не указывать" },
        ],
      },
    ],
  },
];

export const AI_DIALOGUE_POOL: Question[] = [
  {
    key: "aiDialogue_joy",
    label: "Расскажите о случае, когда вы испытывали настоящее удовольствие от работы или учёбы.",
    type: "text",
  },
  {
    key: "aiDialogue_money",
    label: "Представьте, что деньги не имеют значения. Чем бы вы занимались?",
    type: "text",
  },
  {
    key: "aiDialogue_ease",
    label: "Опишите задачу, которая давалась вам легко, когда другим — тяжело.",
    type: "text",
  },
  {
    key: "aiDialogue_helped",
    label: "Расскажите о случае, когда вы помогли кому-то в сложной или срочной ситуации.",
    type: "text",
  },
  {
    key: "aiDialogue_admire",
    label: "Кем вы восхищаетесь профессионально и почему?",
    type: "text",
  },
];

const AI_DIALOGUE_SERIES: QuestionSeries = {
  id: "ai-dialogue",
  title: "ИИ-диалог",
  questions: AI_DIALOGUE_POOL,
};

export function getBaseSeries(category: Category): QuestionSeries[] {
  if (category === "teen") {
    return [...TEEN_COMMON_SERIES, ...TEEN_SERIES, AI_DIALOGUE_SERIES];
  }
  return [...COMMON_SERIES, ...ADULT_SERIES, AI_DIALOGUE_SERIES];
}


export function getRelocationSeries(): QuestionSeries {
  return RELOCATION_SERIES;
}
