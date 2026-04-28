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
