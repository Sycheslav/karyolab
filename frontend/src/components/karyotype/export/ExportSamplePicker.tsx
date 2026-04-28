import { useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { Search, Sprout } from "lucide-react";
import type { Sample, SampleKaryotype } from "@/lib/types";
import { classNames } from "@/lib/utils";

interface Props {
  samples: Sample[];
  karyotypes: SampleKaryotype[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function ExportSamplePicker({
  samples,
  karyotypes,
  selectedIds,
  onToggle,
}: Props) {
  const [search, setSearch] = useState("");

  const sampleHasKaryotype = useMemo(() => {
    const set = new Set(karyotypes.map((k) => k.sampleId));
    return (id: string) => set.has(id);
  }, [karyotypes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return samples
      .filter((s) =>
        q
          ? s.id.toLowerCase().includes(q) ||
            s.species.toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => {
        // образцы с кариотипом — выше
        const ak = sampleHasKaryotype(a.id) ? 0 : 1;
        const bk = sampleHasKaryotype(b.id) ? 0 : 1;
        if (ak !== bk) return ak - bk;
        return a.id.localeCompare(b.id);
      });
  }, [samples, search, sampleHasKaryotype]);

  const recent = samples
    .filter((s) => sampleHasKaryotype(s.id))
    .slice(0, 4);

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="border-b border-brand-line p-3">
        <h3 className="text-[14px] font-bold text-brand-deep">Образцы</h3>
        <Input
          leading={<Search size={14} />}
          placeholder="Поиск по S-номеру или виду…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2"
        />
      </div>

      {recent.length > 0 && !search && (
        <div className="border-b border-brand-line p-3">
          <div className="label-cap mb-2">С готовым кариотипом</div>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((s) => {
              const checked = selectedIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => onToggle(s.id)}
                  className={classNames(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-bold transition",
                    checked
                      ? "border-brand bg-brand text-white"
                      : "border-brand-line bg-white text-brand-deep hover:bg-brand-mint"
                  )}
                >
                  S-{s.id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-h-[40vh] overflow-y-auto">
        {filtered.map((s) => {
          const checked = selectedIds.includes(s.id);
          const has = sampleHasKaryotype(s.id);
          return (
            <label
              key={s.id}
              className={classNames(
                "flex cursor-pointer items-center gap-3 border-t border-brand-line/60 px-3 py-2.5 text-[12.5px] transition",
                checked ? "bg-brand-cream" : "hover:bg-brand-mint/40"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(s.id)}
                className="h-4 w-4 accent-brand"
              />
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-mint text-brand-dark">
                <Sprout size={13} />
              </span>
              <div className="flex-1">
                <div className="font-bold text-brand-deep">S-{s.id}</div>
                <div className="text-[11px] text-brand-muted">{s.species}</div>
              </div>
              {has ? (
                <span className="rounded-full bg-brand-accent/20 px-2 py-0.5 text-[10px] font-bold text-brand-dark">
                  есть кариотип
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  нет кариотипа
                </span>
              )}
            </label>
          );
        })}
      </div>
    </Card>
  );
}
