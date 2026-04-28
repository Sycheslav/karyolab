import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import StatusBar from "./StatusBar";

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-brand-mint">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
        <StatusBar />
      </div>
    </div>
  );
}
