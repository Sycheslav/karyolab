import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { selectProbeUsage, useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";
import ChannelBadge from "../shared/ChannelBadge";
import DictionaryShell from "./DictionaryShell";
import ProbeCard from "./ProbeCard";

export default function ProbesDictionary() {
  const probes = useStore((s) => s.atlasProbes);
  const fluorochromes = useStore((s) => s.fluorochromes);
  const allStained = useStore((s) => s.stained);
  const add = useStore((s) => s.addAtlasProbe);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | undefined>(probes[0]?.id);

  const usageCount = useMemo(() => {
    const cache: Record<string, number> = {};
    for (const p of probes) {
      cache[p.id] = allStained.filter((s) =>
        s.probes.some((x) => x.name === p.name)
      ).length;
    }
    return cache;
  }, [probes, allStained]);

  const filtered = probes.filter((p) =>
    search ? p.name.toLowerCase().includes(search.toLowerCase()) : true
  );
  const probe = useMemo(
    () => probes.find((p) => p.id === activeId) ?? probes[0],
    [probes, activeId]
  );

  const onAdd = () => {
    const id = add({
      name: "Новый зонд",
      fluorochromeId: fluorochromes[0]?.id ?? "FL-FITC",
    });
    setActiveId(id);
    toast.success("Зонд добавлен");
  };

  const list = (
    <Card pad={false}>
      <div className="flex items-center gap-2 border-b border-brand-line p-3">
        <Input
          leading={<Search size={14} />}
          placeholder="Поиск…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button size="sm" onClick={onAdd}>
          <Plus size={13} /> Добавить
        </Button>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="Нет зондов" />
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-brand-deep text-brand-cream">
            <tr>
              <th className="px-3 py-2 text-left">Зонд</th>
              <th className="px-3 py-2 text-left">Канал</th>
              <th className="px-3 py-2 text-left">Мишень</th>
              <th className="px-3 py-2 text-left">Использований</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const channel = fluorochromes.find((f) => f.id === p.fluorochromeId)?.channel;
              const isActive = activeId === p.id;
              return (
                <tr
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={classNames(
                    "cursor-pointer border-t border-brand-line/60 transition",
                    isActive ? "bg-brand-cream" : "hover:bg-brand-mint/40"
                  )}
                >
                  <td className="px-3 py-2 font-bold text-brand-deep">{p.name}</td>
                  <td className="px-3 py-2">
                    {channel && <ChannelBadge channel={channel} />}
                  </td>
                  <td className="px-3 py-2 text-brand-muted">{p.target ?? "—"}</td>
                  <td className="px-3 py-2 text-brand-deep">{usageCount[p.id]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );

  return <DictionaryShell list={list} detail={probe ? <ProbeCard probe={probe} /> : null} />;
}
