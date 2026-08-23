import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageStatCard } from "@/components/page-stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { FieldError } from "@/components/ui/field";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Search, Wallet, History, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, FileText, Banknote, Clock, CalendarDays } from "lucide-react";
import { usePatients, useInvoices, useCreateInvoice, useInvoicePayments, useCreatePayment, useStatusConfigs } from "@/hooks/use-api";
import InvoicePrint from "@/components/invoice-print";

const PAYMENT_METHODS = ["cash", "card", "check", "transfer"];

export default function Billing() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [payFieldErrors, setPayFieldErrors] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<string | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState<string | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState<string | null>(null);
  const { data: patients = [] } = usePatients();
  const { data: invoices = [], isLoading, isError, error, refetch } = useInvoices();
  const { data: statusConfigs = [] } = useStatusConfigs("invoice");
  const createInvoice = useCreateInvoice();
  const createPayment = useCreatePayment();
  const { data: invoicePayments = [] } = useInvoicePayments(paymentDialogOpen || historyDialogOpen || "");
  const [form, setForm] = useState({ patientId: "", amount: "", date: new Date().toISOString().split("T")[0], dueDate: "", status: "Pending" });
  const [payForm, setPayForm] = useState({ amount: "", paymentMethod: "cash", paymentDate: new Date().toISOString().split("T")[0], notes: "" });
  const [saving, setSaving] = useState(false);


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.patientId) errors.patientId = t("common.field-required");
    if (!form.amount) errors.amount = t("common.field-required");
    if (form.amount && (isNaN(Number(form.amount)) || Number(form.amount) <= 0)) errors.amount = t("common.field-invalid");
    if (!form.date) errors.date = t("common.field-required");
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      await createInvoice.mutateAsync({
        patientId: form.patientId,
        amount: form.amount,
        date: new Date(form.date),
        dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
        status: form.status,
        notes: null,
        doctorId: null,
      });
      toast.success(t("billing.invoice-created"));
      setDialogOpen(false);
      setForm({ patientId: "", amount: "", date: new Date().toISOString().split("T")[0], dueDate: "", status: "Pending" });
    } catch { toast.error(t("common.error")); }
    setSaving(false);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!payForm.amount) errors.amount = t("common.field-required");
    if (payForm.amount && (isNaN(Number(payForm.amount)) || Number(payForm.amount) <= 0)) errors.amount = t("common.field-invalid");
    if (!payForm.paymentDate) errors.paymentDate = t("common.field-required");
    setPayFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!paymentDialogOpen) return;
    setSaving(true);
    try {
      await createPayment.mutateAsync({
        invoiceId: paymentDialogOpen,
        amount: payForm.amount,
        paymentMethod: payForm.paymentMethod,
        paymentDate: new Date(payForm.paymentDate),
        notes: payForm.notes || null,
      });
      toast.success(t("billing.payment-recorded"));
      setPaymentDialogOpen(null);
      setPayForm({ amount: "", paymentMethod: "cash", paymentDate: new Date().toISOString().split("T")[0], notes: "" });
    } catch { toast.error(t("common.error")); }
    setSaving(false);
  };

  const clearFieldError = (field: string) => setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  const clearPayFieldError = (field: string) => setPayFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  const openPaymentDialog = (invoiceId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    const remaining = inv ? (parseFloat(inv.amount) - parseFloat(inv.paidAmount || "0.00")).toFixed(2) : "0.00";
    setPayForm({ ...payForm, amount: remaining });
    setPaymentDialogOpen(invoiceId);
  };

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

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <PageStatCard
            icon={Banknote}
            label={t("billing.total-revenue")}
            value={`${Math.round(totalRevenue).toLocaleString()} DA`}
            color="bg-gradient-to-br from-cyan-500/10 to-cyan-500/20 text-cyan-600"
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

        {/* New Invoice Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) setDialogOpen(false); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>{t("billing.invoice-title")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("billing.select-patient")}</Label>
                <Select value={form.patientId} onValueChange={(v) => { setForm({ ...form, patientId: v }); clearFieldError("patientId"); }}>
                  <SelectTrigger className={fieldErrors.patientId ? "border-destructive" : ""}><SelectValue placeholder={t("billing.select-patient")} /></SelectTrigger>
                  <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                {fieldErrors.patientId && <FieldError errors={[{ message: fieldErrors.patientId }]} />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t("billing.amount")}</Label>
                  <Input type="number" step="0.01" value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }); clearFieldError("amount"); }} className={fieldErrors.amount ? "border-destructive" : ""} />
                  {fieldErrors.amount && <FieldError errors={[{ message: fieldErrors.amount }]} />}
                </div>
                <div className="space-y-1.5">
                  <Label>{t("billing.date")}</Label>
                  <Input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); clearFieldError("date"); }} className={fieldErrors.date ? "border-destructive" : ""} />
                  {fieldErrors.date && <FieldError errors={[{ message: fieldErrors.date }]} />}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("billing.due-date")}</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("billing.status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusConfigs.map(sc => (
                      <SelectItem key={sc.id} value={sc.statusValue}>{sc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("billing.cancel")}</Button>
                <Button type="submit" disabled={saving}>{saving ? t("billing.saving") : t("billing.save")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={!!paymentDialogOpen} onOpenChange={(o) => { if (!o) setPaymentDialogOpen(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("billing.record-payment")}</DialogTitle></DialogHeader>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("billing.amount-da")}</Label>
                <Input type="number" step="0.01" value={payForm.amount} onChange={(e) => { setPayForm({ ...payForm, amount: e.target.value }); clearPayFieldError("amount"); }} className={payFieldErrors.amount ? "border-destructive" : ""} />
                {payFieldErrors.amount && <FieldError errors={[{ message: payFieldErrors.amount }]} />}
              </div>
              <div className="space-y-1.5">
                <Label>{t("billing.payment-method")}</Label>
                <Select value={payForm.paymentMethod} onValueChange={(v) => setPayForm({ ...payForm, paymentMethod: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => (
                      <SelectItem key={m} value={m}>
                        {m === "cash" ? t("billing.payment-cash") : m === "card" ? t("billing.payment-card") : m === "check" ? t("billing.payment-check") : t("billing.payment-transfer")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("billing.date")}</Label>
                <Input type="date" value={payForm.paymentDate} onChange={(e) => { setPayForm({ ...payForm, paymentDate: e.target.value }); clearPayFieldError("paymentDate"); }} className={payFieldErrors.paymentDate ? "border-destructive" : ""} />
                {payFieldErrors.paymentDate && <FieldError errors={[{ message: payFieldErrors.paymentDate }]} />}
              </div>
              <div className="space-y-1.5">
                <Label>{t("billing.notes-optional")}</Label>
                <Input value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} placeholder={t("billing.notes-placeholder")} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(null)}>{t("common.cancel")}</Button>
                <Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("billing.save-payment")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Payment History Dialog */}
        <Dialog open={!!historyDialogOpen} onOpenChange={(o) => { if (!o) setHistoryDialogOpen(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>{t("billing.payment-history")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {invoicePayments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">{t("billing.no-payments")}</p>
              ) : (
                invoicePayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold">{parseFloat(p.amount).toLocaleString()} DA</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.paymentDate).toLocaleDateString()} &middot; {p.paymentMethod}
                      </p>
                    </div>
                    {p.notes && <p className="text-xs text-muted-foreground max-w-[200px] truncate">{p.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Premium Invoice Dialog */}
        <InvoicePrint invoiceId={invoiceDialogOpen} open={!!invoiceDialogOpen} onClose={() => setInvoiceDialogOpen(null)} />

        <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("patients.search")} className="ps-9 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isError ? (
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
        ) : isLoading ? (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border">
                  {[t("billing.invoice-id"), t("billing.patient"), t("billing.amount"), t("billing.paid"), t("billing.remaining"), t("billing.date"), t("billing.due-date-header"), t("billing.status"), ""].map(h => (
                    <TableHead key={h} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border">
                  {[t("billing.invoice-id"), t("billing.patient"), t("billing.amount"), t("billing.paid"), t("billing.remaining"), t("billing.date"), t("billing.due-date-header"), t("billing.status"), ""].map(h => (
                    <TableHead key={h} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map(inv => {
                  const paid = parseFloat(inv.paidAmount || "0.00");
                  const remaining = parseFloat(inv.remaining || inv.amount) - paid;
                  const displayRemaining = Math.max(0, remaining).toFixed(2);
                  return (
                    <TableRow key={inv.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{inv.id.substring(0, 8)}</TableCell>
                      <TableCell className="font-medium text-sm">{inv.patientName || "—"}</TableCell>
                      <TableCell className="text-sm font-semibold">{parseFloat(inv.amount).toLocaleString()} DA</TableCell>
                      <TableCell className="text-sm text-emerald-600 font-medium">{paid.toLocaleString()} DA</TableCell>
                      <TableCell className={cn("text-sm font-medium", paid >= parseFloat(inv.amount) ? "text-emerald-600" : "text-amber-600")}>
                        {parseFloat(displayRemaining).toLocaleString()} DA
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("billing.view-invoice")} aria-label="Voir la facture" onClick={() => setInvoiceDialogOpen(inv.id)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("billing.pay")} aria-label="Payer" onClick={() => openPaymentDialog(inv.id)}>
                            <Wallet className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("billing.payment-history")} aria-label="Historique des paiements" onClick={() => setHistoryDialogOpen(inv.id)}>
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="py-12">
                    <EmptyState
                      icon={<FileText className="h-10 w-10" />}
                      title={t("billing.no-invoices")}
                      description={t("billing.no-invoices-desc") || "Aucune facture trouvée"}
                    />
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/10">
              <p className="text-xs text-muted-foreground">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} aria-label="Page précédente">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} variant={i === page ? "outline" : "ghost"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(i)}>
                    {i + 1}
                  </Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} aria-label="Page suivante">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}