import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import JournalHome from "./pages/JournalHome";
import EventCreatePage from "./pages/EventCreatePage";
import SampleCreatePage from "./pages/SampleCreatePage";
import SamplePage from "./pages/SamplePage";
import EventPage from "./pages/EventPage";
import ArchivePage from "./pages/ArchivePage";
import SamplesListPage from "./pages/SamplesListPage";
import JournalDayPage from "./pages/JournalDayPage";
import NotFound from "./pages/NotFound";
import KaryotypeImportPage from "./pages/KaryotypeImportPage";
import KaryotypePage from "./pages/KaryotypePage";
import KaryotypeExportPage from "./pages/KaryotypeExportPage";
import AtlasMatrixPage from "./pages/atlas/AtlasMatrixPage";
import AtlasComparePage from "./pages/atlas/AtlasComparePage";
import AtlasReferencesPage from "./pages/atlas/AtlasReferencesPage";
import AtlasDictionariesPage from "./pages/atlas/AtlasDictionariesPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/журнал" replace />} />
        <Route path="журнал" element={<JournalHome />} />
        <Route path="журнал/новый-ивент" element={<EventCreatePage />} />
        <Route path="журнал/новый-образец" element={<SampleCreatePage />} />
        <Route path="журнал/образцы" element={<SamplesListPage />} />
        <Route path="журнал/ивент/:id" element={<EventPage />} />
        <Route path="журнал/образец/:id" element={<SamplePage />} />
        <Route path="журнал/день/:date" element={<JournalDayPage />} />
        <Route path="журнал/архив" element={<ArchivePage />} />

        <Route
          path="кариотип"
          element={<Navigate to="/кариотип/импорт" replace />}
        />
        <Route path="кариотип/импорт" element={<KaryotypeImportPage />} />
        <Route
          path="кариотип/разметка"
          element={<KaryotypePage initialMode="chromosome" />}
        />
        <Route
          path="кариотип/разметка/хромосома/:chromId"
          element={<KaryotypePage initialMode="chromosome" />}
        />
        <Route
          path="кариотип/разметка/геном"
          element={<KaryotypePage initialMode="genome" />}
        />
        {/* Обратная совместимость со старыми ссылками */}
        <Route
          path="кариотип/разметка-хромосом"
          element={<Navigate to="/кариотип/разметка" replace />}
        />
        <Route
          path="кариотип/разметка-генома"
          element={<Navigate to="/кариотип/разметка/геном" replace />}
        />
        <Route path="кариотип/экспорт" element={<KaryotypeExportPage />} />

        <Route path="атлас" element={<Navigate to="/атлас/матрица" replace />} />
        <Route path="атлас/матрица" element={<AtlasMatrixPage />} />
        <Route path="атлас/сравнение" element={<AtlasComparePage />} />
        <Route path="атлас/эталоны" element={<AtlasReferencesPage />} />
        <Route path="атлас/справочники" element={<AtlasDictionariesPage />} />
        <Route path="атлас/справочники/:tab" element={<AtlasDictionariesPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
