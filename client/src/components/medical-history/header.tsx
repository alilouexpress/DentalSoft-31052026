import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language-context";
import { Plus, ArrowLeft } from "lucide-react";

interface Props {
  patientName: string | undefined;
  onAdd: () => void;
  onBatch: () => void;
}

export default function MedicalHistoryHeader({ patientName, onAdd, onBatch }: Props) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/patients">
          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Filtrer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("medicalHistory.title")}
            </h1>
            {patientName && (
              <span className="text-lg text-muted-foreground font-normal">
                — {patientName}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">{t("medicalHistory.subtitle")}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-1.5 h-9" onClick={onBatch}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("medicalHistory.batch")}</span>
        </Button>
        <Button className="gap-1.5 h-9" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("medicalHistory.add")}</span>
        </Button>
      </div>
    </div>
  );
}