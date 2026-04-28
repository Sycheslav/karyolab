import { useNavigate } from "react-router-dom";
import { eventPillClasses, eventTypeLabel } from "./eventColors";
import type { JournalEvent } from "@/lib/types";
import { classNames } from "@/lib/utils";

interface Props {
  ev: JournalEvent;
  /** position within multi-day band: "single" | "start" | "middle" | "end" */
  position?: "single" | "start" | "middle" | "end";
  /** show title text */
  showLabel?: boolean;
  className?: string;
}

export default function EventPill({
  ev,
  position = "single",
  showLabel = true,
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

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        nav(`/журнал/ивент/${ev.id}`);
      }}
      title={`${eventTypeLabel[ev.type]} · ${ev.title}`}
      className={classNames(
        "block w-full overflow-hidden whitespace-nowrap border px-2 py-[3px] text-[10.5px] font-semibold transition",
        radius,
        eventPillClasses[ev.type],
        className
      )}
    >
      {showLabel ? ev.title : <span>&nbsp;</span>}
    </button>
  );
}
