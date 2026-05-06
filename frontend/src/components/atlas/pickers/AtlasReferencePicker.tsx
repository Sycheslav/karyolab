import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { selectReferenceKaryotypes, useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";
import ReferenceBadge from "../shared/ReferenceBadge";
import TheoreticalBadge from "../shared/TheoreticalBadge";

export default function AtlasReferencePicker({ title = "Эталоны" }: { title?: string }) {
  const refs = useStore(selectReferenceKaryotypes);
  const samples = useStore((s) => s.samples);
  const ctx = useStore((s) => s.atlasCtx);
  const toggle = useStore((s) => s.toggleAtlasReference);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return refs.filter((k) => {
      if (!q) return true;
      const sample = samples.find((s) => s.id === k.sampleId);
      const hay = `${k.referenceLabel ?? ""} ${k.title} ${sample?.species ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [refs, search, samples]);

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="border-b border-brand-line p-3">
        <h3 className="text-[14px] font-bold text-brand-deep">{title}</h3>
        <Input
          leading={<Search size={14} />}
          placeholder="Поиск по эталону или виду…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2"
        />
      </div>
      <div className="max-h-[40vh] overflow-y-auto">
        {filtered.map((k) => {
          const checked = ctx.selectedReferenceIds.includes(k.id);
          const sample = samples.find((s) => s.id === k.sampleId);
          return (
            <label
              key={k.id}
              className={classNames(
                "flex cursor-pointer items-center gap-3 border-t border-brand-line/60 px-3 py-2.5 text-[12.5px] transition",
                checked ? "bg-brand-cream" : "hover:bg-brand-mint/40"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(k.id)}
                className="h-4 w-4 accent-brand"
              />
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-accent/20 text-brand-dark">
                <Star size={13} />
              </span>
              <div className="flex-1">
                <div className="font-bold text-brand-deep">
                  {k.referenceLabel ?? k.title}
                </div>
                <div className="text-[11px] text-brand-muted">
                  S-{k.sampleId}
                  {sample && ` · ${sample.species}`}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <ReferenceBadge />
                {k.referenceSource === "literature" && <TheoreticalBadge />}
              </div>
            </label>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-4 text-center text-[12px] text-brand-muted">
            Эталоны отсутствуют
          </div>
        )}
      </div>
    </Card>
  );
}
