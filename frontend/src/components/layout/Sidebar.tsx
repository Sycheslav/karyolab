import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Microscope,
  Library,
  ChevronDown,
  Plus,
  FileInput,
  Layers,
  Download,
  Grid3x3,
} from "lucide-react";
import { useState } from "react";
import { classNames } from "@/lib/utils";

export default function Sidebar() {
  const loc = useLocation();
  const nav = useNavigate();
  const [karyoOpen, setKaryoOpen] = useState(true);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    classNames(
      "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium transition",
      isActive
        ? "bg-brand-cream text-brand-deep"
        : "text-brand-deep/80 hover:bg-brand-cream/60"
    );

  const subLinkClass = ({ isActive }: { isActive: boolean }) =>
    classNames(
      "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition",
      isActive
        ? "bg-brand-cream text-brand-deep font-semibold"
        : "text-brand-deep/70 hover:bg-brand-cream/60"
    );

  const journalActive = loc.pathname.startsWith("/журнал");
  const karyoActive = loc.pathname.startsWith("/кариотип");

  return (
    <aside className="sticky top-0 flex h-screen w-[210px] shrink-0 flex-col border-r border-brand-line bg-white">
      <div className="px-5 pt-5 pb-2">
        <div className="select-none font-brand text-[36px] leading-none text-brand-dark">
          Soft <span className="text-brand">♥</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        <NavLink
          to="/журнал"
          end
          className={() =>
            classNames(
              "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-semibold transition",
              journalActive
                ? "bg-brand-cream text-brand-deep"
                : "text-brand-deep/80 hover:bg-brand-cream/60"
            )
          }
        >
          {journalActive && (
            <span className="absolute -left-3 top-1.5 h-7 w-1 rounded-r bg-brand" />
          )}
          <BookOpen size={16} className="text-brand-dark" />
          Журнал
        </NavLink>

        <button
          type="button"
          onClick={() => setKaryoOpen((o) => !o)}
          className={classNames(
            "relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-semibold transition",
            karyoActive
              ? "bg-brand-cream text-brand-deep"
              : "text-brand-deep/80 hover:bg-brand-cream/60"
          )}
        >
          {karyoActive && (
            <span className="absolute -left-3 top-1.5 h-7 w-1 rounded-r bg-brand" />
          )}
          <Microscope size={16} className="text-brand-dark" />
          Кариотип
          <ChevronDown
            size={14}
            className={classNames(
              "ml-auto text-brand-muted transition",
              karyoOpen ? "rotate-0" : "-rotate-90"
            )}
          />
        </button>
        {karyoOpen && (
          <div className="ml-3 space-y-0.5 border-l border-brand-line/80 pl-3">
            <NavLink to="/кариотип/импорт" className={subLinkClass}>
              <FileInput size={14} /> Импорт
            </NavLink>
            <NavLink to="/кариотип/разметка-хромосом" className={subLinkClass}>
              <Layers size={14} /> Разметка хромосом
            </NavLink>
            <NavLink to="/кариотип/разметка-генома" className={subLinkClass}>
              <Grid3x3 size={14} /> Разметка генома
            </NavLink>
            <NavLink to="/кариотип/экспорт" className={subLinkClass}>
              <Download size={14} /> Экспорт
            </NavLink>
          </div>
        )}

        <NavLink to="/атлас" className={linkClass}>
          <Library size={16} className="text-brand-dark" />
          Атлас
        </NavLink>
      </nav>

      <div className="space-y-3 px-3 pb-4">
        <button
          onClick={() => nav("/журнал/новый-образец")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-3 py-2.5 text-[12.5px] font-bold uppercase tracking-wider text-white shadow-soft transition hover:bg-brand-dark"
        >
          <Plus size={15} />
          Добавить образец
        </button>

        <div className="flex items-center gap-3 rounded-xl bg-brand-mint px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">
            LD
          </div>
          <div className="text-[12px] leading-tight">
            <div className="font-semibold text-brand-deep">Lab Technician</div>
            <div className="text-brand-muted">Admin Access</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
