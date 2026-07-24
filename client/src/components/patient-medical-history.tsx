import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { useMedicalHistory, useCreateMedicalHistory, useUpdateMedicalHistory, useDeleteMedicalHistory } from "@/hooks/use-api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Plus, Heart, Pencil, Trash2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const MEDICAL_CATEGORIES = [
  "allergy",
  "condition",
  "medication",
  "surgery",
  "family_history",
  "habit",
  "vaccination",
  "other",
] as const;

const SEVERITY_OPTIONS = [
  { value: "none", translationKey: "debt.severity-neutral" },
  { value: "minor", translationKey: "debt.severity-minor" },
  { value: "major", translationKey: "debt.severity-major" },
  { value: "critical", translationKey: "debt.severity-critical" },
] as const;

const SEVERITY_COLORS: Record<string, string> = {
  none: "bg-slate-100 text-slate-700 border-slate-200",
  minor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  major: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

interface MedicalFormData {
  category: string;
  value: string;
  severity: string;
  notes: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

const emptyForm = (): MedicalFormData => ({
  category: "",
  value: "",
  severity: "none",
  notes: "",
  isCurrent: true,
  startDate: "",
  endDate: "",
});

interface PatientMedicalHistoryProps {
  patientId: string;
}

export function PatientMedicalHistory({ patientId }: PatientMedicalHistoryProps) {
  const { t } = useLanguage();
  const { data: records = [], isLoading } = useMedicalHistory(patientId);
  const createMedical = useCreateMedicalHistory();
  const updateMedical = useUpdateMedicalHistory();
  const deleteMedical = useDeleteMedicalHistory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MedicalFormData>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleFieldChange = (field: keyof MedicalFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (record: typeof records[0]) => {
    setEditingId(record.id);
    setForm({
      category: record.category,
      value: record.value,
      severity: record.severity || "none",
      notes: record.notes || "",
      isCurrent: record.isCurrent,
      startDate: record.startDate ? format(new Date(record.startDate), "yyyy-MM-dd") : "",
      endDate: record.endDate ? format(new Date(record.endDate), "yyyy-MM-dd") : "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.value) {
      toast.error(t("common.field-required"));
      return;
    }
    try {
      const payload = {
        category: form.category,
        value: form.value,
        severity: form.severity === "none" ? null : form.severity,
        notes: form.notes || null,
        isCurrent: form.isCurrent,
        startDate: form.startDate ? new Date(form.startDate) : null,
        endDate: form.endDate ? new Date(form.endDate) : null,
      };
      if (editingId) {
        await updateMedical.mutateAsync({ id: editingId, data: payload });
        toast.success(t("common.saved"));
      } else {
        await createMedical.mutateAsync({ patientId, data: { ...payload, patientId } });
        toast.success(t("common.saved"));
      }
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm());
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedical.mutateAsync(deleteTarget);
      toast.success(t("common.deleted"));
      setDeleteTarget(null);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleCancel = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const categoryLabel = (cat: string) => t(`medical.category-${cat}` as any) || cat;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {t("workspace.tab-medical")}
          <span className="text-muted-foreground font-normal ml-2">({records.length})</span>
        </h3>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t("medical.add")}
        </Button>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title={t("patients.no-medical-history")}
          description={t("medical.add-first")}
          action={<Button size="sm" onClick={openCreate} className="cursor-pointer">{t("medical.add")}</Button>}
        />
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Stethoscope className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] font-medium bg-muted/50">
                          {categoryLabel(record.category)}
                        </Badge>
                        {record.severity && record.severity !== "none" && (
                          <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[record.severity] || ""}`}>
                            {t(`debt.severity-${record.severity}` as any)}
                          </Badge>
                        )}
                        {record.isCurrent && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            {t("medical.current")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1.5">{record.value}</p>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        {record.startDate && (
                          <span>{t("medical.from")} {format(new Date(record.startDate), "dd/MM/yyyy")}</span>
                        )}
                        {record.endDate && (
                          <span>{t("medical.to")} {format(new Date(record.endDate), "dd/MM/yyyy")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(record)} aria-label="Modifier">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(record.id)} aria-label="Supprimer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleCancel}>
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 pb-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                {editingId ? t("medical.edit") : t("medical.add")}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("medical.category")}</Label>
                <Select value={form.category} onValueChange={(v) => handleFieldChange("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("medical.category-placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDICAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{categoryLabel(cat)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("medical.value")}</Label>
                <Input
                  value={form.value}
                  onChange={(e) => handleFieldChange("value", e.target.value)}
                  placeholder={t("medical.value-placeholder")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("medical.severity")}</Label>
                  <Select value={form.severity} onValueChange={(v) => handleFieldChange("severity", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{t(opt.translationKey as any)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("medical.current-label")}</Label>
                  <Select value={form.isCurrent ? "true" : "false"} onValueChange={(v) => handleFieldChange("isCurrent", v === "true")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">{t("common.yes")}</SelectItem>
                      <SelectItem value="false">{t("common.no")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("medical.start-date")}</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => handleFieldChange("startDate", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t("medical.end-date")}</Label>
                  <Input type="date" value={form.endDate} onChange={(e) => handleFieldChange("endDate", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("medical.notes")}</Label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleFieldChange("notes", e.target.value)}
                  placeholder={t("medical.notes-placeholder")}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={createMedical.isPending || updateMedical.isPending}>
                  {(createMedical.isPending || updateMedical.isPending) ? t("common.saving") : t("common.save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={t("medical.delete-title")}
        description={t("medical.delete-desc")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        loading={deleteMedical.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
