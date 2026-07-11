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
];

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
        label: "Профильные сертификаты (если есть)",
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
];

const AI_DIALOGUE_SERIES: QuestionSeries = {
  id: "ai-dialogue",
  title: "ИИ-диалог",
  questions: AI_DIALOGUE_POOL,
};

export function getBaseSeries(category: Category): QuestionSeries[] {
  const branchSeries = category === "teen" ? TEEN_SERIES : ADULT_SERIES;
  return [...COMMON_SERIES, ...branchSeries, AI_DIALOGUE_SERIES];
}

export function getRelocationSeries(): QuestionSeries {
  return RELOCATION_SERIES;
}
