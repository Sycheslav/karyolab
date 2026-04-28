import Input from "@/components/ui/Input";

interface Props {
  fridge: string;
  box: string;
  onFridge: (v: string) => void;
  onBox: (v: string) => void;
  fridgeLabel?: string;
  boxLabel?: string;
}

export default function StorageFields({
  fridge,
  box,
  onFridge,
  onBox,
  fridgeLabel = "Холодильник",
  boxLabel = "Коробка",
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Input
        label={fridgeLabel}
        placeholder="напр. F-04"
        value={fridge}
        onChange={(e) => onFridge(e.target.value)}
      />
      <Input
        label={boxLabel}
        placeholder="напр. BX-22"
        value={box}
        onChange={(e) => onBox(e.target.value)}
      />
    </div>
  );
}
