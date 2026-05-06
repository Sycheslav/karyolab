import type {
  AnomalyTypeMeta,
  AtlasProbe,
  ChromosomeClassDef,
  ChromosomeLayer,
  ChromosomeObject,
  ExportJob,
  ExportTemplate,
  Fluorochrome,
  FreeEvent,
  GenomeLayout,
  GerminationEvent,
  HybridizationEvent,
  Ideogram,
  JournalEvent,
  KaryotypeImport,
  Metaphase,
  Note,
  PhotographingEvent,
  Plant,
  Preparation,
  Probe,
  Sample,
  SampleKaryotype,
  SlideEvent,
  SpeciesDef,
  StainedPreparation,
  SubgenomeDef,
  TheoreticalRecord,
  TiltEntry,
  WashEvent,
} from "./types";

/* ------------------------------------------------------------------ */
/* Образцы                                                             */
/* ------------------------------------------------------------------ */

const today = new Date();
const yyyy = today.getFullYear();
const mm = today.getMonth() + 1;

const TODAY_ISO = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
})();

export const initialSamples: Sample[] = [
  {
    id: "1772.01",
    species: "T. aestivum",
    sowingYear: 2023,
    generation: "F3",
    mother: "Saratovskaya 29",
    father: "Bezostaya 1",
    notes: "Линия с устойчивостью к ржавчине.",
    status: "result",
    createdAt: `${yyyy - 1}-09-15`,
    hasResult: true,
  },
  {
    id: "1774.22",
    species: "T. aestivum",
    sowingYear: 2023,
    generation: "F3",
    mother: "Saratovskaya 29",
    father: "Lutescens 70",
    status: "result",
    createdAt: `${yyyy - 1}-09-16`,
    hasResult: true,
  },
  {
    id: "1818.25",
    species: "T. aestivum",
    sowingYear: 2024,
    generation: "F2",
    mother: "Hybrid Line-B",
    father: "Native Wildtype",
    notes: "Базовая линия проекта — следить за стабильностью хранения.",
    status: "in_work",
    createdAt: `${yyyy}-01-12`,
  },
  {
    id: "1822.01",
    species: "T. aestivum",
    sowingYear: 2024,
    generation: "F2",
    status: "registered",
    createdAt: `${yyyy}-01-22`,
  },
  {
    id: "1902.11",
    species: "T. urartu",
    sowingYear: 2024,
    generation: "F1",
    status: "germinating",
    createdAt: `${yyyy}-02-04`,
  },
  {
    id: "1988.55",
    species: "Ae. speltoides",
    sowingYear: 2024,
    generation: "F1",
    status: "in_work",
    createdAt: `${yyyy}-03-19`,
  },
  {
    id: "2004.10",
    species: "Ae. speltoides",
    sowingYear: 2024,
    generation: "F1",
    status: "in_work",
    createdAt: `${yyyy}-03-21`,
  },
  {
    id: "2011.04",
    species: "T. aestivum",
    sowingYear: 2024,
    generation: "F2",
    status: "in_work",
    createdAt: `${yyyy}-04-02`,
  },
  {
    id: "2012.99",
    species: "T. aestivum",
    sowingYear: 2024,
    generation: "F2",
    status: "in_work",
    createdAt: `${yyyy}-04-04`,
  },
  {
    id: "2045.66",
    species: "T. urartu",
    sowingYear: 2024,
    generation: "F2",
    status: "in_work",
    createdAt: `${yyyy}-05-14`,
  },
  {
    id: "2234.12",
    species: "T. aestivum",
    sowingYear: 2024,
    generation: "F2",
    status: "in_work",
    createdAt: `${yyyy}-06-03`,
  },
  {
    id: "49",
    species: "T. aestivum",
    sowingYear: 2024,
    generation: "F4",
    notes: "demo (height 98 cm, gluten 12.4%)",
    status: "result",
    createdAt: `${yyyy - 1}-08-10`,
    hasResult: true,
  },
  {
    id: "1730.25",
    species: "T. aestivum",
    sowingYear: 2024,
    generation: "F3",
    notes:
      "Препарат сфотографирован. Готов к импорту PSD и сборке кариотипа.",
    status: "in_work",
    createdAt: `${yyyy - 1}-09-01`,
  },
];

/* ------------------------------------------------------------------ */
/* Растения                                                            */
/* ------------------------------------------------------------------ */

export const initialPlants: Plant[] = [
  {
    id: "1818.25.1",
    sampleId: "1818.25",
    name: "Растение Альфа-1",
    location: "Теплица A · Лоток 04",
    state: "used",
  },
  {
    id: "1818.25.2",
    sampleId: "1818.25",
    name: "Растение Гамма-Бета",
    location: "Камера C · Полка 2",
    state: "growing",
  },
  {
    id: "1988.55.1",
    sampleId: "1988.55",
    name: "Растение 1988-A",
    location: "Теплица B · Лоток 01",
    state: "used",
  },
  {
    id: "2011.04.1",
    sampleId: "2011.04",
    name: "Растение 2011-A",
    location: "Теплица A · Лоток 02",
    state: "used",
  },
  {
    id: "2234.12.1",
    sampleId: "2234.12",
    name: "Растение 2234-A",
    location: "Теплица B · Лоток 03",
    state: "used",
  },
  {
    id: "2045.66.1",
    sampleId: "2045.66",
    name: "Растение 2045-A",
    location: "Теплица A · Лоток 05",
    state: "used",
  },
  {
    id: "1730.25.1",
    sampleId: "1730.25",
    name: "Растение 1730-A",
    location: "Теплица A · Лоток 07",
    state: "used",
  },
  {
    id: "1772.01.1",
    sampleId: "1772.01",
    name: "Растение 1772-A",
    location: "Теплица B · Лоток 06",
    state: "used",
  },
];

/* ------------------------------------------------------------------ */
/* Препараты — статусы соответствуют документации                       */
/* ------------------------------------------------------------------ */

