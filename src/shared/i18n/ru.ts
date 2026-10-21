import type { Dict } from './en';

/** Russian needs three forms: 1 вопрос, 2 вопроса, 5 вопросов. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const days = (n: number) => `${n} ${plural(n, 'день', 'дня', 'дней')}`;

export const ru: Dict = {
  intl: 'ru-RU',

  common: {
    save: 'Сохранить',
    add: 'Добавить',
    next: 'Далее',
    back: 'Назад',
    close: 'Закрыть',
    dismiss: 'Скрыть',
    ok: 'OK',
    undo: 'Отменить',
    delete: 'Удалить',
    loading: 'Загрузка',
    noChanges: 'Нет изменений',
    kcal: 'ккал',
    g: 'г',
    more: 'Больше',
    less: 'Меньше',
  },

  nav: {
    diary: 'Дневник',
    coach: 'Коуч',
    foods: 'Продукты',
    profile: 'Профиль',
    addFood: 'Добавить еду',
  },

  meal: {
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
    snack: 'Перекус',
  },

  macro: {
    protein: 'Белки',
    fat: 'Жиры',
    carbs: 'Углеводы',
  },

  source: {
    photo: 'по фото',
    text: 'из текста',
    voice: 'голосом',
    barcode: 'по штрихкоду',
    manual: 'вручную',
    favorite: 'из избранного',
  },

  confidence: {
    low: 'низкая уверенность',
    medium: 'средняя уверенность',
    high: 'высокая уверенность',
  },

  date: {
    today: 'Сегодня',
    yesterday: 'Вчера',
    tomorrow: 'Завтра',
    prevDay: 'Предыдущий день',
    nextDay: 'Следующий день',
  },

  theme: {
    dark: 'Тёмная',
    light: 'Светлая',
    system: 'Системная',
  },

  splash: 'Загружаем дневник…',

  ring: {
    left: 'ккал осталось',
    over: 'ккал сверх нормы',
  },

  summary: {
    macroGrams: (label: string) => `${label}, г`,
  },

  grams: {
    valuesFor: (grams: number) => `Значения на ${grams} г`,
    calories: 'Калории',
  },

  toast: {
    logged: (kcal: number) => `Записано: ${kcal} ккал`,
    deleted: (name: string) => `«${name}» удалено`,
    removed: (name: string) => `«${name}» убрано из избранного`,
    hidden: (name: string) => `«${name}» скрыто из недавних`,
    addedToFavorites: (name: string) => `«${name}» добавлено в избранное`,
    allAddedToFavorites: 'Добавлено в избранное',
    exported: 'Файл экспортирован',
    statsUpdated: 'Параметры обновлены',
    targetUpdated: 'Цель обновлена',
  },

  entry: {
    added: (source: string) => `Добавлено ${source}`,
    meal: 'Приём пищи',
    mealOn: (day: string) => `Приём пищи · ${day}`,
    eatenAt: 'Время',
    addToFavorites: 'В избранное',
    lowConfidence: 'Оценка неточная',
  },

  composer: {
    title: 'Добавить еду',
    scanBarcode: 'Сканировать штрихкод',
    manual: 'Ввести КБЖУ вручную',
    takePhoto: 'Сделать фото',
    placeholder: 'Что вы съели?',
    placeholderOffline: 'Нет сети — распознавание недоступно',
    analyse: 'Распознать',
    recordVoice: 'Записать голос',
    cancelRecording: 'Отменить запись',
    sendRecording: 'Отправить запись',
    recordingFailed: 'Запись не получилась. Попробуйте ещё раз.',
    tabRecent: 'Недавние',
    tabFavorites: 'Избранное',
    emptyFavorites: 'Сохраните продукт в редакторе — и он появится здесь для добавления в одно касание.',
    emptyRecent: 'Пока ничего не записано. Попробуйте описать блюдо:',
    examples: [
      'Два яйца, тост с маслом, кофе с молоком',
      'Тарелка борща со сметаной и ржаным хлебом',
      'Куриная грудка 200 г с рисом и салатом',
    ],
    offline:
      'Нет сети — распознавание недоступно. Дневник работает, еду можно добавить вручную или из избранного.',
    micDeniedStandalone:
      'iOS заново спрашивает доступ к микрофону при каждом запуске с экрана «Домой». Нажмите «Разрешить» или введите текстом.',
    micDenied: 'Доступ к микрофону для сайта выключен. Разрешите его в настройках браузера или введите текстом.',
    typeInstead: 'Ввести текстом',
  },

  mic: {
    insecure: 'Для голосового ввода нужно защищённое (https) соединение. Введите текстом.',
    denied: 'Доступ к микрофону выключен. Разрешите его для сайта в настройках браузера и попробуйте снова.',
    missing: 'Микрофон на устройстве не найден.',
    busy: 'Микрофон занят другим приложением. Закройте его и попробуйте снова.',
    blocked: 'Этой странице запрещено использовать микрофон.',
    unknown: 'Не удалось начать запись. Попробуйте снова или введите текстом.',
  },

  analysis: {
    usually: 'Обычно это занимает несколько секунд',
    noFood: 'Не удалось распознать еду. Попробуйте другое фото.',
    stages: {
      photo: ['Смотрим на фото…', 'Определяем блюда…', 'Оцениваем вес порции…', 'Считаем калории и БЖУ…'],
      text: ['Читаем описание…', 'Оцениваем вес порции…', 'Считаем калории и БЖУ…'],
      voice: ['Расшифровываем речь…', 'Определяем блюда…', 'Считаем калории и БЖУ…'],
      barcode: ['Ищем продукт…', 'Читаем этикетку…'],
      manual: ['Работаем…', 'Считаем калории и БЖУ…'],
      favorite: ['Работаем…', 'Считаем калории и БЖУ…'],
    },
  },

  photo: {
    title: 'Проверьте фото',
    retake: 'Переснять',
    library: 'Галерея',
    hintLabel: 'Что-то добавить?',
    hintPlaceholder: 'например, жарено на 2 ст. л. масла',
    hintHelp: 'Уточнение про масло, соус или размер порции заметно улучшает оценку.',
    alt: 'Фото блюда',
  },

  barcode: {
    title: 'Сканировать штрихкод',
    cameraUnavailable: 'Камера недоступна. Введите номер штрихкода ниже.',
    noCamera: 'Нет доступа к камере. Введите номер штрихкода ниже.',
    pointCamera: 'Наведите камеру на штрихкод — он считается автоматически',
    orType: 'или введите вручную',
    numberLabel: 'Номер штрихкода',
    numberPlaceholder: 'например, 4601234123457',
    lookUp: 'Найти',
  },

  manual: {
    title: 'Ввести вручную',
    name: 'Название',
    namePlaceholder: 'Творог 5%',
    per100: 'На 100 грамм',
    portion: 'Вес порции',
    remember: 'Сохранить в «Мои продукты»',
  },

  draft: {
    review: 'Проверьте результат',
    detected: (count: number) => `Найдено: ${count}`,
    adjust: 'Поправьте вес, если нужно',
    allRemoved: 'Все позиции удалены',
    saveToFavorites: 'Сохранить в избранное',
    addKcal: (kcal: number) => `Добавить ${kcal} ккал`,
    per100Line: (kcal: number, p: number, f: number, c: number) =>
      `На 100 г: ${kcal} ккал · Б ${p} · Ж ${f} · У ${c}`,
    removeItem: 'Удалить позицию',
    name: 'Название',
  },

  foods: {
    title: 'Мои продукты',
    search: 'Поиск продуктов',
    favorites: 'Избранное',
    recent: 'Недавние',
    noResults: 'Ничего не найдено',
    remove: (name: string) => `Убрать ${name}`,
    hide: (name: string) => `Скрыть ${name} из недавних`,
    addToFavorites: (name: string) => `Добавить ${name} в избранное`,
    empty:
      'Здесь появятся продукты, которые вы едите часто. Сохраните позицию в редакторе после распознавания — и добавляйте её в одно касание.',
    addManually: 'Добавить вручную',
    showMore: 'Показать ещё',
    entry: (grams: number, kcal: number) => `${grams} г · ${kcal} ккал`,
  },

  profile: {
    title: 'Профиль',
    targetManual: 'Цель задана вручную',
    targetAuto: 'Цель рассчитана автоматически',
    data: 'Данные',
    bodyStats: 'Параметры тела',
    bodyLine: (male: boolean, age: number, height: number, weight: number) =>
      `${male ? 'М' : 'Ж'} · ${age} ${plural(age, 'год', 'года', 'лет')} · ${height} см · ${weight} кг`,
    dailyTarget: 'Дневная цель',
    app: 'Приложение',
    theme: 'Тема',
    language: 'Язык',
    accessCode: 'Код доступа к распознаванию',
    set: 'Задан',
    notSet: 'Не задан',
    diaryData: 'Данные дневника',
    export: 'Экспорт в JSON',
    deleteAll: 'Удалить все данные',
    confirmDelete: 'Удалить профиль и все записи? Это действие нельзя отменить.',
    footer: 'Yomiq · записи хранятся только на этом устройстве',
    bodyTitle: 'Параметры тела',
    targetTitle: 'Дневная цель',
    accessTitle: 'Код доступа',
    accessHelp:
      'Нужен, только если на сервере задан APP_ACCESS_CODE. Он защищает распознавание от чужих запросов к вашему ключу OpenAI.',
    code: 'Код',
  },

  body: {
    male: 'Мужской',
    female: 'Женский',
    age: 'Возраст',
    years: 'лет',
    height: 'Рост',
    cm: 'см',
    weight: 'Вес',
    kg: 'кг',
    activity: 'Уровень активности',
    goal: 'Цель',
  },

  activity: {
    sedentary: { title: 'Сидячий', hint: 'Офисная работа, мало ходьбы' },
    light: { title: 'Лёгкая активность', hint: '1–3 тренировки в неделю' },
    moderate: { title: 'Средняя активность', hint: '3–5 тренировок в неделю' },
    high: { title: 'Высокая активность', hint: '6–7 тренировок в неделю' },
    athlete: { title: 'Спортсмен', hint: 'Две тренировки в день, физический труд' },
  },

  goal: {
    lose: { title: 'Похудеть', hint: 'Дефицит 20% от поддержания' },
    maintain: { title: 'Держать вес', hint: 'Калории поддержания' },
    gain: { title: 'Набрать мышцы', hint: 'Профицит 15% к поддержанию' },
  },

  targets: {
    perDay: 'ккал в день',
    mismatch: (kcal: number) => `БЖУ в сумме дают ${kcal} ккал — это не совпадает с целью выше.`,
    reset: 'Сбросить к расчётным значениям',
    setManually: 'Задать цель вручную',
  },

  onboarding: {
    tagline: 'Сфотографируйте, скажите или напишите — калории и БЖУ посчитаются сами.',
    highlightPhoto: 'Фото блюда → вес и калории',
    highlightVoice: 'Голос и текст вместо поиска по базе',
    highlightFavorites: 'Частые блюда — в одно касание',
    sexTitle: 'Ваш пол',
    sexHint: 'Нужен для формулы обмена веществ',
    bodyTitle: 'Параметры тела',
    bodyHint: 'Их можно изменить в любой момент',
    bodyInvalid: 'Проверьте значения — что-то выглядит странно.',
    activityTitle: 'Уровень активности',
    activityHint: 'Учитываем и работу, и тренировки',
    goalTitle: 'Ваша цель',
    goalHint: 'От неё зависит дневная норма',
    targetTitle: 'Ваша дневная норма',
    targetHint: 'Рассчитано по формуле Миффлина — Сан Жеора',
    start: 'Начать',
    go: 'Поехали',
  },

  coach: {
    title: 'Коуч',
    pastReports: 'Прошлые отчёты',
    days,
    offline: 'Нет сети. Сохранённые отчёты открываются, для новых нужно соединение.',
    newReport: 'Новый отчёт',
    analyse: 'Разобрать моё питание',
    reportMeta: (n: number, to: string, logged: number) =>
      `${days(n)} по ${to.toLowerCase()} · заполнено ${days(logged)}`,
    noReports: 'Отчётов пока нет.',
    open: 'Открыт',
    historyMeta: (n: number, logged: number) => `${days(n)} · заполнено ${logged}`,
    questions: (n: number) => ` · ${n} ${plural(n, 'вопрос', 'вопроса', 'вопросов')}`,
    deleteReport: 'Удалить отчёт',
    notEnough: 'Пока мало записей',
    missingDays: (logged: number, min: number, missing: number) =>
      `За период заполнено ${logged} из ${min} дней. Заполните ещё ${days(missing)}, и коуч сможет искать закономерности.`,
    missingEntries: (count: number, min: number) =>
      `За период записано ${count} из ${min} позиций. Ещё немного — и коуч сможет искать закономерности.`,
    longerPeriod: 'Или выберите период подлиннее.',
    disclaimer:
      'Коуч видит только то, что вы записали. Это не медицинская и не психологическая оценка, и он ничего не диагностирует. Если кажется, что питание выходит из-под контроля, помочь может врач или психолог, работающий с пищевым поведением.',
    suggestions: ['Почему я так часто перекусываю?', 'Что поменять в первую очередь?', 'Мне хватает белка?'],
    ask: 'Спросить',
    askPlaceholder: 'Спросите коуча…',
    askOffline: 'Нет сети — для вопросов нужно соединение',
    stages: ['Читаем дневник…', 'Измеряем привычки…', 'Ищем повторы…', 'Пишем отчёт…'],
    unreachable: 'Не удалось связаться с коучем. Попробуйте ещё раз.',
    target: (value: string) => `Цель: ${value}`,
    you: 'У вас',
    suggested: 'Совет',
    yourTarget: 'Ваша цель для сравнения',
    hours: (n: number) => `${n} ч`,
    dayInitials: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    effort: {
      easy: 'Легко',
      medium: 'Потребует усилий',
      hard: 'Сложно',
    },
    series: {
      kcalByDay: 'Калории по дням',
      snackShareByDay: 'Доля перекусов по дням',
      mealSplit: 'Калории по приёмам пищи',
      macroSplit: 'Откуда берутся калории',
      topFoods: 'Главные источники калорий',
      timeHeatmap: 'Когда вы едите',
      eatingWindow: 'Ваше пищевое окно',
    },
  },

  errors: {
    offline: 'Нет сети. Добавьте вручную или попробуйте позже.',
    unreachable: 'Не удалось связаться с сервером.',
    generic: 'Что-то пошло не так.',
    accessCode: 'Неверный код доступа. Введите его в профиле.',
    rateLimited: 'Слишком много запросов. Подождите минуту.',
    upstream: 'ИИ-сервис не смог обработать запрос. Попробуйте ещё раз.',
    tooLarge: 'Запрос слишком большой.',
    noSpeech: 'Не удалось разобрать речь.',
    photo: 'Не удалось обработать фото.',
    barcodeInvalid: 'Похоже, штрихкод неверный.',
    barcodeOffline: 'Нет сети. Попробуйте, когда появится соединение.',
    barcodeUnreachable: 'Не удалось связаться с базой продуктов.',
    barcodeBusy: 'База продуктов сейчас перегружена. Попробуйте через минуту.',
    barcodeError: (status: number) => `База продуктов вернула ошибку (${status}).`,
    barcodeNotFound: 'Продукт с таким штрихкодом не найден.',
    barcodeNoNutrition: 'У продукта нет данных о пищевой ценности. Добавьте вручную.',
    product: (code: string) => `Продукт ${code}`,
    foodItem: 'Продукт',
  },
};
