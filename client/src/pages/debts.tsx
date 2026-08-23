import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useDebtors, useOverdueDebts, useUpdatePayment, useDeletePayment, useCreatePayment, useInvoicePayments, useAutoCreateOverdueNotifications, useInvoices, usePatientPayments } from "@/hooks/use-api";
import { AlertTriangle, X, Banknote, CalendarDays, TrendingUp, Filter, RefreshCw, Users, AlertCircle, ChevronLeft, ChevronRight, Printer, Plus, Eye, Clock, CircleCheck } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { PageStatCard } from "@/components/page-stat-card";
import { EmptyState } from "@/components/empty-state";

const severityBadge: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  major: "bg-orange-100 text-orange-700 border-orange-200",
  minor: "bg-yellow-100 text-yellow-700 border-yellow-200",
  neutral: "bg-blue-100 text-blue-700 border-blue-200",
};

const severityLabel: Record<string, string> = {
  critical: "debt.severity-critical",
  major: "debt.severity-major",
  minor: "debt.severity-minor",
  neutral: "debt.severity-neutral",
};

export default function Debts() {
  const { t, dir } = useLanguage();
  const { data: debtors = [], isLoading, isError, error, refetch } = useDebtors();
  const autoOverdue = useAutoCreateOverdueNotifications();
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [editPaymentOpen, setEditPaymentOpen] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { data: invoicePayments = [] } = useInvoicePayments(editPaymentOpen || "");
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();
  const createPayment = useCreatePayment();
  const [editForm, setEditForm] = useState({ amount: "", paymentMethod: "cash", paymentDate: "", notes: "" });
  const [addPaymentOpen, setAddPaymentOpen] = useState<string | null>(null);
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);
  const { data: allInvoices = [] } = useInvoices();
  const { data: payHistory = [] } = usePatientPayments(historyOpen || "");
  const [newPayment, setNewPayment] = useState({ amount: "", paymentMethod: "cash", paymentDate: new Date().toISOString().split("T")[0], notes: "" });

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

  const openEditPayment = (paymentId: string) => {
    const payment = invoicePayments.find(p => p.id === paymentId);
    if (payment) {
      setEditForm({
        amount: payment.amount,
        paymentMethod: payment.paymentMethod || "cash",
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        notes: payment.notes || "",
      });
    }
    setEditPaymentOpen(paymentId);
  };

  const handleEditPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPaymentOpen) return;
    try {
      await updatePayment.mutateAsync({
        id: editPaymentOpen,
        data: {
          amount: editForm.amount,
          paymentMethod: editForm.paymentMethod,
          paymentDate: editForm.paymentDate ? new Date(editForm.paymentDate) : undefined,
          notes: editForm.notes || null,
        },
      });
      toast.success(t("debt.payment-saved"));
      setEditPaymentOpen(null);
    } catch { toast.error(t("common.error")); }
  };

  const handleDeletePayment = async () => {
    if (!deleteConfirmId) return;
    try {
      await deletePayment.mutateAsync(deleteConfirmId);
      toast.success(t("debt.payment-deleted"));
      setDeleteConfirmId(null);
    } catch { toast.error(t("common.error")); }
  };

  const handleAutoOverdue = async () => {
    try {
      await autoOverdue.mutateAsync();
      toast.success(t("debt.auto-overdue-done"));
    } catch { toast.error(t("common.error")); }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPaymentOpen) return;
    const debtorInvoices = allInvoices.filter(i => i.patientId === addPaymentOpen && i.status !== "Paid");
    if (debtorInvoices.length === 0) {
      toast.error(t("debt.no-unpaid-invoices"));
      return;
    }
    try {
      await createPayment.mutateAsync({
        invoiceId: debtorInvoices[0].id,
        amount: newPayment.amount,
        paymentMethod: newPayment.paymentMethod,
        paymentDate: new Date(newPayment.paymentDate),
        notes: newPayment.notes || null,
      });
      toast.success(t("debt.payment-created"));
      setAddPaymentOpen(null);
      setNewPayment({ amount: "", paymentMethod: "cash", paymentDate: new Date().toISOString().split("T")[0], notes: "" });
    } catch { toast.error(t("common.error")); }
  };

  const getSeverity = (days: number): string => {
    if (days > 90) return "critical";
    if (days > 30) return "major";
    if (days > 7) return "minor";
    return "neutral";
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
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-md" />
              ))}
            </div>
            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <TableHead key={i}>
                          <Skeleton className="h-4 w-20" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 8 }).map((__, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
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
            <div className="grid gap-6 md:grid-cols-3">
              <PageStatCard icon={Users} label={t("debt.total-debtors")} value={debtors.length} color="bg-gradient-to-br from-sky-500/10 to-sky-500/20 text-sky-600" />
              <PageStatCard icon={AlertTriangle} label={t("debt.overdue-patients", { count: overdueCount })} value={overdueCount} color="bg-gradient-to-br from-red-500/10 to-red-500/20 text-red-500" />
              <PageStatCard icon={Banknote} label={t("debt.total-balance")} value={`${totalDebt.toLocaleString()} ${t("common.currency-dzd")}`} color="bg-gradient-to-br from-amber-500/10 to-amber-500/20 text-amber-500" />
            </div>

            <Card className="overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("common.name")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.total-invoiced")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.total-paid")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.balance")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.status")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.overdue-days")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.phase")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.progress")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.due-date")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((debtor) => {
                      const severity = getSeverity(debtor.overdueDays);
                      return (
                        <TableRow key={debtor.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-medium">{debtor.name}</TableCell>
                          <TableCell>{parseFloat(debtor.totalInvoiced).toLocaleString()} {t("common.currency-dzd")}</TableCell>
                          <TableCell>{parseFloat(debtor.totalPaid).toLocaleString()} {t("common.currency-dzd")}</TableCell>
                          <TableCell>
                            <span className={`font-semibold ${parseFloat(debtor.balance) > 0 ? "text-destructive" : "text-green-600"}`}>
                              {parseFloat(debtor.balance).toLocaleString()} {t("common.currency-dzd")}
                            </span>
                          </TableCell>
                          <TableCell>
                            {parseFloat(debtor.balance) <= 0 ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CircleCheck className="h-3 w-3 me-1 inline" />
                                {t("debt.status-settled")}
                              </Badge>
                            ) : debtor.overdueDays > 0 ? (
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                <AlertTriangle className="h-3 w-3 me-1 inline" />
                                {t("debt.status-overdue")}
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                <CircleCheck className="h-3 w-3 me-1 inline" />
                                {t("debt.status-current")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {debtor.overdueDays > 0 ? (
                              <Badge className={severityBadge[severity]}>
                                <AlertTriangle className="h-3 w-3 me-1 inline" />
                                {debtor.overdueDays}j
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {debtor.currentPhase ? (
                              <Badge className={debtor.currentPhaseColor || "bg-gray-100 text-gray-700"}>
                                {debtor.currentPhase}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {debtor.currentPhase ? (
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${debtor.treatmentPercentage >= 100 ? "bg-green-500" : "bg-blue-500"}`}
                                    style={{ width: `${Math.min(debtor.treatmentPercentage, 100)}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{debtor.treatmentPercentage}%</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {debtor.lastPaymentDate ? new Date(debtor.lastPaymentDate).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" title={t("debt.add-payment")} aria-label="Ajouter un paiement" onClick={() => { setAddPaymentOpen(debtor.id); setNewPayment({ ...newPayment, amount: debtor.balance }); }}>
                                <Banknote className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title={t("debt.view-invoice")} aria-label="Voir la facture" onClick={() => setViewInvoiceOpen(debtor.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title={t("debt.payment-history")} aria-label="Historique des paiements" onClick={() => setHistoryOpen(debtor.id)}>
                                <Clock className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={!!editPaymentOpen} onOpenChange={() => setEditPaymentOpen(null)}>
        <DialogContent className={`sm:max-w-md ${dir === "rtl" ? "font-arabic" : ""}`}>
          <DialogHeader>
            <DialogTitle>{t("debt.edit-payment")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPayment}>
            <div className="space-y-4">
              <div>
                <Label>{t("debt.payment-amount")}</Label>
                <Input type="number" step="0.01" value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div>
                <Label>{t("debt.payment-method")}</Label>
                <Select value={editForm.paymentMethod} onValueChange={v => setEditForm(p => ({ ...p, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["cash", "card", "check", "transfer"].map(m => (
                      <SelectItem key={m} value={m}>{m === "cash" ? t("debt.payment-cash") : m === "card" ? t("debt.payment-card") : m === "check" ? t("debt.payment-check") : t("debt.payment-transfer")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("debt.payment-date")}</Label>
                <Input type="date" value={editForm.paymentDate} onChange={e => setEditForm(p => ({ ...p, paymentDate: e.target.value }))} required />
              </div>
              <div>
                <Label>{t("debt.payment-notes")}</Label>
                <Input value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditPaymentOpen(null)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={updatePayment.isPending}>{t("common.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className={dir === "rtl" ? "font-arabic" : ""}>
          <DialogHeader>
            <DialogTitle>{t("debt.delete-payment")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("common.confirm-delete")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleDeletePayment} disabled={deletePayment.isPending}>{t("common.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={!!addPaymentOpen} onOpenChange={(o) => { if (!o) setAddPaymentOpen(null); }}>
        <DialogContent className={`sm:max-w-md ${dir === "rtl" ? "font-arabic" : ""}`}>
          <DialogHeader>
            <DialogTitle>{t("debt.add-payment")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPayment}>
            <div className="space-y-4">
              <div>
                <Label>{t("debt.payment-amount")}</Label>
                <Input type="number" step="0.01" value={newPayment.amount} onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div>
                <Label>{t("debt.payment-method")}</Label>
                <Select value={newPayment.paymentMethod} onValueChange={v => setNewPayment(p => ({ ...p, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["cash", "card", "check", "transfer"].map(m => (
                      <SelectItem key={m} value={m}>{m === "cash" ? t("debt.payment-cash") : m === "card" ? t("debt.payment-card") : m === "check" ? t("debt.payment-check") : t("debt.payment-transfer")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("debt.payment-date")}</Label>
                <Input type="date" value={newPayment.paymentDate} onChange={e => setNewPayment(p => ({ ...p, paymentDate: e.target.value }))} required />
              </div>
              <div>
                <Label>{t("debt.payment-notes")}</Label>
                <Input value={newPayment.notes} onChange={e => setNewPayment(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setAddPaymentOpen(null)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={createPayment.isPending}>{t("common.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoiceOpen} onOpenChange={(o) => { if (!o) setViewInvoiceOpen(null); }}>
        <DialogContent className={`sm:max-w-lg ${dir === "rtl" ? "font-arabic" : ""}`}>
          <DialogHeader>
            <DialogTitle>{t("debt.view-invoice")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {allInvoices.filter(i => i.patientId === viewInvoiceOpen).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t("debt.no-invoices")}</p>
            ) : (
              allInvoices.filter(i => i.patientId === viewInvoiceOpen).map(inv => {
                const paid = parseFloat(inv.paidAmount || "0");
                const remaining = Math.max(0, parseFloat(inv.amount) - paid);
                return (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{inv.invoiceNumber || inv.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{parseFloat(inv.amount).toLocaleString()} DA</p>
                      {remaining > 0 && <p className="text-xs text-red-600">{remaining.toLocaleString()} DA {t("debt.remaining")}</p>}
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={!!historyOpen} onOpenChange={(o) => { if (!o) setHistoryOpen(null); }}>
        <DialogContent className={`sm:max-w-lg ${dir === "rtl" ? "font-arabic" : ""}`}>
          <DialogHeader>
            <DialogTitle>{t("debt.payment-history")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {payHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t("debt.no-payments")}</p>
            ) : (
              payHistory.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{parseFloat(p.amount).toLocaleString()} DA</p>
                    <p className="text-xs text-muted-foreground">{p.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{new Date(p.paymentDate).toLocaleDateString()}</p>
                    {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}