export const initialPreparations: Preparation[] = [
  {
    id: "1818.25.1.1",
    sampleId: "1818.25",
    source: { kind: "plant", plantId: "1818.25.1" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-15`,
    quality: "high",
    status: "created",
    fridge: "Шкаф 12",
    box: "Ящик B",
    comment: "Отличная видимость ядер.",
    stainCycle: 0,
  },
  {
    id: "1818.25.1.2",
    sampleId: "1818.25",
    source: { kind: "plant", plantId: "1818.25.1" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-15`,
    quality: "high",
    status: "created",
    fridge: "Стол 3",
    box: "Временный",
    stainCycle: 0,
  },
  {
    id: "1818.25.0.1",
    sampleId: "1818.25",
    source: { kind: "mix" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-15`,
    quality: "medium",
    status: "created",
    fridge: "Шкаф 12",
    box: "Ящик B",
    comment: "Из смеси растений Альфа+Гамма.",
    stainCycle: 0,
  },
  {
    id: "2011.04.1.1",
    sampleId: "2011.04",
    source: { kind: "plant", plantId: "2011.04.1" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-09`,
    quality: "medium",
    status: "pre_washed",
    fridge: "F-04",
    box: "BX-22",
    stainCycle: 0,
  },
  {
    id: "2011.04.1.2",
    sampleId: "2011.04",
    source: { kind: "plant", plantId: "2011.04.1" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-09`,
    quality: "high",
    status: "pre_washed",
    fridge: "F-04",
    box: "BX-22",
    stainCycle: 0,
  },
  {
    id: "1988.55.1.1",
    sampleId: "1988.55",
    source: { kind: "plant", plantId: "1988.55.1" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-09`,
    quality: "high",
    status: "hybridized",
    fridge: "F-02",
    box: "BX-11",
    stainCycle: 0,
  },
  {
    id: "2234.12.1.1",
    sampleId: "2234.12",
    source: { kind: "plant", plantId: "2234.12.1" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-02`,
    quality: "high",
    status: "rehyb_ready",
    fridge: "F-03",
    box: "BX-15",
    stainCycle: 2,
    comment: "Переотмыт после второго цикла гибридизации, готов к новой окраске.",
  },
  {
    id: "1988.55.1.2",
    sampleId: "1988.55",
    source: { kind: "plant", plantId: "1988.55.1" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-04`,
    quality: "high",
    status: "photographed_undecided",
    fridge: "F-02",
    box: "BX-12",
    stainCycle: 0,
    comment:
      "Сфотографирован, судьба не решена — ждёт оператора для решения «переотмыть/выбросить».",
  },
  {
    id: "2045.66.1.1",
    sampleId: "2045.66",
    source: { kind: "plant", plantId: "2045.66.1" },
    createdAt: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-25`,
    quality: "medium",
    status: "photographed",
    fridge: "F-03",
    box: "BX-15",
    stainCycle: 1,
  },
  {
    id: "1730.25.1.1",
    sampleId: "1730.25",
    source: { kind: "plant", plantId: "1730.25.1" },
    createdAt: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-12`,
    quality: "high",
    status: "photographed",
    fridge: "F-04",
    box: "BX-30",
    stainCycle: 1,
    comment: "Готов к разметке кариотипа.",
  },
  {
    id: "1772.01.1.1",
    sampleId: "1772.01",
    source: { kind: "plant", plantId: "1772.01.1" },
    createdAt: `${yyyy - 1}-10-22`,
    quality: "high",
    status: "photographed",
    fridge: "F-02",
    box: "BX-08",
    stainCycle: 1,
    comment: "Полностью обработан, есть утвержденный кариотип.",
  },
];

/* ------------------------------------------------------------------ */
/* Окраски                                                              */
/* ------------------------------------------------------------------ */

export const initialStained: StainedPreparation[] = [
  {
    id: "1988.55.1.1.1",
    preparationId: "1988.55.1.1",
    cycleNumber: 1,
    probes: [
      { name: "pAs1", channel: "red" },
      { name: "GAA", channel: "green" },
      { name: "DAPI", channel: "blue" },
    ],
    hybridizationDate: `${yyyy}-${String(mm).padStart(2, "0")}-11`,
    status: "created",
  },
  {
    id: "2234.12.1.1.1",
    preparationId: "2234.12.1.1",
    cycleNumber: 1,
    probes: [
      { name: "GAA", channel: "green" },
      { name: "pAs1", channel: "red" },
    ],
    hybridizationDate: `${yyyy}-${String(Math.max(1, mm - 2)).padStart(2, "0")}-12`,
    status: "closed_wash",
    fate: "washed",
  },
  {
    id: "2234.12.1.1.2",
    preparationId: "2234.12.1.1",
    cycleNumber: 2,
    probes: [
      { name: "pAs119", channel: "red" },
      { name: "GAA", channel: "green" },
    ],
    hybridizationDate: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-15`,
    status: "closed_wash",
    fate: "washed",
  },
  {
    id: "1988.55.1.2.1",
    preparationId: "1988.55.1.2",
    cycleNumber: 1,
    probes: [
      { name: "pAs1", channel: "red" },
      { name: "GAA", channel: "green" },
    ],
    hybridizationDate: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-20`,
    status: "photographed_undecided",
    fate: "undecided",
  },
  {
    id: "2045.66.1.1.1",
    preparationId: "2045.66.1.1",
    cycleNumber: 1,
    probes: [
      { name: "pAs1", channel: "red" },
      { name: "GAA", channel: "green" },
    ],
    hybridizationDate: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-22`,
    status: "photographed",
  },
  {
    id: "1730.25.1.1.1",
    preparationId: "1730.25.1.1",
    cycleNumber: 1,
    probes: [
      { name: "GAA", channel: "green" },
      { name: "pAs119", channel: "red" },
      { name: "pAs1", channel: "red" },
    ],
    hybridizationDate: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-08`,
    status: "photographed",
  },
  {
    id: "1772.01.1.1.1",
    preparationId: "1772.01.1.1",
    cycleNumber: 1,
    probes: [
      { name: "pAs1", channel: "red" },
      { name: "GAA", channel: "green" },
      { name: "DAPI", channel: "blue" },
    ],
    hybridizationDate: `${yyyy - 1}-10-15`,
    status: "photographed",
  },
];

/* ------------------------------------------------------------------ */
/* Каталог зондов                                                      */
/* ------------------------------------------------------------------ */

export const initialProbes: Probe[] = [
  { id: "p1", name: "pAs1", channel: "red" },
  { id: "p2", name: "pAs119", channel: "red" },
  { id: "p3", name: "GAA", channel: "green" },
  { id: "p4", name: "DAPI", channel: "blue" },
  { id: "p5", name: "GFP", channel: "green" },
  { id: "p6", name: "RFP", channel: "red" },
];

/* ------------------------------------------------------------------ */
/* Ивенты — привязаны к текущему месяцу, чтобы календарь сразу жил     */
/* ------------------------------------------------------------------ */

const M = (d: number, t = "09:00") => {
  const dd = String(d).padStart(2, "0");
  const mmStr = String(mm).padStart(2, "0");
  return `${yyyy}-${mmStr}-${dd}T${t}:00`;
};

export const initialEvents: JournalEvent[] = [
  {
    id: "EV-GER-001",
    type: "germination",
    title: `Проращивание · Партия GER-${yyyy}-${String(mm).padStart(2, "0")}-A`,
    batchName: `GER-${yyyy}-${String(mm).padStart(2, "0")}-A`,
    sampleIds: ["1818.25", "1822.01", "1902.11"],
    estimatedDays: 14,
    currentStep: 2,
    startDate: M(3, "08:00"),
    endDate: M(8, "20:00"),
    operator: "Лаборант",
    status: "active",
    comment: "Старт цикла, закладка семян.",
    createdAt: M(3, "08:00"),
  } as GerminationEvent,
  {
    id: "EV-WASH-009",
    type: "wash",
    title: `Предгибридизационная отмывка · Партия WP-${yyyy}-${String(mm).padStart(2, "0")}-09`,
    preparationIds: ["2011.04.1.1", "2011.04.1.2"],
    newFridge: "F-04",
    newBox: "BX-22",
    protocolNotes: "Стандартный 3xSSC при 42°C, 2 цикла по 5 минут.",
    startDate: M(9, "11:00"),
    endDate: M(9, "12:30"),
    operator: "Лаборант",
    status: "completed",
    createdAt: M(9, "11:00"),
  } as WashEvent,
  {
    id: "EV-HYB-011",
    type: "hybridization",
    title: `Гибридизация · Партия HYB-${yyyy}-${String(mm).padStart(2, "0")}-11`,
    batchName: `HYB-${yyyy}-${String(mm).padStart(2, "0")}-11`,
    preparationIds: ["1988.55.1.1"],
    probes: [
      { name: "pAs1", channel: "red" },
      { name: "GAA", channel: "green" },
      { name: "DAPI", channel: "blue" },
    ],
    startDate: M(11, "10:00"),
    endDate: M(13, "10:00"),
    operator: "Dr. Helena Vance",
    status: "active",
    comment: "48-часовой цикл гибридизации.",
    createdAt: M(11, "10:00"),
  } as HybridizationEvent,
  {
    id: "EV-PHOTO-024",
    type: "photographing",
    title: `Фотографирование · Сессия ${yyyy}-${String(mm).padStart(2, "0")}`,
    stainedDecisions: [
      {
        stainedId: "2234.12.1.1.1",
        fate: "washed",
        newFridge: "F-04",
        newBox: "BX-22",
      },
    ],
    startDate: M(24, "09:15"),
    endDate: M(24, "11:45"),
    operator: "Dr. Helena Vance",
    status: "completed",
    comment: "Серия по линии 2234.",
    createdAt: M(24, "09:15"),
  } as PhotographingEvent,
  {
    id: "EV-SLIDE-015",
    type: "slide",
    title: "Создание препарата · Растение Альфа-1",
    sampleId: "1818.25",
    source: { kind: "plant", plantId: "1818.25.1" },
    quality: "high",
    storageJar: "Банка 12",
    storageFridge: "Холодильник A",
    preparationIds: ["1818.25.1.1", "1818.25.1.2"],
    startDate: M(15, "13:00"),
    operator: "Лаборант",
    status: "completed",
    createdAt: M(15, "13:00"),
  } as SlideEvent,
  {
    id: "EV-SLIDE-016",
    type: "slide",
    title: "Создание препарата · Смесь растений 1818.25",
    sampleId: "1818.25",
    source: { kind: "mix" },
    quality: "medium",
    storageJar: "Банка 12",
    storageFridge: "Холодильник A",
    preparationIds: ["1818.25.0.1"],
    startDate: M(15, "14:00"),
    operator: "Лаборант",
    status: "completed",
    createdAt: M(15, "14:00"),
  } as SlideEvent,
  {
    id: "EV-FREE-001",
    type: "free",
    title: "Калибровка микроскопа Leica DM6",
    startDate: M(7, "10:00"),
    operator: "Лаборант",
    status: "completed",
    comment:
      "Полная калибровка по протоколу ISO-9001. Световая интенсивность стабильна.",
    createdAt: M(7, "10:00"),
  } as FreeEvent,
  {
    id: "EV-FIX-TODAY",
    type: "free",
    title: "Фиксация 24ч · Партия B-112",
    startDate: `${TODAY_ISO}T09:00:00`,
    status: "active",
    operator: "Лаборант",
    createdAt: `${TODAY_ISO}T09:00:00`,
  } as FreeEvent,
  {
    id: "EV-PLANT-CHECK-TODAY",
    type: "free",
    title: "Проверка всходов · Лоток 04",
    startDate: `${TODAY_ISO}T11:30:00`,
    status: "active",
    operator: "Лаборант",
    tags: ["наблюдение", "проращивание"],
    createdAt: `${TODAY_ISO}T11:30:00`,
  } as FreeEvent,
  // Демо-стак: ещё один slide-ивент в тот же день, чтобы виден был
  // агрегатор «Создание препарата · N шт.» (правка 2).
  {
    id: "EV-SLIDE-017",
    type: "slide",
    title: "Создание препарата · Растение Альфа-1 (вторая партия)",
    sampleId: "1818.25",
    source: { kind: "plant", plantId: "1818.25.1" },
    quality: "medium",
    storageJar: "Банка 12",
    storageFridge: "Холодильник A",
    preparationIds: [],
    startDate: M(15, "16:00"),
    operator: "Лаборант",
    status: "completed",
    createdAt: M(15, "16:00"),
  } as SlideEvent,
];

/* ------------------------------------------------------------------ */
/* Заметки (3 активных + 3 архивных)                                   */
/* ------------------------------------------------------------------ */

export const initialNotes: Note[] = [
  {
    id: "N-1",
    title: `Закладка GER-${yyyy}-B`,
    body:
      "Подготовить второй цикл проращивания на следующей неделе. Проверить запас фильтровальной бумаги и обновить протокол стратификации.",
    tags: ["план", "проращивание"],
    createdAt: `${TODAY_ISO}T18:30:00`,
    archived: false,
    pinned: true,
  },
  {
    id: "N-2",
    title: "Обновить SOP-HYB-01",
    body: "Обсудить с Dr. Vance уточнения по фиксации после гибридизации.",
    tags: ["протокол"],
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-26T11:10:00`,
    archived: false,
  },
  {
    id: "N-3",
    title: "Заявка на новые зонды",
    body: "Запросить pAs119 и GAA — остатки на исходе.",
    tags: ["закупка"],
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-25T09:50:00`,
    archived: false,
  },
  {
    id: "N-4",
    title: "Наблюдение по плотности хлоропластов: A-12",
    body:
      "Предварительный анализ — рост плотности на 14% при синем спектре. Стенки клеток без признаков стресса.",
    tags: ["наблюдение", "оптика"],
    createdAt: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-24T14:00:00`,
    archived: true,
  },
  {
    id: "N-5",
    title: "Брак партии: контаминация в виале 0049",
    body:
      "Грибковое поражение при 48-часовой инспекции. Стойка списана, отчёт об инциденте отправлен.",
    tags: ["инцидент", "контаминация"],
    createdAt: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-18T08:30:00`,
    archived: true,
  },
  {
    id: "N-6",
    title: "Закрыли первую фазу",
    body:
      "Основные препараты ушли в гибридизацию. Можно планировать фотографирование.",
    tags: ["веха"],
    createdAt: `${yyyy}-${String(Math.max(1, mm - 2)).padStart(2, "0")}-22T19:10:00`,
    archived: true,
  },
];

/* ------------------------------------------------------------------ */
/* История тильта                                                      */
/* ------------------------------------------------------------------ */

export const initialTilts: TiltEntry[] = (() => {
  const arr: TiltEntry[] = [];
  for (let i = 0; i < 8; i++) {
    arr.push({
      id: `T-today-${i}`,
      date: TODAY_ISO,
      level: i % 3 === 0 ? "perfect" : i % 3 === 1 ? "mild" : "calm",
    });
  }
  const monthDays = [
    { d: 25, level: "critical" as const },
    { d: 24, level: "mild" as const },
    { d: 23, level: "perfect" as const },
    { d: 22, level: "perfect" as const },
    { d: 21, level: "mild" as const },
  ];
  for (const m of monthDays) {
    arr.push({
      id: `T-${m.d}`,
      date: `${yyyy}-${String(mm).padStart(2, "0")}-${String(m.d).padStart(2, "0")}`,
      level: m.level,
    });
  }
  return arr;
})();

/* ================================================================== */
/* Кариотип: импорты, метафазы, хромосомы, идеограммы, layout, экспорт */
/* ================================================================== */

const KAR_DATE = `${yyyy}-${String(mm).padStart(2, "0")}-${String(
  Math.max(1, today.getDate() - 2)
).padStart(2, "0")}`;
const KAR_DATE_FULL = `${KAR_DATE}T11:30:00`;
const RESULT_DATE = `${yyyy - 1}-11-04T13:20:00`;

/* ----- helpers ----- */

function makeChromosomeBatch(
  metaphaseId: string,
  sampleId: string,
  stainedId: string,
  importId: string,
  count: number,
  /** seed for variability */
  baseSeed: number
): { chromosomes: ChromosomeObject[]; layers: ChromosomeLayer[] } {
  const chromosomes: ChromosomeObject[] = [];
  const layers: ChromosomeLayer[] = [];
  for (let i = 0; i < count; i++) {
    const seed = baseSeed + i * 7;
    const sizePx = 90 + (seed % 90); // 90..180
    // Слой PSD — служебный объект (имя из исходного файла), id остаётся синтетическим.
    const layerId = `LYR-${metaphaseId}-${String(i + 1).padStart(2, "0")}`;
    // Канонический id хромосомы: `<metaphase>.cNN`.
    const tempName = `${metaphaseId}.c${String(i + 1).padStart(2, "0")}`;
    const chromId = tempName;
    layers.push({
      id: layerId,
      importId,
      name: `untitled${i + 1}`,
      temporaryName: tempName,
      kind: "chromosome",
      included: true,
      maskSizePx: sizePx,
      sizeUmPerPx: 0.1,
      imageSeed: seed,
    });
    chromosomes.push({
      id: chromId,
      sampleId,
      metaphaseId,
      stainedId,
      sourceLayerId: layerId,
      importId,
      temporaryName: tempName,
      maskSizePx: sizePx,
      imageSeed: seed,
      bodyHue: 200 + (seed % 30),
      redSpots: (seed >> 1) % 3,
      greenSpots: (seed >> 2) % 4,
      centromereHint: 0.25 + ((seed % 50) / 100),
      status: "new",
    });
  }
  return { chromosomes, layers };
}

/* ----- 1730.25: пустой импорт, готов к работе ----- */

const IMPORT_1730: KaryotypeImport = {
  id: "KIM-1730",
  sampleId: "1730.25",
  preparationId: "1730.25.1.1",
  stainedId: "1730.25.1.1.1",
  psdFileName: "1730.25-GAA+pAs119+pAs1-21-112.14.psd",
  parsedSampleId: "1730.25",
  parsedProbes: ["GAA", "pAs119", "pAs1"],
  parsedPhotoNumber: "21",
  parsedCoordinates: "112.14",
  layerIds: [],
  status: "empty",
  warnings: [],
  history: [
    {
      id: "h1",
      ts: KAR_DATE_FULL,
      label: "Импорт открыт",
      detail: "Активный выбор: S-1730.25 · 1730.25.1.1.1",
      level: "info",
    },
  ],
  createdAt: KAR_DATE_FULL,
};

/* ----- 2045.66: committed импорт с 10 хромосомами ----- */

const META_2045 = "2045.66.1.1.1.m1";
const IMPORT_2045_ID = "KIM-2045";
const batch2045 = makeChromosomeBatch(
  META_2045,
  "2045.66",
  "2045.66.1.1.1",
  IMPORT_2045_ID,
  10,
  31
);
// дать 4 идеограммы
const IDEOGRAMS_2045: Ideogram[] = batch2045.chromosomes
  .slice(0, 4)
  .map((c, idx): Ideogram => {
    const idg: Ideogram = {
      id: `${c.id}.idg`,
      chromosomeId: c.id,
      lengthPx: c.maskSizePx,
      centromere: 0.32 + idx * 0.06,
      signals: [
        {
          id: `SIG-${c.id}-r1`,
          channel: "red",
          kind: "point",
          position: 0.18 + idx * 0.05,
          size: 2,
          probeName: "pAs1",
        },
        {
          id: `SIG-${c.id}-g1`,
          channel: "green",
          kind: idx === 1 ? "segment" : "point",
          position: 0.7 - idx * 0.04,
          size: 2,
          length: idx === 1 ? 0.12 : undefined,
          probeName: "GAA",
        },
      ],
      anomalies:
        idx === 2
          ? [
              {
                id: `ANO-${c.id}-1`,
                type: "atypical_block",
                position: 0.55,
                comment: "Блок повышенной плотности",
              },
            ]
          : [],
      savedAt: KAR_DATE_FULL,
    };
    return {
      ...idg,
      savedSnapshot: {
        centromere: idg.centromere,
        signals: idg.signals.map((s) => ({ ...s })),
        anomalies: idg.anomalies.map((a) => ({ ...a })),
      },
    };
  });
batch2045.chromosomes.forEach((c, idx) => {
  if (idx < 4) {
    c.ideogramId = `${c.id}.idg`;
    c.status = "has_ideogram";
  } else if (idx < 7) {
    c.status = "in_work";
  }
  // первые 6 раздадим в классы для демо genome layout
  if (idx < 6) {
    c.subgenome = ["A", "B", "D"][idx % 3];
    c.chromosomeClass = (idx % 3) + 1;
  }
});
const META_2045_OBJ: Metaphase = {
  id: META_2045,
  sampleId: "2045.66",
  stainedId: "2045.66.1.1.1",
  psdFileName: "2045.66-pAs1+GAA-08-204.55.psd",
  coordinates: "204.55",
  photoNumber: "08",
  chromosomeIds: batch2045.chromosomes.map((c) => c.id),
  quality: "medium",
  status: "marked",
  comment: "Импортировано 10 объектов, идёт разметка идеограмм.",
  createdAt: KAR_DATE_FULL,
};
const IMPORT_2045: KaryotypeImport = {
  id: IMPORT_2045_ID,
  sampleId: "2045.66",
  preparationId: "2045.66.1.1",
  stainedId: "2045.66.1.1.1",
  psdFileName: "2045.66-pAs1+GAA-08-204.55.psd",
  parsedSampleId: "2045.66",
  parsedProbes: ["pAs1", "GAA"],
  parsedPhotoNumber: "08",
  parsedCoordinates: "204.55",
  metaphaseId: META_2045,
  layerIds: batch2045.layers.map((l) => l.id),
  status: "committed",
  warnings: [],
  history: [
    {
      id: "h1",
      ts: KAR_DATE_FULL,
      label: "PSD прочитан",
      detail: "Найдено 10 хромосом и 1 фоновый слой",
      level: "info",
    },
    {
      id: "h2",
      ts: KAR_DATE_FULL,
      label: "Совпадение с окрашенным препаратом",
      detail: "2045.66.1.1.1 — pAs1 + GAA",
      level: "success",
    },
    {
      id: "h3",
      ts: KAR_DATE_FULL,
      label: "Сохранено 10 хромосом",
      level: "success",
    },
  ],
  createdAt: KAR_DATE_FULL,
  committedAt: KAR_DATE_FULL,
  savedChromosomeCount: 10,
};
const LAYOUT_2045: GenomeLayout = {
  id: "GLY-2045-1",
  sampleId: "2045.66",
  level: "metaphase",
  metaphaseId: META_2045,
  stainedId: "2045.66.1.1.1",
  subgenomes: ["A", "B", "D"],
  classCount: 7,
  assignments: batch2045.chromosomes
    .filter((c) => c.subgenome && c.chromosomeClass)
    .map((c) => ({
      chromosomeId: c.id,
      subgenome: c.subgenome!,
      chromosomeClass: c.chromosomeClass!,
    })),
  cells: [],
  anomalies: [],
  status: "draft",
  updatedAt: KAR_DATE_FULL,
};

/* ----- 1772.01: полный готовый кариотип (для экспорта) ----- */

const META_1772 = "1772.01.1.1.1.m1";
const IMPORT_1772_ID = "KIM-1772";
const batch1772 = makeChromosomeBatch(
  META_1772,
  "1772.01",
  "1772.01.1.1.1",
  IMPORT_1772_ID,
  21, // 7 классов × 3 субгенома
  101
);
// разложить ровно: классы 1..7 × субгеномы A/B/D
const SUBGENOMES_AESTIVUM = ["A", "B", "D"];
batch1772.chromosomes.forEach((c, idx) => {
  c.subgenome = SUBGENOMES_AESTIVUM[Math.floor(idx / 7)];
  c.chromosomeClass = (idx % 7) + 1;
  c.displayName = `${c.subgenome}${c.chromosomeClass}`;
  c.status = "has_ideogram";
  c.ideogramId = `${c.id}.idg`;
  c.selectedForKaryotype = true;
  c.confidence = "high";
});
const IDEOGRAMS_1772: Ideogram[] = batch1772.chromosomes.map(
  (c, idx): Ideogram => {
    const idg: Ideogram = {
      id: `${c.id}.idg`,
      chromosomeId: c.id,
      lengthPx: c.maskSizePx,
      centromere: 0.3 + (idx % 5) * 0.05,
      signals: [
        {
          id: `SIG-${c.id}-r1`,
          channel: "red",
          kind: "point",
          position: 0.2 + (idx % 7) * 0.05,
          size: 2,
          probeName: "pAs1",
        },
        {
          id: `SIG-${c.id}-g1`,
          channel: "green",
          kind: idx % 4 === 0 ? "segment" : "point",
          position: 0.65 - (idx % 5) * 0.05,
          size: 2,
          length: idx % 4 === 0 ? 0.08 : undefined,
          probeName: "GAA",
        },
      ],
      anomalies: [],
      savedAt: RESULT_DATE,
    };
    return {
      ...idg,
      savedSnapshot: {
        centromere: idg.centromere,
        signals: idg.signals.map((s) => ({ ...s })),
        anomalies: idg.anomalies.map((a) => ({ ...a })),
      },
    };
  }
);
const META_1772_OBJ: Metaphase = {
  id: META_1772,
  sampleId: "1772.01",
  stainedId: "1772.01.1.1.1",
  psdFileName: "1772.01-pAs1+GAA-12-088.21.psd",
  coordinates: "088.21",
  photoNumber: "12",
  chromosomeIds: batch1772.chromosomes.map((c) => c.id),
  quality: "high",
  status: "approved",
  createdAt: RESULT_DATE,
};
const IMPORT_1772: KaryotypeImport = {
  id: IMPORT_1772_ID,
  sampleId: "1772.01",
  preparationId: "1772.01.1.1",
  stainedId: "1772.01.1.1.1",
  psdFileName: "1772.01-pAs1+GAA-12-088.21.psd",
  parsedSampleId: "1772.01",
  parsedProbes: ["pAs1", "GAA"],
  parsedPhotoNumber: "12",
  parsedCoordinates: "088.21",
  metaphaseId: META_1772,
  layerIds: batch1772.layers.map((l) => l.id),
  status: "committed",
  warnings: [],
  history: [
    {
      id: "h1",
      ts: RESULT_DATE,
      label: "PSD прочитан",
      detail: "Найден 21 объект",
      level: "info",
    },
    {
      id: "h2",
      ts: RESULT_DATE,
      label: "Сохранён 21 хромосома",
      level: "success",
    },
  ],
  createdAt: RESULT_DATE,
  committedAt: RESULT_DATE,
  savedChromosomeCount: 21,
};
const LAYOUT_1772: GenomeLayout = {
  id: "GLY-1772-1",
  sampleId: "1772.01",
  level: "hybridization",
  stainedId: "1772.01.1.1.1",
  subgenomes: ["A", "B", "D"],
  classCount: 7,
  assignments: batch1772.chromosomes.map((c) => ({
    chromosomeId: c.id,
    subgenome: c.subgenome!,
    chromosomeClass: c.chromosomeClass!,
  })),
  cells: [],
  anomalies: [],
  status: "approved",
  updatedAt: RESULT_DATE,
};
const SAMPLE_KARYOTYPE_1772: SampleKaryotype = {
  id: "1772.01.kar.1",
  sampleId: "1772.01",
  title: "Кариотип образца S-1772.01 · pAs1 + GAA",
  status: "exported",
  layoutId: LAYOUT_1772.id,
  level: "hybridization",
  kind: "sample",
  selectedChromosomeIds: batch1772.chromosomes.map((c) => c.id),
  snapshot: batch1772.chromosomes.map((c) => ({
    chromosomeId: c.id,
    metaphaseId: c.metaphaseId,
    stainedId: c.stainedId,
    displayName: c.displayName,
    subgenome: c.subgenome,
    chromosomeClass: c.chromosomeClass,
    imageSeed: c.imageSeed,
    maskSizePx: c.maskSizePx,
    ideogramId: c.ideogramId,
  })),
  main: true,
  createdAt: RESULT_DATE,
  approvedAt: RESULT_DATE,
  exportIds: ["EXJ-1772-1"],
  isReference: true,
  referenceLabel: "Чайниз Спринг (мок)",
  referenceScope: "species",
  referenceSource: "lab",
  referenceNotes: "Кариотип образца T. aestivum, демонстрация",
};

const SAMPLE_KARYOTYPE_1772_META: SampleKaryotype = {
  id: "1772.01.kar.m1",
  sampleId: "1772.01",
  title: "Кариотип метафазы 1772.01.1.1.1.m1",
  status: "approved",
  layoutId: LAYOUT_1772.id,
  level: "metaphase",
  kind: "metaphase",
  selectedChromosomeIds: batch1772.chromosomes.slice(0, 21).map((c) => c.id),
  main: false,
  createdAt: RESULT_DATE,
  approvedAt: RESULT_DATE,
  exportIds: [],
};

const SAMPLE_KARYOTYPE_2045_REF: SampleKaryotype = {
  id: "2045.66.kar.1",
  sampleId: "2045.66",
  title: "Кариотип образца S-2045.66 · Эталон Aegilops",
  status: "approved",
  layoutId: LAYOUT_2045.id,
  level: "metaphase",
  kind: "sample",
  selectedChromosomeIds: batch2045.chromosomes.slice(0, 6).map((c) => c.id),
  main: false,
  createdAt: KAR_DATE_FULL,
  approvedAt: KAR_DATE_FULL,
  exportIds: [],
  isReference: true,
  referenceLabel: "Безостая 1 (мок)",
  referenceScope: "species",
  referenceSource: "lab",
};

const EXPORT_JOB_1772: ExportJob = {
  id: "EXJ-1772-1",
  templateType: "standard",
  templateId: "tpl-standard",
  sampleIds: ["1772.01"],
  karyotypeIds: ["1772.01.kar.1"],
  settings: {
    view: "chromosomes_with_ideograms",
    alignByCentromere: true,
    showProbeLabels: true,
    showAnomalyLabels: true,
    format: "tiff",
    quality: "publication",
  },
  status: "done",
  fileName: `S-1772.01_standard_overview_${yyyy - 1}-11-04.tiff`,
  createdAt: RESULT_DATE,
};

/* ----- экспортные шаблоны ----- */

export const initialExportTemplates: ExportTemplate[] = [
  {
    id: "tpl-standard",
    type: "standard",
    title: "Стандартный обзор",
    description:
      "Один образец, разметка по субгеномам и классам. Подходит для отчёта по образцу.",
  },
  {
    id: "tpl-multi",
    type: "multi_select",
    title: "Сравнение нескольких образцов",
    description:
      "Сетка с подколонками по образцам. Удобно для сравнения линий.",
  },
  {
    id: "tpl-free",
    type: "free_table",
    title: "Свободная таблица",
    description:
      "Произвольный выбор хромосом и порядка. Для иллюстраций к статьям.",
  },
  {
    id: "tpl-summary",
    type: "summary_table",
    title: "Сводная таблица",
    description:
      "Образец, число хромосом, зонды, аномалии. Без изображений.",
  },
];

/* ----- сборка коллекций ----- */

export const initialKaryotypeImports: KaryotypeImport[] = [
  IMPORT_1730,
  IMPORT_2045,
  IMPORT_1772,
];

export const initialChromosomeLayers: ChromosomeLayer[] = [
  ...batch2045.layers,
  ...batch1772.layers,
];

export const initialMetaphases: Metaphase[] = [META_2045_OBJ, META_1772_OBJ];

export const initialChromosomes: ChromosomeObject[] = [
  ...batch2045.chromosomes,
  ...batch1772.chromosomes,
];

export const initialIdeograms: Ideogram[] = [
  ...IDEOGRAMS_2045,
  ...IDEOGRAMS_1772,
];

export const initialGenomeLayouts: GenomeLayout[] = [LAYOUT_2045, LAYOUT_1772];

export const initialSampleKaryotypes: SampleKaryotype[] = [
  SAMPLE_KARYOTYPE_1772,
  SAMPLE_KARYOTYPE_1772_META,
  SAMPLE_KARYOTYPE_2045_REF,
];

export const initialExportJobs: ExportJob[] = [EXPORT_JOB_1772];

/** Демонстрационный список слоёв, который будет «прочитан» из PSD для 1730.25. */
export const DEMO_PSD_LAYERS_1730: ChromosomeLayer[] = (() => {
  const importId = IMPORT_1730.id;
  const layers: ChromosomeLayer[] = [];
  for (let i = 0; i < 8; i++) {
    const seed = 51 + i * 11;
    layers.push({
      id: `LYR-DEMO-1730-${String(i + 1).padStart(2, "0")}`,
      importId,
      name: `untitled${i + 1}`,
      temporaryName: `untitled${i + 1}`,
      kind: "chromosome",
      included: true,
      maskSizePx: 95 + (seed % 95),
      sizeUmPerPx: 0.1,
      imageSeed: seed,
    });
  }
  layers.push({
    id: "LYR-DEMO-1730-BG",
    importId,
    name: "background",
    temporaryName: "background",
    kind: "background",
    included: false,
    maskSizePx: 0,
    imageSeed: 0,
    warnings: ["служебный фон, исключаем из импорта"],
  });
  layers.push({
    id: "LYR-DEMO-1730-EMPTY",
    importId,
    name: "empty_mask",
    temporaryName: "empty_mask",
    kind: "empty",
    included: false,
    maskSizePx: 0,
    imageSeed: 0,
    warnings: ["пустой слой без маски"],
  });
  return layers;
})();

export const DEMO_PSD_FILE_1730 = "1730.25-GAA+pAs119+pAs1-21-112.14.psd";

/* ================================================================== */
/* Атлас: справочники                                                  */
/* ================================================================== */

export const initialFluorochromes: Fluorochrome[] = [
  { id: "FL-FITC", name: "FITC", channel: "green", description: "Зелёный флюорохром, возбуждение ~488 нм." },
  { id: "FL-TR", name: "Texas Red", channel: "red", description: "Красный флюорохром, возбуждение ~595 нм." },
  { id: "FL-CY3", name: "Cy3", channel: "red", description: "Цианиновый красный флюорохром." },
  { id: "FL-CY5", name: "Cy5", channel: "red", description: "Иногда заменяет красный канал." },
  { id: "FL-DAPI", name: "DAPI", channel: "blue", description: "Контрокраска ДНК.", isCounterstain: true },
  { id: "FL-AF488", name: "AlexaFluor 488", channel: "green", description: "Альтернатива FITC." },
];

export const initialAtlasProbes: AtlasProbe[] = [
  { id: "AP-pAs1", name: "pAs1", fluorochromeId: "FL-TR", target: "теломерный повтор", manufacturer: "Internal lab" },
  { id: "AP-pAs119", name: "pAs119", fluorochromeId: "FL-CY3", target: "теломерный повтор" },
  { id: "AP-GAA", name: "GAA", fluorochromeId: "FL-FITC", target: "(GAA)n микросателлит" },
  { id: "AP-DAPI", name: "DAPI", fluorochromeId: "FL-DAPI", target: "AT-обогащённые регионы", notes: "Контрокраска" },
  { id: "AP-GFP", name: "GFP", fluorochromeId: "FL-AF488", target: "демонстрационный" },
  { id: "AP-RFP", name: "RFP", fluorochromeId: "FL-TR", target: "демонстрационный" },
];

export const initialSubgenomes: SubgenomeDef[] = [
  { id: "SG-A", letter: "A", name: "A-геном пшеницы", description: "Donor: T. urartu" },
  { id: "SG-B", letter: "B", name: "B-геном пшеницы", description: "Donor: близок к Aegilops speltoides" },
  { id: "SG-D", letter: "D", name: "D-геном пшеницы", description: "Donor: Aegilops tauschii" },
  { id: "SG-R", letter: "R", name: "R-геном ржи", description: "Secale cereale" },
  { id: "SG-U", letter: "U", name: "U-геном Aegilops umbellulata" },
  { id: "SG-M", letter: "M", name: "M-геном Aegilops comosa" },
];

export const initialSpecies: SpeciesDef[] = [
  {
    id: "SP-aestivum",
    name: "пшеница мягкая",
    latinName: "T. aestivum",
    comment: "Гексаплоид 2n=42",
    ploidy: 6,
    expectedChromosomeCount: 42,
    templates: [
      { id: "ST-aestivum-default", name: "Стандарт ABD", subgenomes: ["A", "B", "D"], classCount: 7 },
      { id: "ST-aestivum-1bs", name: "С замещением 1RS.1BL", subgenomes: ["A", "B", "D", "R"], classCount: 7 },
    ],
  },
  {
    id: "SP-dicoccum",
    name: "пшеница двузернянка",
    latinName: "T. dicoccum",
    ploidy: 4,
    expectedChromosomeCount: 28,
    templates: [{ id: "ST-dicoccum-default", name: "Стандарт AB", subgenomes: ["A", "B"], classCount: 7 }],
  },
  {
    id: "SP-cereale",
    name: "рожь",
    latinName: "S. cereale",
    ploidy: 2,
    expectedChromosomeCount: 14,
    templates: [{ id: "ST-cereale-default", name: "Стандарт R", subgenomes: ["R"], classCount: 7 }],
  },
  {
    id: "SP-speltoides",
    name: "Aegilops speltoides",
    latinName: "Ae. speltoides",
    ploidy: 2,
    expectedChromosomeCount: 14,
    templates: [{ id: "ST-speltoides-default", name: "Стандарт S", subgenomes: ["S"], classCount: 7 }],
  },
  {
    id: "SP-urartu",
    name: "Triticum urartu",
    latinName: "T. urartu",
    ploidy: 2,
    expectedChromosomeCount: 14,
    templates: [{ id: "ST-urartu-default", name: "Стандарт A", subgenomes: ["A"], classCount: 7 }],
  },
];

export const initialChromosomeClasses: ChromosomeClassDef[] = (() => {
  const out: ChromosomeClassDef[] = [];
  const subs: { id: string; letter: string }[] = [
    { id: "SG-A", letter: "A" },
    { id: "SG-B", letter: "B" },
    { id: "SG-D", letter: "D" },
  ];
  for (const sg of subs) {
    for (let n = 1; n <= 7; n++) {
      out.push({
        id: `CC-${n}${sg.letter}`,
        label: `${n}${sg.letter}`,
        subgenomeId: sg.id,
        classNumber: n,
        type: "standard",
      });
    }
  }
  out.push({
    id: "CC-1RS-1BL",
    label: "1RS.1BL",
    subgenomeId: "SG-B",
    classNumber: 1,
    type: "translocation",
    description: "Транслокация ржи 1RS на 1BL пшеницы.",
  });
  out.push({
    id: "CC-5D-5R",
    label: "5D(5R)",
    subgenomeId: "SG-D",
    classNumber: 5,
    type: "substitution",
    synonyms: ["5D-5R", "subst 5D"],
  });
  return out;
})();

export const initialAnomalyTypes: AnomalyTypeMeta[] = [
  { code: "trisomy", label: "трисомия", description: "Три копии хромосомы вместо двух.", defaultLevel: "metaphase", markerColor: "amber", markerShape: "tri" },
  { code: "aneuploidy", label: "анеуплоидия", description: "Изменение числа отдельных хромосом.", defaultLevel: "metaphase", markerColor: "amber", markerShape: "tri" },
  { code: "monosomy", label: "моносомия", description: "Одна копия вместо двух.", defaultLevel: "metaphase", markerColor: "amber", markerShape: "tri" },
  { code: "nullisomy", label: "нуллисомия", description: "Полное отсутствие пары.", defaultLevel: "metaphase", markerColor: "amber", markerShape: "tri" },
  { code: "substitution", label: "замещение", description: "Замена хромосомы из чужого субгенома.", defaultLevel: "chromosome", markerColor: "blue", markerShape: "tri" },
  { code: "translocation", label: "транслокация", description: "Перестановка участков между хромосомами.", defaultLevel: "chromosome", markerColor: "blue", markerShape: "tri" },
  { code: "atypical_block", label: "нетипичный блок", description: "Аномальный блок сигнала.", defaultLevel: "chromosome", markerColor: "red", markerShape: "tri" },
  { code: "missing_signal", label: "отсутствие сигнала", description: "Сигнал не виден там, где ожидается.", defaultLevel: "hybridization", markerColor: "red", markerShape: "tri" },
  { code: "foreign_material", label: "чужеродный материал", description: "Чужеродные хромосомы или фрагменты.", defaultLevel: "metaphase", markerColor: "red", markerShape: "tri" },
  { code: "doubtful", label: "сомнительный объект", description: "Объект под вопросом, требует проверки.", defaultLevel: "chromosome", markerColor: "slate", markerShape: "circle" },
];

export const initialTheoreticalRecords: TheoreticalRecord[] = [
  {
    id: "TH-1",
    title: "Вариант 5D у T. dicoccum (Smith et al. 2018)",
    scope: { kind: "taxon", ref: "SP-dicoccum" },
    sourceType: "literature",
    source: "Smith J. et al., Plant Genome 2018, p.123",
    description: "Описан вариант хромосомы 5D с дополнительным блоком сигнала pAs1.",
    relatedClassIds: ["CC-5D-5R"],
    createdAt: `${yyyy - 1}-12-04T09:00:00`,
  },
  {
    id: "TH-2",
    title: "Гипотеза 1RS.1BL у локальной линии",
    scope: { kind: "sample", ref: "1730.25" },
    sourceType: "hypothesis",
    description: "Возможна транслокация 1RS.1BL — требуется подтверждение.",
    relatedClassIds: ["CC-1RS-1BL"],
    createdAt: `${yyyy}-01-12T15:30:00`,
  },
  {
    id: "TH-3",
    title: "Теоретическая идеограмма R-генома",
    scope: { kind: "taxon", ref: "SP-cereale" },
    sourceType: "note",
    description: "Идеограмма стандартного R-генома для сверки.",
    createdAt: `${yyyy - 1}-08-22T11:00:00`,
  },
  {
    id: "TH-4",
    title: "Протокол сигналов GAA на 5D",
    scope: { kind: "taxon", ref: "SP-aestivum" },
    sourceType: "protocol",
    description: "Стандартный паттерн сигналов GAA на хромосоме 5D пшеницы.",
    relatedProbeIds: ["AP-GAA"],
    createdAt: `${yyyy}-02-19T10:00:00`,
  },
];
