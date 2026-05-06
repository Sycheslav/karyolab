import { X } from "lucide-react";
import ChromosomeGlyph from "@/components/karyotype/ChromosomeGlyph";
import type { ChromosomeObject } from "@/lib/types";

interface Props {
  sub: string;
  cls: number;
  chromosomes: ChromosomeObject[];
  onClose: () => void;
}

export default function AtlasCellExpandDialog({ sub, cls, chromosomes, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6">
      <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between text-slate-100">
          <h3 className="text-[15px] font-bold">
            Ячейка {sub}{cls} · {chromosomes.length} хромосом
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded text-slate-400 hover:bg-slate-800 hover:text-brand-accent"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {chromosomes.map((c) => (
            <div
              key={c.id}
              className="flex flex-col items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 p-2"
            >
              <ChromosomeGlyph chromosome={c} height={90} dark />
              <span className="font-mono text-[10px] text-slate-400">
                S-{c.sampleId} · {c.displayName ?? c.temporaryName.split(".").slice(-1)[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
