import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Microscope,
  Library,
  Plus,
  List,
} from "lucide-react";
import { classNames } from "@/lib/utils";

export default function Sidebar() {
  const loc = useLocation();
  const nav = useNavigate();

  const journalActive = loc.pathname.startsWith("/журнал");
  const karyoActive = loc.pathname.startsWith("/кариотип");
  const atlasActive = loc.pathname.startsWith("/атлас");

  const topLinkClass = (active: boolean) =>
    classNames(
      "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-semibold transition",
      active
        ? "bg-brand-cream text-brand-deep"
        : "text-brand-deep/80 hover:bg-brand-cream/60"
    );

  return (
    <aside className="sticky top-0 flex h-screen w-[210px] shrink-0 flex-col border-r border-brand-line bg-white">
      <div className="px-5 pt-5 pb-3">
        <a
          href="/журнал"
          className="flex items-center gap-2.5 select-none"
          aria-label="Karyolab"
        >
          {/* Логотип: пара хромосом с центромерами и поперечными полосами,
              вписанная в фирменный зелёный квадрат. */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 48 48"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect
              x="1"
              y="1"
              width="46"
              height="46"
              rx="12"
              fill="#008236"
            />
            {/* Левая хромосома */}
            <g
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
            >
              <path d="M14 11 C 11 17, 11 23, 14 24 C 11 25, 11 31, 14 37" />
              {/* центромера-перетяжка */}
              <line x1="11.5" y1="24" x2="16.5" y2="24" strokeWidth="1.6" />
              {/* поперечные полосы */}
              <line x1="12.5" y1="15.5" x2="14.5" y2="15.5" strokeWidth="1.4" />
              <line x1="12.5" y1="20" x2="14.5" y2="20" strokeWidth="1.4" />
              <line x1="12.5" y1="29" x2="14.5" y2="29" strokeWidth="1.4" />
              <line x1="12.5" y1="33" x2="14.5" y2="33" strokeWidth="1.4" />
            </g>
            {/* Правая хромосома */}
            <g
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
            >
              <path d="M34 11 C 37 17, 37 23, 34 24 C 37 25, 37 31, 34 37" />
              <line x1="31.5" y1="24" x2="36.5" y2="24" strokeWidth="1.6" />
              <line x1="33.5" y1="15.5" x2="35.5" y2="15.5" strokeWidth="1.4" />
              <line x1="33.5" y1="20" x2="35.5" y2="20" strokeWidth="1.4" />
              <line x1="33.5" y1="29" x2="35.5" y2="29" strokeWidth="1.4" />
              <line x1="33.5" y1="33" x2="35.5" y2="33" strokeWidth="1.4" />
            </g>
          </svg>
          <span className="font-brand text-[22px] font-extrabold leading-none text-brand-deep">
            Karyolab
          </span>
        </a>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        <NavLink
          to="/журнал"
          end
          className={() => topLinkClass(journalActive)}
        >
          {journalActive && (
            <span className="absolute -left-3 top-1.5 h-7 w-1 rounded-r bg-brand" />
          )}
          <BookOpen size={16} className="text-brand-dark" />
          Журнал
        </NavLink>

        <NavLink
          to="/кариотип"
          className={() => topLinkClass(karyoActive)}
        >
          {karyoActive && (
            <span className="absolute -left-3 top-1.5 h-7 w-1 rounded-r bg-brand" />
          )}
          <Microscope size={16} className="text-brand-dark" />
          Кариотип
        </NavLink>

        <NavLink
          to="/атлас"
          className={() => topLinkClass(atlasActive)}
        >
          {atlasActive && (
            <span className="absolute -left-3 top-1.5 h-7 w-1 rounded-r bg-brand" />
          )}
          <Library size={16} className="text-brand-dark" />
          Атлас
        </NavLink>
      </nav>

      <div className="space-y-2 px-3 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => nav("/журнал/новый-образец")}
            title="Создать новый образец, ивент или заметку"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-2 py-2.5 text-[13px] font-bold text-white shadow-soft transition hover:bg-brand-dark"
          >
            <Plus size={15} />
          </button>
          <button
            onClick={() => nav("/журнал/образцы")}
            title="Список всех образцов"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-line bg-white px-2 py-2.5 text-[12px] font-bold uppercase tracking-wider text-brand-deep transition hover:bg-brand-cream"
          >
            <List size={15} />
            Все
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-brand-mint px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">
            LD
          </div>
          <div className="text-[12px] leading-tight">
            <div className="font-semibold text-brand-deep">Лаборант</div>
            <div className="text-brand-muted">Полный доступ</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
