import ChromosomeGlyph from "@/components/karyotype/ChromosomeGlyph";
import type { ChromosomeObject } from "@/lib/types";
import { classNames } from "@/lib/utils";

interface Props {
  chromosomes: ChromosomeObject[];
  className?: string;
}

export default function AtlasMiniKaryotype({ chromosomes, className }: Props) {
  const items = chromosomes.slice(0, 7);
  if (items.length === 0) {
    return (
      <div
        className={classNames(
          "grid h-[120px] place-items-center rounded-xl border border-slate-700 bg-slate-950 p-2 text-[11px] text-slate-500",
          className
        )}
      >
        нет хромосом
      </div>
    );
  }
  return (
    <div
      className={classNames(
        "grid grid-cols-7 gap-1 rounded-xl border border-slate-700 bg-slate-950 p-2",
        className
      )}
    >
      {items.map((c) => (
        <div key={c.id} className="flex items-end justify-center">
          <ChromosomeGlyph chromosome={c} height={36} dark />
        </div>
      ))}
    </div>
  );
}
