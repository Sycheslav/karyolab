import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { AlertTriangle, CheckCircle2, FolderOpen, Save } from "lucide-react";
import type { ChromosomeLayer, KaryotypeImport } from "@/lib/types";

interface Props {
  importDoc: KaryotypeImport;
  layers: ChromosomeLayer[];
  onAcknowledge: (warningId: string) => void;
  onCommit: () => void;
  onGoMarkup: () => void;
}

export default function ImportCommitPanel({
  importDoc,
  layers,
  onAcknowledge,
  onCommit,
  onGoMarkup,
}: Props) {
  const includedChromosomes = layers.filter(
    (l) => l.kind === "chromosome" && l.included
  );
  const blocking = importDoc.warnings.filter(
    (w) => w.blocking && !w.acknowledged
  );
  const canCommit =
    importDoc.status !== "committed" &&
    includedChromosomes.length > 0 &&
    blocking.length === 0;

  if (importDoc.status === "committed") {
    return (
      <Card accent>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <div className="text-[14px] font-bold text-brand-deep">
              Сохранено {importDoc.savedChromosomeCount} хромосом
            </div>
            <div className="text-[12px] text-brand-muted">
              Метафаза {importDoc.metaphaseId} · файл{" "}
              <span className="font-mono">{importDoc.psdFileName}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={onGoMarkup}>
            Перейти к разметке хромосом
          </Button>
          <Button
            variant="outline"
            onClick={() => onAcknowledge("__noop__")}
            disabled
          >
            <FolderOpen size={14} />
            Открыть в папке (mock)
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Save size={16} className="text-brand-dark" />
        <h3 className="text-[14px] font-bold text-brand-deep">
          Подтверждение импорта
        </h3>
      </div>

      {importDoc.warnings.length > 0 && (
        <div className="mt-3 space-y-2">
          {importDoc.warnings.map((w) => (
            <div
              key={w.id}
              className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12.5px] text-amber-900"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-bold">{w.title}</div>
                {w.description && (
                  <div className="mt-0.5 text-[11.5px]">{w.description}</div>
                )}
              </div>
              {!w.acknowledged && (
                <Button size="sm" variant="outline" onClick={() => onAcknowledge(w.id)}>
                  Подтвердить
                </Button>
              )}
              {w.acknowledged && (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700">
                  <CheckCircle2 size={13} /> Подтверждено
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-line bg-brand-mint/40 px-3 py-3">
        <div>
          <div className="text-[12px] text-brand-muted">К сохранению</div>
          <div className="text-[18px] font-extrabold text-brand-deep">
            {includedChromosomes.length} хромосом
          </div>
        </div>
        <Button
          size="lg"
          variant="primary"
          disabled={!canCommit}
          onClick={onCommit}
        >
          <Save size={15} />
          Сохранить {includedChromosomes.length} хромосом
        </Button>
      </div>
      {!canCommit && includedChromosomes.length === 0 && (
        <div className="mt-2 text-[11.5px] text-brand-muted">
          Включите хотя бы один слой-хромосому.
        </div>
      )}
    </Card>
  );
}
