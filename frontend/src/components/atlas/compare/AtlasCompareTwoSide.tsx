import { useMemo } from "react";
import { Library } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import ChromosomeGlyph from "@/components/karyotype/ChromosomeGlyph";
import AtlasReferencePicker from "@/components/atlas/pickers/AtlasReferencePicker";
import AtlasSamplePicker from "@/components/atlas/pickers/AtlasSamplePicker";
import AlignToggle from "@/components/atlas/shared/AlignToggle";
import ViewModeSwitch from "@/components/atlas/shared/ViewModeSwitch";
import ReferenceBadge from "@/components/atlas/shared/ReferenceBadge";
import { useStore } from "@/lib/store";
import type { ChromosomeObject } from "@/lib/types";

export default function AtlasCompareTwoSide() {
  const ctx = useStore((s) => s.atlasCtx);
  const sampleKaryotypes = useStore((s) => s.sampleKaryotypes);
  const chromosomes = useStore((s) => s.chromosomes);
  const samples = useStore((s) => s.samples);

  const sampleId = ctx.selectedSampleIds[0];
  const referenceId = ctx.selectedReferenceIds[0];
  const referenceKar = sampleKaryotypes.find((k) => k.id === referenceId);
  const referenceSampleId = referenceKar?.sampleId;

  const sampleChroms = useMemo(
    () => (sampleId ? chromosomes.filter((c) => c.sampleId === sampleId) : []),
    [chromosomes, sampleId]
  );
  const referenceChroms = useMemo(
    () =>
      referenceSampleId
        ? chromosomes.filter((c) => c.sampleId === referenceSampleId)
        : [],
    [chromosomes, referenceSampleId]
  );

  const sample = samples.find((s) => s.id === sampleId);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_260px]">
        <div className="space-y-3">
          <AtlasSamplePicker title="Кариотип A · образец" />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
          <div className="grid grid-cols-2 divide-x divide-slate-700">
            <SidePane
              title={sample ? `S-${sample.id}` : "Кариотип A"}
              hint={sample?.species}
              chromosomes={sampleChroms}
            />
            <SidePane
              title={referenceKar?.referenceLabel ?? "Кариотип B"}
              hint={referenceKar ? `S-${referenceKar.sampleId}` : undefined}
              chromosomes={referenceChroms}
              isReference
            />
          </div>
        </div>

        <div className="space-y-3">
          <AtlasReferencePicker title="Кариотип B · эталон" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-line bg-white px-4 py-3 shadow-card">
        <AlignToggle />
        <ViewModeSwitch />
      </div>
    </div>
  );
}

function SidePane({
  title,
  hint,
  chromosomes,
  isReference,
}: {
  title: string;
  hint?: string;
  chromosomes: ChromosomeObject[];
  isReference?: boolean;
}) {
  const ctx = useStore((s) => s.atlasCtx);
  return (
    <div className="px-3">
      <div className="mb-2 flex items-center justify-between text-slate-100">
        <span className="text-[13px] font-bold truncate">{title}</span>
        {isReference ? <ReferenceBadge /> : null}
      </div>
      {hint && <div className="mb-2 text-[11px] text-slate-400">{hint}</div>}
      {chromosomes.length === 0 ? (
        <EmptyState
          icon={<Library size={20} />}
          title="Не выбрано"
          description="Выберите кариотип в пикере."
          className="bg-slate-900/60 border-slate-700 text-slate-300"
        />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {chromosomes.slice(0, 21).map((c) => (
            <div
              key={c.id}
              className="flex flex-col items-center gap-0.5 rounded border border-slate-800 bg-slate-900/50 p-1"
            >
              <ChromosomeGlyph
                chromosome={c}
                height={ctx.viewMode === "ideograms_only" ? 40 : 50}
                ideogramOnly={ctx.viewMode === "ideograms_only"}
                dark
              />
              {c.displayName && (
                <span className="font-mono text-[9px] text-slate-400">
                  {c.displayName}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
