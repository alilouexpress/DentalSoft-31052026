import { PageStatCard } from "@/components/page-stat-card";
import { useLanguage } from "@/i18n/language-context";
import { Banknote, Clock, AlertCircle, CalendarDays } from "lucide-react";

interface BillingTotalsProps {
  totalRevenue: number;
  pendingTotal: number;
  overdueTotal: number;
  thisMonthTotal: number;
  isLoading: boolean;
}

export function BillingTotals({ totalRevenue, pendingTotal, overdueTotal, thisMonthTotal, isLoading }: BillingTotalsProps) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <PageStatCard
        icon={Banknote}
        label={t("billing.total-revenue")}
        value={`${Math.round(totalRevenue).toLocaleString()} DA`}
        color="bg-gradient-to-br from-sky-500/10 to-sky-500/20 text-sky-600"
        premium
        loading={isLoading}
      />
      <PageStatCard
        icon={Clock}
        label={t("billing.pending")}
        value={`${Math.round(pendingTotal).toLocaleString()} DA`}
        color="bg-gradient-to-br from-amber-500/10 to-amber-500/20 text-amber-600"
        loading={isLoading}
      />
      <PageStatCard
        icon={AlertCircle}
        label={t("billing.overdue")}
        value={`${Math.round(overdueTotal).toLocaleString()} DA`}
        color="bg-gradient-to-br from-red-500/10 to-red-500/20 text-red-600"
        loading={isLoading}
      />
      <PageStatCard
        icon={CalendarDays}
        label={t("billing.month")}
        value={`${Math.round(thisMonthTotal).toLocaleString()} DA`}
        color="bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 text-emerald-600"
        loading={isLoading}
      />
    </div>
  );
}