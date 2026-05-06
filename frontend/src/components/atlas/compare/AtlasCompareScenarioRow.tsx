import {
  AlertTriangle,
  Network,
  Rows3,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import { selectReferenceKaryotypes, useStore } from "@/lib/store";
import { classNames } from "@/lib/utils";

const SCENARIOS = [
  {
    id: "vs_reference",
    label: "Образец vs эталон",
    icon: Star,
    hint: "Двухсторонний разбор",
  },
  {
    id: "siblings",
    label: "Сиблинги одного скрещивания",
    icon: Network,
    hint: "По родителям из журнала",
  },
  {
    id: "by_class",
    label: "Все по одному классу",
    icon: Rows3,
    hint: "Один класс у разных образцов",
  },
  {
    id: "anomaly_confirm",
    label: "Подтверждение аномалии",
    icon: AlertTriangle,
    hint: "По типу аномалии",
  },
] as const;

export default function AtlasCompareScenarioRow() {
  const samples = useStore((s) => s.samples);
  const refs = useStore(selectReferenceKaryotypes);
  const setAtlasContext = useStore((s) => s.setAtlasContext);
  const setAtlasFilters = useStore((s) => s.setAtlasFilters);

  const apply = (id: (typeof SCENARIOS)[number]["id"]) => {
    if (id === "vs_reference") {
      const firstSample = samples.find((s) => s.hasResult)?.id ?? samples[0]?.id;
      const firstRef = refs[0]?.id;
      setAtlasContext({
        compareLayout: "two_side",
        selectedSampleIds: firstSample ? [firstSample] : [],
        selectedReferenceIds: firstRef ? [firstRef] : [],
      });
      toast.success("Сценарий: образец vs эталон");
    } else if (id === "siblings") {
      const sample = samples.find((s) => s.mother || s.father);
      const siblings = sample
        ? samples
            .filter(
              (s) =>
                s.id !== sample.id &&
                ((s.mother && s.mother === sample.mother) ||
                  (s.father && s.father === sample.father))
            )
            .map((s) => s.id)
        : [];
      setAtlasContext({
        compareLayout: "multi",
        selectedSampleIds: sample ? [sample.id, ...siblings] : [],
      });
      toast.success("Сценарий: сиблинги");
    } else if (id === "by_class") {
      setAtlasContext({ compareLayout: "by_subgenome" });
      setAtlasFilters({ classIds: ["CC-5D"], subgenomes: ["D"] });
      toast.success("Сценарий: класс 5D");
    } else if (id === "anomaly_confirm") {
      setAtlasContext({ compareLayout: "multi" });
      setAtlasFilters({ anomalyCodes: ["trisomy"] });
      toast.success("Сценарий: трисомия");
    }
  };

  return (
    <Card>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {SCENARIOS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => apply(s.id)}
              className={classNames(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                "border-brand-line bg-white hover:bg-brand-mint/40"
              )}
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-mint text-brand-dark">
                <Icon size={16} />
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-brand-deep">
                  {s.label}
                </div>
                <div className="text-[11.5px] text-brand-muted">{s.hint}</div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
