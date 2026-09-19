import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useDebtors, useAutoCreateOverdueNotifications } from "@/hooks/use-api";
import { AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { SummaryCards } from "@/components/debts/summary-cards";
import { DebtPageSkeleton } from "@/components/debts/skeleton";
import { DebtorsTable, type DebtorRow } from "@/components/debts/debtors-table";
import { EditPaymentDialog } from "@/components/debts/edit-payment-dialog";
import { DeletePaymentDialog } from "@/components/debts/delete-payment-dialog";
import { AddPaymentDialog } from "@/components/debts/add-payment-dialog";
import { ViewInvoiceDialog } from "@/components/debts/view-invoice-dialog";
import { PaymentHistoryDialog } from "@/components/debts/payment-history-dialog";

export default function Debts() {
  const { t } = useLanguage();
  const { data: debtors = [], isLoading, isError, error, refetch } = useDebtors();
  const autoOverdue = useAutoCreateOverdueNotifications();
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [editPaymentOpen, setEditPaymentOpen] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [addPaymentOpen, setAddPaymentOpen] = useState<string | null>(null);
  const [addPaymentAmount, setAddPaymentAmount] = useState("");
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);

  const filtered = debtors.filter(d => {
    if (filter === "overdue") return d.overdueDays > 0;
    if (filter === "critical") return d.overdueDays > 90;
    return true;
  });

  const PAGE_SIZE = 15;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const overdueCount = debtors.filter(d => d.overdueDays > 0).length;
  const totalDebt = debtors.reduce((sum, d) => sum + parseFloat(d.balance), 0);

  useEffect(() => { setPage(0); }, [filter]);

  const handleAutoOverdue = async () => {
    try {
      await autoOverdue.mutateAsync();
      toast.success(t("debt.auto-overdue-done"));
    } catch { toast.error(t("common.error")); }
  };

  const handleAddPayment = (debtor: DebtorRow) => {
    setAddPaymentAmount(debtor.balance);
    setAddPaymentOpen(debtor.id);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("debt.title")}</h1>
            <p className="text-muted-foreground">{t("debt.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="shadow-sm" onClick={handleAutoOverdue} disabled={autoOverdue.isPending}>
              <RefreshCw className="h-4 w-4 me-2" />
              {t("debt.auto-overdue")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <DebtPageSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{t("common.error")}</h3>
                <p className="text-sm text-muted-foreground">{error?.message || t("common.no-data")}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>{t("common.retry")}</Button>
              </div>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="h-10 w-10" />}
            title={t("debt.no-debtors")}
            description={t("debt.no-debtors-sub")}
            action={filter !== "all" ? (
              <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                {t("common.all")}
              </Button>
            ) : undefined}
          />
        ) : (
          <>
            <SummaryCards
              totalDebtors={debtors.length}
              overdueCount={overdueCount}
              totalBalance={`${totalDebt.toLocaleString()} ${t("common.currency-dzd")}`}
            />
            <DebtorsTable
              debtors={pageItems}
              resultCount={filtered.length}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onAddPayment={handleAddPayment}
              onViewInvoice={(d) => setViewInvoiceOpen(d.id)}
              onHistory={(d) => setHistoryOpen(d.id)}
            />
          </>
        )}
      </div>

      <EditPaymentDialog paymentId={editPaymentOpen} onClose={() => setEditPaymentOpen(null)} />
      <DeletePaymentDialog id={deleteConfirmId} onClose={() => setDeleteConfirmId(null)} />
      <AddPaymentDialog patientId={addPaymentOpen} defaultAmount={addPaymentAmount} onClose={() => setAddPaymentOpen(null)} />
      <ViewInvoiceDialog patientId={viewInvoiceOpen} onClose={() => setViewInvoiceOpen(null)} />
      <PaymentHistoryDialog patientId={historyOpen} onClose={() => setHistoryOpen(null)} />
    </Layout>
  );
}