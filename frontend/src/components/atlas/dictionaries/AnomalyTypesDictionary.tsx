import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";
import DictionaryShell from "./DictionaryShell";
import AnomalyTypeCard from "./AnomalyTypeCard";

const COLOR_BG: Record<string, string> = {
  amber: "bg-amber-400",
  red: "bg-red-500",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  slate: "bg-slate-400",
};

export default function AnomalyTypesDictionary() {
  const anomalies = useStore((s) => s.anomalyTypes);
  const [search, setSearch] = useState("");
  const [activeCode, setActiveCode] = useState<string | undefined>(
    anomalies[0]?.code
  );

  const filtered = anomalies.filter((a) =>
    search ? a.label.toLowerCase().includes(search.toLowerCase()) : true
  );
  const ano = useMemo(
    () => anomalies.find((a) => a.code === activeCode) ?? anomalies[0],
    [anomalies, activeCode]
  );

  const list = (
    <Card pad={false}>
      <div className="border-b border-brand-line p-3">
        <Input
          leading={<Search size={14} />}
          placeholder="Поиск…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Не найдено" />
      ) : (
        <ul>
          {filtered.map((a) => {
            const isActive = activeCode === a.code;
            return (
              <li
                key={a.code}
                onClick={() => setActiveCode(a.code)}
                className={classNames(
                  "flex cursor-pointer items-center gap-3 border-t border-brand-line/60 px-3 py-2.5 text-[12.5px] transition",
                  isActive ? "bg-brand-cream" : "hover:bg-brand-mint/40"
                )}
              >
                <span
                  className={classNames(
                    "h-3 w-3",
                    COLOR_BG[a.markerColor] ?? "bg-slate-400",
                    a.markerShape === "circle" ? "rounded-full" : "rounded-sm"
                  )}
                />
                <div className="flex-1">
                  <div className="font-bold text-brand-deep">{a.label}</div>
                  <div className="font-mono text-[10.5px] text-brand-muted">
                    {a.code}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  return <DictionaryShell list={list} detail={ano ? <AnomalyTypeCard ano={ano} /> : null} />;
}
