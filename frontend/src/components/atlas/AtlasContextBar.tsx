import { Beaker, Filter, Leaf, Sprout, Star } from "lucide-react";
import toast from "react-hot-toast";
import Tabs from "@/components/ui/Tabs";
import { selectAtlasFiltersCount, useStore } from "@/lib/store";
import type { AtlasScale } from "@/lib/types";
import { classNames } from "@/lib/utils";
import ViewModeSwitch from "./shared/ViewModeSwitch";
import AlignToggle from "./shared/AlignToggle";
import ChannelBadge from "./shared/ChannelBadge";

export default function AtlasContextBar({ className }: { className?: string }) {
  const ctx = useStore((s) => s.atlasCtx);
  const filtersCount = useStore(selectAtlasFiltersCount);
  const fluorochromes = useStore((s) => s.fluorochromes);
  const atlasProbes = useStore((s) => s.atlasProbes);
  const species = useStore((s) => s.species);
  const reset = useStore((s) => s.resetAtlasFilters);
  const setAtlasContext = useStore((s) => s.setAtlasContext);

  const probe = ctx.selectedProbeId
    ? atlasProbes.find((p) => p.id === ctx.selectedProbeId)
    : undefined;
  const probeChannel = probe
    ? fluorochromes.find((f) => f.id === probe.fluorochromeId)?.channel
    : undefined;
  const panelProbes = atlasProbes.filter((p) =>
    ctx.selectedPanelProbeIds.includes(p.id)
  );

  const speciesNames = ctx.filters.speciesIds
    .map((id) => species.find((sp) => sp.id === id)?.name ?? id)
    .filter(Boolean);

  return (
    <div
      className={classNames(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-brand-line bg-white px-4 py-3 shadow-card",
        className
      )}
    >
      <Pill icon={<Sprout size={13} />} label="Образцы">
        {ctx.selectedSampleIds.length > 0
          ? `${ctx.selectedSampleIds.length} выбрано`
          : "не выбрано"}
      </Pill>
      <Pill icon={<Star size={13} />} label="Эталоны">
        <span
          className={
            ctx.selectedReferenceIds.length === 0 ? "text-brand-muted" : ""
          }
        >
          {ctx.selectedReferenceIds.length}
        </span>
      </Pill>
      <Pill icon={<Beaker size={13} />} label="Зонд">
        {ctx.probeSelectionMode === "panel" && panelProbes.length > 0 ? (
          <span>Панель: {panelProbes.map((p) => p.name).join(" + ")}</span>
        ) : probe ? (
          <span className="inline-flex items-center gap-1.5">
            {probe.name}
            {probeChannel && <ChannelBadge channel={probeChannel} />}
          </span>
        ) : (
          <span className="text-brand-muted">не выбран</span>
        )}
      </Pill>
      <Pill icon={<Leaf size={13} />} label="Вид">
        {speciesNames.length > 0 ? speciesNames.join(", ") : "все"}
      </Pill>

      <ViewModeSwitch />
      <AlignToggle />

      <div className="flex flex-col gap-0.5">
        <span className="label-cap">Скейл</span>
        <Tabs
          value={ctx.scale}
          onChange={(id) => setAtlasContext({ scale: id as AtlasScale })}
          options={[
            { id: "sample", label: "образец" },
            { id: "metaphase", label: "метафаза" },
            { id: "all", label: "все" },
            { id: "summary", label: "сводка" },
          ]}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {filtersCount > 0 && (
          <>
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-line bg-brand-mint/40 px-2.5 py-1 text-[11.5px] font-bold text-brand-deep">
              <Filter size={11} /> Фильтры: {filtersCount}
            </span>
            <button
              type="button"
              onClick={() => {
                reset();
                toast("Фильтры сброшены");
              }}
              className="rounded-full px-3 py-1 text-[12px] font-semibold text-brand-deep hover:bg-brand-cream/60"
            >
              Сбросить
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Pill({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-brand-line bg-brand-mint/40 px-2.5 py-1.5">
      {icon && <span className="text-brand-dark">{icon}</span>}
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-brand-muted">
        {label}
      </span>
      <span className="text-[12.5px] font-semibold text-brand-deep">
        {children}
      </span>
    </div>
  );
}
