import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useInvoices, useCreatePayment } from "@/hooks/use-api";

const PAYMENT_METHODS = ["cash", "card", "check", "transfer"];

interface PaymentDialogProps {
  invoiceId: string | null;
  onClose: () => void;
}

export function PaymentDialog({ invoiceId, onClose }: PaymentDialogProps) {
  const { t } = useLanguage();
  const createPayment = useCreatePayment();
  const { data: invoices = [] } = useInvoices();
  const [payForm, setPayForm] = useState({ amount: "", paymentMethod: "cash", paymentDate: new Date().toISOString().split("T")[0], notes: "" });
  const [payFieldErrors, setPayFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      const inv = invoices.find(i => i.id === invoiceId);
      const remaining = inv ? (parseFloat(inv.amount) - parseFloat(inv.paidAmount || "0.00")).toFixed(2) : "0.00";
      setPayForm(prev => ({ ...prev, amount: remaining }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const clearPayFieldError = (field: string) => setPayFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!payForm.amount) errors.amount = t("common.field-required");
    if (payForm.amount && (isNaN(Number(payForm.amount)) || Number(payForm.amount) <= 0)) errors.amount = t("common.field-invalid");
    if (!payForm.paymentDate) errors.paymentDate = t("common.field-required");
    setPayFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!invoiceId) return;
    setSaving(true);
    try {
      await createPayment.mutateAsync({
        invoiceId,
        amount: payForm.amount,
        paymentMethod: payForm.paymentMethod,
        paymentDate: new Date(payForm.paymentDate),
        notes: payForm.notes || null,
      });
      toast.success(t("billing.payment-recorded"));
      onClose();
      setPayForm({ amount: "", paymentMethod: "cash", paymentDate: new Date().toISOString().split("T")[0], notes: "" });
    } catch { toast.error(t("common.error")); }
    setSaving(false);
  };

  return (
    <Dialog open={!!invoiceId} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{t("billing.record-payment")}</DialogTitle></DialogHeader>
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("billing.amount-da")}</Label>
            <Input type="number" step="0.01" value={payForm.amount} onChange={(e) => { setPayForm({ ...payForm, amount: e.target.value }); clearPayFieldError("amount"); }} className={payFieldErrors.amount ? "border-destructive" : ""} />
            {payFieldErrors.amount && <FieldError errors={[{ message: payFieldErrors.amount }]} />}
          </div>
          <div className="space-y-1.5">
            <Label>{t("billing.payment-method")}</Label>
            <Select value={payForm.paymentMethod} onValueChange={(v) => setPayForm({ ...payForm, paymentMethod: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(m => (
                  <SelectItem key={m} value={m}>
                    {m === "cash" ? t("billing.payment-cash") : m === "card" ? t("billing.payment-card") : m === "check" ? t("billing.payment-check") : t("billing.payment-transfer")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("billing.date")}</Label>
            <Input type="date" value={payForm.paymentDate} onChange={(e) => { setPayForm({ ...payForm, paymentDate: e.target.value }); clearPayFieldError("paymentDate"); }} className={payFieldErrors.paymentDate ? "border-destructive" : ""} />
            {payFieldErrors.paymentDate && <FieldError errors={[{ message: payFieldErrors.paymentDate }]} />}
          </div>
          <div className="space-y-1.5">
            <Label>{t("billing.notes-optional")}</Label>
            <Input value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} placeholder={t("billing.notes-placeholder")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("billing.save-payment")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}