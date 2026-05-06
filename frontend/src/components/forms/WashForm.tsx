import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Database, ClipboardList, Info } from "lucide-react";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import StorageFields from "./StorageFields";
import PreparationTable from "./PreparationTable";
import Textarea from "@/components/ui/Textarea";
import { defaultBatchName, isoDay } from "@/lib/utils";

interface Props {
  defaultDate?: string;
}

export default function WashForm({ defaultDate }: Props) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const createWashEvent = useStore((s) => s.createWashEvent);
  const preparations = useStore((s) => s.preparations);
  const plants = useStore((s) => s.plants);
  const events = useStore((s) => s.events);

  const [globalFridge, setGlobalFridge] = useState("");
  const [globalBox, setGlobalBox] = useState("");
  const [search, setSearch] = useState("");
  const [protocolNotes, setProtocolNotes] = useState("");
  const [date, setDate] = useState(
    defaultDate ?? new Date().toISOString().slice(0, 10)
  );
  // Дефолт `WP-{YYYY-MM-DD}` (правка 14). Суффикс `-N` появляется, если в
  // этот день уже зафиксирована хотя бы одна предгибридизационная отмывка.
  const sameDayCount = useMemo(
    () =>
      events.filter((e) => e.type === "wash" && isoDay(e.startDate) === date)
        .length,
    [events, date]
  );
  const [batchName, setBatchName] = useState(() =>
    defaultBatchName("wash", date, sameDayCount)
  );

  // Только препараты, которым нужна именно предгибридизационная отмывка:
  // созданные препараты без отмывки. По 04_ивенты.md / 06_экраны.
  const eligible = useMemo(
    () => preparations.filter((p) => p.status === "created"),
    [preparations]
  );

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [overrides, setOverrides] = useState<
    Record<string, { fridge: string; box: string }>
  >({});

  // Поддержка предвыбора через ?prep=ID,ID,...
  useEffect(() => {
    const pre = params.get("prep");
    if (!pre) return;
    const ids = pre.split(",").filter(Boolean);
    if (ids.length === 0) return;
    setSelected((s) => {
      const next = { ...s };
      for (const id of ids) {
        if (eligible.some((p) => p.id === id)) next[id] = true;
      }
      return next;
    });
  }, [params, eligible]);

  const rows = eligible.map((prep) => ({
    prep,
    selected: !!selected[prep.id],
  }));

  function applyToSelected() {
    if (!globalFridge && !globalBox) {
      toast("Заполните холодильник и/или коробку");
      return;
    }
    const o = { ...overrides };
    let count = 0;
    for (const id of Object.keys(selected).filter((k) => selected[k])) {
      o[id] = { fridge: globalFridge, box: globalBox };
      count++;
    }
    setOverrides(o);
    toast.success(`Хранение применено к ${count} препаратам`);
  }

  function save() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) {
      toast.error("Выберите препараты для отмывки");
      return;
    }
    const { eventId } = createWashEvent({
      preparationIds: ids,
      kind: "pre",
      newFridge: globalFridge,
      newBox: globalBox,
      protocolNotes,
      operator: "Лаборант",
      comment: batchName,
      startDate: `${date}T11:00:00`,
    });
    toast.success("Ивент сохранён");
    nav(`/журнал/ивент/${eventId}`);
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const sourceLabel = (p: { source: { kind: "plant" | "mix"; plantId?: string } }) =>
    p.source.kind === "mix"
      ? "Смесь растений"
      : plants.find((pl) => pl.id === p.source.plantId)?.name ??
        p.source.plantId ??
        "—";

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div>
          <h1 className="heading-page">Предгибридизационная отмывка</h1>
          <p className="mt-1 text-sm text-brand-muted">
            В список попадают только созданные препараты, которым нужна
            предгибридизационная отмывка. Постгибридизационная отмывка
            фиксируется внутри ивента «Фотографирование».
          </p>
        </div>

        <Card accent>
          <SectionTitle
            icon={<Database size={16} />}
            title="Массовое обновление хранения"
            hint="Назначить новое место хранения для всех выбранных препаратов сразу."
          />
          <div className="mt-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <StorageFields
              fridge={globalFridge}
              box={globalBox}
              onFridge={setGlobalFridge}
              onBox={setGlobalBox}
              fridgeLabel="Холодильник"
              boxLabel="Коробка"
            />
            <Button onClick={applyToSelected} disabled={selectedCount === 0}>
              Применить к выбранным
            </Button>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-brand-line bg-white px-3 py-2">
              <Search size={14} className="text-brand-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по ID препарата или образца…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-brand-muted/70"
              />
            </div>
          </div>

          {eligible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-brand-line bg-brand-mint/40 p-6 text-center text-sm text-brand-muted">
              Нет препаратов, которым нужна предгибридизационная отмывка.
              Сначала создайте новый препарат.
            </div>
          ) : (
            <PreparationTable
              rows={rows}
              onToggle={(id) =>
                setSelected((s) => ({ ...s, [id]: !s[id] }))
              }
              onToggleAll={(checked) => {
                const ns: Record<string, boolean> = {};
                if (checked) for (const r of rows) ns[r.prep.id] = true;
                setSelected(ns);
              }}
              showStorage
              storageOverrides={overrides}
              onStorageChange={(id, fridge, box) =>
                setOverrides((o) => ({ ...o, [id]: { fridge, box } }))
              }
              search={search}
              sourceLabel={sourceLabel}
            />
          )}
        </Card>

        <Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block w-full">
              <span className="label-cap mb-1.5 block">Название партии</span>
              <input
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="field"
              />
            </label>
            <label className="block w-full">
              <span className="label-cap mb-1.5 block">Дата проведения</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="field"
              />
            </label>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <SectionTitle
            icon={<ClipboardList size={16} />}
            title="Сводка партии"
            hint="Сводка выбранных для отмывки препаратов."
          />
          <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-mint/40 px-3 py-2.5">
            <span className="text-[12.5px] text-brand-muted">
              Выбрано препаратов
            </span>
            <span className="text-[16px] font-extrabold text-brand-deep">
              {String(selectedCount).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-4">
            <Textarea
              label="Протокольная заметка"
              placeholder="Параметры буфера, температура, время…"
              value={protocolNotes}
              onChange={(e) => setProtocolNotes(e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-2 text-[12.5px] text-brand-deep">
            <Info size={14} className="mt-0.5 text-brand-dark" />
            <span>
              После сохранения у выбранных препаратов появится статус
              «предгибридизационно отмыт». В панели «Что изменилось» будет
              ссылка на форму гибридизации.
            </span>
          </div>
        </Card>

        <Button onClick={save} className="w-full" size="lg">
          Сохранить ивент
        </Button>
      </div>
    </div>
  );
}
