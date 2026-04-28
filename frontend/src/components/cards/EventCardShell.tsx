import { ReactNode } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import StatusPill from "@/components/ui/StatusPill";
import Button from "@/components/ui/Button";
import { Download, Printer, Save } from "lucide-react";
import toast from "react-hot-toast";
import type { JournalEvent } from "@/lib/types";
import { eventTypeLabel } from "@/components/calendar/eventColors";
import { fmtDateLong, fmtTime } from "@/lib/utils";

interface Props {
  event: JournalEvent;
  crumbs: { label: string; to?: string }[];
  children: ReactNode;
  side?: ReactNode;
  hideActions?: boolean;
}

export default function EventCardShell({
  event,
  crumbs,
  children,
  side,
  hideActions,
}: Props) {
  return (
    <div>
      <Breadcrumbs items={crumbs} />

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="heading-page">{event.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[12.5px] text-brand-muted">
            <span className="rounded-full bg-brand-cream px-2 py-0.5 text-brand-dark">
              {eventTypeLabel[event.type]}
            </span>
            <span>{fmtDateLong(event.startDate)}</span>
            <span className="h-1 w-1 rounded-full bg-brand-line" />
            <span>{fmtTime(event.startDate)}</span>
            {event.operator && (
              <>
                <span className="h-1 w-1 rounded-full bg-brand-line" />
                <span>👤 {event.operator}</span>
              </>
            )}
            <StatusPill status={event.status ?? "active"} />
          </div>
        </div>

        {!hideActions && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => toast("Экспорт PDF (mock)")}>
              <Download size={14} />
              Экспорт
            </Button>
            <Button variant="outline" onClick={() => toast("Печать этикетки (mock)")}>
              <Printer size={14} />
              Печать
            </Button>
            <Button variant="dark" onClick={() => toast("Сохранено")}>
              <Save size={14} />
              Сохранить
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">{children}</div>
        {side && <div className="space-y-5">{side}</div>}
      </div>
    </div>
  );
}
