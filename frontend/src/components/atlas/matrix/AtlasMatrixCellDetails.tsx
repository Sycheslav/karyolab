import { useNavigate } from "react-router-dom";
import { GitCompare, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ChromosomeGlyph from "@/components/karyotype/ChromosomeGlyph";
import { selectAtlasChromosomes, useStore } from "@/lib/store";

export default function AtlasMatrixCellDetails() {
  const ctx = useStore((s) => s.atlasCtx);
  const setAtlasContext = useStore((s) => s.setAtlasContext);
  const all = useStore(selectAtlasChromosomes);
  const nav = useNavigate();

  if (!ctx.selectedCell) return null;
  const { sub, cls } = ctx.selectedCell;

  const items = all.filter(
    (c) => c.subgenome === sub && c.chromosomeClass === cls
  );

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-brand-line px-4 py-2 bg-brand-deep text-brand-cream">
        <h3 className="text-[14px] font-bold">Ячейка {sub}{cls}</h3>
        <button
          type="button"
          onClick={() => setAtlasContext({ selectedCell: undefined })}
          className="grid h-7 w-7 place-items-center rounded text-brand-cream/80 hover:bg-white/10"
          aria-label="Закрыть"
        >
          <X size={14} />
        </button>
      </div>
      <div className="space-y-2 p-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-brand-line bg-brand-mint/40 p-3 text-center text-[12px] text-brand-muted">
            В ячейке нет хромосом — попробуйте снять фильтры или выбрать другой источник.
          </div>
        ) : (
          items.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-lg border border-brand-line bg-white p-2"
            >
              <ChromosomeGlyph chromosome={c} height={32} />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[11px] font-bold text-brand-deep truncate">
                  {c.displayName ?? c.temporaryName.split(".").slice(-1)[0]}
                </div>
                <div className="text-[10.5px] text-brand-muted truncate">
                  S-{c.sampleId}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() =>
                    nav(
                      `/кариотип/разметка/геном?sampleId=${c.sampleId}&stainedId=${c.stainedId}&metaphaseId=${c.metaphaseId}`
                    )
                  }
                  className="text-[10.5px] font-semibold text-brand-dark hover:underline"
                >
                  → Кариотип
                </button>
                <button
                  type="button"
                  onClick={() => nav(`/журнал/образец/${c.sampleId}`)}
                  className="text-[10.5px] font-semibold text-brand-dark hover:underline"
                >
                  → Образец
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-brand-line p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            nav(`/атлас/сравнение?scenario=by_class&classId=${sub}${cls}`)
          }
        >
          <GitCompare size={13} /> Найти похожее
        </Button>
      </div>
    </Card>
  );
}
