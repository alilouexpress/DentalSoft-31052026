import type { Patient, StatusConfig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useState } from "react";
import { useCreateInvoice } from "@/hooks/use-api";

interface NewInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  patients: Patient[];
  statusConfigs: StatusConfig[];
}

export function NewInvoiceDialog({ open, onClose, patients, statusConfigs }: NewInvoiceDialogProps) {
  const { t } = useLanguage();
  const createInvoice = useCreateInvoice();
  const [form, setForm] = useState({ patientId: "", amount: "", date: new Date().toISOString().split("T")[0], dueDate: "", status: "Pending" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const clearFieldError = (field: string) => setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.patientId) errors.patientId = t("common.field-required");
    if (!form.amount) errors.amount = t("common.field-required");
    if (form.amount && (isNaN(Number(form.amount)) || Number(form.amount) <= 0)) errors.amount = t("common.field-invalid");
    if (!form.date) errors.date = t("common.field-required");
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      await createInvoice.mutateAsync({
        patientId: form.patientId,
        amount: form.amount,
        date: new Date(form.date),
        dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
        status: form.status,
        notes: null,
        doctorId: null,
      });
      toast.success(t("billing.invoice-created"));
      onClose();
      setForm({ patientId: "", amount: "", date: new Date().toISOString().split("T")[0], dueDate: "", status: "Pending" });
    } catch { toast.error(t("common.error")); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{t("billing.invoice-title")}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("billing.select-patient")}</Label>
            <Select value={form.patientId} onValueChange={(v) => { setForm({ ...form, patientId: v }); clearFieldError("patientId"); }}>
              <SelectTrigger className={fieldErrors.patientId ? "border-destructive" : ""}><SelectValue placeholder={t("billing.select-patient")} /></SelectTrigger>
              <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
            {fieldErrors.patientId && <FieldError errors={[{ message: fieldErrors.patientId }]} />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("billing.amount")}</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }); clearFieldError("amount"); }} className={fieldErrors.amount ? "border-destructive" : ""} />
              {fieldErrors.amount && <FieldError errors={[{ message: fieldErrors.amount }]} />}
            </div>
            <div className="space-y-1.5">
              <Label>{t("billing.date")}</Label>
              <Input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); clearFieldError("date"); }} className={fieldErrors.date ? "border-destructive" : ""} />
              {fieldErrors.date && <FieldError errors={[{ message: fieldErrors.date }]} />}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("billing.due-date")}</Label>
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("billing.status")}</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusConfigs.map(sc => (
                  <SelectItem key={sc.id} value={sc.statusValue}>{sc.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t("billing.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving ? t("billing.saving") : t("billing.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}