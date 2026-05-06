import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { useStore } from "@/lib/store";
import type { SampleKaryotype } from "@/lib/types";

interface Props {
  onClose: () => void;
}

type Scope = NonNullable<SampleKaryotype["referenceScope"]>;
type Source = NonNullable<SampleKaryotype["referenceSource"]>;

export default function AtlasMarkReferenceDialog({ onClose }: Props) {
  const sampleKaryotypes = useStore((s) => s.sampleKaryotypes);
  const toggleRef = useStore((s) => s.toggleSampleKaryotypeReference);

  const candidates = useMemo(
    () => sampleKaryotypes.filter((k) => !k.isReference),
    [sampleKaryotypes]
  );
  const [karyotypeId, setKaryotypeId] = useState<string>(
    candidates[0]?.id ?? ""
  );
  const selected = candidates.find((k) => k.id === karyotypeId);
  const [label, setLabel] = useState<string>(selected?.title ?? "");
  const [scope, setScope] = useState<Scope>("species");
  const [source, setSource] = useState<Source>("lab");
  const [notes, setNotes] = useState("");

  const onSelectKar = (id: string) => {
    setKaryotypeId(id);
    const k = candidates.find((x) => x.id === id);
    setLabel(k?.title ?? "");
  };

  const onSubmit = () => {
    if (!karyotypeId) {
      toast.error("Выберите кариотип");
      return;
    }
    toggleRef(karyotypeId, { label, scope, source, notes });
    toast.success("Кариотип помечен эталоном");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6">
      <Card className="w-full max-w-[480px] space-y-3">
        <h3 className="text-[16px] font-extrabold text-brand-deep">
          Пометить кариотип эталоном
        </h3>
        {candidates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-brand-line bg-brand-mint/40 p-3 text-[12px] text-brand-muted">
            Все доступные кариотипы уже помечены эталонами.
          </div>
        ) : (
          <>
            <Select
              label="Кариотип"
              value={karyotypeId}
              onChange={(e) => onSelectKar(e.target.value)}
            >
              {candidates.map((k) => (
                <option key={k.id} value={k.id}>
                  S-{k.sampleId} · {k.title}
                </option>
              ))}
            </Select>
            <Input
              label="Имя эталона"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Select
              label="Область"
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
            >
              <option value="species">вид</option>
              <option value="group">группа</option>
              <option value="line">линия</option>
              <option value="hypothesis">гипотеза</option>
            </Select>
            <Select
              label="Источник"
              value={source}
              onChange={(e) => setSource(e.target.value as Source)}
            >
              <option value="lab">лаборатория</option>
              <option value="literature">литература</option>
              <option value="external">внешний</option>
            </Select>
            <Textarea
              label="Заметки"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            onClick={onSubmit}
            disabled={candidates.length === 0}
          >
            Пометить эталоном
          </Button>
        </div>
      </Card>
    </div>
  );
}
