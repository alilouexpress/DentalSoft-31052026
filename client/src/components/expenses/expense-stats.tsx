import { PageStatCard } from "@/components/page-stat-card";
import { useLanguage } from "@/i18n/language-context";
import { Banknote, Receipt, TrendingDown, TrendingUp } from "lucide-react";

interface ExpenseStatsProps {
  totalExpenses: number;
  fixedTotal: number;
  variableTotal: number;
  profit: number;
  isLoading: boolean;
}

export function ExpenseStats({ totalExpenses, fixedTotal, variableTotal, profit, isLoading }: ExpenseStatsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <PageStatCard
        icon={Banknote}
        label={t("expenses.total")}
        value={`${totalExpenses.toLocaleString()} DA`}
        color="bg-gradient-to-br from-sky-500/10 to-sky-500/20 text-sky-600"
        premium
        loading={isLoading}
      />
      <PageStatCard
        icon={Receipt}
        label={t("expenses.fixed")}
        value={`${fixedTotal.toLocaleString()} DA`}
        color="bg-gradient-to-br from-blue-500/10 to-blue-500/20 text-blue-600"
        loading={isLoading}
      />
      <PageStatCard
        icon={TrendingUp}
        label={t("expenses.variable")}
        value={`${variableTotal.toLocaleString()} DA`}
        color="bg-gradient-to-br from-orange-500/10 to-orange-500/20 text-orange-600"
        loading={isLoading}
      />
      <PageStatCard
        icon={profit >= 0 ? TrendingUp : TrendingDown}
        label={t("expenses.profit")}
        value={`${profit.toLocaleString()} DA`}
        color={profit >= 0 ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 text-emerald-600" : "bg-gradient-to-br from-red-500/10 to-red-500/20 text-red-600"}
        loading={isLoading}
      />
    </div>
  );
}