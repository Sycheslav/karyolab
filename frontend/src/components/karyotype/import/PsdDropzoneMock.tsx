import { useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FileUp, FileText, RefreshCw } from "lucide-react";
import { classNames } from "@/lib/utils";

interface Props {
  fileName: string;
  status: string;
  onRead: () => void;
}

export default function PsdDropzoneMock({ fileName, status, onRead }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);

  return (
    <Card>
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-brand-dark" />
        <h3 className="text-[14px] font-bold text-brand-deep">PSD-файл</h3>
      </div>
      <p className="mt-1 text-[12px] text-brand-muted">
        Перетащите PSD сюда или выберите файл. Это mock — реальное чтение слоёв
        будет на бэкенде.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          onRead();
        }}
        onClick={() => inputRef.current?.click()}
        className={classNames(
          "mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition",
          hover
            ? "border-brand bg-brand-cream"
            : "border-brand-line bg-brand-mint/40 hover:bg-brand-mint"
        )}
      >
        <FileUp size={28} className="text-brand-dark" />
        <div className="text-[13px] font-semibold text-brand-deep">
          Перетащите PSD или нажмите для выбора
        </div>
        <div className="rounded-md bg-white px-2.5 py-1 text-[11.5px] font-mono text-brand-deep/80 shadow-card">
          {fileName}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".psd"
          className="hidden"
          onChange={() => onRead()}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[12px] text-brand-muted">
          Программа определит зонды и координаты по имени файла.
        </span>
        <Button
          size="sm"
          variant={status === "empty" ? "primary" : "outline"}
          onClick={onRead}
        >
          <RefreshCw size={13} />
          {status === "empty" ? "Прочитать demo PSD" : "Прочитать заново"}
        </Button>
      </div>
    </Card>
  );
}
