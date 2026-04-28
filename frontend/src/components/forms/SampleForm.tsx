import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Beaker, BookText, Dna, Info } from "lucide-react";
import { classNames } from "@/lib/utils";

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
  const [notes, setNotes] = useState("");
  const [conflict, setConflict] = useState<string | null>(null);

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
            <Input
              label="Мать"
              placeholder="ID или имя матери"
              value={mother}
              onChange={(e) => setMother(e.target.value)}
            />
            <Input
              label="Отец"
              placeholder="ID или имя отца"
              value={father}
              onChange={(e) => setFather(e.target.value)}
            />
            <Input
              label="Год посева / получения"
              placeholder="YYYY"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              inputMode="numeric"
            />
            <Select
              label="Поколение"
              value={generation}
              onChange={(e) => setGeneration(e.target.value)}
            >
              <option value="">—</option>
              {["F1", "F2", "F3", "F4", "BC1", "BC2"].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
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
