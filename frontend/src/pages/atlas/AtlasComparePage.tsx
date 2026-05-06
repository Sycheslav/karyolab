import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AtlasShell from "@/components/atlas/AtlasShell";
import AtlasCompareScenarioRow from "@/components/atlas/compare/AtlasCompareScenarioRow";
import AtlasCompareLayoutSwitch from "@/components/atlas/compare/AtlasCompareLayoutSwitch";
import AtlasCompareTwoSide from "@/components/atlas/compare/AtlasCompareTwoSide";
import AtlasCompareMulti from "@/components/atlas/compare/AtlasCompareMulti";
import AtlasCompareBySubgenome from "@/components/atlas/compare/AtlasCompareBySubgenome";
import AtlasCompareSameSample from "@/components/atlas/compare/AtlasCompareSameSample";
import { useStore } from "@/lib/store";
import type { AnomalyType } from "@/lib/types";

export default function AtlasComparePage() {
  const [params] = useSearchParams();
  const setAtlasContext = useStore((s) => s.setAtlasContext);
  const setAtlasFilters = useStore((s) => s.setAtlasFilters);
  const layout = useStore((s) => s.atlasCtx.compareLayout);

  useEffect(() => {
    const sampleId = params.get("sampleId");
    const karyotypeId = params.get("karyotypeId");
    const probeId = params.get("probeId");
    const speciesId = params.get("speciesId");
    const classId = params.get("classId");
    const anomalyCode = params.get("anomalyCode");
    const scenario = params.get("scenario");

    if (sampleId) setAtlasContext({ selectedSampleIds: [sampleId] });
    if (karyotypeId) setAtlasContext({ selectedReferenceIds: [karyotypeId] });
    if (probeId) setAtlasContext({ selectedProbeId: probeId });
    if (speciesId) setAtlasFilters({ speciesIds: [speciesId] });
    if (classId) setAtlasFilters({ classIds: [classId] });
    if (anomalyCode)
      setAtlasFilters({ anomalyCodes: [anomalyCode as AnomalyType] });

    if (scenario === "vs_reference")
      setAtlasContext({ compareLayout: "two_side" });
    if (scenario === "siblings")
      setAtlasContext({ compareLayout: "multi" });
    if (scenario === "preparations")
      setAtlasContext({ compareLayout: "by_preparation" });
    if (scenario === "by_class")
      setAtlasContext({ compareLayout: "by_subgenome" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AtlasShell
      title="Атлас · Сравнение"
      subtitle="Поставьте кариотипы рядом, сравните по субгеному или загрузите готовый сценарий."
      breadcrumbsExtra={[{ label: "Сравнение" }]}
    >
      <AtlasCompareScenarioRow />
      <AtlasCompareLayoutSwitch />

      {layout === "two_side" && <AtlasCompareTwoSide />}
      {layout === "multi" && <AtlasCompareMulti />}
      {layout === "by_subgenome" && <AtlasCompareBySubgenome />}
      {(layout === "by_preparation" ||
        layout === "by_probe" ||
        layout === "by_class") && <AtlasCompareSameSample />}
    </AtlasShell>
  );
}
