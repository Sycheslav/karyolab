import { useLocation, useNavigate } from "react-router-dom";
import { classNames } from "@/lib/utils";

/**
 * Горизонтальные вкладки раздела «Кариотип» (`05_роутинг_и_навигация.md`).
 * Подразделы Импорт / Кариотип / Экспорт переключаются ровно здесь —
 * в боковом меню они не дублируются.
 */
export default function KaryotypeTabs() {
  const loc = useLocation();
  const nav = useNavigate();

  const tabs = [
    { id: "import", label: "Импорт", path: "/кариотип/импорт" },
    { id: "markup", label: "Кариотип", path: "/кариотип/разметка" },
    { id: "export", label: "Экспорт", path: "/кариотип/экспорт" },
  ];

  const isActive = (path: string) => {
    if (path === "/кариотип/разметка") {
      return loc.pathname.startsWith("/кариотип/разметка");
    }
    return loc.pathname.startsWith(path);
  };

  return (
    <div className="border-b border-brand-line">
      <div className="-mb-px flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => nav(t.path)}
            className={classNames(
              "relative px-4 py-2.5 text-[13.5px] font-semibold transition",
              isActive(t.path)
                ? "border-b-2 border-brand text-brand-deep"
                : "border-b-2 border-transparent text-brand-muted hover:text-brand-deep"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
