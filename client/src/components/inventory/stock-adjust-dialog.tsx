import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useAdjustStock } from "@/hooks/use-api";
import type { InventoryProduct } from "@shared/schema";

interface StockAdjustDialogProps {
  product: InventoryProduct | null;
  onClose: () => void;
}

export function StockAdjustDialog({ product, onClose }: StockAdjustDialogProps) {
  const { t } = useLanguage();
  const adjustStock = useAdjustStock();
  const [qty, setQty] = useState(1);
  const [type, setType] = useState<"in" | "out">("in");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (product) {
      setQty(1);
      setType("in");
      setNotes("");
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || qty <= 0) return;
    try {
      await adjustStock.mutateAsync({
        id: product.id,
        quantity: qty,
        type,
        notes: notes || undefined,
      });
      toast.success(t("common.saved"));
      onClose();
    } catch { toast.error(t("common.error")); }
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0">
        <div className="p-5 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t("inventory.adjustStock")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1">{product?.name}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex gap-3">
            <Button type="button" variant={type === "in" ? "default" : "outline"} className="flex-1" onClick={() => setType("in")}>
              {t("inventory.stockIn") || "Entrée"}
            </Button>
            <Button type="button" variant={type === "out" ? "default" : "outline"} className="flex-1" onClick={() => setType("out")}>
              {t("inventory.stockOut") || "Sortie"}
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.quantity") || "Quantité"}</Label>
            <Input type="number" min="1" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("inventory.notes") || "Notes"}</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("inventory.notesPlaceholder") || "Raison de l'ajustement"} />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={adjustStock.isPending}>
              {adjustStock.isPending ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
