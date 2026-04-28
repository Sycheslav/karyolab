import { ChevronRight, BarChart3, Sprout } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { selectLastStain, selectProgressBuckets, useStore } from "@/lib/store";
import { useMemo } from "react";
import type { Preparation, Sample } from "@/lib/types";
import { classNames } from "@/lib/utils";

interface SimpleItem {
  key: string;
  label: string;
  hint?: string;
  href: string;
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
      label: `S-${s.id}`,
      hint: s.species,
      href: `/журнал/образец/${s.id}`,
    });
    const prepItem = (p: Preparation): SimpleItem => ({
      key: p.id,
      label: `${p.id}`,
      hint: `S-${p.sampleId}`,
      href: `/журнал/образец/${p.sampleId}`,
    });
    const rehybItem = (p: Preparation): SimpleItem => {
      const last = stained
        .filter((s) => s.preparationId === p.id)
        .sort((a, b) => b.cycleNumber - a.cycleNumber)[0];
      const probes = last?.probes.map((pp) => pp.name).join(" + ") ?? "—";
      return {
        key: p.id,
        label: `S-${p.sampleId}`,
        hint: `${p.id} · ${probes}`,
        href: `/журнал/образец/${p.sampleId}`,
      };
    };

    const createdIds = buckets.created.map((p) => p.id).join(",");
    const washedIds = [...buckets.primaryWashed, ...buckets.postHybWashed]
      .map((p) => p.id)
      .join(",");
    const hybIds = buckets.hybridized.map((p) => p.id).join(",");

    return [
      {
        id: "mature",
        title: "Созрели · нет препарата",
        count: buckets.matureNoPrep.length,
        items: buckets.matureNoPrep.slice(0, 3).map(sampleItem),
        action: {
          label: "Создать препарат",
          href: "/журнал/новый-ивент?type=slide",
        },
      },
      {
        id: "created",
        title: "Создан",
        count: buckets.created.length,
        items: buckets.created.slice(0, 3).map(prepItem),
        action: {
          label: "Поставить отмывку",
          href: `/журнал/новый-ивент?type=wash&prep=${createdIds}`,
        },
      },
      {
        id: "washed",
        title: "Отмыт",
        count: buckets.primaryWashed.length + buckets.postHybWashed.length,
        items: [],
        groups: [
          {
            title: "Первично отмыт",
            items: buckets.primaryWashed.slice(0, 2).map(prepItem),
          },
          {
            title: "Отмыт от гибридизации",
            items: buckets.postHybWashed.slice(0, 2).map(rehybItem),
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
        items: buckets.hybridized.slice(0, 3).map(prepItem),
        action: {
          label: "Сфотографировать",
          href: `/журнал/новый-ивент?type=photographing&prep=${hybIds}`,
        },
      },
      {
        id: "photographed",
        title: "Сфотографирован",
        count: buckets.photographed.length,
        items: buckets.photographed.slice(0, 3).map(prepItem),
        action: {
          label: "Открыть импорт фото",
          href: (() => {
            const first = buckets.photographed[0];
            if (!first) return "/кариотип/импорт";
            const lastStn = stained
              .filter((s) => s.preparationId === first.id)
              .sort((a, b) => b.cycleNumber - a.cycleNumber)[0];
            const qs = new URLSearchParams();
            qs.set("sampleId", first.sampleId);
            qs.set("prepId", first.id);
            if (lastStn) qs.set("stainedId", lastStn.id);
            return `/кариотип/импорт?${qs.toString()}`;
          })(),
        },
      },
      {
        id: "result",
        title: "Есть результат",
        count: buckets.result.length,
        items: buckets.result.slice(0, 3).map(sampleItem),
        action: { label: "Открыть все", href: "/журнал" },
        dark: true,
      },
    ];
  }, [buckets, stained]);

  return (
    <section className="card card-pad">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-brand-dark" />
          <h2 className="text-[18px] font-bold text-brand-deep">
            Прогресс по стадиям
          </h2>
          <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-brand-dark">
            Sample Progress Lifecycle
          </span>
        </div>
        <button
          onClick={() => nav("/журнал")}
          className="text-[12px] font-semibold text-brand-dark hover:underline"
        >
          Открыть полный список
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
              <div className="mt-3 space-y-3">
                {c.groups.map((g) => (
                  <div key={g.title}>
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
                            title={it.hint}
                          >
                            <span className="font-semibold">{it.label}</span>
                            {it.hint && (
                              <span className="ml-1 text-[10.5px] text-brand-muted">
                                · {it.hint}
                              </span>
                            )}
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
