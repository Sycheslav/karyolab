import { create } from "zustand";
import {
  DEMO_PSD_FILE_1730,
  DEMO_PSD_LAYERS_1730,
  initialAnomalyTypes,
  initialAtlasProbes,
  initialChromosomeClasses,
  initialChromosomeLayers,
  initialChromosomes,
  initialEvents,
  initialExportJobs,
  initialExportTemplates,
  initialFluorochromes,
  initialGenomeLayouts,
  initialIdeograms,
  initialKaryotypeImports,
  initialMetaphases,
  initialNotes,
  initialPlants,
  initialPreparations,
  initialProbes,
  initialSampleKaryotypes,
  initialSamples,
  initialSpecies,
  initialStained,
  initialSubgenomes,
  initialTheoreticalRecords,
  initialTilts,
} from "./mockData";
import type {
  AnomalyType,
  AnomalyTypeMeta,
  AtlasContext,
  AtlasFilters,
  AtlasProbe,
  ChangeRecord,
  ChromosomeClassDef,
  ChromosomeLayer,
  ChromosomeObject,
  ChromosomeSnapshot,
  ChromosomeStatus,
  ExportJob,
  ExportSettings,
  ExportTemplate,
  ExportTemplateType,
  Fluorochrome,
  FreeEvent,
  GenomeAnomaly,
  GenomeLayout,
  HybridizationEvent,
  Ideogram,
  IdeogramAnomaly,
  IdeogramSignal,
  ImportWarning,
  JournalEvent,
  KaryotypeImport,
  KaryotypeLevel,
  Metaphase,
  Note,
  PhotographingEvent,
  Plant,
  Preparation,
  PreparationSource,
  Probe,
  ProbeChannel,
  Quality,
  Sample,
  SampleKaryotype,
  SlideEvent,
  SpeciesDef,
  StainFate,
  StainedPreparation,
  SubgenomeDef,
  TheoreticalRecord,
  TiltEntry,
  WashEvent,
} from "./types";
import { isoDay } from "./utils";
import { nextChildId } from "./naming";

interface KaryotypeContext {
  sampleId?: string;
  preparationId?: string;
  stainedId?: string;
  metaphaseId?: string;
  importId?: string;
  /** Уровень для матрицы генома и фильтра банка. */
  level: KaryotypeLevel;
  /** Активная хромосома в редакторе разметки. */
  activeChromosomeId?: string;
}

interface State {
  samples: Sample[];
  plants: Plant[];
  preparations: Preparation[];
  stained: StainedPreparation[];
  probes: Probe[];
  events: JournalEvent[];
  notes: Note[];
  tilts: TiltEntry[];

  selectedDate: string;
  lastChange?: ChangeRecord[];

  // ----- кариотип -----
  karyotypeImports: KaryotypeImport[];
  chromosomeLayers: ChromosomeLayer[];
  metaphases: Metaphase[];
  chromosomes: ChromosomeObject[];
  ideograms: Ideogram[];
  genomeLayouts: GenomeLayout[];
  sampleKaryotypes: SampleKaryotype[];
  exportTemplates: ExportTemplate[];
  exportJobs: ExportJob[];

  karyoCtx: KaryotypeContext;

  // ----- атлас -----
  fluorochromes: Fluorochrome[];
  atlasProbes: AtlasProbe[];
  subgenomes: SubgenomeDef[];
  species: SpeciesDef[];
  chromosomeClasses: ChromosomeClassDef[];
  anomalyTypes: AnomalyTypeMeta[];
  theoreticalRecords: TheoreticalRecord[];
  atlasCtx: AtlasContext;

  setSelectedDate: (d: string) => void;

  addSample: (s: Sample) => void;
  addEvent: (ev: JournalEvent, change?: ChangeRecord[]) => void;
  /** Частичное обновление существующего ивента по id. */
  updateEvent: (id: string, patch: Partial<JournalEvent>) => void;

  /**
   * Доменные действия — инкапсулируют изменения связанных коллекций
   * (`samples`, `preparations`, `stained`) внутри одного перехода.
   * Формы вызывают их вместо ручной правки массивов.
   */
  createSlideEvent: (input: {
    sampleId: string;
    source: PreparationSource;
    quality: Quality;
    storageJar?: string;
    storageFridge?: string;
    /** Сколько препаратов создаём за один ивент. */
    count: number;
    operator?: string;
    comment?: string;
    startDate?: string;
  }) => { eventId: string; preparationIds: string[] };

  createWashEvent: (input: {
    preparationIds: string[];
    /** `pre` — первичная отмывка, `post` — постгибридизационная (=> `rehyb_ready`). */
    kind: "pre" | "post";
    newFridge?: string;
    newBox?: string;
    protocolNotes?: string;
    operator?: string;
    comment?: string;
    startDate?: string;
  }) => { eventId: string };

  createHybridizationEvent: (input: {
    batchName: string;
    preparationIds: string[];
    probes: { name: string; channel: ProbeChannel }[];
    operator?: string;
    comment?: string;
    startDate?: string;
    endDate?: string;
  }) => { eventId: string; stainedIds: string[] };

  createPhotographingEvent: (input: {
    decisions: {
      stainedId: string;
      fate: StainFate;
      newFridge?: string;
      newBox?: string;
    }[];
    operator?: string;
    comment?: string;
    startDate?: string;
    endDate?: string;
  }) => { eventId: string };

  createFreeEvent: (input: {
    title: string;
    operator?: string;
    comment?: string;
    tags?: string[];
    attachmentName?: string;
    startDate?: string;
    endDate?: string;
  }) => { eventId: string };

  /**
   * Изменить судьбу окрашенного препарата без создания нового ивента
   * (например, перевести «решу позже» в «переотмыт» или «выбросить»).
   */
  setStainedFate: (
    stainedId: string,
    fate: StainFate,
    options?: { newFridge?: string; newBox?: string }
  ) => void;

  addNote: (note: Omit<Note, "id" | "createdAt" | "archived">) => Note;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  incrementTilt: () => void;

  setLastChange: (change?: ChangeRecord[]) => void;

  // ----- кариотип actions -----
  selectKaryotypeContext: (ctx: Partial<KaryotypeContext>) => void;
  /**
   * Создаёт новый mock-импорт PSD для выбранного образца/окрашенного препарата.
   * Если уже есть открытый (не committed) импорт под эту окраску — возвращает его id.
   */
  createKaryotypeImport: (input: {
    sampleId: string;
    stainedId: string;
    fileName?: string;
  }) => string;
  /** Симулирует чтение PSD: создаёт preview слоёв и переводит import в `preview`. */
  mockReadPsd: (importId: string, fileName?: string) => void;
  toggleImportLayer: (layerId: string) => void;
  acknowledgeImportWarning: (importId: string, warningId: string) => void;
  /** Сохраняет хромосомы из слоёв-хромосом и переводит import в `committed`. */
  commitKaryotypeImport: (importId: string) => string | undefined;

  selectChromosome: (chromosomeId?: string) => void;
  updateChromosomeClass: (
    chromosomeId: string,
    subgenome: string | undefined,
    chromosomeClass: number | undefined
  ) => void;
  setChromosomeStatus: (chromosomeId: string, status: ChromosomeStatus) => void;
  excludeChromosome: (chromosomeId: string, reason?: string) => void;

  // идеограмма
  setIdeogramCentromere: (chromosomeId: string, position: number) => void;
  addIdeogramSignal: (chromosomeId: string, signal: Omit<IdeogramSignal, "id">) => void;
  removeIdeogramSignal: (chromosomeId: string, signalId: string) => void;
  addIdeogramAnomaly: (chromosomeId: string, anomaly: Omit<IdeogramAnomaly, "id">) => void;
  removeIdeogramAnomaly: (chromosomeId: string, anomalyId: string) => void;
  saveIdeogram: (chromosomeId: string) => void;
  /** Полный сброс несохранённой идеограммы (восстанавливает состояние с диска). */
  resetIdeogramDraft: (chromosomeId: string) => void;

