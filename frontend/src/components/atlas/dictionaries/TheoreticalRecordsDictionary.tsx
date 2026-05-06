import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";
import type { TheoreticalSourceType } from "@/lib/types";
import TheoreticalBadge from "../shared/TheoreticalBadge";
import DictionaryShell from "./DictionaryShell";
import TheoreticalRecordCard from "./TheoreticalRecordCard";

const FILTERS: { id: TheoreticalSourceType | "all"; label: string }[] = [
  { id: "all", label: "все" },
  { id: "literature", label: "литература" },
  { id: "hypothesis", label: "гипотеза" },
  { id: "note", label: "заметка" },
  { id: "protocol", label: "протокол" },
];

export default function TheoreticalRecordsDictionary() {
  const records = useStore((s) => s.theoreticalRecords);
  const species = useStore((s) => s.species);
  const add = useStore((s) => s.addTheoreticalRecord);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TheoreticalSourceType | "all">("all");
  const [activeId, setActiveId] = useState<string | undefined>(records[0]?.id);

  const filtered = records
    .filter((r) => (type === "all" ? true : r.sourceType === type))
    .filter((r) =>
      search ? r.title.toLowerCase().includes(search.toLowerCase()) : true
    );
  const rec = useMemo(
    () => records.find((r) => r.id === activeId) ?? records[0],
    [records, activeId]
  );

  const list = (
    <Card pad={false}>
      <div className="space-y-2 border-b border-brand-line p-3">
        <div className="flex items-center gap-2">
          <Input
            leading={<Search size={14} />}
            placeholder="Поиск…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() => {
              const id = add({
                title: "Новая теоретическая запись",
                scope: { kind: "taxon", ref: species[0]?.id ?? "" },
                sourceType: "note",
              });
              setActiveId(id);
              toast.success("Добавлено");
            }}
          >
            <Plus size={13} /> Добавить
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = type === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setType(f.id)}
                className={classNames(
                  "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition",
                  active
                    ? "border-brand-deep bg-brand-deep text-brand-cream"
                    : "border-brand-line bg-white text-brand-deep hover:bg-brand-mint/40"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Записей нет" />
      ) : (
        <ul>
          {filtered.map((r) => {
            const isActive = activeId === r.id;
            return (
              <li
                key={r.id}
                onClick={() => setActiveId(r.id)}
                className={classNames(
                  "flex cursor-pointer items-center gap-3 border-t border-brand-line/60 px-3 py-2.5 text-[12.5px] transition",
                  isActive
                    ? "bg-brand-cream"
                    : "bg-brand-mint/30 hover:bg-brand-mint/50"
                )}
              >
                <TheoreticalBadge />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-brand-deep truncate">{r.title}</div>
                  <div className="text-[10.5px] text-brand-muted">
                    {r.sourceType}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  return <DictionaryShell list={list} detail={rec ? <TheoreticalRecordCard rec={rec} /> : null} />;
}
