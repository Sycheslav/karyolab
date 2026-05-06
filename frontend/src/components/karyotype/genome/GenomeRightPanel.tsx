import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type {
  AnomalyType,
  ChromosomeObject,
  GenomeLayout,
  SampleKaryotype,
} from "@/lib/types";
import {
  ArrowRight,
  CheckCircle2,
  GitCompare,
  Save,
  Sparkles,
  AlertTriangle,
  Trash2,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";

interface Props {
  layout: GenomeLayout;
  existingKaryotype?: SampleKaryotype;
  selectedCell: { sub: string; cls: number } | null;
  cellChromosomes: ChromosomeObject[];
  onUnassign: (chromosomeId: string) => void;
  onAutoSort: () => void;
  onSave: () => void;
  onMakeKaryotype: () => void;
  onApprove: () => void;
  onGoExport: () => void;
  onCompareToReference?: (karyotypeId: string) => void;
  onToggleReference?: (karyotypeId: string) => void;
}

export default function GenomeRightPanel({
  layout,
  existingKaryotype,
  selectedCell,
  cellChromosomes,
  onUnassign,
  onAutoSort,
  onSave,
  onMakeKaryotype,
  onApprove,
  onGoExport,
  onCompareToReference,
  onToggleReference,
}: Props) {
  const addAnomaly = useStore((s) => s.addGenomeAnomaly);
  const removeAnomaly = useStore((s) => s.removeGenomeAnomaly);
  const anomalyTypes = useStore((s) => s.anomalyTypes);
  const samples = useStore((s) => s.samples);
  const speciesList = useStore((s) => s.species);
  const sample = samples.find((s) => s.id === layout.sampleId);
  const speciesDef = speciesList.find(
    (sp) => sp.latinName === sample?.species || sp.name === sample?.species
  );
  const expectedTotal = speciesDef?.expectedChromosomeCount;
  const genomeAnomalyOptions = anomalyTypes.filter(
    (t) => t.defaultLevel === "metaphase" || t.defaultLevel === "sample"
  );
  const [anomalyType, setAnomalyType] = useState<AnomalyType>(
    (genomeAnomalyOptions[0]?.code ?? "trisomy") as AnomalyType
  );
  const [anomalyComment, setAnomalyComment] = useState("");

  // готовность к экспорту
  const totalCells = layout.subgenomes.length * layout.classCount;
  const filledCells = new Set(
    layout.assignments.map((a) => `${a.subgenome}-${a.chromosomeClass}`)
  ).size;
  const incomplete = totalCells - filledCells;

  return (
    <div className="flex flex-col gap-3">
      {/* выбранная ячейка */}
      <Card pad={false} className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-line px-4 py-2 bg-brand-deep text-brand-cream">
          <h3 className="text-[14px] font-bold">
            Ячейка {selectedCell ? `${selectedCell.sub}${selectedCell.cls}` : "—"}
          </h3>
          <span className="text-[11px] opacity-80">
            {selectedCell ? `${cellChromosomes.length} объектов` : "выберите ячейку"}
          </span>
        </div>
        {selectedCell ? (
          <div className="p-3">
            {cellChromosomes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-brand-line bg-brand-mint/40 p-3 text-center text-[12px] text-brand-muted">
                Назначьте сюда хромосому из банка слева.
              </div>
            ) : (
              <ul className="space-y-2 text-[12px]">
                {cellChromosomes.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-brand-line bg-white p-2"
                  >
                    <div>
                      <div className="font-mono text-[12px] font-bold text-brand-deep">
                        {c.displayName ?? c.temporaryName}
                      </div>
                      <div className="text-[10.5px] text-brand-muted">
                        Метафаза {c.metaphaseId.split("-").slice(0, 3).join("-")}
                      </div>
                    </div>
                    <button
                      onClick={() => onUnassign(c.id)}
                      className="grid h-7 w-7 place-items-center rounded-md text-brand-muted hover:bg-brand-cream hover:text-brand-danger"
                      title="Снять назначение"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="p-3 text-[12px] text-brand-muted">
            Кликните по ячейке матрицы, чтобы увидеть, какие хромосомы в неё назначены.
          </div>
        )}
      </Card>

      {/* аномалии */}
      <Card pad={false} className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-brand-line bg-amber-50 px-4 py-2 text-amber-900">
          <AlertTriangle size={14} />
          <h3 className="text-[13px] font-bold">Аномалии · {layout.anomalies.length}</h3>
        </div>
        <div className="space-y-2 p-3">
          <div className="flex items-center gap-2 text-[12px]">
            <select
              className="field !py-1.5 text-[12px]"
              value={anomalyType}
              onChange={(e) => setAnomalyType(e.target.value as AnomalyType)}
            >
              {genomeAnomalyOptions.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>
            <a
              href="/атлас/аномалии"
              className="text-[11px] font-semibold text-amber-800 underline-offset-2 hover:underline"
              title="Открыть справочник аномалий"
            >
              справочник
            </a>
            <button
              onClick={() => {
                addAnomaly(layout.id, {
                  type: anomalyType,
                  subgenome: selectedCell?.sub,
                  chromosomeClass: selectedCell?.cls,
                  comment: anomalyComment,
                });
                setAnomalyComment("");
              }}
              className="grid h-9 w-9 place-items-center rounded-md bg-amber-200 text-amber-900 hover:bg-amber-300"
              title="Добавить"
            >
              <Plus size={14} />
            </button>
          </div>
          <input
            value={anomalyComment}
            onChange={(e) => setAnomalyComment(e.target.value)}
            placeholder="Комментарий (необязательно)"
            className="field !py-1.5 text-[12px]"
          />
          <ul className="space-y-1 text-[12px]">
            {layout.anomalies.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50/50 px-2 py-1.5"
              >
                <span className="font-bold text-amber-900">
                  {anomalyTypes.find((o) => o.code === a.type)?.label ?? a.type}
                </span>
                {a.subgenome && a.chromosomeClass && (
                  <span className="rounded bg-amber-200 px-1 text-[10px] font-bold text-amber-900">
                    {a.subgenome}{a.chromosomeClass}
                  </span>
                )}
                {a.comment && (
                  <span className="text-amber-800/80">· {a.comment}</span>
                )}
                <button
                  onClick={() => removeAnomaly(layout.id, a.id)}
                  className="ml-auto grid h-6 w-6 place-items-center rounded-md text-amber-700 hover:bg-amber-100"
                >
                  <Trash2 size={11} />
                </button>
              </li>
            ))}
            {layout.anomalies.length === 0 && (
              <li className="text-[11.5px] text-amber-800/70">
                Аномалий нет. Добавляйте их, если в матрице видна замена/трисомия.
              </li>
            )}
          </ul>
        </div>
      </Card>

      {/* готовность */}
      <Card>
        <h3 className="text-[13px] font-bold text-brand-deep">
          Готовность к кариотипу
        </h3>
        <div className="mt-2 space-y-1.5 text-[12px]">
          <ReadyRow label="Заполнено ячеек" value={`${filledCells} / ${totalCells}`} ok={incomplete === 0} />
          <ReadyRow
            label="Назначено хромосом"
            value={
              expectedTotal
                ? `${layout.assignments.length} / ${expectedTotal}`
                : String(layout.assignments.length)
            }
            ok={
              expectedTotal
                ? layout.assignments.length === expectedTotal
                : layout.assignments.length > 0
            }
            neutral={
              expectedTotal
                ? layout.assignments.length > 0 &&
                  layout.assignments.length < expectedTotal
                : undefined
            }
          />
          <ReadyRow label="Аномалий" value={String(layout.anomalies.length)} ok neutral />
          <ReadyRow
            label="Статус"
            value={layoutStatusLabel(layout.status)}
            ok={layout.status === "approved"}
            neutral={layout.status === "draft"}
          />
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <Button variant="outline" onClick={onAutoSort}>
            <Sparkles size={14} />
            Разложить по классам (preview)
          </Button>
          <Button variant="dark" onClick={onSave}>
            <Save size={14} />
            Сохранить разметку
          </Button>
          {existingKaryotype ? (
            existingKaryotype.status === "approved" ||
            existingKaryotype.status === "exported" ? (
              <>
                <div className="rounded-lg bg-brand-accent/15 px-3 py-2 text-[11.5px] font-semibold text-brand-dark">
                  Кариотип утверждён ·{" "}
                  <Badge tone="green">{existingKaryotype.id}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-brand-line bg-white px-3 py-2 text-[12px]">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!existingKaryotype.isReference}
                      onChange={() => onToggleReference?.(existingKaryotype.id)}
                      className="h-4 w-4 accent-brand"
                    />
                    <span className="font-semibold text-brand-deep">
                      Эталонный кариотип
                    </span>
                  </label>
                  {existingKaryotype.isReference && (
                    <span className="text-[11px] text-brand-muted">
                      {existingKaryotype.referenceLabel ?? "—"}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => onCompareToReference?.(existingKaryotype.id)}
                >
                  <GitCompare size={14} />
                  Сравнить с эталоном
                </Button>
                <Button onClick={onGoExport}>
                  <ArrowRight size={14} />
                  Перейти к экспорту
                </Button>
              </>
            ) : (
              <Button onClick={onApprove}>
                <CheckCircle2 size={14} />
                Утвердить кариотип
              </Button>
            )
          ) : (
            <>
              <Button onClick={onMakeKaryotype}>
                <CheckCircle2 size={14} />
                Сформировать кариотип образца
              </Button>
              {layout.assignments.length > 0 && (
                <Button variant="primary" onClick={onApprove}>
                  Утвердить и обновить статус образца
                </Button>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

function ReadyRow({
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
    <div className="flex items-center justify-between rounded-lg bg-brand-mint/40 px-2 py-1.5">
      <span className="text-[11px] uppercase tracking-wider text-brand-muted">
        {label}
      </span>
      <span
        className={
          neutral
            ? "font-bold text-brand-deep"
            : ok
              ? "font-bold text-brand-dark"
              : "font-bold text-brand-warn"
        }
      >
        {value}
      </span>
    </div>
  );
}

function layoutStatusLabel(s: GenomeLayout["status"]) {
  switch (s) {
    case "draft":
      return "черновик";
    case "ready_for_review":
      return "на проверку";
    case "approved":
      return "утверждён";
  }
}
