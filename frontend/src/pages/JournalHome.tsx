import CalendarMonth from "@/components/calendar/CalendarMonth";
import TodayEvents from "@/components/widgets/TodayEvents";
import NotesWidget from "@/components/widgets/NotesWidget";
import TiltCounter from "@/components/widgets/TiltCounter";
import ProgressLifecycle from "@/components/widgets/ProgressLifecycle";

export default function JournalHome() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <CalendarMonth />
        <div className="space-y-6">
          <TodayEvents />
          <NotesWidget />
          <TiltCounter />
        </div>
      </div>

      <ProgressLifecycle />
    </div>
  );
}
