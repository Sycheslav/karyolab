import { useMemo, useState } from "react";
import { Library, Plus, SearchX, X } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { selectAtlasChromosomes, useStore } from "@/lib/store";
import AtlasMatrixCell, { isReferenceSampleSet } from "./AtlasMatrixCell";

const DEFAULT_SUBGENOMES = ["A", "B", "D"];

export default function AtlasMatrixView() {
  const ctx = useStore((s) => s.atlasCtx);
  const setAtlasContext = useStore((s) => s.setAtlasContext);
  const sampleKaryotypes = useStore((s) => s.sampleKaryotypes);
  const allChromosomes = useStore(selectAtlasChromosomes);
  const resetFilters = useStore((s) => s.resetAtlasFilters);

  const [extraSubgenomes, setExtraSubgenomes] = useState<string[]>([]);

  const subgenomes = useMemo(() => {
    const fromData = new Set<string>();
    for (const c of allChromosomes) if (c.subgenome) fromData.add(c.subgenome);
    const all = new Set([...DEFAULT_SUBGENOMES, ...extraSubgenomes, ...Array.from(fromData)]);
    return Array.from(all);
  }, [allChromosomes, extraSubgenomes]);
  const classes = Array.from({ length: 7 }, (_, i) => i + 1);

  const referenceSampleIds = useMemo(
    () => isReferenceSampleSet(sampleKaryotypes, ctx.selectedReferenceIds),
    [sampleKaryotypes, ctx.selectedReferenceIds]
  );

  const noSelection =
    ctx.selectedSampleIds.length === 0 && ctx.selectedReferenceIds.length === 0;

  const cellChromosomes = (sub: string, cls: number) =>
    allChromosomes.filter(
      (c) => c.subgenome === sub && c.chromosomeClass === cls
    );

  const onCellClick = (sub: string, cls: number) => {
    if (
      ctx.selectedCell &&
      ctx.selectedCell.sub === sub &&
      ctx.selectedCell.cls === cls
    ) {
      setAtlasContext({ selectedCell: undefined });
    } else {
      setAtlasContext({ selectedCell: { sub, cls } });
    }
  };

  const addExtraSubgenome = () => {
    const candidates = ["R", "U", "M", "S"];
    const next = candidates.find(
      (n) => !subgenomes.includes(n) && !extraSubgenomes.includes(n)
    );
    if (next) setExtraSubgenomes((s) => [...s, next]);
  };

  const removeSubgenome = (n: string) => {
    setExtraSubgenomes((s) => s.filter((x) => x !== n));
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between text-slate-100">
        <h3 className="text-[14px] font-bold">Матрица атласа</h3>
        <button
          type="button"
          onClick={addExtraSubgenome}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-accent/40 bg-brand-accent/15 px-3 py-1 text-[11.5px] font-bold text-brand-accent hover:bg-brand-accent/25"
        >
          <Plus size={12} /> Добавить субгеном
        </button>
      </div>

      {noSelection ? (
        <EmptyState
          icon={<Library size={28} />}
          title="Выберите образец или эталон"
          description="В левой панели выберите хотя бы один источник, чтобы заполнить матрицу."
          className="bg-slate-900/60 border-slate-700 text-slate-300"
        />
      ) : allChromosomes.length === 0 ? (
        <EmptyState
          icon={<SearchX size={28} />}
          title="Нет совпадений"
          description="По этим условиям нет хромосом, попробуйте снять фильтры."
          action={<Button onClick={resetFilters}>Сбросить фильтры</Button>}
          className="bg-slate-900/60 border-slate-700 text-slate-300"
        />
      ) : (
        <div
          className="grid items-stretch gap-2"
          style={{
            gridTemplateColumns: `40px repeat(${subgenomes.length}, minmax(140px, 1fr))`,
          }}
        >
          <div />
          {subgenomes.map((sub) => (
            <div
              key={sub}
              className="flex items-center justify-center gap-2 rounded-md bg-slate-900 py-2 text-center text-slate-100"
            >
              <span className="text-[14px] font-extrabold">{sub}</span>
              {extraSubgenomes.includes(sub) && (
                <button
                  type="button"
                  onClick={() => removeSubgenome(sub)}
                  className="grid h-5 w-5 place-items-center rounded-full text-slate-500 hover:bg-red-900/40 hover:text-red-400"
                  title="Удалить колонку"
                  aria-label={`Удалить колонку ${sub}`}
                >
                  <X size={11} />
                </button>
              )}
            </div>
          ))}

          {classes.flatMap((cls) => [
            <div
              key={`label-${cls}`}
              className="flex items-center justify-center text-[12px] font-bold text-slate-400"
            >
              {cls}
            </div>,
            ...subgenomes.map((sub) => {
              const items = cellChromosomes(sub, cls);
              const isSelected =
                ctx.selectedCell?.sub === sub && ctx.selectedCell?.cls === cls;
              return (
                <AtlasMatrixCell
                  key={`cell-${sub}-${cls}`}
                  sub={sub}
                  cls={cls}
                  chromosomes={items}
                  isSelected={isSelected}
                  onClick={() => onCellClick(sub, cls)}
                  referenceSampleIds={referenceSampleIds}
                />
              );
            }),
          ])}
        </div>
      )}
    </div>
  );
}
