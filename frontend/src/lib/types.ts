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
  | "result"; // есть результат

/**
 * Статусы препарата (физического стекла) — 03_статусы_и_жизненные_циклы.md.
 *
 * `created` — создан
 * `pre_washed` — предгибридизационно отмыт
 * `hybridized` — гибридизован (есть активная окраска)
 * `photographed` — текущая окраска сфотографирована
 * `rehyb_ready` — постгибридизационно отмыт, готов к повторной гибридизации
 * `discarded` — выброшен
 */
export type PreparationStatus =
  | "created"
  | "pre_washed"
  | "hybridized"
  | "photographed"
  | "rehyb_ready"
  | "discarded";

/**
 * Цикл окраски — отдельный объект «окрашенный препарат».
 *
 * `created` — гибридизация запущена, фото нет
 * `photographed` — окраска сфотографирована
 * `closed_wash` — закрыт постгибридизационной отмывкой
 * `closed_discard` — закрыт выбрасыванием
 */
export type StainStatus = "created" | "photographed" | "closed_wash" | "closed_discard";

export type ProbeChannel = "red" | "green" | "blue";

export type Quality = "high" | "medium" | "low";

/** Источник материала для препарата: конкретное растение или смесь растений. */
export type PreparationSource =
  | { kind: "plant"; plantId: string }
  | { kind: "mix" };

export interface Sample {
  id: string;
  numericId?: string;
  name?: string;
  species: string;
  mother?: string;
  father?: string;
  sowingYear?: number;
  generation?: string;
  notes?: string;
  status: SampleStatus;
  createdAt: string; // ISO
  hasResult?: boolean;
}

export interface Plant {
  id: string;
  sampleId: string;
  name: string;
  location?: string;
  state: "growing" | "used" | "discarded";
}

export interface Preparation {
  id: string;
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
  id: string;
  preparationId: string;
  /** Номер окраски: 1, 2 или 3. */
  cycleNumber: number;
  probes: { name: string; channel: ProbeChannel }[];
  hybridizationDate: string;
  status: StainStatus;
  fate?: "washed" | "discarded";
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
    fate: "washed" | "discarded";
    newFridge?: string;
    newBox?: string;
  }[];
}

export interface FreeEvent extends EventBase {
  type: "free";
  attachmentName?: string;
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

export type TiltLevel = "calm" | "mild" | "perfect" | "critical";

export interface TiltEntry {
  id: string;
  date: string; // YYYY-MM-DD
  level: TiltLevel;
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

export type SignalKind = "point" | "large_point" | "block" | "segment";

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

export type ExportFormat = "png" | "pdf";

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
  id: string;
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
  id: string;
  sampleId: string;
  metaphaseId: string;
  stainedId: string;
  sourceLayerId: string;
  importId: string;
  temporaryName: string;
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

export interface SampleKaryotype {
  id: string;
  sampleId: string;
  title: string;
  status: SampleKaryotypeStatus;
  layoutId: string;
  level: KaryotypeLevel;
  selectedChromosomeIds: string[];
  /** Метка «лицевой кариотип образца» — основной для образца. */
  main?: boolean;
  createdAt: string;
  approvedAt?: string;
  exportIds: string[];
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
