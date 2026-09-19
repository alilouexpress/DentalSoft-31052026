import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useQuotations, useUpdateQuotation,
  useQuotationItems, useAddQuotationItem, useDeleteQuotationItem,
  useTreatments,
} from "@/hooks/use-api";
import { Plus, FileText, Trash2 } from "lucide-react";
import QuotationTotals from "@/components/quotations/quotation-totals";

interface QuotationItemsDialogProps {
  open: boolean;
  quotationId: string | null;
  onOpenChange: (open: boolean) => void;
}

export default function QuotationItemsDialog({ open, quotationId, onOpenChange }: QuotationItemsDialogProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const quotationIdStr = quotationId || "";
  const { data: items = [], refetch: refetchItems } = useQuotationItems(quotationIdStr);
  const { data: quotations = [] } = useQuotations();
  const { data: treatments = [] } = useTreatments();
  const updateQuotation = useUpdateQuotation();
  const addItem = useAddQuotationItem();
  const deleteItem = useDeleteQuotationItem();

  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [itemForm, setItemForm] = useState({ treatmentId: "", toothNumber: "", description: "", quantity: "1", unitPrice: "" });
  const [addingItem, setAddingItem] = useState(false);

  const totalAmount = items.reduce((s, i) => s + parseFloat(i.total || "0"), 0);
  const discVal = parseFloat(discount || "0");
  const taxVal = parseFloat(tax || "0");
  const finalAmount = Math.max(0, totalAmount - discVal + taxVal);

  useEffect(() => {
    if (open && quotationId) {
      const q = quotations.find((q) => q.id === quotationId);
      if (q) {
        setDiscount(q.discount || "0");
        setTax(q.tax || "0");
      }
    }
  }, [open, quotationId, quotations]);

  const treatmentMap = new Map(treatments.map((t) => [t.id, t]));

  const closeItemsDialog = () => onOpenChange(false);

  const handleTreatmentSelect = (value: string) => {
    const treatment = treatments.find((t) => t.id === value);
    setItemForm({
      ...itemForm,
      treatmentId: value,
      description: treatment ? t(`treatments.name-${treatment.name}`) || treatment.name : "",
      unitPrice: treatment?.price || "0",
    });
  };

  const updateQuotationTotals = async (total: number, disc: number, tx: number) => {
    if (!quotationId) return;
    const final = Math.max(0, total - disc + tx);
    await updateQuotation.mutateAsync({
      id: quotationId,
      data: {
        totalAmount: total.toFixed(2),
        discount: disc.toFixed(2),
        tax: tx.toFixed(2),
        finalAmount: final.toFixed(2),
      },
    });
  };

  const handleAddItem = async () => {
    if (!itemForm.treatmentId || !itemForm.unitPrice || !quotationId) return;
    setAddingItem(true);
    const qty = parseInt(itemForm.quantity || "1");
    const price = parseFloat(itemForm.unitPrice || "0");
    const total = qty * price;
    try {
      await addItem.mutateAsync({
        quotationId,
        data: {
          quotationId,
          treatmentId: itemForm.treatmentId,
          description: itemForm.description,
          toothNumber: itemForm.toothNumber ? parseInt(itemForm.toothNumber) : null,
          quantity: qty,
          unitPrice: itemForm.unitPrice,
          total: total.toFixed(2),
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["quotations", quotationId, "items"] });
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
      await queryClient.invalidateQueries({ queryKey: ["quotations", quotationId, "items"] });
      await refetchItems();
      if (item) {
        const newTotal = totalAmount - parseFloat(item.total || "0");
        await updateQuotationTotals(newTotal, discVal, taxVal);
      }
      toast.success(t("common.deleted") || "Supprimé");
    } catch { toast.error(t("common.error")); }
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

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) closeItemsDialog(); }}>
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
          <QuotationTotals
            totalAmount={totalAmount}
            discount={discount}
            tax={tax}
            finalAmount={finalAmount}
            onDiscountChange={handleDiscountChange}
            onTaxChange={handleTaxChange}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeItemsDialog}>{t("common.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}