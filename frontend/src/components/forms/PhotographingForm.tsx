import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertOctagon, Camera, Clock, Info, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";
import Toggle from "@/components/ui/Toggle";
import StorageFields from "./StorageFields";
import { classNames } from "@/lib/utils";
import type { StainFate } from "@/lib/types";

interface Props {
  defaultDate?: string;
}

export default function PhotographingForm({ defaultDate }: Props) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const createPhotographingEvent = useStore(
    (s) => s.createPhotographingEvent
  );
  const stained = useStore((s) => s.stained);
  const preps = useStore((s) => s.preparations);

  // Только активные окрашенные препараты — ещё не сфотографированные.
  const eligible = useMemo(
    () => stained.filter((s) => s.status === "created"),
    [stained]
  );

  const [search, setSearch] = useState("");
  const [batchName, setBatchName] = useState(
    `Сессия ${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`
  );
  const [date, setDate] = useState(
    defaultDate ?? new Date().toISOString().slice(0, 10)
  );
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [decisions, setDecisions] = useState<
    Record<string, { fate: StainFate; fridge: string; box: string }>
  >({});

  // Поддержка предвыбора ?prep=ID,... — пытаемся найти окрашенные препараты
  // по preparationId.
  useEffect(() => {
    const pre = params.get("prep");
    if (!pre) return;
    const ids = pre.split(",").filter(Boolean);
    setSelected((s) => {
      const next = { ...s };
      for (const stn of eligible) {
        if (ids.includes(stn.preparationId)) next[stn.id] = true;
      }
      return next;
    });
  }, [params, eligible]);

  const channelClass = (c: "red" | "green" | "blue") =>
    c === "red"
      ? "bg-brand-danger/15 text-brand-danger border-brand-danger/30"
      : c === "green"
        ? "bg-brand-accent/30 text-brand-dark border-brand-accent/50"
        : "bg-blue-100 text-blue-800 border-blue-200";

  const filtered = eligible.filter(
    (e) =>
      !search ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.preparationId.toLowerCase().includes(search.toLowerCase())
  );

  const queue = filtered.filter((e) => selected[e.id]);
  const washCount = queue.filter(
    (e) => (decisions[e.id]?.fate ?? "washed") === "washed"
  ).length;
  const discardCount = queue.filter(
    (e) => decisions[e.id]?.fate === "discarded"
  ).length;
  const undecidedCount = queue.filter(
    (e) => decisions[e.id]?.fate === "undecided"
  ).length;

  function save() {
    if (queue.length === 0) {
      toast.error("Выберите окрашенные препараты для фотографирования");
      return;
    }
    // Проверим, что у всех «отмыт» есть новое место хранения.
    // Для «решу позже» новое место хранения не требуется — оно остаётся текущим.
    const missing = queue
      .filter((e) => (decisions[e.id]?.fate ?? "washed") === "washed")
      .filter((e) => !(decisions[e.id]?.fridge && decisions[e.id]?.box));
    if (missing.length > 0) {
      toast.error(
        "Укажите новое место хранения для постгибридизационно отмытых"
      );
      return;
    }
    const { eventId } = createPhotographingEvent({
      decisions: queue.map((e) => ({
        stainedId: e.id,
        fate: decisions[e.id]?.fate ?? "washed",
        newFridge: decisions[e.id]?.fridge,
        newBox: decisions[e.id]?.box,
      })),
      operator: "Лаборант",
      comment: batchName,
      startDate: `${date}T09:15:00`,
      endDate: `${date}T11:45:00`,
    });
    toast.success("Ивент сохранён");
    nav(`/журнал/ивент/${eventId}`);
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div>
          <h1 className="heading-page">Фотографирование</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Фотографирование закрывает текущую окраску. Решите судьбу каждого
            физического препарата прямо здесь — постгибридизационная отмывка
            фиксируется внутри этого ивента, а не отдельным ивентом отмывки.
          </p>
        </div>

        <Card>
          <SectionTitle
            icon={<Camera size={16} />}
            title="Активные окрашенные препараты"
            hint="Выберите окраски для фотографирования."
            right={
              <div className="flex items-center gap-2 rounded-xl border border-brand-line bg-white px-3 py-2">
                <Search size={14} className="text-brand-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по ID…"
                  className="w-44 bg-transparent text-sm outline-none placeholder:text-brand-muted/70"
                />
              </div>
            }
          />

          {eligible.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-brand-line bg-brand-mint/40 p-6 text-center text-sm text-brand-muted">
              Нет активных окрашенных препаратов. Сначала проведите гибридизацию.
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-brand-line">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-deep text-brand-cream">
                    <th className="w-10 px-3 py-2.5 text-left">#</th>
                    <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
                      ID окраски
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
                      Препарат · Образец
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
                      Дата гибридизации
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
                      Зонды
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wider">
                      Цикл
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => {
                    const prep = preps.find((p) => p.id === e.preparationId);
                    return (
                      <tr
                        key={e.id}
                        className={classNames(
                          "border-t border-brand-line transition",
                          selected[e.id]
                            ? "bg-brand-cream/60"
                            : "bg-white hover:bg-brand-mint/40"
                        )}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={!!selected[e.id]}
                            onChange={() =>
                              setSelected((s) => ({ ...s, [e.id]: !s[e.id] }))
                            }
                            className="accent-brand-accent"
                            aria-label={`Выбрать ${e.id}`}
                          />
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-brand-deep">
                          {e.id}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-semibold">{e.preparationId}</span>
                          <span className="ml-1 text-brand-muted">
                            · S-{prep?.sampleId ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-brand-muted">
                          {e.hybridizationDate}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {e.probes.map((pp, i) => (
                              <span
                                key={i}
                                className={classNames(
                                  "rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase",
                                  channelClass(pp.channel)
                                )}
                              >
                                {pp.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge tone="default">Окраска {e.cycleNumber}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle
            title="Очередь обработки"
            hint="Для каждой окраски решите судьбу физического препарата."
          />
          <div className="mt-3 space-y-3">
            {queue.length === 0 && (
              <div className="rounded-xl border border-dashed border-brand-line bg-brand-mint/40 p-5 text-center text-[13px] text-brand-muted">
                Очередь пуста. Отметьте окраски в таблице выше.
              </div>
            )}
            {queue.map((e) => {
              const dec = decisions[e.id] ?? {
                fate: "washed" as StainFate,
                fridge: "",
                box: "",
              };
              const isDiscard = dec.fate === "discarded";
              const isUndecided = dec.fate === "undecided";
              return (
                <div
                  key={e.id}
                  className={classNames(
                    "rounded-xl border bg-white p-4 transition",
                    isDiscard
                      ? "border-brand-danger/40 bg-brand-danger/5"
                      : isUndecided
                        ? "border-amber-300/60 bg-amber-50/50"
                        : "border-brand-line"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-brand-deep">
                        {e.id}
                        <span className="ml-2 text-[11.5px] font-medium text-brand-muted">
                          {e.probes.map((p) => p.name).join(" + ")}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11.5px] text-brand-muted">
                        Окраска {e.cycleNumber} · {e.preparationId}
                      </div>
                    </div>
                    <Toggle
                      value={dec.fate}
                      onChange={(v) =>
                        setDecisions((d) => ({
                          ...d,
                          [e.id]: { ...dec, fate: v as StainFate },
                        }))
                      }
                      variant="danger"
                      options={[
                        { id: "washed", label: "Переотмыт" },
                        { id: "undecided", label: "Решу позже" },
                        { id: "discarded", label: "Выброшен" },
                      ]}
                    />
                  </div>

                  {isDiscard ? (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-3 py-2.5 text-brand-danger">
                      <AlertOctagon size={15} className="mt-0.5" />
                      <div className="text-[12.5px]">
                        <div className="font-bold">Стекло будет выброшено</div>
                        <div className="text-brand-danger/85">
                          Препарат больше не участвует в работе. Изменить решение
                          можно до сохранения ивента.
                        </div>
                      </div>
                    </div>
                  ) : isUndecided ? (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-amber-900">
                      <Clock size={15} className="mt-0.5" />
                      <div className="text-[12.5px]">
                        <div className="font-bold">
                          Сфотографирован, судьба не решена
                        </div>
                        <div className="text-amber-900/80">
                          Стекло остаётся в текущем месте хранения. Решение
                          («переотмыт» или «выброшен») можно будет принять
                          позже из карточки препарата без нового ивента.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="mb-2 flex items-center gap-2 text-[11.5px] text-brand-deep">
                        <Info size={13} className="text-brand-dark" />
                        Стекло станет «переотмыт» (готов к повторной
                        гибридизации). Укажите новое место хранения.
                      </div>
                      <StorageFields
                        fridge={dec.fridge}
                        box={dec.box}
                        onFridge={(v) =>
                          setDecisions((d) => ({
                            ...d,
                            [e.id]: { ...dec, fridge: v },
                          }))
                        }
                        onBox={(v) =>
                          setDecisions((d) => ({
                            ...d,
                            [e.id]: { ...dec, box: v },
                          }))
                        }
                        fridgeLabel="Холодильник (новое место)"
                        boxLabel="Коробка (новое место)"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card accent>
          <h3 className="text-[15px] font-bold text-brand-deep">Сводка ивента</h3>
          <div className="mt-3 space-y-3">
            <Input
              label="Название сессии"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
            <Input
              label="Дата фотографирования"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <div className="space-y-1.5 border-t border-brand-line pt-3 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Выбрано окрашиваний</span>
                <span className="font-bold text-brand-deep">
                  {String(queue.length).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Переотмыты</span>
                <span className="font-bold text-brand-deep">
                  {String(washCount).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Решу позже</span>
                <span className="font-bold text-amber-700">
                  {String(undecidedCount).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">К выбрасыванию</span>
                <span className="font-bold text-brand-danger">
                  {String(discardCount).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Button onClick={save} variant="dark" size="lg">
              Сохранить ивент
            </Button>
            <button
              type="button"
              onClick={() => history.back()}
              className="text-[12.5px] font-semibold text-brand-muted hover:text-brand-deep"
            >
              Отмена
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
