import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import SampleMultiPicker from "./SampleMultiPicker";
import { Lightbulb, Sprout, Timer } from "lucide-react";
import { defaultBatchName, isoDay } from "@/lib/utils";

interface Props {
  defaultDate?: string;
}

export default function GerminationForm({ defaultDate }: Props) {
  const nav = useNavigate();
  const addEvent = useStore((s) => s.addEvent);
  const events = useStore((s) => s.events);

  const todayIso = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(defaultDate ?? todayIso);
  const [time, setTime] = useState("09:00");
  // Дефолтное имя партии: `GER-{YYYY-MM-DD}` или с суффиксом `-N`,
  // если в этот день уже есть проращивания (правка 14).
  const sameDayCount = useMemo(
    () =>
      events.filter(
        (e) => e.type === "germination" && isoDay(e.startDate) === date
      ).length,
    [events, date]
  );
  const [batch, setBatch] = useState(() =>
    defaultBatchName("germination", date, sameDayCount)
  );
  const [samples, setSamples] = useState<string[]>([]);

  function save() {
    if (samples.length === 0) {
      toast.error("Выберите хотя бы один образец");
      return;
    }
    const id = `EV-GER-${Date.now()}`;
    addEvent(
      {
        id,
        type: "germination",
        title: `Проращивание · Партия ${batch}`,
        batchName: batch,
        sampleIds: samples,
        estimatedDays: 14,
        currentStep: 0,
        startDate: `${date}T${time}:00`,
        endDate: `${date}T${time}:00`,
        operator: "Лаборант",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      [
        { ts: new Date().toISOString(), title: `Создано проращивание ${batch}` },
        {
          ts: new Date().toISOString(),
          title: `${samples.length} образцов добавлены в партию`,
        },
      ]
    );
    toast.success("Ивент сохранён");
    nav(`/журнал/ивент/${id}`);
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Card>
          <SectionTitle
            icon={<Sprout size={16} />}
            title="Конфигурация партии"
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Название партии"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="GER-2024-A"
            />
          </div>
        </Card>

        <Card>
          <SectionTitle
            icon={<Sprout size={16} />}
            title="Выбор образцов"
            right={
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-brand-dark">
                Выбрано: {samples.length}
              </span>
            }
          />
          <div className="mt-4">
            <SampleMultiPicker value={samples} onChange={setSamples} />
          </div>
        </Card>

        <Card>
          <SectionTitle
            icon={<Timer size={16} />}
            title="Старт таймлайна"
          />
          <div className="mt-4 grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
            <Input
              label="Дата закладки семян"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Время"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <div className="rounded-xl border border-brand-line bg-brand-mint/40 px-3 py-2.5">
              <div className="label-cap">Ожидаемая длительность</div>
              <div className="mt-1 text-sm font-bold text-brand-deep">
                ~14 дней до завершения
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card dark>
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="mt-0.5 text-brand-accent" />
            <div>
              <div className="text-[11.5px] font-bold uppercase tracking-wider text-brand-accent">
                Подсказка по протоколу
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-brand-cream/90">
                Первые этапы проращивания редактируются вручную. От переноса в
                термостат включается жёсткий временной каркас: фиксация 24 ч,
                обработка HU 18 ч, отмывка и доращивание 5 ч.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => history.back()}>
            Отмена
          </Button>
          <Button onClick={save}>Создать ивент</Button>
        </div>
      </div>
    </div>
  );
}
