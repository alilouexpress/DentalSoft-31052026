import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { MedicalHistoryRecord } from "@shared/schema";
import { useCreateMedicalHistory, useUpdateMedicalHistory } from "@/hooks/use-api";
import { CATEGORIES, SEVERITY_OPTIONS, severityDot, emptyForm, type FormState, type Severity } from "./constants";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  record: MedicalHistoryRecord | null;
}

export default function MedicalHistoryFormDialog({ open, onOpenChange, patientId, record }: Props) {
  const { t } = useLanguage();
  const createMedicalHistory = useCreateMedicalHistory();
  const updateMedicalHistory = useUpdateMedicalHistory();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
    }
  }, [open]);

  useEffect(() => {
    if (open && record) {
      setForm({
        category: record.category,
        value: record.value,
        severity: (record.severity as Severity) || "none",
        startDate: record.startDate ? new Date(record.startDate).toISOString().slice(0, 10) : "",
        endDate: record.endDate ? new Date(record.endDate).toISOString().slice(0, 10) : "",
        isCurrent: record.isCurrent,
        notes: record.notes || "",
      });
    }
  }, [open, record]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value.trim()) {
      toast.error(t("medicalHistory.value-required"));
      return;
    }
    setSaving(true);
    try {
      const basePayload = {
        category: form.category,
        value: form.value.trim(),
        severity: form.severity === "none" ? null : form.severity,
        startDate: form.startDate ? new Date(form.startDate) : null,
        endDate: form.endDate ? new Date(form.endDate) : null,
        notes: form.notes.trim() || null,
        isCurrent: form.isCurrent,
      };

      if (record) {
        await updateMedicalHistory.mutateAsync({ id: record.id, data: basePayload });
        toast.success(t("common.saved"));
      } else {
        await createMedicalHistory.mutateAsync({ patientId, data: { ...basePayload, patientId } });
        toast.success(t("medicalHistory.created"));
      }
      onOpenChange(false);
    } catch {
      toast.error(t("common.error"));
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{record ? t("common.edit") : t("medicalHistory.add")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("medicalHistory.category")}</Label>
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger>
                <SelectValue placeholder={t("medicalHistory.category")} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`medicalHistory.${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("medicalHistory.value")}</Label>
            <Input
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              placeholder={t("medicalHistory.value-placeholder")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("medicalHistory.severity")}</Label>
            <Select value={form.severity} onValueChange={(v: Severity) => setForm((f) => ({ ...f, severity: v }))}>
              <SelectTrigger>
                <SelectValue placeholder={t("medicalHistory.severity")} />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${severityDot[opt.value]}`} />
                      {t(opt.labelKey)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("medicalHistory.startDate")}</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("medicalHistory.endDate")}</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.isCurrent}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isCurrent: v }))}
              id="is-current"
            />
            <Label htmlFor="is-current" className="cursor-pointer">{t("medicalHistory.current")}</Label>
          </div>
          <div className="space-y-1.5">
            <Label>{t("medicalHistory.notes")}</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder={t("medicalHistory.notes-placeholder")}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}