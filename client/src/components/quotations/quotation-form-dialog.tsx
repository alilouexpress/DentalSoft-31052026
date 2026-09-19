import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { usePatients, useDoctors, useCreateQuotation } from "@/hooks/use-api";

interface QuotationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}

export default function QuotationFormDialog({ open, onOpenChange, onCreated }: QuotationFormDialogProps) {
  const { t } = useLanguage();
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();
  const createQuotation = useCreateQuotation();
  const [form, setForm] = useState({ patientId: "", doctorId: "", validUntil: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ patientId: "", doctorId: "", validUntil: "", notes: "" });
      setSaving(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) { toast.error(t("quotations.selectPatient")); return; }
    setSaving(true);
    try {
      const result = (await createQuotation.mutateAsync({
        patientId: form.patientId,
        quoteNumber: `DEV-${Date.now()}`,
        doctorId: form.doctorId || null,
        status: "draft",
        totalAmount: "0.00",
        discount: "0.00",
        tax: "0.00",
        finalAmount: "0.00",
        notes: form.notes || null,
        validUntil: form.validUntil ? new Date(form.validUntil) : null,
      })) as { id: string };
      toast.success(t("quotations.created") || "Devis créé");
      onCreated(result.id);
    } catch { toast.error(t("common.error")); }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onOpenChange(false); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("quotations.add")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("quotations.selectPatient")}</Label>
            <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
              <SelectTrigger><SelectValue placeholder={t("quotations.selectPatient")} /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("quotations.doctor")}</Label>
            <Select value={form.doctorId || ""} onValueChange={(v) => setForm({ ...form, doctorId: v })}>
              <SelectTrigger><SelectValue placeholder={t("quotations.doctor")} /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("quotations.validUntil")}</Label>
            <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("quotations.notes")}</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}