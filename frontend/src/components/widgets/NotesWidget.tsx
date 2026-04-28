import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Archive, Pin, Plus, Send } from "lucide-react";
import toast from "react-hot-toast";
import { selectActiveNotes, useStore } from "@/lib/store";
import { fmtDateShort, classNames } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";

export default function NotesWidget() {
  const nav = useNavigate();
  const notes = useStore(selectActiveNotes);
  const archive = useStore((s) => s.archiveNote);
  const togglePin = useStore((s) => s.togglePinNote);
  const addNote = useStore((s) => s.addNote);

  const [composer, setComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const main = notes[0];
  const folded = notes.slice(1, 3);

  function handleAdd() {
    if (!title.trim() && !body.trim()) {
      setComposer(false);
      return;
    }
    addNote({
      title: title.trim() || "Новая заметка",
      body: body.trim(),
      tags: [],
    });
    setTitle("");
    setBody("");
    setComposer(false);
    toast.success("Заметка добавлена");
  }

  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold text-brand-deep">Заметки</h3>
          <p className="text-[11.5px] text-brand-muted">
            {notes.length} активных
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setComposer(true)}>
            <Plus size={13} />
            Новая
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => nav("/журнал/архив")}
          >
            <Archive size={13} />
            Архив
          </Button>
        </div>
      </div>

      {composer && (
        <div className="mb-3 rounded-xl border border-brand-line bg-brand-mint/50 p-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Короткий заголовок"
            className="w-full bg-transparent text-sm font-semibold text-brand-deep outline-none placeholder:text-brand-muted/70"
            autoFocus
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Опишите наблюдение, идею или напоминание…"
            className="mt-1 w-full resize-none bg-transparent text-[12.5px] text-brand-deep outline-none placeholder:text-brand-muted/70"
            rows={2}
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setComposer(false);
                setTitle("");
                setBody("");
              }}
            >
              Отмена
            </Button>
            <Button size="sm" onClick={handleAdd}>
              <Send size={13} />
              Сохранить
            </Button>
          </div>
        </div>
      )}

      {main ? (
        <div className="rounded-xl border border-brand-line bg-brand-mint/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm font-bold text-brand-deep">
              {main.title}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => togglePin(main.id)}
                title={main.pinned ? "Открепить" : "Закрепить"}
                className={classNames(
                  "grid h-7 w-7 place-items-center rounded-full transition",
                  main.pinned
                    ? "bg-brand-accent/30 text-brand-dark"
                    : "text-brand-muted hover:bg-white"
                )}
              >
                <Pin size={13} />
              </button>
              <button
                onClick={() => {
                  archive(main.id);
                  toast.success("Заметка отправлена в архив");
                }}
                title="В архив"
                className="grid h-7 w-7 place-items-center rounded-full text-brand-muted transition hover:bg-white"
              >
                <Archive size={13} />
              </button>
            </div>
          </div>
          <div className="mt-1.5 text-[12.5px] leading-relaxed text-brand-deep/80">
            {main.body}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-brand-muted">
            <div className="flex flex-wrap gap-1.5">
              {main.tags?.map((t) => (
                <Tag key={t}>#{t}</Tag>
              ))}
            </div>
            <span>{fmtDateShort(main.createdAt)}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-brand-line bg-brand-mint/40 p-4 text-center text-[12.5px] text-brand-muted">
          Заметок пока нет. Нажмите «+ Новая», чтобы записать мысль.
        </div>
      )}

      {folded.length > 0 && (
        <div className="mt-3 space-y-2">
          {folded.map((n) => (
            <button
              key={n.id}
              onClick={() => togglePin(n.id)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-brand-line bg-white px-3 py-2 text-left transition hover:bg-brand-mint/40"
              title="Кликнуть, чтобы (от)закрепить"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold text-brand-deep">
                  {n.title}
                </div>
                <div className="truncate text-[11.5px] text-brand-muted">
                  {n.body || "—"}
                </div>
              </div>
              <span className="shrink-0 text-[10.5px] uppercase tracking-wider text-brand-muted">
                {fmtDateShort(n.createdAt)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
