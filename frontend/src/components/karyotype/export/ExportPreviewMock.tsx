import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { useStore } from "@/lib/store";
import type {
  ChromosomeObject,
  ExportSettings,
  ExportTemplate,
  Ideogram,
  SampleKaryotype,
} from "@/lib/types";
import ChromosomeGlyph from "../ChromosomeGlyph";
import { Eye } from "lucide-react";

interface Props {
  template?: ExportTemplate;
  karyotypes: SampleKaryotype[];
  settings: ExportSettings;
}

export default function ExportPreviewMock({
  template,
  karyotypes,
  settings,
}: Props) {
  const chromosomes = useStore((s) => s.chromosomes);
  const ideograms = useStore((s) => s.ideograms);
  const layouts = useStore((s) => s.genomeLayouts);
  const stained = useStore((s) => s.stained);

  if (!template || karyotypes.length === 0) {
    return (
      <EmptyState
        icon={<Eye size={28} />}
        title="Нет превью"
        description="Выберите кариотип и шаблон, чтобы увидеть mock сгенерированной картинки."
      />
    );
  }

  if (template.type === "summary_table") {
    return (
      <Card pad={false}>
        <div className="border-b border-brand-line bg-brand-deep px-4 py-2 text-brand-cream">
          <h3 className="text-[13px] font-bold">Превью таблицы</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-brand-mint/40 text-[10.5px] uppercase tracking-wider text-brand-muted">
            <tr>
              <th className="px-3 py-2 text-left">Образец</th>
              <th className="px-3 py-2 text-left">Хромосом</th>
              <th className="px-3 py-2 text-left">Идеограммы</th>
              <th className="px-3 py-2 text-left">Зонды</th>
              <th className="px-3 py-2 text-left">Аномалии</th>
            </tr>
          </thead>
          <tbody>
            {karyotypes.map((k) => {
              const chroms = chromosomes.filter((c) =>
                k.selectedChromosomeIds.includes(c.id)
              );
              const withIdg = chroms.filter((c) => c.ideogramId).length;
              const layout = layouts.find((l) => l.id === k.layoutId);
              const stainedDoc = stained.find((s) => s.id === layout?.stainedId);
              return (
                <tr key={k.id} className="border-t border-brand-line text-[12px]">
                  <td className="px-3 py-2 font-bold text-brand-deep">
                    S-{k.sampleId}
                  </td>
                  <td className="px-3 py-2">{chroms.length}</td>
                  <td className="px-3 py-2">
                    {withIdg} / {chroms.length}
                  </td>
                  <td className="px-3 py-2">
                    {stainedDoc?.probes.map((p) => p.name).join(" + ") ?? "—"}
                  </td>
                  <td className="px-3 py-2">{layout?.anomalies.length ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    );
  }

  // Изображение: матрица хромосом по субгеномам/классам для каждого выбранного кариотипа
  return (
    <Card pad={false}>
      <div className="flex items-center justify-between border-b border-brand-line bg-brand-deep px-4 py-2 text-brand-cream">
        <h3 className="text-[13px] font-bold">Превью обзора</h3>
        <span className="text-[11px] opacity-80">
          {settings.alignByCentromere ? "выровнено по центромере" : "без выравнивания"}
          {" · "}
          {viewLabel(settings.view)}
        </span>
      </div>
      <div className="space-y-6 bg-slate-950 p-5 text-slate-100">
        {karyotypes.map((k) => {
          const layout = layouts.find((l) => l.id === k.layoutId);
          if (!layout) return null;
          const chromsByCell = (sub: string, cls: number) =>
            layout.assignments
              .filter((a) => a.subgenome === sub && a.chromosomeClass === cls)
              .map((a) => chromosomes.find((c) => c.id === a.chromosomeId))
              .filter(Boolean) as ChromosomeObject[];

          const stainedDoc = stained.find((s) => s.id === layout.stainedId);

          return (
            <div key={k.id}>
              <div className="mb-2 flex items-baseline justify-between">
                <div>
                  <div className="text-[14px] font-bold text-brand-cream">
                    S-{k.sampleId}
                  </div>
                  <div className="text-[10.5px] uppercase tracking-wider text-slate-400">
                    {k.title}
                  </div>
                </div>
                {settings.showProbeLabels && stainedDoc && (
                  <div className="flex flex-wrap gap-1">
                    {stainedDoc.probes.map((p) => (
                      <span
                        key={p.name}
                        className={
                          p.channel === "red"
                            ? "rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-300"
                            : p.channel === "green"
                              ? "rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300"
                              : "rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300"
                        }
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="grid items-end gap-3"
                style={{
                  gridTemplateColumns: `60px repeat(${layout.classCount}, minmax(56px, 1fr))`,
                }}
              >
                <div />
                {Array.from({ length: layout.classCount }, (_, i) => i + 1).map(
                  (cls) => (
                    <div
                      key={cls}
                      className="text-center text-[11px] font-bold text-slate-400"
                    >
                      {cls}
                    </div>
                  )
                )}
                {layout.subgenomes.flatMap((sub) => [
                  <div
                    key={`label-${sub}`}
                    className="flex items-center justify-end pr-2 text-[14px] font-extrabold text-slate-200"
                  >
                    {sub}
                  </div>,
                  ...Array.from({ length: layout.classCount }, (_, i) => i + 1).map(
                    (cls) => {
                      const chroms = chromsByCell(sub, cls);
                      return (
                        <PreviewCell
                          key={`${sub}-${cls}`}
                          chroms={chroms}
                          ideograms={ideograms}
                          settings={settings}
                        />
                      );
                    }
                  ),
                ])}
              </div>

              {settings.showAnomalyLabels && layout.anomalies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-amber-300">
                  Аномалии:
                  {layout.anomalies.map((a) => (
                    <span
                      key={a.id}
                      className="rounded bg-amber-500/20 px-2 py-0.5 font-bold"
                    >
                      {a.subgenome}
                      {a.chromosomeClass} · {a.type}
                      {a.comment && ` (${a.comment})`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PreviewCell({
  chroms,
  ideograms,
  settings,
}: {
  chroms: ChromosomeObject[];
  ideograms: Ideogram[];
  settings: ExportSettings;
}) {
  if (chroms.length === 0) {
    return (
      <div className="flex h-[120px] items-end justify-center rounded border border-dashed border-slate-800 bg-black/20 text-[10px] text-slate-700">
        —
      </div>
    );
  }
  return (
    <div className="flex h-[140px] items-end justify-center gap-1 rounded bg-black/20 p-1">
      {chroms.map((c) => {
        const idg = ideograms.find((i) => i.chromosomeId === c.id && !i.id.startsWith("IDG-DRAFT-"));
        const showChrom =
          settings.view === "chromosomes" ||
          settings.view === "chromosomes_with_ideograms";
        const showIdeo =
          settings.view === "ideograms_only" ||
          settings.view === "chromosomes_with_ideograms";
        return (
          <div
            key={c.id}
            className="flex flex-col items-center justify-end gap-0.5"
            style={{
              alignSelf: settings.alignByCentromere && idg?.centromere
                ? "flex-end"
                : "flex-end",
            }}
          >
            {showChrom && (
              <ChromosomeGlyph chromosome={c} ideogram={idg} height={90} dark />
            )}
            {showIdeo && (
              <ChromosomeGlyph
                chromosome={c}
                ideogram={idg}
                height={70}
                ideogramOnly
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function viewLabel(v: ExportSettings["view"]) {
  switch (v) {
    case "chromosomes":
      return "только хромосомы";
    case "chromosomes_with_ideograms":
      return "хромосомы + идеограммы";
    case "ideograms_only":
      return "только идеограммы";
  }
}
