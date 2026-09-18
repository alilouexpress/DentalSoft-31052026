import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, Loader2 } from "lucide-react";
import { useCreateInventorySupplier, useUpdateInventorySupplier } from "@/hooks/use-api";
import type { InventorySupplier, InsertInventorySupplier } from "@shared/schema";

const defaultForm = (): Partial<InsertInventorySupplier> => ({
  name: "", contactPerson: "", email: "", phone: "", address: "", notes: "", isActive: true,
});

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: InventorySupplier | null;
}

export function SupplierFormDialog({ open, onOpenChange, supplier }: SupplierFormDialogProps) {
  const { t } = useLanguage();
  const createSupplier = useCreateInventorySupplier();
  const updateSupplier = useUpdateInventorySupplier();
  const [form, setForm] = useState<Partial<InsertInventorySupplier>>(defaultForm());
  const isSaving = createSupplier.isPending || updateSupplier.isPending;

  useEffect(() => {
    if (!open) return;
    if (supplier) {
      setForm({
        name: supplier.name, contactPerson: supplier.contactPerson || "", email: supplier.email || "",
        phone: supplier.phone || "", address: supplier.address || "", notes: supplier.notes || "", isActive: supplier.isActive,
      });
    } else {
      setForm(defaultForm());
    }
  }, [open, supplier]);

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error(t("common.required")); return; }
    try {
      if (supplier) {
        await updateSupplier.mutateAsync({ id: supplier.id, data: form });
      } else {
        await createSupplier.mutateAsync(form as InsertInventorySupplier);
      }
      toast.success(t("common.saved"));
      handleClose();
    } catch { toast.error(t("common.error")); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <div className="p-5 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {supplier ? t("common.edit") : t("inventory.addSupplier") || "Ajouter un fournisseur"}
            </DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.name")} *</Label>
            <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.contactPerson") || "Contact"}</Label>
            <Input value={form.contactPerson || ""} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.email") || "Email"}</Label>
              <Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.phone") || "Téléphone"}</Label>
              <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.address") || "Adresse"}</Label>
            <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.notes") || "Notes"}</Label>
            <Input value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter className="gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 me-1" /> {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
