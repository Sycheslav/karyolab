import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import JournalHome from "./pages/JournalHome";
import EventCreatePage from "./pages/EventCreatePage";
import SampleCreatePage from "./pages/SampleCreatePage";
import SamplePage from "./pages/SamplePage";
import EventPage from "./pages/EventPage";
import ArchivePage from "./pages/ArchivePage";
import NotFound from "./pages/NotFound";
import StubPage from "./pages/StubPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/журнал" replace />} />
        <Route path="журнал" element={<JournalHome />} />
        <Route path="журнал/новый-ивент" element={<EventCreatePage />} />
        <Route path="журнал/новый-образец" element={<SampleCreatePage />} />
        <Route path="журнал/ивент/:id" element={<EventPage />} />
        <Route path="журнал/образец/:id" element={<SamplePage />} />
        <Route path="журнал/архив" element={<ArchivePage />} />
        <Route
          path="кариотип"
          element={
            <StubPage
              title="Кариотип"
              note="Раздел в разработке. Здесь будет работа с фотографиями, метафазами и сборкой кариотипов."
            />
          }
        />
        <Route
          path="кариотип/:sub"
          element={
            <StubPage
              title="Кариотип"
              note="Раздел в разработке. Здесь будет работа с фотографиями, метафазами и сборкой кариотипов."
            />
          }
        />
        <Route
          path="атлас"
          element={
            <StubPage
              title="Атлас"
              note="Раздел в разработке. Здесь будет аналитика накопленных данных по образцам и зондам."
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
