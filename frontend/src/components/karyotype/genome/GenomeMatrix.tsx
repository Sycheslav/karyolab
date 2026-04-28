import type { ChromosomeObject, GenomeLayout } from "@/lib/types";
import ChromosomeGlyph from "../ChromosomeGlyph";
import { classNames } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface Props {
  layout: GenomeLayout;
  cellChromosomes: (sub: string, cls: number) => ChromosomeObject[];
  selectedCell: { sub: string; cls: number } | null;
  selectedChromId: string | null;
  onCellClick: (sub: string, cls: number) => void;
  onChromClick: (id: string) => void;
  onAddSubgenome: () => void;
  onRemoveSubgenome: (name: string) => void;
}

export default function GenomeMatrix({
  layout,
  cellChromosomes,
  selectedCell,
  selectedChromId,
  onCellClick,
  onChromClick,
  onAddSubgenome,
  onRemoveSubgenome,
}: Props) {
  const classes = Array.from({ length: layout.classCount }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between text-slate-100">
        <h3 className="text-[14px] font-bold">Матрица кариотипа</h3>
        <button
          onClick={onAddSubgenome}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-accent/40 bg-brand-accent/15 px-3 py-1 text-[11.5px] font-bold text-brand-accent hover:bg-brand-accent/25"
        >
          <Plus size={12} />
          Добавить субгеном
        </button>
      </div>

      {/* Шапка субгеномов */}
      <div
        className="grid items-stretch gap-2"
        style={{
          gridTemplateColumns: `40px repeat(${layout.subgenomes.length}, minmax(120px, 1fr))`,
        }}
      >
        <div />
        {layout.subgenomes.map((sub) => (
          <div
            key={sub}
            className="flex items-center justify-center gap-2 rounded-md bg-slate-900 py-2 text-center text-slate-100"
          >
            <span className="text-[14px] font-extrabold">{sub}</span>
            {layout.subgenomes.length > 1 && (
              <button
                onClick={() => onRemoveSubgenome(sub)}
                className="grid h-5 w-5 place-items-center rounded-full text-slate-500 hover:bg-red-900/40 hover:text-red-400"
                title="Удалить колонку"
              >
                <X size={11} />
              </button>
            )}
          </div>
        ))}

        {/* Сетка строк */}
        {classes.flatMap((cls) => [
          <div
            key={`label-${cls}`}
            className="flex items-center justify-center text-[12px] font-bold text-slate-400"
          >
            {cls}
          </div>,
          ...layout.subgenomes.map((sub) => {
            const items = cellChromosomes(sub, cls);
            const isSelected =
              selectedCell?.sub === sub && selectedCell?.cls === cls;
            const tone = computeTone(items.length);
            return (
              <button
                key={`cell-${sub}-${cls}`}
                onClick={() => onCellClick(sub, cls)}
                className={classNames(
                  "group relative flex min-h-[110px] cursor-pointer items-center justify-center gap-1 rounded-xl border p-2 transition",
                  isSelected
                    ? "border-brand-accent bg-brand-accent/10"
                    : items.length === 0
                      ? "border-dashed border-slate-700 bg-slate-900/60 hover:border-brand-accent/40"
                      : "border-slate-700 bg-slate-900 hover:border-brand-accent/40",
                  tone
                )}
              >
                {items.length === 0 && !selectedChromId && (
                  <span className="text-[10px] uppercase tracking-wider text-slate-600">
                    пусто
                  </span>
                )}
                {items.length === 0 && selectedChromId && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent/80">
                    кликните, чтобы назначить
                  </span>
                )}

                <div className="flex flex-wrap items-end justify-center gap-1">
                  {items.map((c) => (
                    <span
                      key={c.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChromClick(c.id);
                      }}
                      className={classNames(
                        "flex flex-col items-center rounded-md border p-1",
                        c.id === selectedChromId
                          ? "border-brand-accent bg-brand-accent/15"
                          : "border-transparent hover:border-slate-600"
                      )}
                    >
                      <ChromosomeGlyph chromosome={c} height={70} dark />
                      <span className="font-mono text-[9px] text-slate-400">
                        {c.temporaryName.replace("untitled", "u")}
                      </span>
                    </span>
                  ))}
                </div>

                {/* подсказка статуса */}
                <CellStatusHint count={items.length} />
              </button>
            );
          }),
        ])}
      </div>

      <div className="mt-3 text-[11px] text-slate-400">
        Подсказка: выберите хромосому слева и кликните по ячейке.
        Или сначала ячейку, потом хромосому. Повторный клик по выбранной ячейке снимает выделение.
      </div>
    </div>
  );
}

function computeTone(count: number) {
  if (count === 0) return "";
  if (count === 1) return "ring-1 ring-emerald-400/30";
  if (count === 2) return "ring-1 ring-blue-400/40";
  return "ring-1 ring-amber-400/40";
}

function CellStatusHint({ count }: { count: number }) {
  if (count === 0) return null;
  let label = "норма";
  let cls = "bg-emerald-500/20 text-emerald-300";
  if (count === 1) {
    label = "моносомия?";
    cls = "bg-amber-500/20 text-amber-300";
  } else if (count >= 3) {
    label = count === 3 ? "трисомия?" : `+${count}`;
    cls = "bg-amber-500/20 text-amber-300";
  } else {
    label = "норма";
  }
  return (
    <span
      className={classNames(
        "absolute right-1 top-1 rounded px-1 text-[9px] font-bold uppercase",
        cls
      )}
    >
      {label}
    </span>
  );
}
