import { Banknote, Users, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";
import { PageStatCard } from "@/components/page-stat-card";

interface SummaryCardsProps {
  totalDebtors: number;
  overdueCount: number;
  totalBalance: string;
}

export function SummaryCards({ totalDebtors, overdueCount, totalBalance }: SummaryCardsProps) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <PageStatCard icon={Users} label={t("debt.total-debtors")} value={totalDebtors} color="bg-gradient-to-br from-sky-500/10 to-sky-500/20 text-sky-600" />
      <PageStatCard icon={AlertTriangle} label={t("debt.overdue-patients", { count: overdueCount })} value={overdueCount} color="bg-gradient-to-br from-red-500/10 to-red-500/20 text-red-500" />
      <PageStatCard icon={Banknote} label={t("debt.total-balance")} value={totalBalance} color="bg-gradient-to-br from-amber-500/10 to-amber-500/20 text-amber-500" />
    </div>
  );
}