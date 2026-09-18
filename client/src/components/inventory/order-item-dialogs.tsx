import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { X, Loader2, Boxes } from "lucide-react";
import { usePurchaseOrderItems, useAddPurchaseOrderItem, useInventoryProducts } from "@/hooks/use-api";

export function OrderItemsDialog({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const { t } = useLanguage();
  const { data: orderItems = [] } = usePurchaseOrderItems(orderId || "");

  return (
    <Dialog open={!!orderId} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <div className="p-5 pb-4 border-b border-border flex items-center justify-between">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t("inventory.orderItems") || "Articles de la commande"}</DialogTitle>
          </DialogHeader>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Fermer">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5">
          {orderItems.length === 0 ? (
            <EmptyState icon={<Boxes />} title="Aucun article" description="Ajoutez des articles à l'inventaire" />
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {orderItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.productName || item.productId}</p>
                    <p className="text-xs text-muted-foreground">{t("inventory.quantity") || "Qté"}: {item.quantity} × {parseFloat(item.unitPrice).toLocaleString()} DA</p>
                  </div>
                  <p className="text-sm font-bold">{parseFloat(item.total).toLocaleString()} DA</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const emptyItem = { productId: "", quantity: "1", unitPrice: "0.00" };

export function AddItemDialog({ orderId, open, onOpenChange }: { orderId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useLanguage();
  const addPOItem = useAddPurchaseOrderItem();
  const { data: products = [] } = useInventoryProducts();
  const [itemForm, setItemForm] = useState(emptyItem);

  useEffect(() => {
    if (open) setItemForm(emptyItem);
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.productId || !itemForm.quantity) { toast.error(t("common.required")); return; }
    const qty = parseInt(itemForm.quantity);
    const price = itemForm.unitPrice;
    const total = (qty * parseFloat(price)).toFixed(2);
    try {
      await addPOItem.mutateAsync({
        orderId,
        data: {
          productId: itemForm.productId,
          quantity: qty,
          unitPrice: price,
          total,
        },
      });
      toast.success(t("common.saved"));
      handleClose();
    } catch { toast.error(t("common.error")); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0">
        <div className="p-5 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t("inventory.addItem") || "Ajouter un article"}</DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.product") || "Produit"} *</Label>
            <Select value={itemForm.productId} onValueChange={(v) => setItemForm({ ...itemForm, productId: v })}>
              <SelectTrigger><SelectValue placeholder={t("inventory.selectProduct") || "Sélectionner un produit"} /></SelectTrigger>
              <SelectContent>
                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.quantity") || "Quantité"}</Label>
              <Input type="number" min="1" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("inventory.unitPrice") || "Prix unitaire"}</Label>
              <Input type="number" step="0.01" value={itemForm.unitPrice} onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })} />
            </div>
          </div>
          {itemForm.productId && itemForm.quantity && itemForm.unitPrice && (
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">{t("inventory.total") || "Total"}</p>
              <p className="text-lg font-bold">{(parseInt(itemForm.quantity) * parseFloat(itemForm.unitPrice || "0")).toLocaleString()} DA</p>
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={addPOItem.isPending}>
              {addPOItem.isPending ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
