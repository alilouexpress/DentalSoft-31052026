import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/language-context";
import { ClipboardList } from "lucide-react";
import { severityColor, severityDot, categoryIcons } from "./constants";

export function SeverityBadge({ severity }: { severity: string | null | undefined }) {
  const { t } = useLanguage();
  const s = severity || "none";
  const key = s in severityColor ? s : "none";
  return (
    <Badge variant="outline" className={severityColor[key]}>
      <span className={`h-1.5 w-1.5 rounded-full me-1.5 ${severityDot[key]}`} />
      {t(`medicalHistory.${key}`)}
    </Badge>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const { t } = useLanguage();
  const colors: Record<string, string> = {
    allergies: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    diabetes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    hypertension: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    pregnancy: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800",
    medications: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    contraindications: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    other: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  };
  const Icon = categoryIcons[category] || ClipboardList;
  return (
    <Badge variant="outline" className={colors[category] || colors.other}>
      <Icon className="h-3 w-3 me-1" />
      {t(`medicalHistory.${category}`)}
    </Badge>
  );
}