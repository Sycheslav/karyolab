import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import SectionTitle from "@/components/ui/SectionTitle";
import { useStore } from "@/lib/store";
import type {
  AnomalyType,
  AtlasSourceFilter,
  SampleKaryotypeStatus,
} from "@/lib/types";
import { classNames } from "@/lib/utils";
import AtlasSpeciesQuickFilter from "./AtlasSpeciesQuickFilter";

const SUBGENOME_LETTERS = ["A", "B", "D", "R", "U", "M", "S"];

const STATUS_OPTIONS: { id: SampleKaryotypeStatus; label: string }[] = [
  { id: "approved", label: "утверждён" },
  { id: "ready_for_review", label: "готов к проверке" },
  { id: "draft", label: "черновик" },
  { id: "archived", label: "архивный" },
];

export default function AtlasFilterBar() {
  const ctx = useStore((s) => s.atlasCtx);
  const setAtlasFilters = useStore((s) => s.setAtlasFilters);
  const classes = useStore((s) => s.chromosomeClasses);
  const anomalyTypes = useStore((s) => s.anomalyTypes);

  const toggleArr = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const colorDot = (color: string) => {
    const map: Record<string, string> = {
      amber: "bg-amber-400",
      red: "bg-red-500",
      blue: "bg-blue-500",
      emerald: "bg-emerald-500",
      violet: "bg-violet-500",
      slate: "bg-slate-400",
    };
    return map[color] ?? "bg-slate-400";
  };

  return (
    <Card className="space-y-4">
      <SectionTitle title="Фильтры атласа" />

      <div>
        <div className="label-cap mb-1.5">Вид</div>
        <AtlasSpeciesQuickFilter />
      </div>

      <div>
        <div className="label-cap mb-1.5">Субгеном</div>
        <div className="flex flex-wrap gap-1.5">
          {SUBGENOME_LETTERS.map((l) => {
            const active = ctx.filters.subgenomes.includes(l);
            return (
              <button
                key={l}
                type="button"
                onClick={() =>
                  setAtlasFilters({ subgenomes: toggleArr(ctx.filters.subgenomes, l) })
                }
                className={classNames(
                  "inline-flex h-8 w-8 items-center justify-center rounded-lg border text-[13px] font-extrabold transition",
                  active
                    ? "border-brand-deep bg-brand-deep text-brand-cream"
                    : "border-brand-line bg-white text-brand-deep hover:bg-brand-mint/40"
                )}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="label-cap mb-1.5">Класс</div>
        <div className="flex max-h-[140px] flex-wrap gap-1.5 overflow-y-auto">
          {classes.map((c) => {
            const active = ctx.filters.classIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  setAtlasFilters({ classIds: toggleArr(ctx.filters.classIds, c.id) })
                }
                className={classNames(
                  "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition",
                  active
                    ? "border-brand-deep bg-brand-deep text-brand-cream"
                    : "border-brand-line bg-white text-brand-deep hover:bg-brand-mint/40"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="label-cap mb-1.5">Тип аномалии</div>
        <div className="flex flex-wrap gap-1.5">
          {anomalyTypes.map((a) => {
            const active = ctx.filters.anomalyCodes.includes(a.code);
            return (
              <button
                key={a.code}
                type="button"
                onClick={() =>
                  setAtlasFilters({
                    anomalyCodes: toggleArr<AnomalyType>(ctx.filters.anomalyCodes, a.code),
                  })
                }
                className={classNames(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition",
                  active
                    ? "border-brand-deep bg-brand-deep text-brand-cream"
                    : "border-brand-line bg-white text-brand-deep hover:bg-brand-mint/40"
                )}
              >
                <span className={classNames("h-2 w-2 rounded-full", colorDot(a.markerColor))} />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="label-cap mb-1.5">Источник</div>
        <Tabs
          value={ctx.filters.source}
          onChange={(id) => setAtlasFilters({ source: id as AtlasSourceFilter })}
          options={[
            { id: "all", label: "Все" },
            { id: "lab", label: "Лабораторные" },
            { id: "theoretical", label: "Теоретические" },
          ]}
        />
      </div>

      <div>
        <div className="label-cap mb-1.5">Статус кариотипа</div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((s) => {
            const active = ctx.filters.karyotypeStatuses.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  setAtlasFilters({
                    karyotypeStatuses: toggleArr(ctx.filters.karyotypeStatuses, s.id),
                  })
                }
                className={classNames(
                  "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition",
                  active
                    ? "border-brand-deep bg-brand-deep text-brand-cream"
                    : "border-brand-line bg-white text-brand-deep hover:bg-brand-mint/40"
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-brand-line pt-3">
        <div className="label-cap mb-1.5">Пресеты</div>
        <div className="flex flex-wrap gap-1.5">
          <PresetButton
            onClick={() => setAtlasFilters({ anomalyCodes: ["trisomy"] })}
          >
            Все случаи трисомии
          </PresetButton>
          <PresetButton
            onClick={() => setAtlasFilters({ anomalyCodes: ["substitution"] })}
          >
            Все аномалии типа замещение
          </PresetButton>
          <PresetButton onClick={() => setAtlasFilters({ source: "theoretical" })}>
            Только теоретические записи
          </PresetButton>
        </div>
      </div>
    </Card>
  );
}

function PresetButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-brand-line bg-brand-mint/40 px-2.5 py-1 text-[11.5px] font-semibold text-brand-deep transition hover:bg-brand-mint"
    >
      {children}
    </button>
  );
}
