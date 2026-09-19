import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useInvoicePayments, useUpdatePayment } from "@/hooks/use-api";

interface EditPaymentDialogProps {
  paymentId: string | null;
  onClose: () => void;
}

export function EditPaymentDialog({ paymentId, onClose }: EditPaymentDialogProps) {
  const { t, dir } = useLanguage();
  const { data: invoicePayments = [] } = useInvoicePayments(paymentId || "");
  const updatePayment = useUpdatePayment();
  const [editForm, setEditForm] = useState({ amount: "", paymentMethod: "cash", paymentDate: "", notes: "" });

  useEffect(() => {
    if (!paymentId) return;
    const payment = invoicePayments.find(p => p.id === paymentId);
    if (payment) {
      setEditForm({
        amount: payment.amount,
        paymentMethod: payment.paymentMethod || "cash",
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        notes: payment.notes || "",
      });
    }
  }, [paymentId, invoicePayments]);

  const handleEditPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!paymentId) return;
    try {
      await updatePayment.mutateAsync({
        id: paymentId,
        data: {
          amount: editForm.amount,
          paymentMethod: editForm.paymentMethod,
          paymentDate: editForm.paymentDate ? new Date(editForm.paymentDate) : undefined,
          notes: editForm.notes || null,
        },
      });
      toast.success(t("debt.payment-saved"));
      onClose();
    } catch { toast.error(t("common.error")); }
  };

  return (
    <Dialog open={!!paymentId} onOpenChange={() => onClose()}>
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
            <Button type="button" variant="outline" onClick={() => onClose()}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={updatePayment.isPending}>{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}