import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useStore } from "@/lib/store";
import type {
  ExportFormat,
  ExportSettings,
  ExportTemplateType,
} from "@/lib/types";
import ExportSamplePicker from "./ExportSamplePicker";
import KaryotypeResultPicker from "./KaryotypeResultPicker";
import ExportTemplatePicker from "./ExportTemplatePicker";
import ExportSettingsPanel from "./ExportSettingsPanel";
import ExportReadinessPanel from "./ExportReadinessPanel";
import ExportPreviewMock from "./ExportPreviewMock";
import ExportResultPanel from "./ExportResultPanel";

export default function KaryotypeExportPage() {
  const [params, setParams] = useSearchParams();
  const samples = useStore((s) => s.samples);
  const sampleKaryotypes = useStore((s) => s.sampleKaryotypes);
  const exportTemplates = useStore((s) => s.exportTemplates);
  const exportJobs = useStore((s) => s.exportJobs);
  const createExportJob = useStore((s) => s.createExportJob);

  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>(() => {
    const s = params.get("sampleId");
    return s ? [s] : [];
  });
  const [selectedKaryotypeIds, setSelectedKaryotypeIds] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState<string>("tpl-standard");
  const [settings, setSettings] = useState<ExportSettings>({
    view: "chromosomes_with_ideograms",
    alignByCentromere: true,
    showProbeLabels: true,
    showAnomalyLabels: true,
    format: "png",
    quality: "publication",
  });
  const [lastJobId, setLastJobId] = useState<string | null>(null);

  // авто-выбор кариотипа при выборе образца
  useEffect(() => {
    const valid = sampleKaryotypes.filter((k) =>
      selectedSampleIds.includes(k.sampleId)
    );
    setSelectedKaryotypeIds((prev) => {
      const stillValid = prev.filter((id) => valid.some((v) => v.id === id));
      if (stillValid.length === 0 && valid.length > 0) {
        // авто-выбираем main
        const main = valid.find((v) => v.main) ?? valid[0];
        return [main.id];
      }
      return stillValid;
    });
  }, [selectedSampleIds, sampleKaryotypes]);

  const template = exportTemplates.find((t) => t.id === templateId);

  const selectedKaryotypes = sampleKaryotypes.filter((k) =>
    selectedKaryotypeIds.includes(k.id)
  );

  // оценка готовности
  const allChromosomes = useStore((s) => s.chromosomes);
  const allIdeograms = useStore((s) => s.ideograms);
  const readiness = useMemo(() => {
    const chromIds = selectedKaryotypes.flatMap((k) => k.selectedChromosomeIds);
    const chroms = allChromosomes.filter((c) => chromIds.includes(c.id));
    const noIdeogram = chroms.filter((c) => !c.ideogramId).length;
    const noCentromere = chroms.filter((c) => {
      const id = allIdeograms.find((i) => i.chromosomeId === c.id);
      return !id || id.centromere === undefined;
    }).length;
    const incompleteClasses = chroms.filter(
      (c) => !c.subgenome || !c.chromosomeClass
    ).length;
    return {
      chromosomes: chroms,
      noIdeogram,
      noCentromere,
      incompleteClasses,
    };
  }, [selectedKaryotypes, allChromosomes, allIdeograms]);

  const canGenerate = selectedKaryotypes.length > 0 && template;
  const blocking =
    settings.alignByCentromere && readiness.noCentromere > 0
      ? "Снимите «выравнивать по центромере» — не у всех хромосом она задана."
      : null;

  const onSampleToggle = (id: string) => {
    setSelectedSampleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setParams(
      (p) => {
        const np = new URLSearchParams(p);
        np.delete("sampleId");
        return np;
      },
      { replace: true }
    );
  };

  const onGenerate = () => {
    if (!template) return;
    if (blocking) {
      toast.error(blocking);
      return;
    }
    const id = createExportJob({
      templateType: template.type,
      templateId: template.id,
      sampleIds: selectedSampleIds,
      karyotypeIds: selectedKaryotypeIds,
      settings,
    });
    setLastJobId(id);
    toast.success("Обзор собран");
  };

  const lastJob = exportJobs.find((j) => j.id === lastJobId);

  // подзаголовок зависит от типа шаблона
  const generateLabel =
    template?.type === "summary_table"
      ? "Экспортировать таблицу"
      : template?.type === "multi_select"
        ? "Собрать сравнение"
        : "Собрать обзор";

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Кариотип" },
          { label: "Экспорт" },
        ]}
      />

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-page">Экспорт кариотипа</h1>
          <p className="mt-1 text-[13px] text-brand-muted">
            Соберите обзорный кариотип, сравнение или сводную таблицу. Для
            публикации выбирайте PDF и выравнивание по центромере.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <ExportSamplePicker
            samples={samples}
            karyotypes={sampleKaryotypes}
            selectedIds={selectedSampleIds}
            onToggle={onSampleToggle}
          />
          <KaryotypeResultPicker
            sampleIds={selectedSampleIds}
            karyotypes={sampleKaryotypes}
            selectedIds={selectedKaryotypeIds}
            onToggle={(id) =>
              setSelectedKaryotypeIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
          />
        </div>

        <div className="space-y-4">
          <ExportTemplatePicker
            templates={exportTemplates}
            selectedId={templateId}
            onSelect={setTemplateId}
          />
          <ExportSettingsPanel
            settings={settings}
            onChange={setSettings}
            disableCentromere={readiness.noCentromere > 0}
            isTable={template?.type === "summary_table"}
          />
          <ExportReadinessPanel readiness={readiness} blocking={blocking} />
          <ExportPreviewMock
            template={template}
            karyotypes={selectedKaryotypes}
            settings={settings}
          />

          {/* большая кнопка генерации */}
          <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-line bg-white px-4 py-3 shadow-soft">
            <div className="text-[12.5px] text-brand-muted">
              {selectedKaryotypes.length === 0
                ? "Выберите хотя бы один кариотип"
                : `Готовы собрать: ${selectedKaryotypes.length} кариотип(ов) · шаблон ${template?.title}`}
            </div>
            <button
              onClick={onGenerate}
              disabled={!canGenerate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-[14px] font-bold text-white shadow-soft transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generateLabel}
              <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] uppercase tracking-wider">
                {(settings.format as ExportFormat).toUpperCase()}
              </span>
            </button>
          </div>

          {lastJob && (
            <ExportResultPanel
              job={lastJob}
              templateType={template?.type as ExportTemplateType}
            />
          )}
        </div>
      </div>
    </div>
  );
}