  // genome layout
  ensureGenomeLayout: (
    sampleId: string,
    level: KaryotypeLevel,
    metaphaseId?: string,
    stainedId?: string
  ) => string;
  assignChromosomeToCell: (
    layoutId: string,
    chromosomeId: string,
    subgenome: string,
    chromosomeClass: number
  ) => void;
  unassignChromosome: (layoutId: string, chromosomeId: string) => void;
  addSubgenomeColumn: (layoutId: string, name?: string) => void;
  removeSubgenomeColumn: (layoutId: string, name: string) => void;
  applyAutoSort: (layoutId: string) => number;
  addGenomeAnomaly: (layoutId: string, anomaly: Omit<GenomeAnomaly, "id">) => void;
  removeGenomeAnomaly: (layoutId: string, anomalyId: string) => void;
  saveGenomeLayout: (layoutId: string) => void;
  createSampleKaryotype: (
    layoutId: string,
    title?: string
  ) => string | undefined;
  approveSampleKaryotype: (karyotypeId: string) => void;

  createExportJob: (
    config: Omit<ExportJob, "id" | "createdAt" | "status" | "fileName"> & {
      fileLabel?: string;
    }
  ) => string;

  // ----- атлас actions -----
  setAtlasContext: (patch: Partial<AtlasContext>) => void;
  setAtlasFilters: (patch: Partial<AtlasFilters>) => void;
  resetAtlasFilters: () => void;
  toggleAtlasSample: (id: string) => void;
  toggleAtlasReference: (karyotypeId: string) => void;
  toggleAtlasTheoretical: (id: string) => void;
  toggleAtlasPanelProbe: (id: string) => void;

  addFluorochrome: (f: Omit<Fluorochrome, "id">) => string;
  updateFluorochrome: (id: string, patch: Partial<Fluorochrome>) => void;
  deleteFluorochrome: (id: string) => void;

  addAtlasProbe: (p: Omit<AtlasProbe, "id">) => string;
  updateAtlasProbe: (id: string, patch: Partial<AtlasProbe>) => void;
  deleteAtlasProbe: (id: string) => void;

  addSubgenome: (s: Omit<SubgenomeDef, "id">) => string;
  updateSubgenome: (id: string, patch: Partial<SubgenomeDef>) => void;
  deleteSubgenome: (id: string) => void;

  addSpecies: (s: Omit<SpeciesDef, "id">) => string;
  updateSpecies: (id: string, patch: Partial<SpeciesDef>) => void;
  deleteSpecies: (id: string) => void;

  addChromosomeClassDef: (c: Omit<ChromosomeClassDef, "id">) => string;
  updateChromosomeClassDef: (id: string, patch: Partial<ChromosomeClassDef>) => void;
  deleteChromosomeClassDef: (id: string) => void;

  addAnomalyType: (a: AnomalyTypeMeta) => void;
  updateAnomalyType: (code: AnomalyType, patch: Partial<AnomalyTypeMeta>) => void;

  addTheoreticalRecord: (r: Omit<TheoreticalRecord, "id" | "createdAt">) => string;
  updateTheoreticalRecord: (id: string, patch: Partial<TheoreticalRecord>) => void;
  deleteTheoreticalRecord: (id: string) => void;

  toggleSampleKaryotypeReference: (
    karyotypeId: string,
    refMeta?: {
      label?: string;
      scope?: NonNullable<SampleKaryotype["referenceScope"]>;
      source?: NonNullable<SampleKaryotype["referenceSource"]>;
      notes?: string;
    }
  ) => void;
}

/* ----- helpers ----- */

const nowIso = () => new Date().toISOString();

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
}

function defaultKaryotypeCtx(): KaryotypeContext {
  return {
    level: "metaphase",
  };
}

function defaultAtlasCtx(): AtlasContext {
  return {
    viewMode: "chromosomes_with_ideograms",
    alignByCentromere: true,
    showProbeLabels: false,
    showAnomalyLabels: true,
    selectedSampleIds: [],
    selectedReferenceIds: [],
    selectedTheoreticalIds: [],
    selectedPanelProbeIds: [],
    probeSelectionMode: "single",
    filters: {
      speciesIds: [],
      subgenomes: [],
      classIds: [],
      anomalyCodes: [],
      source: "all",
      karyotypeStatuses: [],
    },
    scale: "sample",
    compareLayout: "two_side",
  };
}

function upsertIdeogram(
  state: State,
  chromosomeId: string,
  apply: (idg: Ideogram) => Ideogram
): Ideogram[] {
  const existing = state.ideograms.find(
    (i) => i.chromosomeId === chromosomeId
  );
  if (existing) {
    return state.ideograms.map((i) =>
      i.chromosomeId === chromosomeId ? apply(i) : i
    );
  }
  const draft: Ideogram = {
    id: `IDG-DRAFT-${chromosomeId}`,
    chromosomeId,
    lengthPx:
      state.chromosomes.find((c) => c.id === chromosomeId)?.maskSizePx ?? 120,
    signals: [],
    anomalies: [],
    savedAt: "",
    dirty: false,
  };
  return [...state.ideograms, apply(draft)];
}

/* ----- store ----- */

