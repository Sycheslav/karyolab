export type EventType =
  | "germination"
  | "slide"
  | "wash"
  | "hybridization"
  | "photographing"
  | "free";

/**
 * Статусы образца — соответствуют 03_статусы_и_жизненные_циклы.md.
 * `draft` оставлен для удобства черновика анкеты.
 */
export type SampleStatus =
  | "draft"
  | "registered" // зарегистрирован
  | "germinating" // проращивается
  | "in_work" // в работе
  | "result" // есть результат
  | "archived"; // архивный

/**
 * Статусы препарата (физического стекла) — 03_статусы_и_жизненные_циклы.md.
 *
 * `created` — создан
 * `pre_washed` — предгибридизационно отмыт
 * `hybridized` — гибридизован (есть активная окраска)
 * `photographed` — текущая окраска сфотографирована, судьба решена
 * `photographed_undecided` — сфотографирован, судьба не решена («решу позже»)
 * `rehyb_ready` — постгибридизационно отмыт, готов к повторной гибридизации
 * `discarded` — выброшен
 */
export type PreparationStatus =
  | "created"
  | "pre_washed"
  | "hybridized"
  | "photographed"
  | "photographed_undecided"
  | "rehyb_ready"
  | "discarded";

/**
 * Цикл окраски — отдельный объект «окрашенный препарат».
 *
 * `created` — гибридизация запущена, фото нет
 * `photographed` — окраска сфотографирована, судьба решена
 * `photographed_undecided` — сфотографирована, оператор отложил решение
 * `closed_wash` — закрыт постгибридизационной отмывкой
 * `closed_discard` — закрыт выбрасыванием
 */
export type StainStatus =
  | "created"
  | "photographed"
  | "photographed_undecided"
  | "closed_wash"
  | "closed_discard";

/**
 * Судьба окраски после фотографирования.
 * `undecided` — оператор отложил решение, не создавая нового ивента;
 * меняется потом из карточки препарата/окраски.
 */
export type StainFate = "washed" | "discarded" | "undecided";

export type ProbeChannel = "red" | "green" | "blue";

export type Quality = "high" | "medium" | "low";

/** Источник материала для препарата: конкретное растение или смесь растений. */
export type PreparationSource =
  | { kind: "plant"; plantId: string }
  | { kind: "mix" };

export interface Sample {
  /**
   * Канонический id образца — `<линия>.<год>` (см. `lib/naming.ts`).
   * Линия может быть числовой (`1730`) или буквенной (`добрыня`).
   */
  id: string;
  /** Альтернативное «читаемое» отображение для UI (`S-1730.25`). Хранится опционально. */
  displayId?: string;
  /** Свободное название партии/линии — отдельно от id. */
  name?: string;
  species: string;
  /**
   * id образца-матери. Это ссылка на другой `Sample.id`, а не свободная строка.
   * Если такого образца нет в системе — он будет создан как «пустой» (только id).
   */
  mother?: string;
  /**
   * id образца-отца. Это ссылка на другой `Sample.id`, а не свободная строка.
   * Если такого образца нет в системе — он будет создан как «пустой» (только id).
   */
  father?: string;
  sowingYear?: number;
  generation?: string;
  notes?: string;
  status: SampleStatus;
  createdAt: string; // ISO
  hasResult?: boolean;
}

export interface Plant {
  /** Канонический id растения: `<sample>.<n>`, для смеси — `<sample>.0`. */
  id: string;
  /** «Читаемое» отображение для UI (`PL-1730.25-1`, `PL-1730.25-MIX`). */
  displayId?: string;
  sampleId: string;
  name: string;
  location?: string;
  state: "growing" | "used" | "discarded";
}

export interface Preparation {
  /** Канонический id препарата: `<plant>.<n>` (например `1730.25.1.1`). */
  id: string;
  /** «Читаемое» отображение (`SLD-1730.25.1-1`). */
  displayId?: string;
  sampleId: string;
  /** Источник материала: растение или смесь растений. */
  source: PreparationSource;
  createdAt: string;
  quality: Quality;
  status: PreparationStatus;
  fridge?: string;
  box?: string;
  comment?: string;
  /** Сколько окрасок уже завершено (0..3). Текущая активная окраска не учитывается. */
  stainCycle?: number;
}

