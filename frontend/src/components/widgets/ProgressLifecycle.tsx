import { ChevronRight, BarChart3, Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  formatStainHistoryShort,
  selectProgressBuckets,
  selectStainHistory,
  useStore,
} from "@/lib/store";
import { useMemo } from "react";
import type { Preparation, Sample, StainedPreparation } from "@/lib/types";
import { classNames } from "@/lib/utils";

interface SimpleItem {
  key: string;
  label: string;
  hint?: string;
  href: string;
  /** Дополнительные строки текста под основной — для истории отмывок/зондов. */
  extraLines?: string[];
}

interface Column {
  id: string;
  title: string;
  count: number;
  items: SimpleItem[];
  groups?: { title: string; items: SimpleItem[] }[];
  action?: { label: string; href: string };
  dark?: boolean;
}

export default function ProgressLifecycle() {
  const buckets = useStore(selectProgressBuckets);
  const stained = useStore((s) => s.stained);
  const nav = useNavigate();

  const cols: Column[] = useMemo(() => {
    const sampleItem = (s: Sample): SimpleItem => ({
      key: s.id,
      // Используем «полный» ID образца — теряется привязка только если строки урезать.
      label: `S-${s.id}`,
      hint: s.species,
      href: `/журнал/образец/${s.id}`,
    });
    const prepItem = (p: Preparation): SimpleItem => ({
      key: p.id,
      // Канонический id препарата уже содержит образец (`1730.25.1.1`),
      // префикс `S-` помогает при беглом чтении.
      label: `S-${p.id}`,
      hint: `S-${p.sampleId}`,
      href: `/журнал/образец/${p.sampleId}`,
    });
    /**
     * Строка переотмытого препарата: `S-<id>  ×N  · 1: GAA + pAs1 / 2: pAs119 + pTa713`.
     * (правка 5.2)
     */
    const rehybItem = (
      p: Preparation,
      historyByPrep: Map<string, StainedPreparation[]>
    ): SimpleItem => {
      const history = historyByPrep.get(p.id) ?? [];
      const washCount = history.length;
      const histLine = history
        .map(
          (h) =>
            `${h.cycleNumber}: ${h.probes.map((pp) => pp.name).join(" + ")}`
        )
        .join(" / ");
      return {
        key: p.id,
        label: `S-${p.id}`,
        hint: washCount > 0 ? `×${washCount}` : "—",
        href: `/журнал/образец/${p.sampleId}`,
        extraLines: histLine ? [histLine] : undefined,
      };
    };

    const historyByPrep = new Map<string, StainedPreparation[]>();
    for (const p of buckets.washed.rehybReady) {
      historyByPrep.set(
        p.id,
        stained
          .filter((s) => s.preparationId === p.id)
          .sort((a, b) => a.cycleNumber - b.cycleNumber)
      );
    }

    const createdIds = buckets.awaitingWash.map((p) => p.id).join(",");
    const washedIds = buckets.washed.all.map((p) => p.id).join(",");
    const hybIds = buckets.hybridized.map((p) => p.id).join(",");

    return [
      {
        id: "matured",
        title: "Созрели",
        count: buckets.matured.length,
        items: buckets.matured.map(sampleItem),
        action: {
          label: "Создать препарат",
          href: "/журнал/новый-ивент?type=slide",
        },
      },
      {
        id: "awaiting-wash",
        title: "Ждёт отмывку",
        count: buckets.awaitingWash.length,
        items: buckets.awaitingWash.map(prepItem),
        action: {
          label: "Поставить отмывку",
          href: `/журнал/новый-ивент?type=wash&prep=${createdIds}`,
        },
      },
      {
        id: "washed",
        title: "Отмыт",
        count: buckets.washed.all.length,
        items: [],
        groups: [
          {
            title: "Первично отмыт",
            items: buckets.washed.primaryWashed.map(prepItem),
          },
          {
            title: "Переотмытые",
            items: buckets.washed.rehybReady.map((p) =>
              rehybItem(p, historyByPrep)
            ),
          },
        ],
        action: {
          label: "Поставить гибридизацию",
          href: `/журнал/новый-ивент?type=hybridization&prep=${washedIds}`,
        },
      },
      {
        id: "hybridized",
        title: "Гибридизован",
        count: buckets.hybridized.length,
        items: buckets.hybridized.map(prepItem),
        action: {
          label: "Сфотографировать",
          href: `/журнал/новый-ивент?type=photographing&prep=${hybIds}`,
        },
      },
      {
        id: "result",
        title: "Есть результат",
        count: buckets.result.length,
        items: buckets.result.slice(0, 3).map(sampleItem),
        action: { label: "Открыть полный список", href: "/журнал/образцы?status=result" },
        dark: true,
      },
    ];
  }, [buckets, stained]);

  // Утилита: построитель селектора оставлен для возможного расширения,
  // см. selectStainHistory/formatStainHistoryShort выше.
  void selectStainHistory;
  void formatStainHistoryShort;

  return (
    <section className="card card-pad">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-brand-dark" />
          <h2 className="text-[18px] font-bold text-brand-deep">
            Прогресс материала
          </h2>
        </div>
        <button
          onClick={() => nav("/журнал/образцы")}
          className="text-[12px] font-semibold text-brand-dark hover:underline"
        >
          Открыть полный список
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cols.map((c) => (
          <div
            key={c.id}
            className={classNames(
              "flex flex-col rounded-2xl border p-3 transition hover:shadow-soft",
              c.dark
                ? "border-brand-deep bg-brand-deep text-brand-cream"
                : "border-brand-line bg-white"
            )}
          >
            <div
              className={classNames(
                "text-[10.5px] font-bold uppercase tracking-wider",
                c.dark ? "text-brand-cream/70" : "text-brand-muted"
              )}
            >
              {c.title}
            </div>
            <div
              className={classNames(
                "mt-1 text-[34px] font-extrabold leading-none",
                c.dark ? "text-white" : "text-brand-deep"
              )}
            >
              {String(c.count).padStart(2, "0")}
            </div>

            {c.groups ? (
              <div className="mt-3 space-y-2">
                {c.groups.map((g, gi) => (
                  <div key={g.title}>
                    {gi > 0 && (
                      // Тонкий разделитель между «Первично отмыт» и «Переотмытые» (правка 5.2.1).
                      <div className="my-2 h-px bg-brand-line" />
                    )}
                    <div
                      className={classNames(
                        "mb-1 text-[10px] font-semibold uppercase tracking-wider",
                        c.dark ? "text-brand-cream/60" : "text-brand-muted"
                      )}
                    >
                      {g.title} · {g.items.length}
                    </div>
                    {g.items.length === 0 ? (
                      <div
                        className={classNames(
                          "rounded-md border border-dashed px-2 py-1 text-[11px]",
                          c.dark
                            ? "border-white/10 text-brand-cream/50"
                            : "border-brand-line text-brand-muted"
                        )}
                      >
                        пусто
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {g.items.map((it) => (
                          <button
                            key={it.key}
                            onClick={() => nav(it.href)}
                            className={classNames(
                              "block w-full truncate rounded-md px-2 py-1 text-left text-[11.5px] transition",
                              c.dark
                                ? "bg-white/5 text-brand-cream hover:bg-white/10"
                                : "bg-brand-mint/40 text-brand-deep hover:bg-brand-mint"
                            )}
                            title={[it.label, it.hint, ...(it.extraLines ?? [])]
                              .filter(Boolean)
                              .join(" · ")}
                          >
                            <div className="flex items-center gap-1">
                              <span className="truncate font-semibold">
                                {it.label}
                              </span>
                              {it.hint && (
                                <span className="shrink-0 text-[10.5px] text-brand-muted">
                                  · {it.hint}
                                </span>
                              )}
                            </div>
                            {it.extraLines?.map((ln, i) => (
                              <div
                                key={i}
                                className="truncate text-[10.5px] font-mono text-brand-muted"
                              >
                                {ln}
                              </div>
                            ))}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 space-y-1.5">
                {c.items.length === 0 && (
                  <div
                    className={classNames(
                      "flex items-center gap-1.5 rounded-md border border-dashed px-2 py-1.5 text-[11px]",
                      c.dark
                        ? "border-white/10 text-brand-cream/50"
                        : "border-brand-line text-brand-muted"
                    )}
                  >
                    <Sprout size={11} />
                    пока пусто
                  </div>
                )}
                {c.items.map((it) => (
                  <button
                    key={it.key}
                    onClick={() => nav(it.href)}
                    className={classNames(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12px] transition",
                      c.dark
                        ? "bg-white/5 text-brand-cream hover:bg-white/10"
                        : "bg-brand-mint/40 text-brand-deep hover:bg-brand-mint"
                    )}
                  >
                    <span className="truncate">
                      <span className="font-semibold">{it.label}</span>
                      {it.hint && (
                        <span className="ml-1 text-[10.5px] text-brand-muted">
                          · {it.hint}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {c.action && (
              <button
                onClick={() => nav(c.action!.href)}
                className={classNames(
                  "mt-3 inline-flex items-center justify-between rounded-md px-2 py-1.5 text-[11.5px] font-semibold transition",
                  c.dark
                    ? "text-brand-cream hover:bg-white/10"
                    : "text-brand-dark hover:bg-brand-cream"
                )}
              >
                {c.action.label}
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
