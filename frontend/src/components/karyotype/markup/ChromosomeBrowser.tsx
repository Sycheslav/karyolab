import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import { useStore } from "@/lib/store";
import type { ChromosomeObject, KaryotypeLevel } from "@/lib/types";
import ChromosomeGlyph from "../ChromosomeGlyph";
import { classNames } from "@/lib/utils";
import { Filter } from "lucide-react";

type FilterId = "all" | "no_ideogram" | "doubtful" | "selected" | "excluded";

interface Props {
  chromosomes: ChromosomeObject[];
  activeId?: string;
  level: KaryotypeLevel;
  onChangeLevel: (l: KaryotypeLevel) => void;
  onSelect: (id: string) => void;
}

export default function ChromosomeBrowser({
  chromosomes,
  activeId,
  level,
  onChangeLevel,
  onSelect,
}: Props) {
  const [filter, setFilter] = useState<FilterId>("all");
  const ideogramsState = useStore((s) => s.ideograms);

  const filtered = useMemo(() => {
    return chromosomes.filter((c) => {
      switch (filter) {
        case "no_ideogram":
          return !c.ideogramId;
        case "doubtful":
          return c.status === "doubtful";
        case "selected":
          return !!c.selectedForKaryotype;
        case "excluded":
          return c.status === "excluded";
        default:
          return c.status !== "excluded";
      }
    });
  }, [chromosomes, filter]);

  const counters = useMemo(() => {
    return {
      total: chromosomes.length,
      no_ideogram: chromosomes.filter((c) => !c.ideogramId).length,
      doubtful: chromosomes.filter((c) => c.status === "doubtful").length,
      excluded: chromosomes.filter((c) => c.status === "excluded").length,
    };
  }, [chromosomes]);

  const filters: { id: FilterId; label: string; count?: number }[] = [
    { id: "all", label: "Все", count: counters.total - counters.excluded },
    {
      id: "no_ideogram",
      label: "Без идеограммы",
      count: counters.no_ideogram,
    },
    { id: "doubtful", label: "Сомнительные", count: counters.doubtful },
    { id: "selected", label: "Выбранные" },
    { id: "excluded", label: "Исключены", count: counters.excluded },
  ];

  return (
    <Card className="flex flex-col" pad={false}>
      <div className="flex flex-col gap-3 border-b border-brand-line p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
          Уровень
        </div>
        <Tabs
          value={level}
          onChange={(id) => onChangeLevel(id as KaryotypeLevel)}
          options={[
            { id: "metaphase", label: "Метафаза" },
            { id: "hybridization", label: "Гибридизация" },
          ]}
          className="!w-full justify-stretch"
        />
        <div className="mt-1 flex items-center gap-1 text-[11px] text-brand-muted">
          <Filter size={11} />
          <span className="font-bold uppercase tracking-wider">Фильтр</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={classNames(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition",
                filter === f.id
                  ? "border-brand bg-brand text-white"
                  : "border-brand-line bg-white text-brand-deep/80 hover:bg-brand-mint"
              )}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span
                  className={classNames(
                    "rounded-full px-1.5 text-[10px]",
                    filter === f.id ? "bg-white/20" : "bg-brand-mint"
                  )}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto p-3">
        {filtered.map((c) => {
          const ideogram = ideogramsState.find(
            (i) => i.chromosomeId === c.id && !i.id.startsWith("IDG-DRAFT-")
          );
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={classNames(
                "group relative flex flex-col items-center gap-1 rounded-xl border p-2 text-left transition",
                isActive
                  ? "border-brand bg-brand-cream"
                  : "border-brand-line bg-white hover:bg-brand-mint/40"
              )}
            >
              <div className="flex h-[110px] w-full items-center justify-center rounded-lg bg-slate-900/95">
                <ChromosomeGlyph chromosome={c} ideogram={ideogram} height={94} dark />
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="truncate font-mono text-[11px] font-semibold text-brand-deep">
                  {c.displayName ?? c.temporaryName}
                </span>
                {ideogram ? (
                  <span
                    className="grid h-4 w-4 place-items-center rounded-full bg-brand text-[10px] font-black text-white"
                    title="Есть идеограмма"
                  >
                    ✓
                  </span>
                ) : (
                  <span
                    className="grid h-4 w-4 place-items-center rounded-full border border-brand-line text-[9px] text-brand-muted"
                    title="Идеограммы нет"
                  >
                    new
                  </span>
                )}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-6 text-center text-[12px] text-brand-muted">
            Нет хромосом по этому фильтру.
          </div>
        )}
      </div>
    </Card>
  );
}