export const useStore = create<State>((set, get) => ({
  samples: initialSamples,
  plants: initialPlants,
  preparations: initialPreparations,
  stained: initialStained,
  probes: initialProbes,
  events: initialEvents,
  notes: initialNotes,
  tilts: initialTilts,
  selectedDate: isoDay(new Date()),
  lastChange: undefined,

  karyotypeImports: initialKaryotypeImports,
  chromosomeLayers: initialChromosomeLayers,
  metaphases: initialMetaphases,
  chromosomes: initialChromosomes,
  ideograms: initialIdeograms,
  genomeLayouts: initialGenomeLayouts,
  sampleKaryotypes: initialSampleKaryotypes,
  exportTemplates: initialExportTemplates,
  exportJobs: initialExportJobs,
  karyoCtx: defaultKaryotypeCtx(),

  // ----- атлас -----
  fluorochromes: initialFluorochromes,
  atlasProbes: initialAtlasProbes,
  subgenomes: initialSubgenomes,
  species: initialSpecies,
  chromosomeClasses: initialChromosomeClasses,
  anomalyTypes: initialAnomalyTypes,
  theoreticalRecords: initialTheoreticalRecords,
  atlasCtx: defaultAtlasCtx(),

  setSelectedDate: (d) => set({ selectedDate: d }),

  addSample: (s) => set((st) => ({ samples: [s, ...st.samples] })),

  addEvent: (ev, change) =>
    set((st) => ({
      events: [ev, ...st.events],
      lastChange: change,
    })),

  updateEvent: (id, patch) =>
    set((st) => ({
      events: st.events.map((e) =>
        e.id === id ? ({ ...e, ...patch } as JournalEvent) : e
      ),
    })),

  addNote: (note) => {
    const created: Note = {
      id: `N-${Date.now()}`,
      title: note.title,
      body: note.body,
      tags: note.tags,
      createdAt: new Date().toISOString(),
      archived: false,
      pinned: note.pinned,
    };
    set((st) => ({ notes: [created, ...st.notes] }));
    return created;
  },

  archiveNote: (id) =>
    set((st) => ({
      notes: st.notes.map((n) => (n.id === id ? { ...n, archived: true } : n)),
    })),

  unarchiveNote: (id) =>
    set((st) => ({
      notes: st.notes.map((n) =>
        n.id === id ? { ...n, archived: false } : n
      ),
    })),

  togglePinNote: (id) =>
    set((st) => ({
      notes: st.notes.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n
      ),
    })),

  incrementTilt: () => {
    const today = isoDay(new Date());
    const t: TiltEntry = {
      id: `T-${Date.now()}`,
      date: today,
    };
    set((st) => ({ tilts: [t, ...st.tilts] }));
  },

  /* ====================== ДОМЕННЫЕ ИВЕНТЫ ====================== */

  createSlideEvent: ({
    sampleId,
    source,
    quality,
    storageJar,
    storageFridge,
    count,
    operator,
    comment,
    startDate,
  }) => {
    const ts = startDate ?? nowIso();
    const st = get();
    const sample = st.samples.find((s) => s.id === sampleId);
    const sourceKey =
      source.kind === "plant" ? source.plantId : `${sampleId}.0`;
    const existingForSource = st.preparations.filter((p) =>
      p.id.startsWith(`${sourceKey}.`)
    );
    const startNumber = existingForSource.length + 1;
    const preparationIds: string[] = [];
    const newPreparations: Preparation[] = [];
    for (let i = 0; i < count; i++) {
      const id = `${sourceKey}.${startNumber + i}`;
      preparationIds.push(id);
      newPreparations.push({
        id,
        sampleId,
        source,
        createdAt: ts,
        quality,
        status: "created",
        fridge: storageFridge,
        box: storageJar,
        stainCycle: 0,
      });
    }
    const eventId = `EV-SLIDE-${Date.now().toString(36)}`;
    const ev: SlideEvent = {
      id: eventId,
      type: "slide",
      title: `Создание препарата · ${count} шт.`,
      sampleId,
      source,
      quality,
      storageJar,
      storageFridge,
      preparationIds,
      startDate: ts,
      operator,
      comment,
      status: "completed",
      createdAt: ts,
    };
    set((st2) => ({
      events: [ev, ...st2.events],
      preparations: [...newPreparations, ...st2.preparations],
      samples:
        sample && sample.status !== "in_work" && sample.status !== "result"
          ? st2.samples.map((s) =>
              s.id === sampleId ? { ...s, status: "in_work" } : s
            )
          : st2.samples,
      lastChange: [
        {
          ts,
          title: `Создан препарат · ${count} шт.`,
          detail: `Образец S-${sampleId}`,
          href: `/журнал/ивент/${eventId}`,
        },
      ],
    }));
    return { eventId, preparationIds };
  },

  createWashEvent: ({
    preparationIds,
    kind,
    newFridge,
    newBox,
    protocolNotes,
    operator,
    comment,
    startDate,
  }) => {
    const ts = startDate ?? nowIso();
    const eventId = `EV-WASH-${Date.now().toString(36)}`;
    const ev: WashEvent = {
      id: eventId,
      type: "wash",
      title:
        kind === "pre"
          ? `Предгибридизационная отмывка · ${preparationIds.length} шт.`
          : `Постгибридизационная отмывка · ${preparationIds.length} шт.`,
      preparationIds,
      newFridge,
      newBox,
      protocolNotes,
      startDate: ts,
      operator,
      comment,
      status: "completed",
      createdAt: ts,
    };
    set((st) => ({
      events: [ev, ...st.events],
      preparations: st.preparations.map((p) =>
        preparationIds.includes(p.id)
          ? {
              ...p,
              status: kind === "pre" ? "pre_washed" : "rehyb_ready",
              fridge: newFridge ?? p.fridge,
              box: newBox ?? p.box,
            }
          : p
      ),
      lastChange: [
        {
          ts,
          title:
            kind === "pre"
              ? `Препараты отмыты (первично)`
              : `Препараты переотмыты`,
          detail: `${preparationIds.length} шт.`,
          href: `/журнал/ивент/${eventId}`,
        },
      ],
    }));
    return { eventId };
  },

  createHybridizationEvent: ({
    batchName,
    preparationIds,
    probes,
    operator,
    comment,
    startDate,
    endDate,
  }) => {
    const ts = startDate ?? nowIso();
    const eventId = `EV-HYB-${Date.now().toString(36)}`;
    const stainedIds: string[] = [];
    const newStained: StainedPreparation[] = [];
    const st = get();
    for (const prepId of preparationIds) {
      const prep = st.preparations.find((p) => p.id === prepId);
      const cycle = (prep?.stainCycle ?? 0) + 1;
      const stainedId = `${prepId}.${cycle}`;
      stainedIds.push(stainedId);
      newStained.push({
        id: stainedId,
        preparationId: prepId,
        cycleNumber: cycle,
        probes,
        hybridizationDate: ts,
        status: "created",
      });
    }
    const ev: HybridizationEvent = {
      id: eventId,
      type: "hybridization",
      title: `Гибридизация · ${batchName}`,
      batchName,
      preparationIds,
      probes,
      startDate: ts,
      endDate,
      operator,
      comment,
      status: "active",
      createdAt: ts,
    };
    set((st2) => ({
      events: [ev, ...st2.events],
      stained: [...newStained, ...st2.stained],
      preparations: st2.preparations.map((p) =>
        preparationIds.includes(p.id)
          ? { ...p, status: "hybridized" }
          : p
      ),
      lastChange: [
        {
          ts,
          title: `Гибридизация запущена`,
          detail: `${preparationIds.length} препарат(ов), зонды: ${probes
            .map((pr) => pr.name)
            .join(" + ")}`,
          href: `/журнал/ивент/${eventId}`,
        },
      ],
    }));
    return { eventId, stainedIds };
  },

  createPhotographingEvent: ({
    decisions,
    operator,
    comment,
    startDate,
    endDate,
  }) => {
    const ts = startDate ?? nowIso();
    const eventId = `EV-PHOTO-${Date.now().toString(36)}`;
    const ev: PhotographingEvent = {
      id: eventId,
      type: "photographing",
      title: `Фотографирование · ${decisions.length} окрасок`,
      stainedDecisions: decisions,
      startDate: ts,
      endDate,
      operator,
      comment,
      status: "completed",
      createdAt: ts,
    };
    const st = get();
    const stainedById = new Map(st.stained.map((s) => [s.id, s]));
    const updatedStained: StainedPreparation[] = st.stained.map((s) => {
      const dec = decisions.find((d) => d.stainedId === s.id);
      if (!dec) return s;
      const status: StainedPreparation["status"] =
        dec.fate === "washed"
          ? "closed_wash"
          : dec.fate === "discarded"
            ? "closed_discard"
            : "photographed_undecided";
      return { ...s, status, fate: dec.fate };
    });
    const updatedPreparations = st.preparations.map((p) => {
      const dec = decisions.find((d) => stainedById.get(d.stainedId)?.preparationId === p.id);
      if (!dec) return p;
      const cycleAfter = (p.stainCycle ?? 0) + 1;
      if (dec.fate === "washed") {
        return {
          ...p,
          status: "rehyb_ready" as const,
          stainCycle: cycleAfter,
          fridge: dec.newFridge ?? p.fridge,
          box: dec.newBox ?? p.box,
        };
      }
      if (dec.fate === "discarded") {
        return {
          ...p,
          status: "discarded" as const,
          stainCycle: cycleAfter,
        };
      }
      return {
        ...p,
        status: "photographed_undecided" as const,
        fridge: dec.newFridge ?? p.fridge,
        box: dec.newBox ?? p.box,
      };
    });
    set((st2) => ({
      events: [ev, ...st2.events],
      stained: updatedStained,
      preparations: updatedPreparations,
      lastChange: [
        {
          ts,
          title: `Фотографирование сохранено`,
          detail: `${decisions.length} окрасок`,
          href: `/журнал/ивент/${eventId}`,
        },
      ],
    }));
    return { eventId };
  },

  createFreeEvent: ({
    title,
    operator,
    comment,
    tags,
    attachmentName,
    startDate,
    endDate,
  }) => {
    const ts = startDate ?? nowIso();
    const eventId = `EV-FREE-${Date.now().toString(36)}`;
    const ev: FreeEvent = {
      id: eventId,
      type: "free",
      title,
      attachmentName,
      tags,
      startDate: ts,
      endDate,
      operator,
      comment,
      status: "completed",
      createdAt: ts,
    };
    set((st) => ({
      events: [ev, ...st.events],
      lastChange: [
        {
          ts,
          title,
          href: `/журнал/ивент/${eventId}`,
        },
      ],
    }));
    return { eventId };
  },

  setStainedFate: (stainedId, fate, options) =>
    set((st) => {
      const stained = st.stained.find((s) => s.id === stainedId);
      if (!stained) return st;
      const status =
        fate === "washed"
          ? "closed_wash"
          : fate === "discarded"
            ? "closed_discard"
            : "photographed_undecided";
      const cycleAfter = (() => {
        const prep = st.preparations.find(
          (p) => p.id === stained.preparationId
        );
        return (prep?.stainCycle ?? 0) + (fate === "undecided" ? 0 : 1);
      })();
      return {
        stained: st.stained.map((s) =>
          s.id === stainedId ? { ...s, status, fate } : s
        ),
        preparations: st.preparations.map((p) => {
          if (p.id !== stained.preparationId) return p;
          if (fate === "washed") {
            return {
              ...p,
              status: "rehyb_ready",
              stainCycle: cycleAfter,
              fridge: options?.newFridge ?? p.fridge,
              box: options?.newBox ?? p.box,
            };
          }
          if (fate === "discarded") {
            return { ...p, status: "discarded", stainCycle: cycleAfter };
          }
          return { ...p, status: "photographed_undecided" };
        }),
      };
    }),

  setLastChange: (change) => set({ lastChange: change }),

  /* ============================ КАРИОТИП ============================ */

  selectKaryotypeContext: (ctx) =>
    set((st) => ({ karyoCtx: { ...st.karyoCtx, ...ctx } })),

  createKaryotypeImport: ({ sampleId, stainedId, fileName }) => {
    const st = get();
    const stained = st.stained.find((s) => s.id === stainedId);
    const existing = st.karyotypeImports.find(
      (i) =>
        i.sampleId === sampleId &&
        i.stainedId === stainedId &&
        i.status !== "committed"
    );
    if (existing) return existing.id;

    const ts = nowIso();
    const id = `KIM-${Date.now().toString(36).toUpperCase()}`;
    const probes = stained?.probes.map((p) => p.name) ?? [];
    const psdFileName =
      fileName ??
      `${sampleId}-${probes.join("+") || "psd"}-${id}.psd`;

    const imp: KaryotypeImport = {
      id,
      sampleId,
      preparationId: stained?.preparationId,
      stainedId,
      psdFileName,
      parsedSampleId: sampleId,
      parsedProbes: probes,
      parsedPhotoNumber: undefined,
      parsedCoordinates: undefined,
      layerIds: [],
      status: "empty",
      warnings: [],
      history: [
        {
          id: `h-${Date.now()}`,
          ts,
          label: "Импорт открыт",
          detail: `Активный выбор: S-${sampleId} · ${stainedId}`,
          level: "info",
        },
      ],
      createdAt: ts,
    };
    set((st2) => ({
      karyotypeImports: [...st2.karyotypeImports, imp],
      karyoCtx: {
        ...st2.karyoCtx,
        sampleId,
        stainedId,
        preparationId: stained?.preparationId,
        importId: id,
      },
    }));
    return id;
  },

  mockReadPsd: (importId, _fileName) =>
    set((st) => {
      const imp = st.karyotypeImports.find((i) => i.id === importId);
      if (!imp) return st;
      // Демо: всегда генерируем DEMO_PSD_LAYERS_1730 (или копию для других импортов)
      const baseLayers =
        importId === "KIM-1730"
          ? DEMO_PSD_LAYERS_1730
          : DEMO_PSD_LAYERS_1730.map((l, i) => ({
              ...l,
              id: `LYR-${importId}-${String(i + 1).padStart(2, "0")}`,
              importId,
            }));
      // не дублируем, если уже есть
      const existingLayers = st.chromosomeLayers.filter(
        (l) => l.importId !== importId
      );
      const layers: ChromosomeLayer[] = baseLayers.map((l) => ({ ...l }));
      const ts = nowIso();

      const warnings: ImportWarning[] = [];
      // если зонды импорта не пересекаются со stained — добавим конфликт
      if (imp.stainedId) {
        const stained = st.stained.find((s) => s.id === imp.stainedId);
        if (stained && imp.parsedProbes) {
          const stainedNames = stained.probes.map((p) => p.name);
          const overlap = imp.parsedProbes.filter((p) =>
            stainedNames.includes(p)
          );
          if (
            overlap.length === 0 ||
            overlap.length < imp.parsedProbes.length
          ) {
            warnings.push({
              id: `WRN-PROBES-${importId}`,
              kind: "probe_conflict",
              title: "Расхождение зондов",
              description: `В файле: ${imp.parsedProbes.join(
                ", "
              )}. В окраске: ${stainedNames.join(", ")}. Подтвердите перед сохранением.`,
              acknowledged: false,
              blocking: true,
            });
          }
        }
      }

      const updatedImport: KaryotypeImport = {
        ...imp,
        psdFileName: _fileName ?? imp.psdFileName ?? DEMO_PSD_FILE_1730,
        layerIds: layers.map((l) => l.id),
        status: warnings.length > 0 ? "warning" : "preview",
        warnings,
        history: [
          ...imp.history,
          {
            id: `h-${Date.now()}`,
            ts,
            label: "PSD прочитан",
            detail: `Найдено ${layers.filter((l) => l.kind === "chromosome").length} объектов`,
            level: "info",
          },
          {
            id: `h-${Date.now() + 1}`,
            ts,
            label: "Метаданные распознаны",
            detail: imp.parsedProbes
              ? `Зонды: ${imp.parsedProbes.join(" + ")}`
              : "Имя файла без зондов",
            level: "info",
          },
          ...(warnings.length > 0
            ? warnings.map((w) => ({
                id: `h-w-${w.id}`,
                ts,
                label: w.title,
                detail: w.description,
                level: "warning" as const,
              }))
            : [
                {
                  id: `h-${Date.now() + 2}`,
                  ts,
                  label: "Готов к сохранению",
                  detail: "Можно подтвердить commit",
                  level: "success" as const,
                },
              ]),
        ],
      };

      return {
        chromosomeLayers: [...existingLayers, ...layers],
        karyotypeImports: st.karyotypeImports.map((i) =>
          i.id === importId ? updatedImport : i
        ),
      };
    }),

  toggleImportLayer: (layerId) =>
    set((st) => ({
      chromosomeLayers: st.chromosomeLayers.map((l) =>
        l.id === layerId ? { ...l, included: !l.included } : l
      ),
    })),

  acknowledgeImportWarning: (importId, warningId) =>
    set((st) => ({
      karyotypeImports: st.karyotypeImports.map((i) => {
        if (i.id !== importId) return i;
        const warnings = i.warnings.map((w) =>
          w.id === warningId ? { ...w, acknowledged: true } : w
        );
        const allAck = warnings.every((w) => w.acknowledged);
        return {
          ...i,
          warnings,
          status: allAck && i.status === "warning" ? "preview" : i.status,
          history: [
            ...i.history,
            {
              id: `h-${Date.now()}`,
              ts: nowIso(),
              label: "Подтверждено предупреждение",
              detail: i.warnings.find((w) => w.id === warningId)?.title,
              level: "info",
            },
          ],
        };
      }),
    })),

  commitKaryotypeImport: (importId) => {
    const st = get();
    const imp = st.karyotypeImports.find((i) => i.id === importId);
    if (!imp) return undefined;
    if (
      imp.warnings.some((w) => w.blocking && !w.acknowledged) ||
      !imp.sampleId ||
      !imp.stainedId
    ) {
      return undefined;
    }
    const layers = st.chromosomeLayers.filter(
      (l) => l.importId === importId && l.kind === "chromosome" && l.included
    );
    if (layers.length === 0) return undefined;
    const ts = nowIso();
    // Метафаза всегда живёт под окраской: `<stainedId>.m<n>` по схеме naming.ts.
    const metaphaseId =
      imp.metaphaseId ??
      nextChildId(imp.stainedId, "metaphase", st.metaphases.map((m) => m.id));
    // Канонические id хромосом: `<metaphase>.cNN`. Учитываем уже существующие,
    // чтобы при повторных импортах не было коллизий.
    const existingChromIds = st.chromosomes
      .filter((c) => c.metaphaseId === metaphaseId)
      .map((c) => c.id);
    const newChromosomes: ChromosomeObject[] = [];
    for (const l of layers) {
      const id = nextChildId(metaphaseId, "chromosome", [
        ...existingChromIds,
        ...newChromosomes.map((c) => c.id),
      ]);
      newChromosomes.push({
        id,
        sampleId: imp.sampleId!,
        metaphaseId,
        stainedId: imp.stainedId!,
        sourceLayerId: l.id,
        importId,
        temporaryName: l.temporaryName,
        maskSizePx: l.maskSizePx,
        imageSeed: l.imageSeed,
        bodyHue: 200 + (l.imageSeed % 30),
        redSpots: (l.imageSeed >> 1) % 3,
        greenSpots: (l.imageSeed >> 2) % 4,
        centromereHint: 0.25 + ((l.imageSeed % 50) / 100),
        status: "new",
      });
    }
    const metaphase: Metaphase = st.metaphases.find((m) => m.id === metaphaseId) ?? {
      id: metaphaseId,
      sampleId: imp.sampleId!,
      stainedId: imp.stainedId!,
      psdFileName: imp.psdFileName,
      coordinates: imp.parsedCoordinates,
      photoNumber: imp.parsedPhotoNumber,
      chromosomeIds: newChromosomes.map((c) => c.id),
      quality: "high",
      status: "new",
      createdAt: ts,
    };
    const updatedImport: KaryotypeImport = {
      ...imp,
      metaphaseId,
      status: "committed",
      committedAt: ts,
      savedChromosomeCount: newChromosomes.length,
      history: [
        ...imp.history,
        {
          id: `h-${Date.now()}`,
          ts,
          label: `Сохранено ${newChromosomes.length} хромосом`,
          detail: `Метафаза ${metaphaseId}`,
          level: "success",
        },
      ],
    };
    set((st2) => ({
      karyotypeImports: st2.karyotypeImports.map((i) =>
        i.id === importId ? updatedImport : i
      ),
      metaphases: st2.metaphases.find((m) => m.id === metaphaseId)
        ? st2.metaphases
        : [...st2.metaphases, metaphase],
      chromosomes: [...st2.chromosomes, ...newChromosomes],
      karyoCtx: {
        ...st2.karyoCtx,
        sampleId: imp.sampleId,
        stainedId: imp.stainedId,
        metaphaseId,
        importId,
      },
    }));
    return metaphaseId;
  },

  selectChromosome: (chromosomeId) =>
    set((st) => ({
      karyoCtx: { ...st.karyoCtx, activeChromosomeId: chromosomeId },
    })),

  updateChromosomeClass: (chromosomeId, subgenome, chromosomeClass) =>
    set((st) => ({
      chromosomes: st.chromosomes.map((c) =>
        c.id === chromosomeId
          ? {
              ...c,
              subgenome,
              chromosomeClass,
              displayName:
                subgenome && chromosomeClass
                  ? `${subgenome}${chromosomeClass}`
                  : c.displayName,
              status: chromosomeClass
                ? c.ideogramId
                  ? "has_ideogram"
                  : "classed"
                : c.status,
            }
          : c
      ),
    })),

  setChromosomeStatus: (chromosomeId, status) =>
    set((st) => ({
      chromosomes: st.chromosomes.map((c) =>
        c.id === chromosomeId ? { ...c, status } : c
      ),
    })),

  excludeChromosome: (chromosomeId, reason) =>
    set((st) => ({
      chromosomes: st.chromosomes.map((c) =>
        c.id === chromosomeId
          ? { ...c, status: "excluded", excludeReason: reason }
          : c
      ),
    })),

  /* ----- идеограмма ----- */

  setIdeogramCentromere: (chromosomeId, position) =>
    set((st) => {
      const updated = upsertIdeogram(st, chromosomeId, (idg) => ({
        ...idg,
        centromere: Math.max(0, Math.min(1, position)),
        dirty: true,
      }));
      return { ideograms: updated };
    }),

  addIdeogramSignal: (chromosomeId, signal) =>
    set((st) => {
      const sig: IdeogramSignal = { ...signal, id: genId("SIG") };
      const updated = upsertIdeogram(st, chromosomeId, (idg) => ({
        ...idg,
        signals: [...idg.signals, sig],
        dirty: true,
      }));
      return { ideograms: updated };
    }),

  removeIdeogramSignal: (chromosomeId, signalId) =>
    set((st) => ({
      ideograms: st.ideograms.map((i) =>
        i.chromosomeId === chromosomeId
          ? {
              ...i,
              signals: i.signals.filter((s) => s.id !== signalId),
              dirty: true,
            }
          : i
      ),
    })),

  addIdeogramAnomaly: (chromosomeId, anomaly) =>
    set((st) => {
      const ano: IdeogramAnomaly = { ...anomaly, id: genId("ANO") };
      const updated = upsertIdeogram(st, chromosomeId, (idg) => ({
        ...idg,
        anomalies: [...idg.anomalies, ano],
        dirty: true,
      }));
      return { ideograms: updated };
    }),

  removeIdeogramAnomaly: (chromosomeId, anomalyId) =>
    set((st) => ({
      ideograms: st.ideograms.map((i) =>
        i.chromosomeId === chromosomeId
          ? {
              ...i,
              anomalies: i.anomalies.filter((a) => a.id !== anomalyId),
              dirty: true,
            }
          : i
      ),
    })),

  saveIdeogram: (chromosomeId) =>
    set((st) => {
      const ts = nowIso();
      const ideograms = st.ideograms.map((i) => {
        if (i.chromosomeId !== chromosomeId) return i;
        // Сохранённая идеограмма получает канонический id `<chromosome>.idg`.
        const newId = i.id.startsWith("IDG-DRAFT-")
          ? `${chromosomeId}.idg`
          : i.id;
        return {
          ...i,
          id: newId,
          savedAt: ts,
          dirty: false,
          savedSnapshot: {
            centromere: i.centromere,
            signals: i.signals.map((s) => ({ ...s })),
            anomalies: i.anomalies.map((a) => ({ ...a })),
          },
        };
      });
      const targetIdeogram = ideograms.find(
        (i) => i.chromosomeId === chromosomeId
      );
      const chromosomes = st.chromosomes.map((c) =>
        c.id === chromosomeId
          ? {
              ...c,
              ideogramId: targetIdeogram?.id,
              status:
                c.status === "excluded" ? c.status : ("has_ideogram" as const),
            }
          : c
      );
      return { ideograms, chromosomes };
    }),

  resetIdeogramDraft: (chromosomeId) =>
    set((st) => {
      // если есть snapshot — откатываемся к нему;
      // если идеограмма была чисто draft (без сохранения) — удаляем
      const ideogram = st.ideograms.find((i) => i.chromosomeId === chromosomeId);
      if (!ideogram) return st;
      if (!ideogram.savedSnapshot && ideogram.id.startsWith("IDG-DRAFT-")) {
        return {
          ideograms: st.ideograms.filter((i) => i.id !== ideogram.id),
        };
      }
      return {
        ideograms: st.ideograms.map((i) =>
          i.chromosomeId === chromosomeId
            ? {
                ...i,
                centromere: i.savedSnapshot?.centromere,
                signals: i.savedSnapshot?.signals.map((s) => ({ ...s })) ?? [],
                anomalies:
                  i.savedSnapshot?.anomalies.map((a) => ({ ...a })) ?? [],
                dirty: false,
              }
            : i
        ),
      };
    }),

  /* ----- genome layout ----- */

  ensureGenomeLayout: (sampleId, level, metaphaseId, stainedId) => {
    const st = get();
    const existing = st.genomeLayouts.find(
      (l) =>
        l.sampleId === sampleId &&
        l.level === level &&
        (level === "metaphase"
          ? l.metaphaseId === metaphaseId || !metaphaseId
          : l.stainedId === stainedId || !stainedId)
    );
    if (existing) return existing.id;
    const id = `GLY-${sampleId}-${Date.now().toString(36)}`;
    const layout: GenomeLayout = {
      id,
      sampleId,
      level,
      metaphaseId,
      stainedId,
      subgenomes: ["A", "B", "D"],
      classCount: 7,
      assignments: [],
      cells: [],
      anomalies: [],
      status: "draft",
      updatedAt: nowIso(),
    };
    set((st2) => ({ genomeLayouts: [...st2.genomeLayouts, layout] }));
    return id;
  },

  assignChromosomeToCell: (layoutId, chromosomeId, subgenome, chromosomeClass) =>
    set((st) => {
      const layout = st.genomeLayouts.find((l) => l.id === layoutId);
      if (!layout) return st;
      const assignments = [
        ...layout.assignments.filter((a) => a.chromosomeId !== chromosomeId),
        { chromosomeId, subgenome, chromosomeClass },
      ];
      return {
        genomeLayouts: st.genomeLayouts.map((l) =>
          l.id === layoutId
            ? { ...l, assignments, updatedAt: nowIso() }
            : l
        ),
        chromosomes: st.chromosomes.map((c) =>
          c.id === chromosomeId
            ? {
                ...c,
                subgenome,
                chromosomeClass,
                displayName: `${subgenome}${chromosomeClass}`,
                status: c.ideogramId ? "has_ideogram" : "classed",
              }
            : c
        ),
      };
    }),

  unassignChromosome: (layoutId, chromosomeId) =>
    set((st) => ({
      genomeLayouts: st.genomeLayouts.map((l) =>
        l.id === layoutId
          ? {
              ...l,
              assignments: l.assignments.filter(
                (a) => a.chromosomeId !== chromosomeId
              ),
              updatedAt: nowIso(),
            }
          : l
      ),
      chromosomes: st.chromosomes.map((c) =>
        c.id === chromosomeId
          ? { ...c, subgenome: undefined, chromosomeClass: undefined }
          : c
      ),
    })),

  addSubgenomeColumn: (layoutId, name) =>
    set((st) => ({
      genomeLayouts: st.genomeLayouts.map((l) => {
        if (l.id !== layoutId) return l;
        const remaining = ["R", "U", "M", "S"].find(
          (n) => !l.subgenomes.includes(n)
        );
        const next = name ?? remaining ?? `X${l.subgenomes.length}`;
        if (l.subgenomes.includes(next)) return l;
        return {
          ...l,
          subgenomes: [...l.subgenomes, next],
          updatedAt: nowIso(),
        };
      }),
    })),

  removeSubgenomeColumn: (layoutId, name) =>
    set((st) => ({
      genomeLayouts: st.genomeLayouts.map((l) =>
        l.id === layoutId
          ? {
              ...l,
              subgenomes: l.subgenomes.filter((s) => s !== name),
              assignments: l.assignments.filter((a) => a.subgenome !== name),
              updatedAt: nowIso(),
            }
          : l
      ),
    })),

  applyAutoSort: (layoutId) => {
    const st = get();
    const layout = st.genomeLayouts.find((l) => l.id === layoutId);
    if (!layout) return 0;
    // те хромосомы, у которых уже есть subgenome+class (задано на уровне разметки)
    // — переписать assignments ровно по этому полю.
    const candidates = st.chromosomes.filter(
      (c) =>
        c.sampleId === layout.sampleId &&
        c.subgenome &&
        c.chromosomeClass &&
        layout.subgenomes.includes(c.subgenome)
    );
    let added = 0;
    const newAssignments = [...layout.assignments];
    for (const c of candidates) {
      if (newAssignments.find((a) => a.chromosomeId === c.id)) continue;
      newAssignments.push({
        chromosomeId: c.id,
        subgenome: c.subgenome!,
        chromosomeClass: c.chromosomeClass!,
      });
      added++;
    }
    set((st2) => ({
      genomeLayouts: st2.genomeLayouts.map((l) =>
        l.id === layoutId
          ? { ...l, assignments: newAssignments, updatedAt: nowIso() }
          : l
      ),
    }));
    return added;
  },

  addGenomeAnomaly: (layoutId, anomaly) =>
    set((st) => ({
      genomeLayouts: st.genomeLayouts.map((l) =>
        l.id === layoutId
          ? {
              ...l,
              anomalies: [
                ...l.anomalies,
                { ...anomaly, id: genId("GANO") },
              ],
              updatedAt: nowIso(),
            }
          : l
      ),
    })),

  removeGenomeAnomaly: (layoutId, anomalyId) =>
    set((st) => ({
      genomeLayouts: st.genomeLayouts.map((l) =>
        l.id === layoutId
          ? {
              ...l,
              anomalies: l.anomalies.filter((a) => a.id !== anomalyId),
              updatedAt: nowIso(),
            }
          : l
      ),
    })),

  saveGenomeLayout: (layoutId) =>
    set((st) => ({
      genomeLayouts: st.genomeLayouts.map((l) =>
        l.id === layoutId
          ? { ...l, status: "draft", updatedAt: nowIso() }
          : l
      ),
    })),

  createSampleKaryotype: (layoutId, title) => {
    const st = get();
    const layout = st.genomeLayouts.find((l) => l.id === layoutId);
    if (!layout) return undefined;
    // Канонический id `<sample>.kar.<n>`.
    const existing = st.sampleKaryotypes.filter(
      (k) => k.sampleId === layout.sampleId && (k.kind ?? "sample") === "sample"
    );
    const id = `${layout.sampleId}.kar.${existing.length + 1}`;
    const ts = nowIso();
    const selectedIds = layout.assignments.map((a) => a.chromosomeId);
    const snapshot: ChromosomeSnapshot[] = st.chromosomes
      .filter((c) => selectedIds.includes(c.id))
      .map((c) => ({
        chromosomeId: c.id,
        metaphaseId: c.metaphaseId,
        stainedId: c.stainedId,
        displayName: c.displayName,
        subgenome: c.subgenome,
        chromosomeClass: c.chromosomeClass,
        imageSeed: c.imageSeed,
        maskSizePx: c.maskSizePx,
        ideogramId: c.ideogramId,
      }));
    const sk: SampleKaryotype = {
      id,
      sampleId: layout.sampleId,
      title:
        title ??
        `Кариотип образца S-${layout.sampleId} · ${
          layout.level === "metaphase" ? "Метафаза" : "Гибридизация"
        }`,
      status: "draft",
      kind: "sample",
      layoutId,
      level: layout.level,
      selectedChromosomeIds: selectedIds,
      snapshot,
      main: !st.sampleKaryotypes.some(
        (k) => k.sampleId === layout.sampleId && k.main
      ),
      createdAt: ts,
      exportIds: [],
    };
    set((st2) => ({
      sampleKaryotypes: [...st2.sampleKaryotypes, sk],
      genomeLayouts: st2.genomeLayouts.map((l) =>
        l.id === layoutId ? { ...l, status: "draft" } : l
      ),
    }));
    return id;
  },

  approveSampleKaryotype: (karyotypeId) =>
    set((st) => {
      const ts = nowIso();
      const sk = st.sampleKaryotypes.find((k) => k.id === karyotypeId);
      if (!sk) return st;
      return {
        sampleKaryotypes: st.sampleKaryotypes.map((k) =>
          k.id === karyotypeId
            ? { ...k, status: "approved", approvedAt: ts }
            : k
        ),
        genomeLayouts: st.genomeLayouts.map((l) =>
          l.id === sk.layoutId ? { ...l, status: "approved" } : l
        ),
        samples: st.samples.map((s) =>
          s.id === sk.sampleId
            ? { ...s, status: "result", hasResult: true }
            : s
        ),
      };
    }),

  createExportJob: (config) => {
    const id = `EXJ-${Date.now().toString(36)}`;
    const ts = nowIso();
    const datePart = isoDay(new Date());
    const sampleLabel =
      config.sampleIds.length === 1 ? `S-${config.sampleIds[0]}` : "MULTI";
    const tplPart =
      config.templateType === "standard"
        ? "standard_overview"
        : config.templateType === "multi_select"
          ? "multi_compare"
          : config.templateType === "free_table"
            ? "free_table"
            : "summary_table";
    const ext = (() => {
      switch (config.settings.format) {
        case "tiff":
          return "tiff";
        case "excel":
          return "xlsx";
        case "text":
          return "csv";
        default:
          return config.settings.format;
      }
    })();
    const job: ExportJob = {
      id,
      ...config,
      status: "done",
      fileName:
        config.fileLabel ?? `${sampleLabel}_${tplPart}_${datePart}.${ext}`,
      createdAt: ts,
    };
    delete (job as unknown as { fileLabel?: string }).fileLabel;
    set((st) => ({
      exportJobs: [job, ...st.exportJobs],
      sampleKaryotypes: st.sampleKaryotypes.map((sk) =>
        config.karyotypeIds.includes(sk.id)
          ? {
              ...sk,
              exportIds: [...sk.exportIds, id],
              status:
                sk.status === "approved" || sk.status === "exported"
                  ? "exported"
                  : sk.status,
            }
          : sk
      ),
    }));
    return id;
  },

  /* ============================ АТЛАС ============================ */

  setAtlasContext: (patch) =>
    set((st) => ({ atlasCtx: { ...st.atlasCtx, ...patch } })),

  setAtlasFilters: (patch) =>
    set((st) => ({
      atlasCtx: {
        ...st.atlasCtx,
        filters: { ...st.atlasCtx.filters, ...patch },
      },
    })),

  resetAtlasFilters: () =>
    set((st) => ({
      atlasCtx: { ...st.atlasCtx, filters: defaultAtlasCtx().filters },
    })),

  toggleAtlasSample: (id) =>
    set((st) => ({
      atlasCtx: {
        ...st.atlasCtx,
        selectedSampleIds: st.atlasCtx.selectedSampleIds.includes(id)
          ? st.atlasCtx.selectedSampleIds.filter((x) => x !== id)
          : [...st.atlasCtx.selectedSampleIds, id],
      },
    })),

  toggleAtlasReference: (karyotypeId) =>
    set((st) => ({
      atlasCtx: {
        ...st.atlasCtx,
        selectedReferenceIds: st.atlasCtx.selectedReferenceIds.includes(karyotypeId)
          ? st.atlasCtx.selectedReferenceIds.filter((x) => x !== karyotypeId)
          : [...st.atlasCtx.selectedReferenceIds, karyotypeId],
      },
    })),

  toggleAtlasTheoretical: (id) =>
    set((st) => ({
      atlasCtx: {
        ...st.atlasCtx,
        selectedTheoreticalIds: st.atlasCtx.selectedTheoreticalIds.includes(id)
          ? st.atlasCtx.selectedTheoreticalIds.filter((x) => x !== id)
          : [...st.atlasCtx.selectedTheoreticalIds, id],
      },
    })),

  toggleAtlasPanelProbe: (id) =>
    set((st) => ({
      atlasCtx: {
        ...st.atlasCtx,
        selectedPanelProbeIds: st.atlasCtx.selectedPanelProbeIds.includes(id)
          ? st.atlasCtx.selectedPanelProbeIds.filter((x) => x !== id)
          : [...st.atlasCtx.selectedPanelProbeIds, id],
      },
    })),

  addFluorochrome: (f) => {
    const id = `FL-${Date.now().toString(36)}`;
    set((st) => ({ fluorochromes: [...st.fluorochromes, { ...f, id }] }));
    return id;
  },
  updateFluorochrome: (id, patch) =>
    set((st) => ({
      fluorochromes: st.fluorochromes.map((x) =>
        x.id === id ? { ...x, ...patch } : x
      ),
    })),
  deleteFluorochrome: (id) =>
    set((st) => ({ fluorochromes: st.fluorochromes.filter((x) => x.id !== id) })),

  addAtlasProbe: (p) => {
    const id = `AP-${Date.now().toString(36)}`;
    set((st) => ({ atlasProbes: [...st.atlasProbes, { ...p, id }] }));
    return id;
  },
  updateAtlasProbe: (id, patch) =>
    set((st) => ({
      atlasProbes: st.atlasProbes.map((x) =>
        x.id === id ? { ...x, ...patch } : x
      ),
    })),
  deleteAtlasProbe: (id) =>
    set((st) => ({ atlasProbes: st.atlasProbes.filter((x) => x.id !== id) })),

  addSubgenome: (s) => {
    const id = `SG-${Date.now().toString(36)}`;
    set((st) => ({ subgenomes: [...st.subgenomes, { ...s, id }] }));
    return id;
  },
  updateSubgenome: (id, patch) =>
    set((st) => ({
      subgenomes: st.subgenomes.map((x) =>
        x.id === id ? { ...x, ...patch } : x
      ),
    })),
  deleteSubgenome: (id) =>
    set((st) => ({ subgenomes: st.subgenomes.filter((x) => x.id !== id) })),

  addSpecies: (s) => {
    const id = `SP-${Date.now().toString(36)}`;
    set((st) => ({ species: [...st.species, { ...s, id }] }));
    return id;
  },
  updateSpecies: (id, patch) =>
    set((st) => ({
      species: st.species.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    })),
  deleteSpecies: (id) =>
    set((st) => ({ species: st.species.filter((x) => x.id !== id) })),

  addChromosomeClassDef: (c) => {
    const id = `CC-${Date.now().toString(36)}`;
    set((st) => ({
      chromosomeClasses: [...st.chromosomeClasses, { ...c, id }],
    }));
    return id;
  },
  updateChromosomeClassDef: (id, patch) =>
    set((st) => ({
      chromosomeClasses: st.chromosomeClasses.map((x) =>
        x.id === id ? { ...x, ...patch } : x
      ),
    })),
  deleteChromosomeClassDef: (id) =>
    set((st) => ({
      chromosomeClasses: st.chromosomeClasses.filter((x) => x.id !== id),
    })),

  addAnomalyType: (a) =>
    set((st) => ({ anomalyTypes: [...st.anomalyTypes, a] })),
  updateAnomalyType: (code, patch) =>
    set((st) => ({
      anomalyTypes: st.anomalyTypes.map((x) =>
        x.code === code ? { ...x, ...patch } : x
      ),
    })),

  addTheoreticalRecord: (r) => {
    const id = `TH-${Date.now().toString(36)}`;
    set((st) => ({
      theoreticalRecords: [
        ...st.theoreticalRecords,
        { ...r, id, createdAt: nowIso() },
      ],
    }));
    return id;
  },
  updateTheoreticalRecord: (id, patch) =>
    set((st) => ({
      theoreticalRecords: st.theoreticalRecords.map((x) =>
        x.id === id ? { ...x, ...patch } : x
      ),
    })),
  deleteTheoreticalRecord: (id) =>
    set((st) => ({
      theoreticalRecords: st.theoreticalRecords.filter((x) => x.id !== id),
    })),

  toggleSampleKaryotypeReference: (karyotypeId, refMeta) =>
    set((st) => ({
      sampleKaryotypes: st.sampleKaryotypes.map((k) =>
        k.id === karyotypeId
          ? {
              ...k,
              isReference: !k.isReference,
              referenceLabel: !k.isReference
                ? (refMeta?.label ?? `Эталон S-${k.sampleId}`)
                : k.referenceLabel,
              referenceScope: refMeta?.scope ?? k.referenceScope,
              referenceSource: refMeta?.source ?? k.referenceSource,
              referenceNotes: refMeta?.notes ?? k.referenceNotes,
            }
          : k
      ),
    })),
}));