export interface StainedPreparation {
  /** Канонический id окраски: `<preparation>.<cycle>` (например `1730.25.1.1.1`). */
  id: string;
  /** «Читаемое» отображение (`STN-1-1730.25.1.1`). */
  displayId?: string;
  preparationId: string;
  /** Номер окраски: 1, 2 или 3. */
  cycleNumber: number;
  probes: { name: string; channel: ProbeChannel }[];
  hybridizationDate: string;
  status: StainStatus;
  fate?: StainFate;
}

export interface Probe {
  id: string;
  name: string;
  channel: ProbeChannel;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

interface EventBase {
  id: string;
  type: EventType;
  title: string;
  startDate: string; // ISO date or ISO datetime
  endDate?: string;
  comment?: string;
  operator?: string;
  status?: "active" | "completed" | "scheduled";
  createdAt: string;
}

export interface GerminationEvent extends EventBase {
  type: "germination";
  batchName: string;
  sampleIds: string[];
  estimatedDays: number;
  currentStep: number; // 0..6 index into protocol steps
}

export interface SlideEvent extends EventBase {
  type: "slide";
  sampleId: string;
  source: PreparationSource;
  quality: Quality;
  storageJar?: string;
  storageFridge?: string;
  preparationIds: string[];
}

export interface WashEvent extends EventBase {
  type: "wash";
  preparationIds: string[];
  newFridge?: string;
  newBox?: string;
  protocolNotes?: string;
}

export interface HybridizationEvent extends EventBase {
  type: "hybridization";
  batchName: string;
  preparationIds: string[];
  probes: { name: string; channel: ProbeChannel }[];
}

export interface PhotographingEvent extends EventBase {
  type: "photographing";
  stainedDecisions: {
    stainedId: string;
    fate: StainFate;
    newFridge?: string;
    newBox?: string;
  }[];
}

export interface FreeEvent extends EventBase {
  type: "free";
  attachmentName?: string;
  /** Свободные пользовательские теги (хеш-теги без `#`). */
  tags?: string[];
}

export type JournalEvent =
  | GerminationEvent
  | SlideEvent
  | WashEvent
  | HybridizationEvent
  | PhotographingEvent
  | FreeEvent;

/* ------------------------------------------------------------------ */
/* Notes & tilt                                                        */
/* ------------------------------------------------------------------ */

export interface Note {
  id: string;
  title: string;
  body: string;
  tags?: string[];
  createdAt: string; // ISO
  archived: boolean;
  pinned?: boolean;
}

/**
 * Уровни тильта оставлены для совместимости со старыми данными,
 * но в новом UI не используются: тильт — одно действие, одна кнопка `+`.
 * @deprecated будет удалено после полного перехода на одно-уровневый тильт.
 */
export type TiltLevel = "calm" | "mild" | "perfect" | "critical";

export interface TiltEntry {
  id: string;
  date: string; // YYYY-MM-DD
  /** @deprecated не используется в UI, оставлено для старых записей. */
  level?: TiltLevel;
}

export interface ChangeRecord {
  ts: string;
  title: string;
  detail?: string;
  href?: string;
}

/* ------------------------------------------------------------------ */
/* Кариотип                                                            */
/* ------------------------------------------------------------------ */

export type KaryotypeImportStatus =
  | "empty"
  | "preview"
  | "warning"
  | "committed"
  | "error";

export type ChromosomeStatus =
  | "new"
  | "in_work"
  | "classed"
  | "has_ideogram"
  | "candidate"
  | "selected"
  | "doubtful"
  | "excluded";

export type KaryotypeLevel = "metaphase" | "hybridization";

export type SignalChannel = "red" | "green" | "blue";

/**
 * Четыре типа сигналов на идеограмме (`05_идеограммы_и_сигналы.md`).
 * Хранятся в каналах `red` / `green`; синий (DAPI) идёт автоматически.
 */
export type SignalKind = "small_point" | "point" | "large_point" | "segment";

export type AnomalyType =
  | "trisomy"
  | "aneuploidy"
  | "monosomy"
  | "nullisomy"
  | "substitution"
  | "translocation"
  | "atypical_block"
  | "missing_signal"
  | "foreign_material"
  | "doubtful";

export type SampleKaryotypeStatus =
  | "draft"
  | "incomplete"
  | "ready_for_review"
  | "approved"
  | "exported"
  | "archived";

export type ExportTemplateType =
  | "standard"
  | "multi_select"
  | "free_table"
  | "summary_table";

/**
 * Форматы экспорта по `09_экспорт_и_шаблоны_обзоров.md`:
 * - `tiff` — основной растровый формат для изображений кариотипа;
 * - `excel` — табличные шаблоны (`.xlsx`);
 * - `text` — текстовые шаблоны (`.csv` / `.txt`).
 *
 * `png` / `pdf` оставлены для обратной совместимости с уже существующими
 * mock-задачами, но в новых сценариях не выбираются.
 */
export type ExportFormat = "tiff" | "excel" | "text" | "png" | "pdf";

export type ChromosomeLayerKind =
  | "chromosome"
  | "background"
  | "garbage"
  | "empty";

export interface ImportHistoryStep {
  id: string;
  ts: string;
  label: string;
  detail?: string;
  level?: "info" | "warning" | "error" | "success";
}

export interface ImportWarning {
  id: string;
  kind: "probe_conflict" | "duplicate_file" | "service_layers" | "no_layers";
  title: string;
  description?: string;
  acknowledged?: boolean;
  blocking?: boolean;
}

export interface ChromosomeLayer {
  id: string;
  importId: string;
  name: string;
  temporaryName: string;
  kind: ChromosomeLayerKind;
  included: boolean;
  maskSizePx: number;
  sizeUmPerPx?: number;
  warnings?: string[];
  /** Псевдо-сид для отрисовки превью. */
  imageSeed: number;
}

export interface KaryotypeImport {
  id: string;
  sampleId?: string;
  preparationId?: string;
  stainedId?: string;
  psdFileName: string;
  parsedSampleId?: string;
  parsedProbes?: string[];
  parsedPhotoNumber?: string;
  parsedCoordinates?: string;
  metaphaseId?: string;
  layerIds: string[];
  status: KaryotypeImportStatus;
  warnings: ImportWarning[];
  history: ImportHistoryStep[];
  createdAt: string;
  committedAt?: string;
  /** Сколько хромосом сохранено по результату commit. */
  savedChromosomeCount?: number;
}

export interface Metaphase {
  /** Канонический id метафазы: `<stained>.m<n>` (например `1730.25.1.1.1.m1`). */
  id: string;
  /** «Читаемое» отображение для UI. */
  displayId?: string;
  sampleId: string;
  stainedId: string;
  psdFileName: string;
  /** Координаты на стекле (например "21-112.14"). */
  coordinates?: string;
  photoNumber?: string;
  chromosomeIds: string[];
  quality: Quality;
  status: "new" | "marked" | "approved";
  comment?: string;
  createdAt: string;
}

export interface IdeogramSignal {
  id: string;
  channel: SignalChannel;
  kind: SignalKind;
  /** Позиция от 0 до 1 вдоль длины хромосомы. */
  position: number;
  /** Для отрезков — размер вдоль хромосомы (доля от длины). */
  length?: number;
  /** Размер точки 1..4. */
  size?: number;
  comment?: string;
  probeName?: string;
}

export interface IdeogramAnomaly {
  id: string;
  type: AnomalyType;
  position: number;
  comment?: string;
}

export interface Ideogram {
  id: string;
  chromosomeId: string;
  lengthPx: number;
  /** Положение центромеры от 0 до 1 (от вершины p-плеча). */
  centromere?: number;
  signals: IdeogramSignal[];
  anomalies: IdeogramAnomaly[];
  savedAt: string;
  /** Признак несохранённых правок относительно последнего save. */
  dirty?: boolean;
  /** Снимок состояния, к которому возвращаемся при «отменить правки». */
  savedSnapshot?: {
    centromere?: number;
    signals: IdeogramSignal[];
    anomalies: IdeogramAnomaly[];
  };
}

export interface ChromosomeObject {
  /** Канонический id хромосомы: `<metaphase>.c<NN>` (например `1730.25.1.1.1.m1.c01`). */
  id: string;
  /** Дополнительное «читаемое» отображение системного id (`PHO-…` и пр.). */
  displayId?: string;
  sampleId: string;
  metaphaseId: string;
  stainedId: string;
  sourceLayerId: string;
  importId: string;
  temporaryName: string;
  /** Имя класса после разметки: `1A`, `5D` и т. п. (отдельно от технического id). */
  displayName?: string;
  maskSizePx: number;
  imageSeed: number;
  /** Цвет тела хромосомы для mock-превью (DAPI, etc.) */
  bodyHue?: number;
  /** Подсчёт сигналов в исходной фотографии (для генерации миниатюры). */
  redSpots?: number;
  greenSpots?: number;
  centromereHint?: number; // 0..1
  subgenome?: string; // A, B, D, R, U, ...
  chromosomeClass?: number; // 1..7
  confidence?: "low" | "medium" | "high";
  status: ChromosomeStatus;
  ideogramId?: string;
  anomalyIds?: string[];
  selectedForKaryotype?: boolean;
  comment?: string;
  excludeReason?: string;
}

export interface GenomeAssignment {
  /** id хромосомы */
  chromosomeId: string;
  subgenome: string;
  chromosomeClass: number;
}

export type GenomeCellStatus =
  | "empty"
  | "monosomy"
  | "normal"
  | "trisomy"
  | "nullisomy"
  | "substitution"
  | "doubtful";

export interface GenomeCellMeta {
  subgenome: string;
  chromosomeClass: number;
  status: GenomeCellStatus;
  comment?: string;
  confirmed?: boolean;
}

export interface GenomeAnomaly {
  id: string;
  type: AnomalyType;
  subgenome?: string;
  chromosomeClass?: number;
  comment?: string;
}

export interface GenomeLayout {
  id: string;
  sampleId: string;
  level: KaryotypeLevel;
  metaphaseId?: string;
  stainedId?: string;
  /** Список колонок (субгеномов) — упорядоченный, с возможностью добавлять. */
  subgenomes: string[];
  /** Сколько строк (классов хромосом) в матрице. По умолчанию 7. */
  classCount: number;
  assignments: GenomeAssignment[];
  cells: GenomeCellMeta[];
  anomalies: GenomeAnomaly[];
  status: "draft" | "ready_for_review" | "approved";
  updatedAt: string;
}

/**
 * Снимок выбранной хромосомы внутри кариотипа образца.
 * Хранит ссылку на канонический id и ключевые поля, которые нужны
 * для устойчивости результата к правкам исходных метафаз
 * (`08_лицевой_кариотип_образца.md`).
 */
export interface ChromosomeSnapshot {
  chromosomeId: string;
  metaphaseId: string;
  stainedId: string;
  displayName?: string;
  subgenome?: string;
  chromosomeClass?: number;
  imageSeed: number;
  maskSizePx: number;
  ideogramId?: string;
}

export interface SampleKaryotype {
  /** Канонический id кариотипа образца: `<sample>.kar.<n>` (например `1730.25.kar.1`). */
  id: string;
  /** «Читаемое» отображение для UI. */
  displayId?: string;
  sampleId: string;
  title: string;
  status: SampleKaryotypeStatus;
  layoutId: string;
  level: KaryotypeLevel;
  selectedChromosomeIds: string[];
  /**
   * Снимок выбранных хромосом на момент сохранения кариотипа образца.
   * Делает результат независимым от живых правок исходных хромосом.
   */
  snapshot?: ChromosomeSnapshot[];
  /** Метка «лицевой кариотип образца» — основной для образца. */
  main?: boolean;
  /**
   * Принадлежит ли кариотип «обзору образца» (несколько метафаз) или
   * «кариотипу метафазы» (одна метафаза).
   */
  kind?: "sample" | "metaphase";
  createdAt: string;
  approvedAt?: string;
  exportIds: string[];
  /** Помечен как эталонный кариотип (для атласа). */
  isReference?: boolean;
  referenceLabel?: string;
  referenceScope?: "species" | "group" | "line" | "hypothesis";
  referenceSource?: "lab" | "literature" | "external";
  referenceNotes?: string;
}

export interface ExportTemplate {
  id: string;
  type: ExportTemplateType;
  title: string;
  description: string;
}

export interface ExportSettings {
  view: "chromosomes" | "chromosomes_with_ideograms" | "ideograms_only";
  alignByCentromere: boolean;
  showProbeLabels: boolean;
  showAnomalyLabels: boolean;
  format: ExportFormat;
  quality: "draft" | "publication";
}

export interface ExportJob {
  id: string;
  templateType: ExportTemplateType;
  templateId: string;
  sampleIds: string[];
  karyotypeIds: string[];
  settings: ExportSettings;
  status: "ready" | "generating" | "done" | "error";
  fileName?: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Атлас                                                               */
/* ------------------------------------------------------------------ */

export type FluorochromeChannel = ProbeChannel;

export interface Fluorochrome {
  id: string;
  name: string;
  channel: FluorochromeChannel;
  description?: string;
  isCounterstain?: boolean;
}

export interface AtlasProbe {
  id: string;
  name: string;
  fluorochromeId: string;
  target?: string;
  manufacturer?: string;
  notes?: string;
}

export interface SubgenomeDef {
  id: string;
  letter: string;
  name: string;
  description?: string;
}

export interface SpeciesTemplate {
  id: string;
  name: string;
  subgenomes: string[];
  classCount: number;
}

export interface SpeciesDef {
  id: string;
  name: string;
  latinName?: string;
  comment?: string;
  /**
   * Плоидность вида (`2n=42`, `2n=14` и т.д.).
   * Используется для подсчёта готовности кариотипа и подсказок в матрице.
   */
  ploidy?: number;
  /**
   * Ожидаемое типовое число хромосом (для пшеницы мягкой — 42, не 21).
   * Если не указано — берём `subgenomes.length * classCount * 2` из шаблона.
   */
  expectedChromosomeCount?: number;
  templates: SpeciesTemplate[];
}

export type ChromosomeClassType =
  | "standard"
  | "translocation"
  | "substitution"
  | "foreign"
  | "derivative";

export interface ChromosomeClassDef {
  id: string;
  label: string;
  subgenomeId: string;
  classNumber: number;
  type: ChromosomeClassType;
  synonyms?: string[];
  description?: string;
}

export type AnomalyLevel = "chromosome" | "metaphase" | "hybridization" | "sample";
export type AnomalyMarkerShape = "tri" | "circle" | "square";

export interface AnomalyTypeMeta {
  code: AnomalyType;
  label: string;
  description: string;
  defaultLevel: AnomalyLevel;
  markerColor: string;
  markerShape: AnomalyMarkerShape;
  comment?: string;
}

export type TheoreticalSourceType = "literature" | "hypothesis" | "note" | "protocol";

export interface TheoreticalRecord {
  id: string;
  title: string;
  scope: { kind: "taxon" | "sample"; ref: string };
  sourceType: TheoreticalSourceType;
  source?: string;
  description?: string;
  relatedClassIds?: string[];
  relatedProbeIds?: string[];
  relatedAnomalyCodes?: AnomalyType[];
  ideogramId?: string;
  isReference?: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Контекст атласа                                                     */
/* ------------------------------------------------------------------ */

export type AtlasViewMode =
  | "chromosomes"
  | "chromosomes_with_ideograms"
  | "ideograms_only";

export type AtlasScale = "sample" | "metaphase" | "all" | "summary";

export type AtlasSourceFilter = "all" | "lab" | "theoretical";

export type AtlasCompareLayout =
  | "two_side"
  | "multi"
  | "by_subgenome"
  | "by_preparation"
  | "by_probe"
  | "by_class";

export interface AtlasFilters {
  speciesIds: string[];
  subgenomes: string[];
  classIds: string[];
  anomalyCodes: AnomalyType[];
  source: AtlasSourceFilter;
  karyotypeStatuses: SampleKaryotypeStatus[];
}

export interface AtlasContext {
  viewMode: AtlasViewMode;
  alignByCentromere: boolean;
  showProbeLabels: boolean;
  showAnomalyLabels: boolean;
  selectedSampleIds: string[];
  selectedReferenceIds: string[];
  selectedTheoreticalIds: string[];
  selectedProbeId?: string;
  selectedPanelProbeIds: string[];
  probeSelectionMode: "single" | "panel";
  filters: AtlasFilters;
  scale: AtlasScale;
  compareLayout: AtlasCompareLayout;
  selectedCell?: { sub: string; cls: number };
}
