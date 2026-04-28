import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import SampleAutocomplete from "./SampleAutocomplete";
import { Beaker, BookText, Dna, Info } from "lucide-react";
import { classNames } from "@/lib/utils";

const GENERATION_SUGGESTIONS = [
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "BC1",
  "BC2",
  "BC3",
];

export default function SampleForm() {
  const nav = useNavigate();
  const addSample = useStore((s) => s.addSample);
  const samples = useStore((s) => s.samples);

  const [idType, setIdType] = useState<"numeric" | "alphabetic">("numeric");
  const [id, setId] = useState("");
  const [species, setSpecies] = useState("Triticum aestivum");
  const [mother, setMother] = useState("");
  const [father, setFather] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [generation, setGeneration] = useState("");
  const [genOpen, setGenOpen] = useState(false);
  const generationWrapRef = useRef<HTMLDivElement | null>(null);
  const [notes, setNotes] = useState("");
  const [conflict, setConflict] = useState<string | null>(null);

  useEffect(() => {
    if (!genOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!generationWrapRef.current?.contains(e.target as Node)) setGenOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [genOpen]);

  function checkAndCreate(asDraft = false) {
    const trimmed = id.trim();
    if (!trimmed) {
      toast.error("Укажите ID или название образца");
      setConflict(null);
      return;
    }
    const exists = samples.find((s) => s.id === trimmed);
    if (exists) {
      setConflict(trimmed);
      return;
    }
    addSample({
      id: trimmed,
      species,
      mother: mother || undefined,
      father: father || undefined,
      sowingYear: year ? Number(year) : undefined,
      generation: generation || undefined,
      notes: notes || undefined,
      status: asDraft ? "draft" : "registered",
      createdAt: new Date().toISOString(),
    });
    toast.success(asDraft ? "Черновик сохранён" : "Образец создан");
    nav(`/журнал/образец/${trimmed}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Breadcrumbs
        items={[
          { label: "Журнал", to: "/журнал" },
          { label: "Новый образец" },
        ]}
      />

      <h1 className="heading-page">Регистрация образца</h1>
      <p className="mt-1 text-sm text-brand-muted">
        Образец — центральная сущность журнала. Анкету можно заполнить позже:
        достаточно ID, чтобы не потерять материал. Изменение ID после
        регистрации опасно: пострадают связи и история.
      </p>

      {conflict && (
        <Card className="mt-4 border-brand-warn bg-amber-50">
          <div className="flex items-start gap-3 text-amber-900">
            <Info size={16} className="mt-0.5" />
            <div className="flex-1 text-[13px]">
              <div className="font-semibold">
                Образец S-{conflict} уже существует
              </div>
              <p className="mt-1 text-amber-900/80">
                Выберите дальнейший шаг — открыть карточку или поменять ID.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nav(`/журнал/образец/${conflict}`)}
                >
                  Открыть существующий
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConflict(null)}
                >
                  Поменять ID
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 space-y-5">
        <Card>
          <SectionTitle
            icon={<Dna size={16} />}
            title="Идентификация"
            right={
              <div className="inline-flex rounded-lg border border-brand-line bg-brand-mint p-0.5">
                {(["numeric", "alphabetic"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setIdType(k)}
                    className={classNames(
                      "rounded-md px-3 py-1 text-[11.5px] font-semibold uppercase tracking-wider",
                      idType === k
                        ? "bg-white text-brand-deep shadow-card"
                        : "text-brand-muted"
                    )}
                  >
                    {k === "numeric" ? "Номерной" : "Буквенный"}
                  </button>
                ))}
              </div>
            }
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="ID или название образца"
              placeholder={
                idType === "numeric" ? "напр. 1818.25" : "напр. добрыня"
              }
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                if (conflict) setConflict(null);
              }}
            />
            <Input
              label="Вид"
              placeholder="напр. T. aestivum"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={<Beaker size={16} />} title="Происхождение" />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/*
              Заказчик: «Мать» и «Отец» — это образцы (правка 6.2). Если такого
              ID нет — создаётся пустой образец-черновик.
            */}
            <SampleAutocomplete
              label="Мать (образец)"
              placeholder="ID матери, начните вводить…"
              value={mother}
              onChange={setMother}
              excludeIds={id ? [id.trim()] : []}
            />
            <SampleAutocomplete
              label="Отец (образец)"
              placeholder="ID отца, начните вводить…"
              value={father}
              onChange={setFather}
              excludeIds={id ? [id.trim()] : []}
            />
            <Input
              label="Год посева / получения"
              placeholder="YYYY"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              inputMode="numeric"
            />
            {/*
              Заказчик: «Поколение» — свободный ввод (`F7`, `BC3` и т. п.) +
              комбобокс с подсказками (правка 6.1).
            */}
            <div ref={generationWrapRef} className="relative block w-full">
              <span className="label-cap mb-1.5 block">Поколение</span>
              <span className="field flex items-center gap-2 px-3.5 py-2.5">
                <input
                  value={generation}
                  onChange={(e) => {
                    setGeneration(e.target.value);
                    setGenOpen(true);
                  }}
                  onFocus={() => setGenOpen(true)}
                  placeholder="например, F7 или BC3"
                  className="w-full bg-transparent text-sm text-brand-deep outline-none placeholder:text-brand-muted/70"
                />
              </span>
              {genOpen && (
                <div className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-brand-line bg-white shadow-soft">
                  <div className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-brand-muted">
                    Подсказки
                  </div>
                  <div className="grid grid-cols-5 gap-1 p-1.5">
                    {GENERATION_SUGGESTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setGeneration(g);
                          setGenOpen(false);
                        }}
                        className={classNames(
                          "rounded-md border px-2 py-1 text-[12px] font-semibold transition",
                          generation === g
                            ? "border-brand-deep bg-brand-deep text-brand-cream"
                            : "border-brand-line bg-white text-brand-deep hover:bg-brand-mint"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle
            icon={<BookText size={16} />}
            title="Заметки и наблюдения"
          />
          <div className="mt-4">
            <Textarea
              placeholder="Опишите начальные наблюдения, особенности линии, условия эксперимента…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
            />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => checkAndCreate(true)}>
            Сохранить черновик
          </Button>
          <Button onClick={() => checkAndCreate(false)}>
            Создать образец
          </Button>
        </div>
      </div>
    </div>
  );
}
