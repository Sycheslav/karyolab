import EventCardShell from "./EventCardShell";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import type { FreeEvent } from "@/lib/types";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  event: FreeEvent;
}

export default function EventCardFree({ event }: Props) {
  return (
    <EventCardShell
      event={event}
      crumbs={[
        { label: "Журнал", to: "/журнал" },
        { label: "Свободный ивент" },
        { label: event.title },
      ]}
      hideActions
    >
      <Card accent>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-brand-deep">
              {event.title}
            </h2>
            <div className="mt-1 text-[12.5px] text-brand-muted">
              📅 {event.startDate.slice(0, 10)},{" "}
              {event.startDate.slice(11, 16)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast("Редактировать (mock)")}
            >
              <Pencil size={13} />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => toast("Удалить (mock)")}
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-brand-line bg-white p-4">
          <div className="label-cap mb-1">Заметка</div>
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-brand-deep/85">
            {event.comment ?? "—"}
          </p>
          {event.attachmentName && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-line bg-brand-mint/40 px-2.5 py-1 text-[12px] text-brand-dark">
              📎 {event.attachmentName}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              <Tag>#наблюдение</Tag>
            </div>
            {event.operator && (
              <span className="inline-flex items-center gap-1.5 text-[11.5px] text-brand-muted">
                Автор: {event.operator}
              </span>
            )}
          </div>
        </div>
      </Card>
    </EventCardShell>
  );
}
