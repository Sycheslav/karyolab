import { Bell, Settings, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function TopBar() {
  const loc = useLocation();
  const p = loc.pathname;

  let crumb = "Журнал";
  if (p.startsWith("/журнал/архив")) crumb = "Архив заметок и тильта";
  else if (p.startsWith("/журнал/новый-ивент")) crumb = "Новый ивент";
  else if (p.startsWith("/журнал/новый-образец")) crumb = "Новый образец";
  else if (p.startsWith("/журнал/ивент")) crumb = "Карточка ивента";
  else if (p.startsWith("/журнал/образец")) crumb = "Карточка образца";
  else if (p.startsWith("/кариотип/импорт")) crumb = "Кариотип · Импорт";
  else if (p.startsWith("/кариотип/разметка-хромосом"))
    crumb = "Кариотип · Разметка хромосом";
  else if (p.startsWith("/кариотип/разметка-генома"))
    crumb = "Кариотип · Разметка генома";
  else if (p.startsWith("/кариотип/экспорт")) crumb = "Кариотип · Экспорт";
  else if (p.startsWith("/кариотип")) crumb = "Кариотип";
  else if (p.startsWith("/атлас")) crumb = "Атлас";

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
