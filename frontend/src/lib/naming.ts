/**
 * Единая система именования объектов журнала и кариотипа.
 *
 * Канонический формат — иерархическое склеивание ID родителя через точку.
 * См. `docs/промпты доработок/план_доработки1.md` (раздел 0).
 *
 * Уровни:
 * - образец:               `<линия>.<год>`            → `1730.25`
 * - растение:              `<образец>.<n>`            → `1730.25.1`, смесь — `1730.25.0`
 * - препарат:              `<растение>.<n>`           → `1730.25.1.1`
 * - окрашенный препарат:   `<препарат>.<n>`           → `1730.25.1.1.1`
 * - фотография:            `<окраска>.<n>`            → `1730.25.1.1.1.1`
 * - метафаза:              `<окраска>.m<n>`           → `1730.25.1.1.1.m1`
 * - хромосома:             `<метафаза>.c<NN>`         → `1730.25.1.1.1.m1.c01`
 * - идеограмма:            `<хромосома>.idg`          → `1730.25.1.1.1.m1.c01.idg`
 * - обзорный кариотип:     `<образец>.kar.<n>`        → `1730.25.kar.1`
 *
 * «Читаемые» отображения (`S-`, `PL-`, `SLD-`, `STN-`, `PHO-`) строятся из
 * канонического `id` через `format*` функции — отдельно в БД не хранятся.
 */

import type {
  Plant,
  Preparation,
  Sample,
  StainedPreparation,
} from "./types";

export type ChildKind =
  | "plant"
  | "preparation"
  | "stain"
  | "photo"
  | "metaphase"
  | "chromosome"
  | "ideogram"
  | "karyotype";

const SUFFIX: Record<ChildKind, string> = {
  plant: "",
  preparation: "",
  stain: "",
  photo: "",
  metaphase: "m",
  chromosome: "c",
  ideogram: "idg",
  karyotype: "kar",
};

const CHROMOSOME_PAD = 2;

/**
 * Извлекает порядковый номер из дочернего id.
 * `1730.25.1.1.1.m3` для kind=metaphase → 3.
 */
function parseChildIndex(
  parentId: string,
  kind: ChildKind,
  childId: string
): number | null {
  if (!childId.startsWith(parentId + ".")) return null;
  const tail = childId.slice(parentId.length + 1);
  if (kind === "ideogram") return tail === "idg" ? 1 : null;
  if (kind === "karyotype") {
    const m = /^kar\.(\d+)$/.exec(tail);
    return m ? Number(m[1]) : null;
  }
  const prefix = SUFFIX[kind];
  const re = prefix
    ? new RegExp(`^${prefix}(\\d+)$`)
    : /^(\d+)$/;
  const m = re.exec(tail);
  return m ? Number(m[1]) : null;
}

/**
 * Подбирает следующий свободный id для дочернего объекта.
 *
 * Не делает ничего магического: смотрит уже занятые id (`takenIds`),
 * вычисляет максимум использованных индексов под указанным родителем
 * и возвращает next.
 */
export function nextChildId(
  parentId: string,
  kind: ChildKind,
  takenIds: Iterable<string>
): string {
  if (kind === "ideogram") {
    return `${parentId}.idg`;
  }

  let maxIdx = 0;
  for (const id of takenIds) {
    const n = parseChildIndex(parentId, kind, id);
    if (n != null && n > maxIdx) maxIdx = n;
  }
  const next = maxIdx + 1;

  if (kind === "karyotype") return `${parentId}.kar.${next}`;
  if (kind === "chromosome") {
    return `${parentId}.c${String(next).padStart(CHROMOSOME_PAD, "0")}`;
  }
  if (kind === "metaphase") return `${parentId}.m${next}`;
  return `${parentId}.${next}`;
}

/* -------------------------------------------------------------------- */
/* «Читаемые» форматы для UI                                             */
/* -------------------------------------------------------------------- */

export function formatSampleId(id: string): string {
  return `S-${id}`;
}

export function formatPlantId(plant: Pick<Plant, "id" | "sampleId">): string {
  // canonical id растения: `<sample>.<n>`
  // смесь: `<sample>.0` → `PL-<sample>-MIX`
  if (plant.id.endsWith(".0")) {
    return `PL-${plant.sampleId}-MIX`;
  }
  const tail = plant.id.startsWith(plant.sampleId + ".")
    ? plant.id.slice(plant.sampleId.length + 1)
    : plant.id;
  return `PL-${plant.sampleId}-${tail}`;
}

export function formatPreparationId(
  prep: Pick<Preparation, "id" | "sampleId">
): string {
  // `1730.25.1.1` → `SLD-1730.25.1-1`
  // tail — всё после <sampleId>.
  if (!prep.id.startsWith(prep.sampleId + ".")) {
    return `SLD-${prep.id}`;
  }
  const tail = prep.id.slice(prep.sampleId.length + 1);
  // Разделим на «растение» и «номер препарата».
  // tail формата `<plantNum>.<prepNum>` или `0.<prepNum>`.
  const dot = tail.lastIndexOf(".");
  if (dot < 0) return `SLD-${prep.id}`;
  const plantPart = tail.slice(0, dot);
  const prepNum = tail.slice(dot + 1);
  return `SLD-${prep.sampleId}.${plantPart}-${prepNum}`;
}

export function formatStainedId(
  st: Pick<StainedPreparation, "id" | "cycleNumber" | "preparationId">
): string {
  // `1730.25.1.1.1` → `STN-1-1730.25.1.1`
  return `STN-${st.cycleNumber}-${st.preparationId}`;
}

export function formatPhotoId(canonicalId: string): string {
  // `1730.25.1.1.1.1` (фото №1 окраски `1730.25.1.1.1`) → `PHO-1-1730.25.1.1.1`
  const dot = canonicalId.lastIndexOf(".");
  if (dot < 0) return `PHO-${canonicalId}`;
  const stainId = canonicalId.slice(0, dot);
  const photoNum = canonicalId.slice(dot + 1);
  return `PHO-${photoNum}-${stainId}`;
}

/* -------------------------------------------------------------------- */
/* Утилита для смеси растений                                            */
/* -------------------------------------------------------------------- */

/** Идентификатор «виртуального растения-смеси» для образца. */
export function mixPlantId(sampleId: string): string {
  return `${sampleId}.0`;
}

/** Возвращает true, если id растения — это смесь (`<sample>.0`). */
export function isMixPlantId(id: string): boolean {
  return /\.0$/.test(id);
}
