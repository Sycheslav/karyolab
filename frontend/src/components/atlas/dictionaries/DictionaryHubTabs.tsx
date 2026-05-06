import { useNavigate } from "react-router-dom";
import { classNames } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface Props {
  active: string;
  tabs: Tab[];
}

export default function DictionaryHubTabs({ active, tabs }: Props) {
  const nav = useNavigate();
  return (
    <div className="flex flex-wrap gap-1.5 rounded-2xl border border-brand-line bg-white p-1.5 shadow-card">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => nav(`/атлас/справочники/${t.id}`)}
            className={classNames(
              "rounded-xl px-3 py-1.5 text-[12.5px] font-semibold transition",
              isActive
                ? "bg-brand-cream text-brand-deep"
                : "text-brand-muted hover:bg-brand-mint/40"
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
