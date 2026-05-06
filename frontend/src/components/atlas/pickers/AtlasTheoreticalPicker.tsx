import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";
import TheoreticalBadge from "../shared/TheoreticalBadge";

const SOURCE_LABEL: Record<string, string> = {
  literature: "литература",
  hypothesis: "гипотеза",
  note: "заметка",
  protocol: "протокол",
};

export default function AtlasTheoreticalPicker() {
  const records = useStore((s) => s.theoreticalRecords);
  const ctx = useStore((s) => s.atlasCtx);
  const toggle = useStore((s) => s.toggleAtlasTheoretical);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) =>
      q ? r.title.toLowerCase().includes(q) : true
    );
  }, [records, search]);

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="border-b border-brand-line p-3">
        <h3 className="text-[14px] font-bold text-brand-deep">Теоретические записи</h3>
        <Input
          leading={<Search size={14} />}
          placeholder="Поиск по названию…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2"
        />
      </div>
      <div className="max-h-[40vh] overflow-y-auto">
        {filtered.map((r) => {
          const checked = ctx.selectedTheoreticalIds.includes(r.id);
          return (
            <label
              key={r.id}
              className={classNames(
                "flex cursor-pointer items-start gap-3 border-t border-brand-line/60 px-3 py-2.5 text-[12.5px] transition",
                checked ? "bg-brand-cream" : "hover:bg-brand-mint/40"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(r.id)}
                className="mt-0.5 h-4 w-4 accent-brand"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <TheoreticalBadge />
                  <span className="font-bold text-brand-deep">{r.title}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-brand-muted">
                  сценарий: {SOURCE_LABEL[r.sourceType] ?? r.sourceType}
                </div>
              </div>
            </label>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-4 text-center text-[12px] text-brand-muted">
            Записей нет
          </div>
        )}
      </div>
    </Card>
  );
}
