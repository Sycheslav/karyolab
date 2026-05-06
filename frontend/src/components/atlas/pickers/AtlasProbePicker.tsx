import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Tabs from "@/components/ui/Tabs";
import { useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";
import ChannelBadge from "../shared/ChannelBadge";

export default function AtlasProbePicker() {
  const probes = useStore((s) => s.atlasProbes);
  const fluorochromes = useStore((s) => s.fluorochromes);
  const ctx = useStore((s) => s.atlasCtx);
  const setAtlasContext = useStore((s) => s.setAtlasContext);
  const toggleAtlasPanelProbe = useStore((s) => s.toggleAtlasPanelProbe);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return probes.filter((p) =>
      q ? p.name.toLowerCase().includes(q) || (p.target ?? "").toLowerCase().includes(q) : true
    );
  }, [probes, search]);

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="border-b border-brand-line p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[14px] font-bold text-brand-deep">Зонд</h3>
          <Tabs
            value={ctx.probeSelectionMode}
            onChange={(id) => setAtlasContext({ probeSelectionMode: id as "single" | "panel" })}
            options={[
              { id: "single", label: "Один зонд" },
              { id: "panel", label: "Панель" },
            ]}
          />
        </div>
        <Input
          leading={<Search size={14} />}
          placeholder="Поиск по названию или мишени…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="max-h-[40vh] overflow-y-auto">
        {filtered.map((p) => {
          const channel = fluorochromes.find((f) => f.id === p.fluorochromeId)?.channel;
          const isSingle = ctx.probeSelectionMode === "single";
          const checked = isSingle
            ? ctx.selectedProbeId === p.id
            : ctx.selectedPanelProbeIds.includes(p.id);
          return (
            <label
              key={p.id}
              className={classNames(
                "flex cursor-pointer items-center gap-3 border-t border-brand-line/60 px-3 py-2.5 text-[12.5px] transition",
                checked ? "bg-brand-cream" : "hover:bg-brand-mint/40"
              )}
            >
              {isSingle ? (
                <input
                  type="radio"
                  name="atlas-probe"
                  checked={checked}
                  onChange={() =>
                    setAtlasContext({
                      selectedProbeId: ctx.selectedProbeId === p.id ? undefined : p.id,
                    })
                  }
                  className="h-4 w-4 accent-brand"
                />
              ) : (
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAtlasPanelProbe(p.id)}
                  className="h-4 w-4 accent-brand"
                />
              )}
              <div className="flex-1">
                <div className="font-bold text-brand-deep">{p.name}</div>
                {p.target && (
                  <div className="text-[11px] text-brand-muted">{p.target}</div>
                )}
              </div>
              {channel && <ChannelBadge channel={channel} />}
            </label>
          );
        })}
      </div>
      <div className="border-t border-brand-line p-3 text-[11px] text-brand-muted">
        Подсказка: канал берётся у флюорохрома, не у зонда.
      </div>
    </Card>
  );
}
