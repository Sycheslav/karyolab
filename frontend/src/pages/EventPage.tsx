import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import EventCardGermination from "@/components/cards/EventCardGermination";
import EventCardWash from "@/components/cards/EventCardWash";
import EventCardSlide from "@/components/cards/EventCardSlide";
import EventCardHybridization from "@/components/cards/EventCardHybridization";
import EventCardPhoto from "@/components/cards/EventCardPhoto";
import EventCardFree from "@/components/cards/EventCardFree";
import ChangePanel from "@/components/widgets/ChangePanel";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function EventPage() {
  const { id } = useParams();
  const event = useStore((s) => s.events.find((e) => e.id === id));
  const nav = useNavigate();

  if (!event) {
    return (
      <Card>
        <h2 className="text-lg font-bold text-brand-deep">Ивент не найден</h2>
        <p className="mt-2 text-sm text-brand-muted">
          Возможно, он был удалён или ссылка устарела.
        </p>
        <Button className="mt-4" onClick={() => nav("/журнал")}>
          В журнал
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <ChangePanel />
      {event.type === "germination" && <EventCardGermination event={event} />}
      {event.type === "wash" && <EventCardWash event={event} />}
      {event.type === "slide" && <EventCardSlide event={event} />}
      {event.type === "hybridization" && (
        <EventCardHybridization event={event} />
      )}
      {event.type === "photographing" && <EventCardPhoto event={event} />}
      {event.type === "free" && <EventCardFree event={event} />}
    </div>
  );
}
