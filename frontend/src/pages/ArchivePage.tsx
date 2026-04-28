import { useMemo, useState } from "react";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { selectArchivedNotes, useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { fmtDateLong, fmtMonthYear, classNames } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import toast from "react-hot-toast";

export default function ArchivePage() {
  const archived = useStore(selectArchivedNotes);
  const tilts = useStore((s) => s.tilts);
  const unarchive = useStore((s) => s.unarchiveNote);

  const [q, setQ] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    archived.forEach((n) => n.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [archived]);

  const filtered = archived.filter((n) => {
    const ql = q.toLowerCase();
    const inText =
      !ql ||
      n.title.toLowerCase().includes(ql) ||
      n.body.toLowerCase().includes(ql);
    const inTags =
      activeTags.length === 0 || activeTags.some((t) => n.tags?.includes(t));
    return inText && inTags;
  });

  const grouped = useMemo(() => {
    const m = new Map<string, typeof filtered>();
    for (const n of filtered) {
      const k = format(parseISO(n.createdAt), "yyyy-MM");
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(n);
    }
    return Array.from(m.entries()).sort(([a], [b]) => (a > b ? -1 : 1));
  }, [filtered]);

  const tiltColor = (lvl: string) =>
    lvl === "critical"
      ? "bg-brand-danger"
      : lvl === "mild"
        ? "bg-brand-warn"
        : lvl === "perfect"
          ? "bg-brand"
          : "bg-brand-accent";

  const tiltLevelLabel = (lvl: string) =>
    lvl === "critical"
      ? "критический"
      : lvl === "mild"
        ? "лёгкий"
        : lvl === "perfect"
          ? "ровный"
          : "спокойный";

  const tiltGroups = useMemo(() => {
    const m = new Map<string, typeof tilts>();
    for (const t of tilts) {
      const k = t.date;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(t);
    }
    return Array.from(m.entries()).sort((a, b) => (a[0] > b[0] ? -1 : 1));
  }, [tilts]);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Журнал", to: "/журнал" },
          { label: "Архив заметок и тильта" },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="heading-page">Архив заметок</h1>
              <p className="mt-1 text-sm text-brand-muted">
                История наблюдений, инцидентов и веховых записей. Группируется
                по месяцам.
              </p>
            </div>
            <Button variant="secondary">
              <SlidersHorizontal size={14} />
              Сортировка по дате
            </Button>
          </div>

          <Card>
            <div className="flex items-center gap-2 rounded-xl border border-brand-line bg-white px-3 py-2.5">
              <Search size={15} className="text-brand-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск по заголовку или тексту…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-brand-muted/70"
              />
            </div>
            {allTags.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-brand-muted">
                  Теги:
                </span>
                {allTags.map((t) => {
                  const active = activeTags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        setActiveTags((s) =>
                          s.includes(t) ? s.filter((x) => x !== t) : [...s, t]
                        )
                      }
                      className={classNames(
                        "rounded-full border px-2.5 py-1 text-[12px] font-semibold transition",
                        active
                          ? "border-brand-accent bg-brand-accent/30 text-brand-dark"
                          : "border-brand-line bg-white text-brand-muted hover:bg-brand-mint"
                      )}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          <div className="space-y-5">
            {grouped.length === 0 && (
              <div className="rounded-2xl border border-dashed border-brand-line bg-white p-8 text-center text-brand-muted">
                В архиве ничего не найдено.
              </div>
            )}
            {grouped.map(([month, items]) => (
              <div key={month}>
                <span className="inline-block rounded-full bg-brand-deep px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-cream">
                  {fmtMonthYear(`${month}-01`)}
                </span>
                <div className="mt-3 space-y-3">
                  {items.map((n) => (
                    <Card key={n.id}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold text-brand-deep">
                          {n.title}
                        </h3>
                        <span className="rounded-md bg-brand-mint px-2 py-1 text-[11px] font-bold uppercase text-brand-dark">
                          {format(parseISO(n.createdAt), "d MMM", { locale: ru })}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-brand-deep/85">
                        {n.body}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {n.tags?.map((t) => (
                            <Tag key={t}>#{t}</Tag>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            unarchive(n.id);
                            toast.success("Заметка восстановлена");
                          }}
                        >
                          Восстановить
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-brand-deep">
                История тильта
              </h3>
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-brand-muted">
                {tilts.length} записей
              </span>
            </div>
            <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
              {tiltGroups.map(([date, items]) => (
                <div
                  key={date}
                  className="rounded-lg border border-brand-line bg-white px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-brand-deep">
                      {fmtDateLong(date)}
                    </span>
                    <span className="text-[12.5px] font-bold text-brand-deep">
                      ×{items.length}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {items.map((t) => (
                      <span
                        key={t.id}
                        className={classNames(
                          "h-2 w-2 rounded-full",
                          tiltColor(t.level)
                        )}
                        title={tiltLevelLabel(t.level)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {tiltGroups.length === 0 && (
                <div className="rounded-lg border border-dashed border-brand-line p-3 text-center text-[12.5px] text-brand-muted">
                  Тильт ещё не отмечался.
                </div>
              )}
            </div>
            <Button variant="outline" className="mt-3 w-full">
              <Download size={13} />
              Скачать историю
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
