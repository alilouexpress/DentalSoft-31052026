import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useQuotations, useCreateQuotation, useUpdateQuotation, useDeleteQuotation,
  useApproveQuotation, useConvertQuotationToInvoice,
  useQuotationItems, useAddQuotationItem, useDeleteQuotationItem,
  usePatients, useTreatments, useDoctors,
} from "@/hooks/use-api";
import { Plus, FileText, CheckCircle, ArrowRightFromLine, Trash2, Eye, Search, AlertCircle, RefreshCw } from "lucide-react";

const STATUS_OPTIONS = ["draft", "pending", "approved", "rejected", "converted"];

export default function Quotations() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // ── Data ──
  const { data: quotations = [], isLoading, isError, refetch } = useQuotations();
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();
  const { data: treatments = [] } = useTreatments();
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const deleteQuotation = useDeleteQuotation();
  const approveQuotation = useApproveQuotation();
  const convertQuotation = useConvertQuotationToInvoice();
  const addItem = useAddQuotationItem();
  const deleteItem = useDeleteQuotationItem();

  // ── Filters & Search ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Create Quotation Dialog ──
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ patientId: "", doctorId: "", validUntil: "", notes: "" });
  const [saving, setSaving] = useState(false);

  // ── Items Dialog ──
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [currentQuotationId, setCurrentQuotationId] = useState<string | null>(null);
  const { data: items = [], refetch: refetchItems } = useQuotationItems(currentQuotationId || "");
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [itemForm, setItemForm] = useState({ treatmentId: "", toothNumber: "", description: "", quantity: "1", unitPrice: "" });
  const [addingItem, setAddingItem] = useState(false);

  // ── Delete Confirmation ──
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null);

  // ── Computed totals ──
  const totalAmount = items.reduce((s, i) => s + parseFloat(i.total || "0"), 0);
  const discVal = parseFloat(discount || "0");
  const taxVal = parseFloat(tax || "0");
  const finalAmount = Math.max(0, totalAmount - discVal + taxVal);

  // ── Sync discount/tax when items change ──
  useEffect(() => {
    if (itemsDialogOpen && currentQuotationId) {
      const q = quotations.find((q) => q.id === currentQuotationId);
      if (q) {
        setDiscount(q.discount || "0");
        setTax(q.tax || "0");
      }
    }
  }, [itemsDialogOpen, currentQuotationId, quotations]);

  // ── Helpers ──
  const treatmentMap = new Map(treatments.map((t) => [t.id, t]));

  const filtered = quotations.filter((q) => {
    const mSearch = (q.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
      q.quoteNumber.toLowerCase().includes(search.toLowerCase());
    const mStatus = statusFilter === "all" || q.status === statusFilter;
    return mSearch && mStatus;
  });

  // ── Dialog handlers ──
  const openCreateDialog = () => {
    setForm({ patientId: "", doctorId: "", validUntil: "", notes: "" });
    setDialogOpen(true);
  };

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) { toast.error(t("quotations.selectPatient")); return; }
    setSaving(true);
    try {
      const result = (await createQuotation.mutateAsync({
        patientId: form.patientId,
        quoteNumber: `DEV-${Date.now()}`,
        doctorId: form.doctorId || null,
        status: "draft",
        totalAmount: "0.00",
        discount: "0.00",
        tax: "0.00",
        finalAmount: "0.00",
        notes: form.notes || null,
        validUntil: form.validUntil ? new Date(form.validUntil) : null,
      })) as { id: string };
      toast.success(t("quotations.created") || "Devis créé");
      setDialogOpen(false);
      setCurrentQuotationId(result.id);
      setItemsDialogOpen(true);
    } catch { toast.error(t("common.error")); }
    setSaving(false);
  };

  const openItemsDialog = (id: string) => {
    setCurrentQuotationId(id);
    setItemsDialogOpen(true);
  };

  const closeItemsDialog = () => {
    setItemsDialogOpen(false);
    setCurrentQuotationId(null);
  };

  const handleTreatmentSelect = (value: string) => {
    const treatment = treatments.find((t) => t.id === value);
    setItemForm({
      ...itemForm,
      treatmentId: value,
      description: treatment ? t(`treatments.name-${treatment.name}`) || treatment.name : "",
      unitPrice: treatment?.price || "0",
    });
  };

  const handleAddItem = async () => {
    if (!itemForm.treatmentId || !itemForm.unitPrice) return;
    setAddingItem(true);
    const qty = parseInt(itemForm.quantity || "1");
    const price = parseFloat(itemForm.unitPrice || "0");
    const total = qty * price;
    try {
      await addItem.mutateAsync({
        quotationId: currentQuotationId!,
        data: {
          quotationId: currentQuotationId!,
          treatmentId: itemForm.treatmentId,
          description: itemForm.description,
          toothNumber: itemForm.toothNumber ? parseInt(itemForm.toothNumber) : null,
          quantity: qty,
          unitPrice: itemForm.unitPrice,
          total: total.toFixed(2),
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["quotations", currentQuotationId, "items"] });
      await refetchItems();
      await updateQuotationTotals(totalAmount + total, discVal, taxVal);
      setItemForm({ treatmentId: "", toothNumber: "", description: "", quantity: "1", unitPrice: "" });
      toast.success(t("quotations.itemAdded") || "Article ajouté");
    } catch { toast.error(t("common.error")); }
    setAddingItem(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const item = items.find((i) => i.id === itemId);
      await deleteItem.mutateAsync(itemId);
      await queryClient.invalidateQueries({ queryKey: ["quotations", currentQuotationId, "items"] });
      await refetchItems();
      if (item) {
        const newTotal = totalAmount - parseFloat(item.total || "0");
        await updateQuotationTotals(newTotal, discVal, taxVal);
      }
      toast.success(t("common.deleted") || "Supprimé");
    } catch { toast.error(t("common.error")); }
  };

  const updateQuotationTotals = async (total: number, disc: number, tx: number) => {
    if (!currentQuotationId) return;
    const final = Math.max(0, total - disc + tx);
    await updateQuotation.mutateAsync({
      id: currentQuotationId,
      data: {
        totalAmount: total.toFixed(2),
        discount: disc.toFixed(2),
        tax: tx.toFixed(2),
        finalAmount: final.toFixed(2),
      },
    });
  };

  const handleDiscountChange = (val: string) => {
    setDiscount(val);
    const d = parseFloat(val || "0");
    updateQuotationTotals(totalAmount, d, taxVal);
  };

  const handleTaxChange = (val: string) => {
    setTax(val);
    const t = parseFloat(val || "0");
    updateQuotationTotals(totalAmount, discVal, t);
  };

  // ── Actions ──
  const handleApprove = async (id: string) => {
    try {
      await approveQuotation.mutateAsync(id);
      toast.success(t("quotations.approved") || "Devis approuvé");
    } catch { toast.error(t("common.error")); }
  };

  const handleConvert = async (id: string) => {
    try {
      await convertQuotation.mutateAsync(id);
      toast.success(t("quotations.converted") || "Devis converti en facture");
    } catch { toast.error(t("common.error")); }
  };

  const handleViewPdf = (id: string) => {
    const token = localStorage.getItem("dentalsoft-token");
    const url = `/api/pdf/quotation/${id}${token ? `?token=${token}` : ""}`;
    window.open(url, "_blank");
  };

  const handleDelete = async () => {
    if (!quotationToDelete) return;
    try {
      await deleteQuotation.mutateAsync(quotationToDelete);
      toast.success(t("common.deleted") || "Supprimé");
      setDeleteConfirmOpen(false);
      setQuotationToDelete(null);
    } catch { toast.error(t("common.error")); }
  };

  const confirmDelete = (id: string) => {
    setQuotationToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // ── Render ──
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* ── Header ── */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("quotations.title")}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{t("quotations.subtitle") || "Gérer les devis et estimations."}</p>
          </div>
          <Button className="gap-2 shadow-sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> {t("quotations.add")}
          </Button>
        </div>

        {isLoading ? (
          <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
            <CardContent className="flex items-center justify-center py-12">
              <Spinner className="h-6 w-6" />
            </CardContent>
          </Card>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>
              {t("common.error")}
              <br />
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                <RefreshCw className="h-3 w-3 mr-1" /> {t("common.retry")}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (<>
          {/* ── Filters ── */}
          <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search")}
                className="ps-9 bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-card">
                <SelectValue placeholder={t("common.filter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{t(`quotations.status-${s}`) || s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Quotation List ── */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden card-hover">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border">
                  {[t("quotations.number"), t("quotations.patient"), t("quotations.doctor"), t("quotations.amount"), t("quotations.discount"), t("quotations.tax"), t("quotations.final"), t("quotations.status"), t("common.date"), t("common.actions")].map((h) => (
                    <TableHead key={h} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((q) => (
                  <TableRow key={q.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">{q.quoteNumber}</TableCell>
                    <TableCell className="font-medium text-sm">{q.patientName || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{q.doctorName || "—"}</TableCell>
                    <TableCell className="text-sm font-semibold">{parseFloat(q.totalAmount).toLocaleString()} DA</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{parseFloat(q.discount).toLocaleString()} DA</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{parseFloat(q.tax).toLocaleString()} DA</TableCell>
                    <TableCell className="text-sm font-bold text-foreground">{parseFloat(q.finalAmount).toLocaleString()} DA</TableCell>
                    <TableCell>
                      <StatusBadge status={q.status.charAt(0).toUpperCase() + q.status.slice(1)} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={t("common.edit")} aria-label="Modifier le devis" onClick={() => openItemsDialog(q.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {q.status === "draft" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" title={t("quotations.approve")} aria-label="Approuver le devis" onClick={() => handleApprove(q.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {q.status === "approved" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title={t("quotations.convertToInvoice")} aria-label="Convertir en facture" onClick={() => handleConvert(q.id)}>
                            <ArrowRightFromLine className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="PDF" aria-label="Voir le PDF" onClick={() => handleViewPdf(q.id)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title={t("common.delete")} aria-label="Supprimer le devis" onClick={() => confirmDelete(q.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                      {t("common.no-data")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>)}
      </div>

      {/* ── Create Quotation Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) setDialogOpen(false); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("quotations.add")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveQuotation} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("quotations.selectPatient")}</Label>
              <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                <SelectTrigger><SelectValue placeholder={t("quotations.selectPatient")} /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("quotations.doctor")}</Label>
              <Select value={form.doctorId || ""} onValueChange={(v) => setForm({ ...form, doctorId: v })}>
                <SelectTrigger><SelectValue placeholder={t("quotations.doctor")} /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("quotations.validUntil")}</Label>
              <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("quotations.notes")}</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("common.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Items Dialog ── */}
      <Dialog open={itemsDialogOpen} onOpenChange={(o) => { if (!o) closeItemsDialog(); }}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("quotations.items")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Items Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    {[t("treatments.name") || "Traitement", t("quotations.tooth") || "N° Dent", t("quotations.description") || "Description", t("quotations.qty") || "Qté", t("quotations.unitPrice") || "P.U.", t("quotations.total") || "Total", ""].map((h) => (
                      <TableHead key={h} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const trt = treatmentMap.get(item.treatmentId || "");
                    const trtName = trt ? t(`treatments.name-${trt.name}`) || trt.name : "—";
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">{trtName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.toothNumber ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{item.description}</TableCell>
                        <TableCell className="text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-sm font-mono">{parseFloat(item.unitPrice).toLocaleString()} DA</TableCell>
                        <TableCell className="text-sm font-semibold font-mono">{parseFloat(item.total).toLocaleString()} DA</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteItem(item.id)} aria-label="Supprimer l'article">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12">
                      <EmptyState
                        icon={<FileText className="h-10 w-10" />}
                        title={t("quotations.noItems") || "Aucun article"}
                        description="Ajoutez des articles à ce devis"
                      />
                    </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Add Item Form */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <p className="text-sm font-semibold">{t("quotations.addItem")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{t("treatments.name") || "Traitement"}</Label>
                  <Select value={itemForm.treatmentId} onValueChange={handleTreatmentSelect}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      {treatments.map((tr) => (
                        <SelectItem key={tr.id} value={tr.id}>
                          {t(`treatments.name-${tr.name}`) || tr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("quotations.tooth") || "N° Dent"}</Label>
                  <Input type="number" min={1} max={52} className="h-9 text-sm" value={itemForm.toothNumber} onChange={(e) => setItemForm({ ...itemForm, toothNumber: e.target.value })} placeholder="—" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("quotations.description") || "Description"}</Label>
                  <Input className="h-9 text-sm" value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("quotations.qty") || "Qté"}</Label>
                  <Input type="number" min={1} className="h-9 text-sm" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("quotations.unitPrice") || "P.U."}</Label>
                  <Input type="number" step="0.01" min={0} className="h-9 text-sm" value={itemForm.unitPrice} onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })} />
                </div>
                <div className="flex items-end">
                  <Button size="sm" className="h-9 w-full gap-1" onClick={handleAddItem} disabled={addingItem || !itemForm.treatmentId}>
                    <Plus className="h-3.5 w-3.5" /> {t("quotations.addItem")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("quotations.amount")}</span>
                <span className="font-semibold font-mono">{totalAmount.toLocaleString()} DA</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground w-16">{t("quotations.discount")}</Label>
                  <Input type="number" step="0.01" min={0} className="h-8 text-sm font-mono w-28" value={discount} onChange={(e) => handleDiscountChange(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground w-16">{t("quotations.tax")}</Label>
                  <Input type="number" step="0.01" min={0} className="h-8 text-sm font-mono w-28" value={tax} onChange={(e) => handleTaxChange(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                <span className="font-bold">{t("quotations.final")}</span>
                <span className="font-bold text-lg font-mono">{finalAmount.toLocaleString()} DA</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeItemsDialog}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("common.delete")}
        description={t("quotations.deleteConfirm") || "Êtes-vous sûr de vouloir supprimer ce devis ?"}
        confirmLabel={t("common.delete")}
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteQuotation.isPending}
      />
    </Layout>
  );
}
