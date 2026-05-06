import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AtlasShell from "@/components/atlas/AtlasShell";
import AtlasSamplePicker from "@/components/atlas/pickers/AtlasSamplePicker";
import AtlasReferencePicker from "@/components/atlas/pickers/AtlasReferencePicker";
import AtlasProbePicker from "@/components/atlas/pickers/AtlasProbePicker";
import AtlasFilterBar from "@/components/atlas/pickers/AtlasFilterBar";
import AtlasMatrixView from "@/components/atlas/matrix/AtlasMatrixView";
import AtlasMatrixCellDetails from "@/components/atlas/matrix/AtlasMatrixCellDetails";
import { useStore } from "@/lib/store";
import type { AnomalyType } from "@/lib/types";

export default function AtlasMatrixPage() {
  const [params] = useSearchParams();
  const setAtlasContext = useStore((s) => s.setAtlasContext);
  const setAtlasFilters = useStore((s) => s.setAtlasFilters);
  const ctx = useStore((s) => s.atlasCtx);

  useEffect(() => {
    const sampleId = params.get("sampleId");
    const karyotypeId = params.get("karyotypeId");
    const probeId = params.get("probeId");
    const speciesId = params.get("speciesId");
    const classId = params.get("classId");
    const anomalyCode = params.get("anomalyCode");

    if (sampleId) setAtlasContext({ selectedSampleIds: [sampleId] });
    if (karyotypeId) setAtlasContext({ selectedReferenceIds: [karyotypeId] });
    if (probeId) setAtlasContext({ selectedProbeId: probeId });
    if (speciesId) setAtlasFilters({ speciesIds: [speciesId] });
    if (classId) setAtlasFilters({ classIds: [classId] });
    if (anomalyCode)
      setAtlasFilters({ anomalyCodes: [anomalyCode as AnomalyType] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AtlasShell
      title="Атлас · Матрица"
      subtitle="Матрица класс × субгеном × образец. Группируйте хромосомы из выбранных образцов и эталонов на тёмном холсте."
      breadcrumbsExtra={[{ label: "Матрица" }]}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr_340px]">
        <div className="space-y-4">
          <AtlasSamplePicker />
          <AtlasReferencePicker />
          <AtlasProbePicker />
        </div>
        <AtlasMatrixView />
        {ctx.selectedCell ? <AtlasMatrixCellDetails /> : <AtlasFilterBar />}
      </div>
    </AtlasShell>
  );
}
