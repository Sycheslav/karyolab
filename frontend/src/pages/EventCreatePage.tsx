import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import GerminationForm from "@/components/forms/GerminationForm";
import SlideForm from "@/components/forms/SlideForm";
import WashForm from "@/components/forms/WashForm";
import HybridizationForm from "@/components/forms/HybridizationForm";
import PhotographingForm from "@/components/forms/PhotographingForm";
import FreeEventForm from "@/components/forms/FreeEventForm";
import type { EventType } from "@/lib/types";
import { eventTypeLabel } from "@/components/calendar/eventColors";
import { X } from "lucide-react";

const types: EventType[] = [
  "germination",
  "slide",
  "wash",
  "hybridization",
  "photographing",
  "free",
];

export default function EventCreatePage() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();

  const type = (params.get("type") as EventType) ?? "free";
  const date = params.get("date") ?? undefined;

  const Form = useMemo(() => {
    switch (type) {
      case "germination":
        return <GerminationForm defaultDate={date} />;
      case "slide":
        return <SlideForm defaultDate={date} />;
      case "wash":
        return <WashForm defaultDate={date} />;
      case "hybridization":
        return <HybridizationForm defaultDate={date} />;
      case "photographing":
        return <PhotographingForm defaultDate={date} />;
      case "free":
      default:
        return <FreeEventForm defaultDate={date} />;
    }
  }, [type, date]);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Журнал", to: "/журнал" },
          { label: "Новый ивент" },
        ]}
      />

      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="heading-page">Новый ивент</h1>
          <p className="text-sm text-brand-muted">
            Сначала выберите тип события — форма ниже подстроится.
            {date && (
              <>
                {" "}
                Дата по умолчанию: <strong>{date}</strong>.
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => nav("/журнал")}
          className="grid h-9 w-9 place-items-center rounded-full border border-brand-line bg-white text-brand-muted hover:bg-brand-mint"
          aria-label="Закрыть"
          title="Вернуться в журнал"
        >
          <X size={15} />
        </button>
      </div>

      <Card className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[280px_1fr]">
          <Select
            label="Тип ивента"
            value={type}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              next.set("type", e.target.value);
              setParams(next, { replace: true });
            }}
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {eventTypeLabel[t]}
              </option>
            ))}
          </Select>
          <div className="rounded-xl border border-brand-line bg-brand-mint/40 px-3 py-2 text-[12.5px] text-brand-deep/85">
            После сохранения вы увидите карточку ивента и панель «Что
            изменилось». Календарь, лента дня и прогресс обновятся автоматически.
          </div>
        </div>
      </Card>

      {Form}
    </div>
  );
}