/* ============================================================ */
/* Selectors                                                     */
/* ============================================================ */

export function selectActiveNotes(state: State): Note[] {
  return state.notes
    .filter((n) => !n.archived)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function selectArchivedNotes(state: State): Note[] {
  return state.notes
    .filter((n) => n.archived)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function selectTiltCount(
  state: State,
  scope: "today" | "month" | "year" | "lastYear"
) {
  const now = new Date();
  return state.tilts.filter((t) => {
    const d = new Date(t.date);
    if (scope === "today") return t.date === isoDay(now);
    if (scope === "month")
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    if (scope === "year") return d.getFullYear() === now.getFullYear();
    if (scope === "lastYear") return d.getFullYear() === now.getFullYear() - 1;
    return false;
  }).length;
}

/**
 * Бакеты прогресса материала (`09_прогресс_и_поиск_висяков.md`).
 *
 * Пять колонок:
 *  - `matured` — образцы, у которых растения готовы, но препарата ещё нет.
 *  - `awaitingWash` — препараты в статусе `created` (ждут первичную отмывку).
 *  - `washed` — препараты, готовые к гибридизации; делятся на
 *      `primaryWashed` (первично отмыт) и `rehybReady` (переотмытые).
 *  - `hybridized` — активная гибридизация без решения по фото.
 *  - `result` — образцы с утверждённым кариотипом образца.
 *
 * Колонки «сфотографирован» в прогрессе нет: состояние «фото есть, судьба не
 * решена» живёт в карточках и закрывается без отдельной колонки.
 */
export interface ProgressBuckets {
  matured: Sample[];
  awaitingWash: Preparation[];
  washed: {
    all: Preparation[];
    primaryWashed: Preparation[];
    rehybReady: Preparation[];
  };
  hybridized: Preparation[];
  result: Sample[];
}

export function selectProgressBuckets(state: State): ProgressBuckets {
  const { samples, preparations } = state;

  const matured = samples.filter(
    (s) =>
      (s.status === "registered" || s.status === "germinating") &&
      !preparations.some((p) => p.sampleId === s.id)
  );

  const awaitingWash = preparations.filter((p) => p.status === "created");
  const primaryWashed = preparations.filter((p) => p.status === "pre_washed");
  const rehybReady = preparations.filter((p) => p.status === "rehyb_ready");
  const hybridized = preparations.filter(
    (p) => p.status === "hybridized" || p.status === "photographed_undecided"
  );
  const result = samples.filter((s) => s.status === "result" || s.hasResult);

  return {
    matured,
    awaitingWash,
    washed: {
      all: [...primaryWashed, ...rehybReady],
      primaryWashed,
      rehybReady,
    },
    hybridized,
    result,
  };
}

export function selectLastStain(
  state: State,
  preparationId: string
): StainedPreparation | undefined {
  return state.stained
    .filter((s) => s.preparationId === preparationId)
    .sort((a, b) => b.cycleNumber - a.cycleNumber)[0];
}

/**
 * Полная история окрашиваний препарата по возрастанию `cycleNumber`.
 * Используется в прогрессе главной (правка 5.2) и в форме гибридизации
 * (правка 16) для подсказки «чем стекло уже окрашивалось».
 */
export function selectStainHistory(
  state: State,
  preparationId: string
): StainedPreparation[] {
  return state.stained
    .filter((s) => s.preparationId === preparationId)
    .sort((a, b) => a.cycleNumber - b.cycleNumber);
}

/**
 * Компактный текст истории окрасок: `1: GAA + pAs1 / 2: pAs119 + pTa713`.
 * Разделитель между циклами можно заменить на `\n` для табличного режима
 * (форма гибридизации использует перенос строки).
 */
export function formatStainHistoryShort(
  history: StainedPreparation[],
  separator: string = " / "
): string {
  if (history.length === 0) return "";
  return history
    .map((st) => {
      const probes = st.probes.map((p) => p.name).join(" + ") || "—";
      return `${st.cycleNumber}: ${probes}`;
    })
    .join(separator);
}

/* --- кариотип selectors --- */

export function selectImportsForSample(state: State, sampleId: string) {
  return state.karyotypeImports.filter((i) => i.sampleId === sampleId);
}

export function selectChromosomesForMetaphase(
  state: State,
  metaphaseId: string
) {
  return state.chromosomes.filter((c) => c.metaphaseId === metaphaseId);
}

export function selectChromosomesForSample(
  state: State,
  sampleId: string,
  level: KaryotypeLevel,
  metaphaseId?: string,
  stainedId?: string
) {
  return state.chromosomes.filter((c) => {
    if (c.sampleId !== sampleId) return false;
    if (level === "metaphase" && metaphaseId)
      return c.metaphaseId === metaphaseId;
    if (level === "hybridization" && stainedId)
      return c.stainedId === stainedId;
    return true;
  });
}

export function selectIdeogramFor(state: State, chromosomeId: string) {
  return state.ideograms.find((i) => i.chromosomeId === chromosomeId);
}

export function selectKaryotypesForSample(state: State, sampleId: string) {
  return state.sampleKaryotypes.filter((k) => k.sampleId === sampleId);
}

/**
 * Только «кариотипы образца» (обзорные). Используется в карточке образца
 * и в списке результатов для разделения с «кариотипами метафаз».
 */
export function selectSampleKaryotypesOnly(state: State, sampleId: string) {
  return state.sampleKaryotypes.filter(
    (k) => k.sampleId === sampleId && (k.kind ?? "sample") === "sample"
  );
}

/**
 * Только «кариотипы метафаз» — отдельный список в карточке образца.
 */
export function selectMetaphaseKaryotypesForSample(
  state: State,
  sampleId: string
) {
  return state.sampleKaryotypes.filter(
    (k) => k.sampleId === sampleId && k.kind === "metaphase"
  );
}

/** Список метафаз образца — для блока «Метафазы» в карточке образца. */
export function selectMetaphasesForSample(state: State, sampleId: string) {
  return state.metaphases.filter((m) => m.sampleId === sampleId);
}

export function selectExportsForSample(state: State, sampleId: string) {
  return state.exportJobs.filter((j) => j.sampleIds.includes(sampleId));
}

/* --- атлас selectors --- */

export function selectReferenceKaryotypes(state: State): SampleKaryotype[] {
  return state.sampleKaryotypes.filter((k) => k.isReference);
}

export function selectAtlasChromosomes(state: State): ChromosomeObject[] {
  const ctx = state.atlasCtx;
  const referenceSampleIds = state.sampleKaryotypes
    .filter((k) => ctx.selectedReferenceIds.includes(k.id))
    .map((k) => k.sampleId);
  const sampleIds = new Set([
    ...ctx.selectedSampleIds,
    ...referenceSampleIds,
  ]);
  let result = state.chromosomes.filter((c) => sampleIds.has(c.sampleId));
  if (ctx.filters.subgenomes.length > 0) {
    result = result.filter(
      (c) => c.subgenome && ctx.filters.subgenomes.includes(c.subgenome)
    );
  }
  if (ctx.filters.classIds.length > 0) {
    const labels = new Set(
      state.chromosomeClasses
        .filter((cls) => ctx.filters.classIds.includes(cls.id))
        .map((cls) => cls.label)
    );
    result = result.filter(
      (c) => c.displayName && labels.has(c.displayName)
    );
  }
  return result;
}

export function selectProbeUsage(state: State, probeName: string) {
  return state.stained.filter((s) =>
    s.probes.some((p) => p.name === probeName)
  );
}

export function selectSpeciesSamples(state: State, speciesId: string) {
  const sp = state.species.find((s) => s.id === speciesId);
  if (!sp) return [];
  return state.samples.filter(
    (s) => s.species === sp.latinName || s.species === sp.name
  );
}

export function selectAtlasFiltersCount(state: State): number {
  const f = state.atlasCtx.filters;
  return (
    f.speciesIds.length +
    f.subgenomes.length +
    f.classIds.length +
    f.anomalyCodes.length +
    f.karyotypeStatuses.length +
    (f.source === "all" ? 0 : 1)
  );
}
