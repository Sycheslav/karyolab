import { useMemo, useState } from "react";
import { Search, Sprout } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";
import TheoreticalBadge from "../shared/TheoreticalBadge";

export default function AtlasSamplePicker({ title = "Образцы" }: { title?: string }) {
  const samples = useStore((s) => s.samples);
  const sampleKaryotypes = useStore((s) => s.sampleKaryotypes);
  const theoreticalRecords = useStore((s) => s.theoreticalRecords);
  const ctx = useStore((s) => s.atlasCtx);
  const toggle = useStore((s) => s.toggleAtlasSample);

  const [search, setSearch] = useState("");

  const sampleHasKaryotype = useMemo(() => {
    const set = new Set(
      sampleKaryotypes.filter((k) => k.status === "approved" || k.status === "exported").map((k) => k.sampleId)
    );
    return (id: string) => set.has(id);
  }, [sampleKaryotypes]);

  const sampleHasTheory = useMemo(() => {
    const set = new Set(
      theoreticalRecords
        .filter((t) => t.scope.kind === "sample")
        .map((t) => t.scope.ref)
    );
    return (id: string) => set.has(id);
  }, [theoreticalRecords]);

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
        const ak = sampleHasKaryotype(a.id) ? 0 : 1;
        const bk = sampleHasKaryotype(b.id) ? 0 : 1;
        if (ak !== bk) return ak - bk;
        return a.id.localeCompare(b.id);
      });
  }, [samples, search, sampleHasKaryotype]);

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="border-b border-brand-line p-3">
        <h3 className="text-[14px] font-bold text-brand-deep">{title}</h3>
        <Input
          leading={<Search size={14} />}
          placeholder="Поиск по S-номеру или виду…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2"
        />
      </div>
      <div className="max-h-[40vh] overflow-y-auto">
        {filtered.map((s) => {
          const checked = ctx.selectedSampleIds.includes(s.id);
          const has = sampleHasKaryotype(s.id);
          const theory = sampleHasTheory(s.id);
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
                onChange={() => toggle(s.id)}
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
                <Badge tone="green">кариотип</Badge>
              ) : theory ? (
                <TheoreticalBadge />
              ) : (
                <Badge tone="amber">нет кариотипа</Badge>
              )}
            </label>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-4 text-center text-[12px] text-brand-muted">
            Ничего не найдено
          </div>
        )}
      </div>
    </Card>
  );
}
