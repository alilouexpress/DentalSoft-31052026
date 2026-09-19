import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useDeletePayment } from "@/hooks/use-api";

interface DeletePaymentDialogProps {
  id: string | null;
  onClose: () => void;
}

export function DeletePaymentDialog({ id, onClose }: DeletePaymentDialogProps) {
  const { t, dir } = useLanguage();
  const deletePayment = useDeletePayment();

  const handleDeletePayment = async () => {
    if (!id) return;
    try {
      await deletePayment.mutateAsync(id);
      toast.success(t("debt.payment-deleted"));
      onClose();
    } catch { toast.error(t("common.error")); }
  };

  return (
    <Dialog open={!!id} onOpenChange={() => onClose()}>
      <DialogContent className={dir === "rtl" ? "font-arabic" : ""}>
        <DialogHeader>
          <DialogTitle>{t("debt.delete-payment")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t("common.confirm-delete")}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>{t("common.cancel")}</Button>
          <Button variant="destructive" onClick={handleDeletePayment} disabled={deletePayment.isPending}>{t("common.delete")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}