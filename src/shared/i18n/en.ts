const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const en = {
  intl: 'en-US',

  common: {
    save: 'Save',
    add: 'Add',
    next: 'Next',
    back: 'Back',
    close: 'Close',
    dismiss: 'Dismiss',
    ok: 'OK',
    undo: 'Undo',
    delete: 'Delete',
    loading: 'Loading',
    noChanges: 'No changes',
    kcal: 'kcal',
    g: 'g',
    more: 'More',
    less: 'Less',
  },

  nav: {
    diary: 'Diary',
    coach: 'Coach',
    foods: 'Foods',
    profile: 'Profile',
    addFood: 'Add food',
  },

  meal: {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  },

  macro: {
    protein: 'Protein',
    fat: 'Fat',
    carbs: 'Carbs',
  },

  source: {
    photo: 'from a photo',
    text: 'from text',
    voice: 'by voice',
    barcode: 'from a barcode',
    manual: 'manually',
    favorite: 'from favorites',
  },

  confidence: {
    low: 'low confidence',
    medium: 'medium confidence',
    high: 'high confidence',
  },

  date: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    prevDay: 'Previous day',
    nextDay: 'Next day',
  },

  theme: {
    dark: 'Dark',
    light: 'Light',
    system: 'System',
  },

  splash: 'Loading your diary…',

  ring: {
    left: 'kcal left',
    over: 'kcal over',
  },

  summary: {
    macroGrams: (label: string) => `${label}, g`,
  },

  grams: {
    valuesFor: (grams: number) => `Values for ${grams} g`,
    calories: 'Calories',
  },

  toast: {
    logged: (kcal: number) => `Logged: ${kcal} kcal`,
    deleted: (name: string) => `"${name}" deleted`,
    removed: (name: string) => `"${name}" removed`,
    hidden: (name: string) => `"${name}" hidden from recent`,
    addedToFavorites: (name: string) => `"${name}" added to favorites`,
    allAddedToFavorites: 'Added to favorites',
    exported: 'File exported',
    statsUpdated: 'Stats updated',
    targetUpdated: 'Target updated',
  },

  entry: {
    added: (source: string) => `Added ${source}`,
    meal: 'Meal',
    mealOn: (day: string) => `Meal · ${day}`,
    eatenAt: 'Eaten at',
    addToFavorites: 'Add to favorites',
    lowConfidence: 'Low confidence estimate',
  },

  composer: {
    title: 'Add food',
    scanBarcode: 'Scan barcode',
    manual: 'Enter macros manually',
    takePhoto: 'Take a photo',
    placeholder: 'What did you eat?',
    placeholderOffline: 'Offline — recognition needs a connection',
    analyse: 'Analyse',
    recordVoice: 'Record voice',
    cancelRecording: 'Cancel recording',
    sendRecording: 'Send recording',
    recordingFailed: 'Recording failed. Please try again.',
    tabRecent: 'Recent',
    tabFavorites: 'Favorites',
    emptyFavorites: 'Save a food from the editor and it will show up here for one-tap adding.',
    emptyRecent: 'Nothing logged yet. Try describing a meal:',
    examples: [
      'Two eggs, toast with butter, coffee with milk',
      'A bowl of borscht with sour cream and rye bread',
      'Chicken breast 200 g with rice and salad',
    ],
    offline:
      'No connection — recognition is unavailable. The diary still works, and you can add food manually or from favorites.',
    micDeniedStandalone:
      'iOS asks for the microphone again every time the app is opened from the Home Screen. Tap Allow when it asks, or type it instead.',
    micDenied:
      'Microphone access is off for this site. Allow it in your browser settings, or type it instead.',
    typeInstead: 'Type it instead',
  },

  mic: {
    insecure: 'Voice input needs a secure (https) connection. Type what you ate instead.',
    denied: 'Microphone access is off. Allow it for this site in your browser settings, then try again.',
    missing: 'No microphone found on this device.',
    busy: 'The microphone is busy in another app. Close it and try again.',
    blocked: 'This page is not allowed to use the microphone.',
    unknown: 'Could not start recording. Try again, or type what you ate.',
  },

  analysis: {
    usually: 'Usually takes a few seconds',
    noFood: "Couldn't recognize any food. Try another photo.",
    stages: {
      photo: [
        'Reading the photo…',
        'Identifying the dishes…',
        'Estimating portion weight…',
        'Calculating calories and macros…',
      ],
      text: ['Reading your description…', 'Estimating portion weight…', 'Calculating calories and macros…'],
      voice: ['Transcribing what you said…', 'Identifying the dishes…', 'Calculating calories and macros…'],
      barcode: ['Looking up the product…', 'Reading the label…'],
      manual: ['Working on it…', 'Calculating calories and macros…'],
      favorite: ['Working on it…', 'Calculating calories and macros…'],
    },
  },

  photo: {
    title: 'Check the photo',
    retake: 'Retake',
    library: 'Library',
    hintLabel: 'Anything to add?',
    hintPlaceholder: 'e.g. fried in 2 tbsp of oil',
    hintHelp: 'A note about oil, sauce, or portion size makes the estimate noticeably better.',
    alt: 'Photo of the meal',
  },

  barcode: {
    title: 'Scan a Barcode',
    cameraUnavailable: 'Camera is unavailable. Enter the barcode number below instead.',
    noCamera: 'No camera access. Enter the barcode number below instead.',
    pointCamera: "Point the camera at the barcode — it's read automatically",
    orType: 'or type it in',
    numberLabel: 'Barcode number',
    numberPlaceholder: 'e.g. 5901234123457',
    lookUp: 'Look Up',
  },

  manual: {
    title: 'Enter Manually',
    name: 'Name',
    namePlaceholder: 'Cottage cheese 5%',
    per100: 'Per 100 grams',
    portion: 'Portion weight',
    remember: 'Save to "My Foods"',
  },

  draft: {
    review: 'Review the result',
    detected: (count: number) => `Detected: ${count}`,
    adjust: 'Adjust the weight if needed',
    allRemoved: 'All items removed',
    saveToFavorites: 'Save to favorites',
    addKcal: (kcal: number) => `Add ${kcal} kcal`,
    per100Line: (kcal: number, p: number, f: number, c: number) =>
      `Per 100 g: ${kcal} kcal · P ${p} · F ${f} · C ${c}`,
    removeItem: 'Remove item',
    name: 'Name',
  },

  foods: {
    title: 'My Foods',
    search: 'Search foods',
    favorites: 'Favorites',
    recent: 'Recent',
    noResults: 'No results found',
    remove: (name: string) => `Remove ${name}`,
    hide: (name: string) => `Hide ${name} from recent`,
    addToFavorites: (name: string) => `Add ${name} to favorites`,
    empty:
      'Foods you eat often will show up here. Save any item from the editor after recognition — then add it in one tap.',
    addManually: 'Add manually',
    showMore: 'Show more',
    entry: (grams: number, kcal: number) => `${grams} g · ${kcal} kcal`,
  },

  profile: {
    title: 'Profile',
    targetManual: 'Target set manually',
    targetAuto: 'Target calculated automatically',
    data: 'Data',
    bodyStats: 'Body stats',
    bodyLine: (male: boolean, age: number, height: number, weight: number) =>
      `${male ? 'M' : 'F'} · ${age} yrs · ${height} cm · ${weight} kg`,
    dailyTarget: 'Daily target',
    app: 'App',
    theme: 'Theme',
    language: 'Language',
    accessCode: 'Recognition access code',
    set: 'Set',
    notSet: 'Not set',
    diaryData: 'Diary Data',
    export: 'Export to JSON',
    deleteAll: 'Delete All Data',
    confirmDelete: 'Delete your profile and all entries? This cannot be undone.',
    footer: 'Yomiq · entries are stored only on this device',
    bodyTitle: 'Body Stats',
    targetTitle: 'Daily Target',
    accessTitle: 'Access Code',
    accessHelp:
      "Only needed if APP_ACCESS_CODE is set on the server. It protects recognition from other people's requests hitting your OpenAI key.",
    code: 'Code',
  },

  body: {
    male: 'Male',
    female: 'Female',
    age: 'Age',
    years: 'yrs',
    height: 'Height',
    cm: 'cm',
    weight: 'Weight',
    kg: 'kg',
    activity: 'Activity level',
    goal: 'Goal',
  },

  activity: {
    sedentary: { title: 'Sedentary', hint: 'Desk job, little walking' },
    light: { title: 'Lightly active', hint: '1–3 workouts a week' },
    moderate: { title: 'Moderately active', hint: '3–5 workouts a week' },
    high: { title: 'Very active', hint: '6–7 workouts a week' },
    athlete: { title: 'Athlete', hint: 'Two workouts a day, physical job' },
  },

  goal: {
    lose: { title: 'Lose weight', hint: '20% deficit from maintenance' },
    maintain: { title: 'Maintain weight', hint: 'Maintenance calories' },
    gain: { title: 'Gain muscle', hint: '15% surplus over maintenance' },
  },

  targets: {
    perDay: 'kcal per day',
    mismatch: (kcal: number) => `Macros add up to ${kcal} kcal — that doesn't match the target above.`,
    reset: 'Reset to calculated values',
    setManually: 'Set target manually',
  },

  onboarding: {
    tagline: 'Snap a photo, speak, or type — calories and macros get calculated for you.',
    highlightPhoto: 'Photo of a meal → weight and calories',
    highlightVoice: 'Voice and text instead of searching a database',
    highlightFavorites: 'Frequent meals — added in one tap',
    sexTitle: 'Your sex',
    sexHint: 'Needed for the metabolic rate formula',
    bodyTitle: 'Body stats',
    bodyHint: 'You can change these anytime',
    bodyInvalid: 'Double-check these values — something looks off.',
    activityTitle: 'Activity level',
    activityHint: 'Counting both work and workouts',
    goalTitle: 'Your goal',
    goalHint: 'This sets your daily target',
    targetTitle: 'Your daily target',
    targetHint: 'Calculated with the Mifflin-St Jeor formula',
    start: 'Start tracking',
    go: "Let's go",
  },

  coach: {
    title: 'Coach',
    pastReports: 'Past reports',
    days: (n: number) => `${n} days`,
    offline: 'Offline. Saved reports still open; new ones need a connection.',
    newReport: 'New report',
    analyse: 'Analyse my diet',
    reportMeta: (days: number, to: string, logged: number) =>
      `${days} days up to ${to.toLowerCase()} · ${logged} days logged`,
    noReports: 'No reports yet.',
    open: 'Open',
    historyMeta: (days: number, logged: number) => `${days} days · ${logged} logged`,
    questions: (n: number) => ` · ${n} ${plural(n, 'question', 'questions')}`,
    deleteReport: 'Delete report',
    notEnough: 'Not enough diary yet',
    missingDays: (logged: number, min: number, missing: number) =>
      `${logged} of ${min} days logged in this period. Log ${missing} more and the coach can look for patterns.`,
    missingEntries: (count: number, min: number) =>
      `${count} of ${min} items logged in this period. A few more and the coach can look for patterns.`,
    longerPeriod: 'Or pick a longer period above.',
    disclaimer:
      'The coach only reads what you logged. It is not a medical or psychological assessment and cannot diagnose anything. If eating feels out of your control, a doctor or a psychologist who works with eating behaviour can help.',
    suggestions: ['Why do I snack so much?', 'What should I change first?', 'Is my protein enough?'],
    ask: 'Ask',
    askPlaceholder: 'Ask the coach…',
    askOffline: 'Offline — questions need a connection',
    stages: [
      'Reading your diary…',
      'Measuring your patterns…',
      'Looking for what repeats…',
      'Writing your report…',
    ],
    unreachable: 'Could not reach the coach. Try again.',
    target: (value: string) => `Target: ${value}`,
    you: 'You',
    suggested: 'Suggested',
    yourTarget: 'Your target for comparison',
    hours: (n: number) => `${n}h`,
    dayInitials: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    effort: {
      easy: 'Easy',
      medium: 'Takes effort',
      hard: 'Hard',
    },
    series: {
      kcalByDay: 'Calories by day',
      snackShareByDay: 'Snack share by day',
      mealSplit: 'Calories by meal',
      macroSplit: 'Where your calories come from',
      topFoods: 'Biggest calorie contributors',
      timeHeatmap: 'When you eat',
      eatingWindow: 'Your eating window',
    },
  },

  errors: {
    offline: 'No connection. Add the item manually or try again later.',
    unreachable: 'Could not reach the server.',
    generic: 'Something went wrong.',
    accessCode: 'Invalid access code. Enter it in your profile.',
    rateLimited: 'Too many requests. Please wait a minute.',
    upstream: 'The AI service could not process the request. Please try again.',
    tooLarge: 'The request is too large.',
    noSpeech: 'Could not make out any speech.',
    photo: 'Could not process the photo.',
    barcodeInvalid: 'That barcode looks invalid.',
    barcodeOffline: 'No connection. Try again once you are online.',
    barcodeUnreachable: 'Could not reach the food database.',
    barcodeBusy: 'Food database is busy right now. Try again in a minute.',
    barcodeError: (status: number) => `Food database returned an error (${status}).`,
    barcodeNotFound: 'No product found for this barcode.',
    barcodeNoNutrition: 'This product has no nutrition data. Add it manually.',
    product: (code: string) => `Product ${code}`,
    foodItem: 'Food item',
  },
};

export type Dict = typeof en;
