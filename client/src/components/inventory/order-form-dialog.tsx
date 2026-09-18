import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { useCreatePurchaseOrder, useInventorySuppliers } from "@/hooks/use-api";
import type { InsertPurchaseOrder } from "@shared/schema";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderFormDialog({ open, onOpenChange }: OrderFormDialogProps) {
  const { t } = useLanguage();
  const createOrder = useCreatePurchaseOrder();
  const { data: suppliers = [] } = useInventorySuppliers();
  const [form, setForm] = useState<Partial<InsertPurchaseOrder>>({
    orderNumber: "", supplierId: "", status: "draft", totalAmount: "0.00", expectedDate: null, notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        orderNumber: "PO-" + Date.now().toString(36).toUpperCase(),
        supplierId: "", status: "draft", totalAmount: "0.00", expectedDate: null, notes: "",
      });
    }
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderNumber || !form.supplierId) { toast.error(t("common.required")); return; }
    try {
      await createOrder.mutateAsync(form as InsertPurchaseOrder);
      toast.success(t("common.saved"));
      handleClose();
    } catch { toast.error(t("common.error")); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <div className="p-5 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t("inventory.createOrder") || "Nouveau bon de commande"}</DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.orderNumber") || "N° Commande"} *</Label>
            <Input value={form.orderNumber || ""} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.suppliers")} *</Label>
            <Select value={form.supplierId || ""} onValueChange={(v) => setForm({ ...form, supplierId: v })}>
              <SelectTrigger><SelectValue placeholder={t("inventory.selectSupplier") || "Sélectionner un fournisseur"} /></SelectTrigger>
              <SelectContent>
                {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.expectedDate") || "Date prévue"}</Label>
            <Input type="date" value={form.expectedDate ? new Date(form.expectedDate).toISOString().split("T")[0] : ""} onChange={(e) => setForm({ ...form, expectedDate: e.target.value ? new Date(e.target.value).toISOString() as any : null })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.notes") || "Notes"}</Label>
            <Input value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter className="gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 me-1" /> {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={createOrder.isPending}>
              {createOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
