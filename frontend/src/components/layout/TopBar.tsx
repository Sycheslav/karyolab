import { Bell, Settings, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function TopBar() {
  const loc = useLocation();
  const crumb =
    loc.pathname.startsWith("/журнал/архив")
      ? "Архив заметок и тильта"
      : loc.pathname.startsWith("/журнал/новый-ивент")
        ? "Новый ивент"
        : loc.pathname.startsWith("/журнал/новый-образец")
          ? "Новый образец"
          : loc.pathname.startsWith("/журнал/ивент")
            ? "Карточка ивента"
            : loc.pathname.startsWith("/журнал/образец")
              ? "Карточка образца"
              : loc.pathname.startsWith("/кариотип")
                ? "Кариотип"
                : loc.pathname.startsWith("/атлас")
                  ? "Атлас"
                  : "Журнал";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-brand-dark/40 bg-brand px-6 text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]">
      <Link
        to="/журнал"
        className="text-[13px] font-semibold uppercase tracking-wider text-white/80 hover:text-white"
      >
        Karyolab
      </Link>
      <span className="text-white/40">/</span>
      <span className="text-[13px] font-semibold text-white">{crumb}</span>

      <div className="ml-auto flex items-center gap-1">
        <button
          className="grid h-9 w-9 place-items-center rounded-full text-white/85 transition hover:bg-white/10"
          title="Уведомления"
        >
          <Bell size={17} />
        </button>
        <button
          className="grid h-9 w-9 place-items-center rounded-full text-white/85 transition hover:bg-white/10"
          title="Настройки"
        >
          <Settings size={17} />
        </button>
        <button
          className="grid h-9 w-9 place-items-center rounded-full text-white/85 transition hover:bg-white/10"
          title="Профиль"
        >
          <User size={17} />
        </button>
      </div>
    </header>
  );
}
