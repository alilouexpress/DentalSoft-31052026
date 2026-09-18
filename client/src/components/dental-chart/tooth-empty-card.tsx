import { useLanguage } from "@/i18n/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function ToothEmptyCard() {
  const { t } = useLanguage();

  return (
    <Card className="card-hover">
      <CardContent className="flex flex-col items-center gap-3 py-12">
        <Activity className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          {t("dentalChart.selectTooth")}
        </p>
      </CardContent>
    </Card>
  );
}