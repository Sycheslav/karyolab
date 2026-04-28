import Card from "@/components/ui/Card";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  ListChecks,
} from "lucide-react";
import type { ImportHistoryStep } from "@/lib/types";
import { classNames } from "@/lib/utils";

interface Props {
  history: ImportHistoryStep[];
}

export default function ImportVerificationLog({ history }: Props) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <ListChecks size={16} className="text-brand-dark" />
        <h3 className="text-[14px] font-bold text-brand-deep">
          Шаги проверки
        </h3>
        <span className="ml-auto text-[12px] text-brand-muted">
          Понятная история действий, не технический лог.
        </span>
      </div>
      <ol className="mt-3 space-y-2">
        {history.map((step) => {
          const Icon =
            step.level === "warning"
              ? AlertTriangle
              : step.level === "error"
                ? XCircle
                : step.level === "success"
                  ? CheckCircle2
                  : Info;
          const tone =
            step.level === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : step.level === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : step.level === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-brand-line bg-white text-brand-deep";
          return (
            <li
              key={step.id}
              className={classNames(
                "flex items-start gap-3 rounded-xl border px-3 py-2 text-[12.5px]",
                tone
              )}
            >
              <Icon size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">{step.label}</div>
                {step.detail && (
                  <div className="mt-0.5 text-[11.5px] opacity-80">
                    {step.detail}
                  </div>
                )}
              </div>
              <div className="text-[10.5px] uppercase tracking-wider opacity-60">
                {fmtTs(step.ts)}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function fmtTs(ts: string) {
  try {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  } catch {
    return ts;
  }
}
