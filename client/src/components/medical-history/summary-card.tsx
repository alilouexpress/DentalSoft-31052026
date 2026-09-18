import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/language-context";
import { Stethoscope, ChevronDown, ChevronUp } from "lucide-react";
import { severityDot } from "./constants";
import { CategoryBadge } from "./badges";

export interface SummaryGroup {
  category: string;
  items: { value: string; severity?: string; isCurrent: boolean }[];
}

interface Props {
  summary: SummaryGroup[];
  expanded: boolean;
  onToggle: () => void;
}

export default function MedicalHistorySummary({ summary, expanded, onToggle }: Props) {
  const { t } = useLanguage();
  return (
    <Card className="card-hover">
      <CardHeader className="pb-3 px-5 pt-5 cursor-pointer select-none" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            {t("medicalHistory.summary")}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Effacer la recherche">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="px-5 pb-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {summary.map((group) => (
              <div key={group.category} className="p-3.5 rounded-xl border bg-card/50">
                <div className="flex items-center gap-2 mb-2">
                  <CategoryBadge category={group.category} />
                </div>
                <div className="space-y-1.5">
                  {group.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${severityDot[item.severity || "none"]}`} />
                      <span className="text-foreground">{item.value}</span>
                      {item.isCurrent && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-[10px] px-1.5 py-0">
                          {t("medicalHistory.current")}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}