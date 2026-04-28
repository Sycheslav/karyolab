import { useMemo, useState } from "react";
import type { ChromosomeObject, KaryotypeLevel } from "@/lib/types";
import ChromosomeGlyph from "../ChromosomeGlyph";
import { classNames } from "@/lib/utils";
import { Filter } from "lucide-react";
import Tabs from "@/components/ui/Tabs";

interface Props {
  chromosomes: ChromosomeObject[];
  totalCount: number;
  assignedCount: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  level: KaryotypeLevel;
  onChangeLevel: (l: KaryotypeLevel) => void;
}

type FilterId = "unassigned" | "classed" | "no_ideogram" | "excluded";

export default function GenomeChromosomeBank({
  chromosomes,
  totalCount,
  assignedCount,
  selectedId,
  onSelect,
  level,
  onChangeLevel,
}: Props) {
  const [filter, setFilter] = useState<FilterId>("unassigned");

  const filtered = useMemo(() => {
    return chromosomes.filter((c) => {
      switch (filter) {
        case "unassigned":
          return !c.subgenome || !c.chromosomeClass;
        case "classed":
          return !!c.subgenome && !!c.chromosomeClass;
        case "no_ideogram":
          return !c.ideogramId;
        case "excluded":
          return c.status === "excluded";
        default:
          return true;
      }
    });
  }, [chromosomes, filter]);

  const filters: { id: FilterId; label: string }[] = [
    { id: "unassigned", label: "Нераспределённые" },
    { id: "classed", label: "С классом" },
    { id: "no_ideogram", label: "Без идеограммы" },
    { id: "excluded", label: "Исключены" },
  ];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-card">
      <div className="border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[14px] font-bold">Банк хромосом</h3>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-bold">
            {assignedCount} / {totalCount}
          </span>
        </div>
        <Tabs
          value={level}
          onChange={(id) => onChangeLevel(id as KaryotypeLevel)}
          options={[
            { id: "metaphase", label: "Метафаза" },
            { id: "hybridization", label: "Гибридизация" },
          ]}
          className="mt-3 !w-full !border-slate-700 !bg-slate-900 [&>button]:!text-slate-300 [&>button.bg-brand-cream]:!bg-brand [&>button.bg-brand-cream]:!text-white"
        />
        <div className="mt-3 flex items-center gap-1 text-[10.5px] text-slate-400">
          <Filter size={11} />
          <span className="font-bold uppercase tracking-wider">Фильтр</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={classNames(
                "rounded-full border px-2 py-0.5 text-[11px] font-semibold transition",
                filter === f.id
                  ? "border-brand-accent bg-brand-accent/20 text-brand-accent"
                  : "border-slate-700 text-slate-300 hover:bg-slate-800"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid max-h-[68vh] grid-cols-2 gap-2 overflow-y-auto p-3">
        {filtered.map((c) => {
          const isSelected = c.id === selectedId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={classNames(
                "group flex flex-col items-center gap-1 rounded-xl border p-2 transition",
                isSelected
                  ? "border-brand-accent bg-brand-accent/15"
                  : "border-slate-700 bg-slate-900 hover:bg-slate-800"
              )}
            >
              <div className="flex h-[100px] w-full items-center justify-center rounded-lg bg-black/60">
                <ChromosomeGlyph chromosome={c} height={88} dark />
              </div>
              <div className="flex w-full items-center justify-between text-[10.5px]">
                <span className="font-mono font-semibold text-slate-200">
                  {c.displayName ?? c.temporaryName}
                </span>
                {c.subgenome && c.chromosomeClass && (
                  <span className="rounded bg-brand-accent/30 px-1 py-px font-bold text-brand-accent">
                    {c.subgenome}{c.chromosomeClass}
                  </span>
                )}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-6 text-center text-[12px] text-slate-400">
            Пусто. Выберите другой фильтр или уровень.
          </div>
        )}
      </div>
    </div>
  );
}
