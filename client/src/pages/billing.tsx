import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { Plus } from "lucide-react";
import { usePatients, useInvoices, useStatusConfigs } from "@/hooks/use-api";
import InvoicePrint from "@/components/invoice-print";
import { BillingTotals } from "@/components/billing/billing-totals";
import { NewInvoiceDialog } from "@/components/billing/new-invoice-dialog";
import { PaymentDialog } from "@/components/billing/payment-dialog";
import { PaymentHistoryDialog } from "@/components/billing/payment-history-dialog";
import { InvoicesTable } from "@/components/billing/invoices-table";

export default function Billing() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<string | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState<string | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState<string | null>(null);
  const { data: patients = [] } = usePatients();
  const { data: invoices = [], isLoading, isError, error, refetch } = useInvoices();
  const { data: statusConfigs = [] } = useStatusConfigs("invoice");

  const filtered = invoices.filter(i =>
    (i.patientName || "").toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase())
  );

  const PAGE_SIZE = 15;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); }, [search]);

  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + parseFloat(i.amount), 0);
  const pendingTotal = invoices.filter(i => i.status === "Pending").reduce((s, i) => s + parseFloat(i.amount), 0);
  const overdueTotal = invoices.filter(i => i.status === "Overdue").reduce((s, i) => s + parseFloat(i.amount), 0);
  const thisMonthTotal = invoices.filter(i => new Date(i.date).getMonth() === new Date().getMonth() && new Date(i.date).getFullYear() === new Date().getFullYear()).reduce((s, i) => s + parseFloat(i.amount), 0);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("billing.title")}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{t("billing.subtitle")}</p>
          </div>
          <Button className="gap-2 shadow-sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> {t("billing.new-invoice")}
          </Button>
        </div>

        <BillingTotals
          totalRevenue={totalRevenue}
          pendingTotal={pendingTotal}
          overdueTotal={overdueTotal}
          thisMonthTotal={thisMonthTotal}
          isLoading={isLoading}
        />

        <NewInvoiceDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          patients={patients}
          statusConfigs={statusConfigs}
        />

        <PaymentDialog invoiceId={paymentDialogOpen} onClose={() => setPaymentDialogOpen(null)} />

        <PaymentHistoryDialog invoiceId={historyDialogOpen} onClose={() => setHistoryDialogOpen(null)} />

        <InvoicePrint invoiceId={invoiceDialogOpen} open={!!invoiceDialogOpen} onClose={() => setInvoiceDialogOpen(null)} />

        <InvoicesTable
          search={search}
          onSearchChange={setSearch}
          pageItems={pageItems}
          totalRows={filtered.length}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          onView={(id) => setInvoiceDialogOpen(id)}
          onPay={(id) => setPaymentDialogOpen(id)}
          onHistory={(id) => setHistoryDialogOpen(id)}
        />
      </div>
    </Layout>
  );
}