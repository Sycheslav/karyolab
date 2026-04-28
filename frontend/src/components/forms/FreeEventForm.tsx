import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Hash, Info, UploadCloud, X } from "lucide-react";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";

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
  // Свободные пользовательские теги (правка 8).
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  function addTag(raw: string) {
    const t = raw.trim().replace(/^#+/, "").toLowerCase();
    if (!t) return;
    if (tags.includes(t)) return;
    setTags((arr) => [...arr, t]);
    setTagInput("");
  }

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
        tags: tags.length > 0 ? tags : undefined,
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

        {/*
          Поле «Теги» — chips + input (правка 8). Те же теги индексируются и в
          архиве заметок, и в потенциальном глобальном поиске.
        */}
        <div className="mt-4">
          <span className="label-cap mb-1.5 block">Теги</span>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-line bg-white px-3 py-2">
            <Hash size={14} className="text-brand-muted" />
            {tags.map((t) => (
              <Tag key={t} onRemove={() => setTags((arr) => arr.filter((x) => x !== t))}>
                #{t}
              </Tag>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                } else if (
                  e.key === "Backspace" &&
                  !tagInput &&
                  tags.length > 0
                ) {
                  setTags((arr) => arr.slice(0, -1));
                }
              }}
              onBlur={() => addTag(tagInput)}
              placeholder={
                tags.length === 0
                  ? "наблюдение, протокол, инцидент…"
                  : "ещё тег…"
              }
              className="min-w-[120px] flex-1 bg-transparent text-sm text-brand-deep outline-none placeholder:text-brand-muted/70"
            />
            {tagInput && (
              <button
                type="button"
                onClick={() => setTagInput("")}
                className="text-brand-muted"
                aria-label="Очистить ввод"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <span className="mt-1 block text-[11.5px] text-brand-muted">
            Enter или запятая — добавить тег. Backspace — удалить последний.
          </span>
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
