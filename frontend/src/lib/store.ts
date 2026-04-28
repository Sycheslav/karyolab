import { create } from "zustand";
import {
  initialEvents,
  initialNotes,
  initialPlants,
  initialPreparations,
  initialProbes,
  initialSamples,
  initialStained,
  initialTilts,
} from "./mockData";
import type {
  ChangeRecord,
  JournalEvent,
  Note,
  Plant,
  Preparation,
  Probe,
  Sample,
  StainedPreparation,
  TiltEntry,
} from "./types";
import { isoDay } from "./utils";

interface State {
  samples: Sample[];
  plants: Plant[];
  preparations: Preparation[];
  stained: StainedPreparation[];
  probes: Probe[];
  events: JournalEvent[];
  notes: Note[];
  tilts: TiltEntry[];

  selectedDate: string; // YYYY-MM-DD
  lastChange?: ChangeRecord[];

  setSelectedDate: (d: string) => void;

  addSample: (s: Sample) => void;
  addEvent: (ev: JournalEvent, change?: ChangeRecord[]) => void;

  addNote: (note: Omit<Note, "id" | "createdAt" | "archived">) => Note;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  incrementTilt: (level?: TiltEntry["level"]) => void;

  setLastChange: (change?: ChangeRecord[]) => void;
}

export const useStore = create<State>((set) => ({
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
}));

/* ----- selectors ----- */

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

/* ---- помощники для прогресса (06/09 документации) ---- */

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

  // «созрели, но нет препарата» — образцы не в работе и без preparations.
  // В нашем mock — это registered/germinating без preparations.
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

/** Получить последнюю окраску препарата (по cycleNumber). */
export function selectLastStain(
  state: State,
  preparationId: string
): StainedPreparation | undefined {
  return state.stained
    .filter((s) => s.preparationId === preparationId)
    .sort((a, b) => b.cycleNumber - a.cycleNumber)[0];
}
