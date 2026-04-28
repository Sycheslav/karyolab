import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UploadCloud, Info } from "lucide-react";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface Props {
  defaultDate?: string;
}

export default function FreeEventForm({ defaultDate }: Props) {
  const nav = useNavigate();
  const addEvent = useStore((s) => s.addEvent);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(
    defaultDate ?? new Date().toISOString().slice(0, 10)
  );
  const [time, setTime] = useState("12:00");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<string | null>(null);

  function save() {
    if (!title.trim()) {
      toast.error("Введите название ивента");
      return;
    }
    const id = `EV-FR-${Date.now()}`;
    addEvent(
      {
        id,
        type: "free",
        title: title.trim(),
        startDate: `${date}T${time}:00`,
        operator: "Лаборант",
        status: "completed",
        comment: note,
        attachmentName: file ?? undefined,
        createdAt: new Date().toISOString(),
      },
      [
        { ts: new Date().toISOString(), title: "Создан свободный ивент" },
      ]
    );
    toast.success("Ивент сохранён");
    nav(`/журнал/ивент/${id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="heading-page">Создать свободный ивент</h1>
      <p className="mt-1 text-sm text-brand-muted">
        Свободный ивент попадает в календарь и ленту дня, но не меняет статусы
        образцов или препаратов.
      </p>

      <Card className="mt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Название ивента"
            placeholder="Например, калибровка микроскопа"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Дата"
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
          </div>
        </div>

        <div className="mt-4">
          <Textarea
            label="Заметка"
            placeholder="Опишите детали события, наблюдения или внешние действия…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
          />
        </div>

        <button
          type="button"
          onClick={() => setFile(file ? null : "report.pdf")}
          className="mt-5 block w-full rounded-2xl border-2 border-dashed border-brand-accent/60 bg-brand-mint/40 px-5 py-8 text-center transition hover:bg-brand-mint"
        >
          <UploadCloud size={28} className="mx-auto text-brand-dark" />
          <div className="mt-2 text-sm font-semibold text-brand-deep">
            {file ? `Файл: ${file}` : "Прикрепить файл"}
          </div>
          <div className="text-[11.5px] text-brand-muted">PDF, JPEG до 10 МБ</div>
        </button>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-brand-line bg-brand-mint/40 px-3 py-2.5 text-[12.5px] text-brand-deep">
          <Info size={14} className="mt-0.5 text-brand-dark" />
          <span>
            Если нужна личная запись без отображения в календаре — используйте
            блок «Заметки» на главной.
          </span>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => history.back()}>
            Отмена
          </Button>
          <Button variant="dark" onClick={save}>
            Сохранить ивент
          </Button>
        </div>
      </Card>
    </div>
  );
}
