import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { useCreateInventoryProduct, useUpdateInventoryProduct, useInventorySuppliers, useInventoryProducts } from "@/hooks/use-api";
import type { InventoryProduct, InsertInventoryProduct } from "@shared/schema";

const defaultForm = (): Partial<InsertInventoryProduct> => ({
  name: "", sku: "", category: "", description: "", unit: "piece",
  purchasePrice: "0.00", sellingPrice: "0.00",
  currentStock: 0, minimumStock: 5, maximumStock: 100,
  supplierId: null, expirationDate: null,
});

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: InventoryProduct | null;
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const { t } = useLanguage();
  const createProduct = useCreateInventoryProduct();
  const updateProduct = useUpdateInventoryProduct();
  const { data: suppliers = [] } = useInventorySuppliers();
  const { data: products = [] } = useInventoryProducts();
  const [form, setForm] = useState<Partial<InsertInventoryProduct>>(defaultForm());

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];
  const isSaving = createProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        name: product.name, sku: product.sku || "", category: product.category || "", description: product.description || "",
        unit: product.unit, purchasePrice: product.purchasePrice, sellingPrice: product.sellingPrice,
        currentStock: product.currentStock, minimumStock: product.minimumStock, maximumStock: product.maximumStock,
        supplierId: product.supplierId || null, expirationDate: product.expirationDate ? new Date(product.expirationDate).toISOString().split("T")[0] as any : null,
      });
    } else {
      setForm(defaultForm());
    }
  }, [open, product]);

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error(t("common.required")); return; }
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, data: form });
      } else {
        await createProduct.mutateAsync(form as InsertInventoryProduct);
      }
      toast.success(t("common.saved"));
      handleClose();
    } catch { toast.error(t("common.error")); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="p-5 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {product ? t("common.edit") : t("inventory.addProduct")}
            </DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.name")} *</Label>
              <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.sku")}</Label>
              <Input value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.category")}</Label>
            <Select value={form.category || ""} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue placeholder={t("inventory.category")} /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                <SelectItem value="__custom__">{t("common.other") || "Autre"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.description") || "Description"}</Label>
            <Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.unit")}</Label>
              <Input value={form.unit || "piece"} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.purchasePrice") || "PA"}</Label>
              <Input type="number" step="0.01" value={form.purchasePrice || "0.00"} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.sellingPrice") || "PV"}</Label>
              <Input type="number" step="0.01" value={form.sellingPrice || "0.00"} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.stock")}</Label>
              <Input type="number" value={form.currentStock ?? 0} onChange={(e) => setForm({ ...form, currentStock: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.minStock")}</Label>
              <Input type="number" value={form.minimumStock ?? 5} onChange={(e) => setForm({ ...form, minimumStock: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.maxStock") || "Stock max"}</Label>
              <Input type="number" value={form.maximumStock ?? 100} onChange={(e) => setForm({ ...form, maximumStock: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.suppliers")}</Label>
            <Select value={form.supplierId || ""} onValueChange={(v) => setForm({ ...form, supplierId: v || null })}>
              <SelectTrigger><SelectValue placeholder={t("inventory.selectSupplier") || "Sélectionner un fournisseur"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("common.none") || "Aucun"}</SelectItem>
                {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.expiration")}</Label>
            <Input type="date" value={form.expirationDate ? new Date(form.expirationDate).toISOString().split("T")[0] : ""} onChange={(e) => setForm({ ...form, expirationDate: e.target.value ? new Date(e.target.value).toISOString() as any : null })} />
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
