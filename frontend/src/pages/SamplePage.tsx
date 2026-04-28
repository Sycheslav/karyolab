import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import SampleCard from "@/components/cards/SampleCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function SamplePage() {
  const { id } = useParams();
  const sample = useStore((s) => s.samples.find((sm) => sm.id === id));
  const nav = useNavigate();

  if (!sample) {
    return (
      <Card>
        <h2 className="text-lg font-bold text-brand-deep">
          Образец не найден
        </h2>
        <Button className="mt-3" onClick={() => nav("/журнал")}>
          В журнал
        </Button>
      </Card>
    );
  }

  return <SampleCard sample={sample} />;
}
