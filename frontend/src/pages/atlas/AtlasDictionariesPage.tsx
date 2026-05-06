import { useParams } from "react-router-dom";
import AtlasShell from "@/components/atlas/AtlasShell";
import DictionaryHubTabs from "@/components/atlas/dictionaries/DictionaryHubTabs";
import ProbesDictionary from "@/components/atlas/dictionaries/ProbesDictionary";
import FluorochromesDictionary from "@/components/atlas/dictionaries/FluorochromesDictionary";
import SpeciesDictionary from "@/components/atlas/dictionaries/SpeciesDictionary";
import SubgenomesDictionary from "@/components/atlas/dictionaries/SubgenomesDictionary";
import ChromosomeClassesDictionary from "@/components/atlas/dictionaries/ChromosomeClassesDictionary";
import AnomalyTypesDictionary from "@/components/atlas/dictionaries/AnomalyTypesDictionary";
import TheoreticalRecordsDictionary from "@/components/atlas/dictionaries/TheoreticalRecordsDictionary";

const TABS = [
  { id: "probes", label: "Зонды" },
  { id: "fluorochromes", label: "Флюорохромы" },
  { id: "species", label: "Виды" },
  { id: "subgenomes", label: "Субгеномы" },
  { id: "classes", label: "Классы" },
  { id: "anomalies", label: "Аномалии" },
  { id: "theoretical", label: "Теоретические записи" },
];

export default function AtlasDictionariesPage() {
  const { tab } = useParams();
  const active = TABS.find((t) => t.id === tab)?.id ?? "probes";

  return (
    <AtlasShell
      title="Атлас · Справочники"
      subtitle="Зонды, флюорохромы, виды, субгеномы, классы хромосом, аномалии и теоретические записи."
      breadcrumbsExtra={[{ label: "Справочники" }]}
      hideContextBar
    >
      <DictionaryHubTabs active={active} tabs={TABS} />
      {active === "probes" && <ProbesDictionary />}
      {active === "fluorochromes" && <FluorochromesDictionary />}
      {active === "species" && <SpeciesDictionary />}
      {active === "subgenomes" && <SubgenomesDictionary />}
      {active === "classes" && <ChromosomeClassesDictionary />}
      {active === "anomalies" && <AnomalyTypesDictionary />}
      {active === "theoretical" && <TheoreticalRecordsDictionary />}
    </AtlasShell>
  );
}
