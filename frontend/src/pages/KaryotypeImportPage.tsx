import KaryotypeImportPage from "@/components/karyotype/import/KaryotypeImportPage";
import KaryotypeTabs from "@/components/karyotype/KaryotypeTabs";

export default function KaryotypeImportPageRoute() {
  return (
    <div className="space-y-4">
      <KaryotypeTabs />
      <KaryotypeImportPage />
    </div>
  );
}
