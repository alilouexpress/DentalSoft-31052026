import { useLayoutEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useInvoices, useCreatePayment } from "@/hooks/use-api";

interface AddPaymentDialogProps {
  patientId: string | null;
  defaultAmount: string;
  onClose: () => void;
}

export function AddPaymentDialog({ patientId, defaultAmount, onClose }: AddPaymentDialogProps) {
  const { t, dir } = useLanguage();
  const { data: allInvoices = [] } = useInvoices();
  const createPayment = useCreatePayment();
  const [newPayment, setNewPayment] = useState({ amount: "", paymentMethod: "cash", paymentDate: new Date().toISOString().split("T")[0], notes: "" });

  useLayoutEffect(() => {
    if (patientId) setNewPayment(p => ({ ...p, amount: defaultAmount }));
  }, [patientId, defaultAmount]);

  const handleAddPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    const debtorInvoices = allInvoices.filter(i => i.patientId === patientId && i.status !== "Paid");
    if (debtorInvoices.length === 0) {
      toast.error(t("debt.no-unpaid-invoices"));
      return;
    }
    try {
      await createPayment.mutateAsync({
        invoiceId: debtorInvoices[0].id,
        amount: newPayment.amount,
        paymentMethod: newPayment.paymentMethod,
        paymentDate: new Date(newPayment.paymentDate),
        notes: newPayment.notes || null,
      });
      toast.success(t("debt.payment-created"));
      onClose();
      setNewPayment({ amount: "", paymentMethod: "cash", paymentDate: new Date().toISOString().split("T")[0], notes: "" });
    } catch { toast.error(t("common.error")); }
  };

  return (
    <Dialog open={!!patientId} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={`sm:max-w-md ${dir === "rtl" ? "font-arabic" : ""}`}>
        <DialogHeader>
          <DialogTitle>{t("debt.add-payment")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddPayment}>
          <div className="space-y-4">
            <div>
              <Label>{t("debt.payment-amount")}</Label>
              <Input type="number" step="0.01" value={newPayment.amount} onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))} required />
            </div>
            <div>
              <Label>{t("debt.payment-method")}</Label>
              <Select value={newPayment.paymentMethod} onValueChange={v => setNewPayment(p => ({ ...p, paymentMethod: v }))}>
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
              <Input type="date" value={newPayment.paymentDate} onChange={e => setNewPayment(p => ({ ...p, paymentDate: e.target.value }))} required />
            </div>
            <div>
              <Label>{t("debt.payment-notes")}</Label>
              <Input value={newPayment.notes} onChange={e => setNewPayment(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onClose()}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={createPayment.isPending}>{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}