import { useLanguage } from "@/i18n/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";

export function Legend() {
  const { t } = useLanguage();
  return (
    <Card className="card-hover">
      <CardHeader className="pb-2 px-5 pt-4">
        <CardTitle className="text-sm font-semibold">{t("dentalChart.legend")}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[key] }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}