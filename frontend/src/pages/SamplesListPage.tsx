import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Plus, Filter } from "lucide-react";
import {
  selectProgressBuckets,
  useStore,
} from "@/lib/store";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { classNames, fmtDateLong } from "@/lib/utils";
import type { Sample, SampleStatus } from "@/lib/types";

const STATUS_LABEL: Record<SampleStatus, string> = {
  draft: "Черновик",
  registered: "Зарегистрирован",
  germinating: "Проращивается",
  in_work: "В работе",
  result: "Есть результат",
  archived: "Архивный",
};

const STATUS_TONE: Record<SampleStatus, "default" | "mint" | "green" | "amber" | "blue"> = {
  draft: "default",
  registered: "mint",
  germinating: "blue",
  in_work: "amber",
  result: "green",
  archived: "default",
};

const STATUS_FILTERS: Array<{
  id: "all" | SampleStatus | "result";
  label: string;
}> = [
  { id: "all", label: "Все" },
  { id: "registered", label: "Зарегистрирован" },
  { id: "germinating", label: "Проращивается" },
  { id: "in_work", label: "В работе" },
  { id: "result", label: "Есть результат" },
];

export default function SamplesListPage() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const samples = useStore((s) => s.samples);
  const events = useStore((s) => s.events);
  const buckets = useStore(selectProgressBuckets);

  const statusFilter = (params.get("status") as SampleStatus | "all" | null) ?? "all";
  const speciesFilter = params.get("species") ?? "";
  const yearFilter = params.get("year") ?? "";

  const [q, setQ] = useState("");

  const allSpecies = useMemo(
    () => Array.from(new Set(samples.map((s) => s.species))).sort(),
    [samples]
  );
  const allYears = useMemo(
    () =>
      Array.from(
        new Set(samples.map((s) => s.sowingYear).filter(Boolean) as number[])
      ).sort((a, b) => b - a),
    [samples]
  );

  const lastEventBySample = useMemo(() => {
    const map = new Map<string, { date: string; type: string; title: string }>();
    for (const ev of events) {
      const ids: string[] = [];
      if ("sampleId" in ev && (ev as { sampleId?: string }).sampleId) {
        ids.push((ev as { sampleId: string }).sampleId);
      }
      if ("sampleIds" in ev) {
        const arr = (ev as { sampleIds?: string[] }).sampleIds;
        if (arr) ids.push(...arr);
      }
      for (const id of ids) {
        const prev = map.get(id);
        if (!prev || ev.startDate > prev.date) {
          map.set(id, { date: ev.startDate, type: ev.type, title: ev.title });
        }
      }
    }
    return map;
  }, [events]);

  // Образцы, которым подходит фильтр «result» — это и `status === result`,
  // и явный `hasResult`. Чтобы корректно реагировать на ?status=result.
  const filtered = useMemo(() => {
    const ql = q.toLowerCase().trim();
    return samples.filter((s) => {
      if (statusFilter !== "all") {
        if (statusFilter === "result") {
          if (!(s.status === "result" || s.hasResult)) return false;
        } else if (s.status !== statusFilter) {
          return false;
        }
      }
      if (speciesFilter && s.species !== speciesFilter) return false;
      if (yearFilter && String(s.sowingYear ?? "") !== yearFilter) return false;
      if (ql) {
        const inText =
          s.id.toLowerCase().includes(ql) ||
          s.species.toLowerCase().includes(ql) ||
          (s.notes?.toLowerCase().includes(ql) ?? false);
        if (!inText) return false;
      }
      return true;
    });
  }, [samples, statusFilter, speciesFilter, yearFilter, q]);

  function setStatus(id: typeof statusFilter) {
    const next = new URLSearchParams(params);
    if (id === "all") next.delete("status");
    else next.set("status", id);
    setParams(next, { replace: true });
  }
  function setSpecies(v: string) {
    const next = new URLSearchParams(params);
    if (!v) next.delete("species");
    else next.set("species", v);
    setParams(next, { replace: true });
  }
  function setYear(v: string) {
    const next = new URLSearchParams(params);
    if (!v) next.delete("year");
    else next.set("year", v);
    setParams(next, { replace: true });
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Журнал", to: "/журнал" },
          { label: "Образцы" },
        ]}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-page">Образцы</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Все образцы лаборатории. Фильтруйте по статусу, виду или году
            посева, открывайте карточку образца кликом по строке.
          </p>
        </div>
        <Button onClick={() => nav("/журнал/новый-образец")}>
          <Plus size={14} />
          Новый образец
        </Button>
      </div>

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-brand-line bg-white px-3 py-2.5">
            <Search size={15} className="text-brand-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по ID, виду или примечанию…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-brand-muted/70"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[12px] text-brand-muted">
              <Filter size={13} />
              Вид:
              <select
                value={speciesFilter}
                onChange={(e) => setSpecies(e.target.value)}
                className="rounded-lg border border-brand-line bg-white px-2 py-1 text-[12.5px] text-brand-deep"
              >
                <option value="">Все</option>
                {allSpecies.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-[12px] text-brand-muted">
              Год:
              <select
                value={yearFilter}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-lg border border-brand-line bg-white px-2 py-1 text-[12.5px] text-brand-deep"
              >
                <option value="">Все</option>
                {allYears.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.id;
            const count =
              f.id === "all"
                ? samples.length
                : f.id === "result"
                  ? buckets.result.length
                  : samples.filter((s) => s.status === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setStatus(f.id)}
                className={classNames(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold transition",
                  active
                    ? "border-brand-deep bg-brand-deep text-brand-cream"
                    : "border-brand-line bg-white text-brand-muted hover:bg-brand-mint/40"
                )}
              >
                {f.label}
                <span
                  className={classNames(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    active ? "bg-white/15" : "bg-brand-cream"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="overflow-hidden rounded-xl border border-brand-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-deep text-brand-cream">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  ID
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Вид
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Поколение
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Год
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                  Последнее действие
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-brand-muted"
                  >
                    По выбранным фильтрам ничего не найдено.
                  </td>
                </tr>
              )}
              {filtered.map((s: Sample) => {
                const last = lastEventBySample.get(s.id);
                return (
                  <tr
                    key={s.id}
                    onClick={() => nav(`/журнал/образец/${s.id}`)}
                    className="cursor-pointer border-t border-brand-line transition hover:bg-brand-mint/40"
                  >
                    <td className="px-3 py-2.5 font-bold text-brand-deep">
                      S-{s.id}
                    </td>
                    <td className="px-3 py-2.5 text-brand-deep/85">
                      {s.species}
                    </td>
                    <td className="px-3 py-2.5 text-brand-deep/85">
                      {s.generation ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-brand-deep/85">
                      {s.sowingYear ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone={STATUS_TONE[s.status]}>
                        {STATUS_LABEL[s.status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-[12.5px] text-brand-muted">
                      {last
                        ? `${fmtDateLong(last.date)} · ${last.title}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[12px] text-brand-muted">
          Показано {filtered.length} из {samples.length}
        </div>
      </Card>
    </div>
  );
}
