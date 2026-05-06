import { useState } from "react";
import { Maximize2 } from "lucide-react";
import ChromosomeGlyph from "@/components/karyotype/ChromosomeGlyph";
import type { ChromosomeObject, SampleKaryotype } from "@/lib/types";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";
import AtlasCellExpandDialog from "./AtlasCellExpandDialog";

interface Props {
  sub: string;
  cls: number;
  chromosomes: ChromosomeObject[];
  isSelected: boolean;
  onClick: () => void;
  referenceSampleIds: Set<string>;
}

export default function AtlasMatrixCell({
  sub,
  cls,
  chromosomes,
  isSelected,
  onClick,
  referenceSampleIds,
}: Props) {
  const ctx = useStore((s) => s.atlasCtx);
  const [expanded, setExpanded] = useState(false);

  const tone = computeTone(chromosomes.length);
  const visible = chromosomes.length > 5 ? chromosomes.slice(0, 4) : chromosomes;
  const overflow = chromosomes.length - visible.length;

  const sortedVisible = [...visible].sort((a, b) => {
    const ar = referenceSampleIds.has(a.sampleId) ? 0 : 1;
    const br = referenceSampleIds.has(b.sampleId) ? 0 : 1;
    return ar - br;
  });

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={classNames(
          "group relative flex min-h-[120px] cursor-pointer flex-col items-center gap-1 rounded-xl border p-2 transition",
          isSelected
            ? "border-brand-accent bg-brand-accent/10"
            : chromosomes.length === 0
              ? "border-dashed border-slate-700 bg-slate-900/60 hover:border-brand-accent/40"
              : "border-slate-700 bg-slate-900 hover:border-brand-accent/40",
          tone
        )}
      >
        {chromosomes.length === 0 ? (
          <span className="text-[10px] uppercase tracking-wider text-slate-600">
            пусто
          </span>
        ) : (
          <div className="flex flex-wrap items-end justify-center gap-1">
            {sortedVisible.map((c) => {
              const isRef = referenceSampleIds.has(c.sampleId);
              return (
                <span
                  key={c.id}
                  className={classNames(
                    "flex flex-col items-center rounded-md border p-1",
                    isRef
                      ? "border-brand-accent/30 ring-1 ring-brand-accent/40"
                      : "border-transparent"
                  )}
                >
                  <ChromosomeGlyph
                    chromosome={c}
                    height={ctx.viewMode === "ideograms_only" ? 48 : 60}
                    ideogramOnly={ctx.viewMode === "ideograms_only"}
                    dark
                  />
                  {(ctx.viewMode !== "chromosomes" || chromosomes.length <= 5) && (
                    <span className="font-mono text-[9px] text-slate-400">
                      S-{c.sampleId.split(".")[0]}.{c.sampleId.split(".")[1]}
                    </span>
                  )}
                </span>
              );
            })}
            {overflow > 0 && (
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                +{overflow}
              </span>
            )}
          </div>
        )}

        {chromosomes.length > 5 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
            className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded text-slate-400 hover:bg-slate-800 hover:text-brand-accent"
            title="Развернуть"
            aria-label="Развернуть ячейку"
          >
            <Maximize2 size={11} />
          </button>
        )}

        <CellStatusHint count={chromosomes.length} />
      </button>

      {expanded && (
        <AtlasCellExpandDialog
          sub={sub}
          cls={cls}
          chromosomes={chromosomes}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}

function computeTone(count: number) {
  if (count === 0) return "";
  if (count === 1) return "ring-1 ring-amber-400/40";
  if (count === 2) return "ring-1 ring-emerald-400/30";
  if (count === 3) return "ring-1 ring-amber-400/40";
  return "ring-1 ring-amber-400/40";
}

function CellStatusHint({ count }: { count: number }) {
  if (count === 0) return null;
  let label = "норма";
  let cls = "bg-emerald-500/20 text-emerald-300";
  if (count === 1) {
    label = "моносомия?";
    cls = "bg-amber-500/20 text-amber-300";
  } else if (count === 3) {
    label = "трисомия?";
    cls = "bg-amber-500/20 text-amber-300";
  } else if (count > 3) {
    label = `+${count}`;
    cls = "bg-amber-500/20 text-amber-300";
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

export function isReferenceSampleSet(sampleKaryotypes: SampleKaryotype[], referenceIds: string[]): Set<string> {
  return new Set(
    sampleKaryotypes
      .filter((k) => referenceIds.includes(k.id))
      .map((k) => k.sampleId)
  );
}
