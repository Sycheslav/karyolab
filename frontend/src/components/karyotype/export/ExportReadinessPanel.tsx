import Card from "@/components/ui/Card";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { ChromosomeObject } from "@/lib/types";
import { classNames } from "@/lib/utils";

interface Props {
  readiness: {
    chromosomes: ChromosomeObject[];
    noIdeogram: number;
    noCentromere: number;
    incompleteClasses: number;
  };
  blocking: string | null;
}

export default function ExportReadinessPanel({ readiness, blocking }: Props) {
  const total = readiness.chromosomes.length;
  return (
    <Card>
      <h3 className="text-[14px] font-bold text-brand-deep">
        Готовность к экспорту
      </h3>
      <p className="mt-1 text-[11.5px] text-brand-muted">
        Проверки на основе выбранных кариотипов: {total} хромосом.
      </p>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Row label="Без идеограмм" value={readiness.noIdeogram} ok={readiness.noIdeogram === 0} />
        <Row label="Без центромеры" value={readiness.noCentromere} ok={readiness.noCentromere === 0} />
        <Row label="Неполные классы" value={readiness.incompleteClasses} ok={readiness.incompleteClasses === 0} />
        <Row label="Объектов всего" value={total} ok={total > 0} neutral />
      </div>

      {blocking && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-900">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{blocking}</span>
        </div>
      )}
    </Card>
  );
}

function Row({
  label,
  value,
  ok,
  neutral,
}: {
  label: string;
  value: number;
  ok: boolean;
  neutral?: boolean;
}) {
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  return (
    <div
      className={classNames(
        "flex items-center justify-between rounded-lg border px-3 py-2",
        neutral
          ? "border-brand-line bg-white"
          : ok
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
      )}
    >
      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
        {label}
      </span>
      <span
        className={classNames(
          "inline-flex items-center gap-1 font-bold",
          neutral
            ? "text-brand-deep"
            : ok
              ? "text-emerald-700"
              : "text-amber-800"
        )}
      >
        <Icon size={13} />
        {value}
      </span>
    </div>
  );
}
