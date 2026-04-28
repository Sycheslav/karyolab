import type {
  FreeEvent,
  GerminationEvent,
  HybridizationEvent,
  JournalEvent,
  Note,
  PhotographingEvent,
  Plant,
  Preparation,
  Probe,
  Sample,
  SlideEvent,
  StainedPreparation,
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
    notes: "Созрел, но препарата ещё нет. Нужно поставить в работу.",
    status: "registered",
    createdAt: `${yyyy - 1}-09-01`,
  },
];

/* ------------------------------------------------------------------ */
/* Растения                                                            */
/* ------------------------------------------------------------------ */

export const initialPlants: Plant[] = [
  {
    id: "P1-1818.25",
    sampleId: "1818.25",
    name: "Растение Альфа-1",
    location: "Теплица A · Лоток 04",
    state: "used",
  },
  {
    id: "P2-1818.25",
    sampleId: "1818.25",
    name: "Растение Гамма-Бета",
    location: "Камера C · Полка 2",
    state: "growing",
  },
  {
    id: "P1-1988.55",
    sampleId: "1988.55",
    name: "Растение 1988-A",
    location: "Теплица B · Лоток 01",
    state: "used",
  },
  {
    id: "P1-2011.04",
    sampleId: "2011.04",
    name: "Растение 2011-A",
    location: "Теплица A · Лоток 02",
    state: "used",
  },
  {
    id: "P1-2234.12",
    sampleId: "2234.12",
    name: "Растение 2234-A",
    location: "Теплица B · Лоток 03",
    state: "used",
  },
];

/* ------------------------------------------------------------------ */
/* Препараты — статусы соответствуют документации                       */
/* ------------------------------------------------------------------ */

export const initialPreparations: Preparation[] = [
  {
    id: "SLD-1818-A",
    sampleId: "1818.25",
    source: { kind: "plant", plantId: "P1-1818.25" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-15`,
    quality: "high",
    status: "created",
    fridge: "Шкаф 12",
    box: "Ящик B",
    comment: "Отличная видимость ядер.",
    stainCycle: 0,
  },
  {
    id: "SLD-1818-B",
    sampleId: "1818.25",
    source: { kind: "plant", plantId: "P1-1818.25" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-15`,
    quality: "high",
    status: "created",
    fridge: "Стол 3",
    box: "Временный",
    stainCycle: 0,
  },
  {
    id: "SLD-1818-MIX",
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
    id: "SLD-2011-A",
    sampleId: "2011.04",
    source: { kind: "plant", plantId: "P1-2011.04" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-09`,
    quality: "medium",
    status: "pre_washed",
    fridge: "F-04",
    box: "BX-22",
    stainCycle: 0,
  },
  {
    id: "SLD-2011-B",
    sampleId: "2011.04",
    source: { kind: "plant", plantId: "P1-2011.04" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-09`,
    quality: "high",
    status: "pre_washed",
    fridge: "F-04",
    box: "BX-22",
    stainCycle: 0,
  },
  {
    id: "SLD-1988-A",
    sampleId: "1988.55",
    source: { kind: "plant", plantId: "P1-1988.55" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0")}-09`,
    quality: "high",
    status: "hybridized",
    fridge: "F-02",
    box: "BX-11",
    stainCycle: 0,
  },
  {
    id: "SLD-2234-A",
    sampleId: "2234.12",
    source: { kind: "plant", plantId: "P1-2234.12" },
    createdAt: `${yyyy}-${String(mm).padStart(2, "0") }-02`,
    quality: "high",
    status: "rehyb_ready",
    fridge: "F-03",
    box: "BX-15",
    stainCycle: 1,
    comment: "Готов к повторной гибридизации.",
  },
  {
    id: "SLD-2045-A",
    sampleId: "2045.66",
    source: { kind: "plant", plantId: "P1-2234.12" },
    createdAt: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-25`,
    quality: "medium",
    status: "photographed",
    fridge: "F-03",
    box: "BX-15",
    stainCycle: 1,
  },
];

/* ------------------------------------------------------------------ */
/* Окраски                                                              */
/* ------------------------------------------------------------------ */

export const initialStained: StainedPreparation[] = [
  {
    id: "STN-1988-A-1",
    preparationId: "SLD-1988-A",
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
    id: "STN-2234-A-1",
    preparationId: "SLD-2234-A",
    cycleNumber: 1,
    probes: [
      { name: "pAs119", channel: "red" },
      { name: "DAPI", channel: "blue" },
    ],
    hybridizationDate: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-15`,
    status: "closed_wash",
    fate: "washed",
  },
  {
    id: "STN-2045-A-1",
    preparationId: "SLD-2045-A",
    cycleNumber: 1,
    probes: [
      { name: "pAs1", channel: "red" },
      { name: "GAA", channel: "green" },
    ],
    hybridizationDate: `${yyyy}-${String(Math.max(1, mm - 1)).padStart(2, "0")}-22`,
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
    preparationIds: ["SLD-2011-A", "SLD-2011-B"],
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
    preparationIds: ["SLD-1988-A"],
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
        stainedId: "STN-2234-A-1",
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
    source: { kind: "plant", plantId: "P1-1818.25" },
    quality: "high",
    storageJar: "Банка 12",
    storageFridge: "Холодильник A",
    preparationIds: ["SLD-1818-A", "SLD-1818-B"],
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
    preparationIds: ["SLD-1818-MIX"],
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
    createdAt: `${TODAY_ISO}T11:30:00`,
  } as FreeEvent,
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
