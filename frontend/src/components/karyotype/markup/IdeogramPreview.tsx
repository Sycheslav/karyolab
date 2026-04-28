import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { ChromosomeObject, Ideogram } from "@/lib/types";
import ChromosomeGlyph from "../ChromosomeGlyph";
import { ArrowRight, Save, Undo2 } from "lucide-react";
import { classNames } from "@/lib/utils";

interface Props {
  chromosome: ChromosomeObject;
  ideogram?: Ideogram;
  dirty: boolean;
  onSave: () => void;
  onReset: () => void;
  onNext: () => void;
}

export default function IdeogramPreview({
  chromosome,
  ideogram,
  dirty,
  onSave,
  onReset,
  onNext,
}: Props) {
  const reds = ideogram?.signals.filter((s) => s.channel === "red").length ?? 0;
  const greens =
    ideogram?.signals.filter((s) => s.channel === "green").length ?? 0;
  const anomalies = ideogram?.anomalies.length ?? 0;
  const hasCentromere = ideogram?.centromere !== undefined;

  return (
    <Card pad={false} className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-brand-line bg-brand-deep px-4 py-2 text-brand-cream">
        <h3 className="text-[14px] font-bold">Идеограмма</h3>
        {dirty && (
          <Badge tone="amber" className="!text-[10px]">
            не сохранено
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="flex h-[260px] items-center justify-center rounded-xl bg-slate-950">
          <ChromosomeGlyph
            chromosome={chromosome}
            ideogram={ideogram}
            height={220}
            width={32}
            dark
          />
        </div>
        <div className="flex h-[260px] items-center justify-center rounded-xl bg-slate-50">
          <ChromosomeGlyph
            chromosome={chromosome}
            ideogram={ideogram}
            height={220}
            width={32}
            ideogramOnly
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-brand-line px-4 py-3 text-[12px]">
        <SummaryRow
          label="Центромера"
          value={hasCentromere ? "есть" : "нет"}
          ok={hasCentromere}
        />
        <SummaryRow label="Красных" value={String(reds)} ok={reds > 0} />
        <SummaryRow label="Зелёных" value={String(greens)} ok={greens > 0} />
        <SummaryRow
          label="Аномалий"
          value={String(anomalies)}
          ok={anomalies === 0}
          neutral
        />
      </div>

      <div className="space-y-2 border-t border-brand-line p-3">
        <Button
          variant="primary"
          className="w-full"
          onClick={onSave}
          disabled={!dirty}
        >
          <Save size={14} />
          {ideogram?.savedAt && !dirty ? "Идеограмма сохранена" : "Сохранить идеограмму"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onReset} disabled={!dirty}>
            <Undo2 size={13} />
            Отменить правки
          </Button>
          <Button variant="dark" size="sm" onClick={onNext}>
            Следующая <ArrowRight size={13} />
          </Button>
        </div>
        {ideogram && !dirty && (
          <div className="text-center text-[11px] text-brand-muted">
            Сохранено: {fmtTs(ideogram.savedAt)}
          </div>
        )}
      </div>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  ok,
  neutral,
}: {
  label: string;
  value: string;
  ok: boolean;
  neutral?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-brand-mint/40 px-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-brand-muted">
        {label}
      </span>
      <span
        className={classNames(
          "font-bold",
          neutral
            ? "text-brand-deep"
            : ok
              ? "text-brand-dark"
              : "text-brand-danger"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function fmtTs(ts: string) {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    return `${String(d.getDate()).padStart(2, "0")}.${String(
      d.getMonth() + 1
    ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  } catch {
    return ts;
  }
}
