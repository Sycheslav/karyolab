import { create } from "zustand";
import {
  DEMO_PSD_FILE_1730,
  DEMO_PSD_LAYERS_1730,
  initialChromosomeLayers,
  initialChromosomes,
  initialEvents,
  initialExportJobs,
  initialExportTemplates,
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
  initialStained,
  initialTilts,
} from "./mockData";
import type {
  ChangeRecord,
  ChromosomeLayer,
  ChromosomeObject,
  ChromosomeStatus,
  ExportJob,
  ExportSettings,
  ExportTemplate,
  ExportTemplateType,
  GenomeAnomaly,
  GenomeLayout,
  Ideogram,
  IdeogramAnomaly,
  IdeogramSignal,
  ImportWarning,
  JournalEvent,
  KaryotypeImport,
  KaryotypeLevel,
  Metaphase,
  Note,
  Plant,
  Preparation,
  Probe,
  Sample,
  SampleKaryotype,
  StainedPreparation,
  TiltEntry,
} from "./types";
import { isoDay } from "./utils";

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

  setSelectedDate: (d: string) => void;

  addSample: (s: Sample) => void;
  addEvent: (ev: JournalEvent, change?: ChangeRecord[]) => void;

  addNote: (note: Omit<Note, "id" | "createdAt" | "archived">) => Note;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  incrementTilt: (level?: TiltEntry["level"]) => void;

  setLastChange: (change?: ChangeRecord[]) => void;

  // ----- кариотип actions -----
  selectKaryotypeContext: (ctx: Partial<KaryotypeContext>) => void;
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

  setSelectedDate: (d) => set({ selectedDate: d }),

  addSample: (s) => set((st) => ({ samples: [s, ...st.samples] })),

  addEvent: (ev, change) =>
    set((st) => ({
      events: [ev, ...st.events],
      lastChange: change,
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

  incrementTilt: (level = "calm") => {
    const today = isoDay(new Date());
    const t: TiltEntry = {
      id: `T-${Date.now()}`,
      date: today,
      level,
    };
    set((st) => ({ tilts: [t, ...st.tilts] }));
  },

  setLastChange: (change) => set({ lastChange: change }),

  /* ============================ КАРИОТИП ============================ */

  selectKaryotypeContext: (ctx) =>
    set((st) => ({ karyoCtx: { ...st.karyoCtx, ...ctx } })),

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
    const metaphaseId = imp.metaphaseId ?? `MET-${importId}`;
    const newChromosomes: ChromosomeObject[] = layers.map((l, idx) => ({
      id: `CHR-${metaphaseId}-${String(idx + 1).padStart(2, "0")}`,
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
    }));
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
        const newId = i.id.startsWith("IDG-DRAFT-")
          ? `IDG-${chromosomeId}`
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
    const id = `SK-${Date.now().toString(36)}`;
    const ts = nowIso();
    const sk: SampleKaryotype = {
      id,
      sampleId: layout.sampleId,
      title:
        title ??
        `Лицевой кариотип S-${layout.sampleId} · ${layout.level === "metaphase" ? "Метафаза" : "Гибридизация"}`,
      status: "ready_for_review",
      layoutId,
      level: layout.level,
      selectedChromosomeIds: layout.assignments.map((a) => a.chromosomeId),
      main: !st.sampleKaryotypes.some(
        (k) => k.sampleId === layout.sampleId && k.main
      ),
      createdAt: ts,
      exportIds: [],
    };
    set((st2) => ({
      sampleKaryotypes: [...st2.sampleKaryotypes, sk],
      genomeLayouts: st2.genomeLayouts.map((l) =>
        l.id === layoutId ? { ...l, status: "ready_for_review" } : l
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
    const ext = config.settings.format;
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

export interface ProgressBuckets {
  matureNoPrep: Sample[];
  created: Preparation[];
  primaryWashed: Preparation[];
  postHybWashed: Preparation[];
  hybridized: Preparation[];
  photographed: Preparation[];
  result: Sample[];
}

export function selectProgressBuckets(state: State): ProgressBuckets {
  const { samples, preparations } = state;

  const matureNoPrep = samples.filter(
    (s) =>
      (s.status === "registered" || s.status === "germinating") &&
      !preparations.some((p) => p.sampleId === s.id)
  );

  const created = preparations.filter((p) => p.status === "created");
  const primaryWashed = preparations.filter((p) => p.status === "pre_washed");
  const postHybWashed = preparations.filter((p) => p.status === "rehyb_ready");
  const hybridized = preparations.filter((p) => p.status === "hybridized");
  const photographed = preparations.filter((p) => p.status === "photographed");
  const result = samples.filter((s) => s.status === "result" || s.hasResult);

  return {
    matureNoPrep,
    created,
    primaryWashed,
    postHybWashed,
    hybridized,
    photographed,
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

export function selectExportsForSample(state: State, sampleId: string) {
  return state.exportJobs.filter((j) => j.sampleIds.includes(sampleId));
}
