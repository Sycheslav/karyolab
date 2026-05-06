import KaryotypePage from "@/components/karyotype/KaryotypePage";
import KaryotypeTabs from "@/components/karyotype/KaryotypeTabs";

interface Props {
  initialMode?: "chromosome" | "genome";
}

export default function KaryotypePageRoute({ initialMode = "chromosome" }: Props) {
  return (
    <div className="space-y-4">
      <KaryotypeTabs />
      <KaryotypePage initialMode={initialMode} />
    </div>
  );
}
