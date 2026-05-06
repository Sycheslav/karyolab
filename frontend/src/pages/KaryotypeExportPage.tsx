import KaryotypeExportPage from "@/components/karyotype/export/KaryotypeExportPage";
import KaryotypeTabs from "@/components/karyotype/KaryotypeTabs";

export default function KaryotypeExportPageRoute() {
  return (
    <div className="space-y-4">
      <KaryotypeTabs />
      <KaryotypeExportPage />
    </div>
  );
}
