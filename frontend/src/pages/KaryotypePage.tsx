import KaryotypePage from "@/components/karyotype/KaryotypePage";

interface Props {
  initialMode?: "chromosome" | "genome";
}

export default function KaryotypePageRoute({ initialMode = "chromosome" }: Props) {
  return <KaryotypePage initialMode={initialMode} />;
}
