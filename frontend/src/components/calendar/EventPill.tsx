import { useNavigate } from "react-router-dom";
import { eventPillClasses, eventTypeLabel } from "./eventColors";
import type { EventType, JournalEvent } from "@/lib/types";
import { classNames } from "@/lib/utils";

interface Props {
  ev: JournalEvent;
  /** Если задан — переопределяет тип для стилей и подписи (для агрегированных групп). */
  type?: EventType;
  /** Текст внутри плашки. По умолчанию — заголовок ивента. */
  label?: string;
  /** position within multi-day band: "single" | "start" | "middle" | "end" */
  position?: "single" | "start" | "middle" | "end";
  /** show title text */
  showLabel?: boolean;
  /** Альтернативный обработчик клика. По умолчанию — навигация в карточку ивента. */
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export default function EventPill({
  ev,
  type,
  label,
  position = "single",
  showLabel = true,
  onClick,
  className,
}: Props) {
  const nav = useNavigate();
  const radius =
    position === "single"
      ? "rounded-full"
      : position === "start"
        ? "rounded-l-full"
        : position === "end"
          ? "rounded-r-full"
          : "rounded-none";

  const eventType = type ?? ev.type;
  const text = label ?? ev.title;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
        else nav(`/журнал/ивент/${ev.id}`);
      }}
      title={`${eventTypeLabel[eventType]} · ${text}`}
      className={classNames(
        "block w-full overflow-hidden whitespace-nowrap border px-2 py-[3px] text-[10.5px] font-semibold transition",
        radius,
        eventPillClasses[eventType],
        className
      )}
    >
      {showLabel ? text : <span>&nbsp;</span>}
    </button>
  );
}
