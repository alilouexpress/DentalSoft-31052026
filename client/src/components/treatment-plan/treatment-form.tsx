import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { TREATMENT_STATUSES, PRIORITIES, FDI_TEETH } from "./constants";

export interface TreatmentFormData {
  toothNumber: string;
  treatmentId: string;
  doctorId: string;
  status: string;
  priority: string;
  cost: string;
  notes: string;
}

interface TreatmentPlanFormProps {
  mode: "add" | "edit";
  formData: TreatmentFormData;
  treatmentCatalog?: { id: string; name: string }[];
  doctors?: { id: string; name: string }[];
  isSubmitting?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onFieldChange: (field: keyof TreatmentFormData, value: string) => void;
}

export function TreatmentPlanForm({
  mode,
  formData,
  treatmentCatalog = [],
  doctors = [],
  isSubmitting = false,
  onSubmit,
  onCancel,
  onFieldChange,
}: TreatmentPlanFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {mode === "add" && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Dent</label>
            <Select value={formData.toothNumber} onValueChange={(v) => onFieldChange("toothNumber", v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {FDI_TEETH.map((t) => (
                  <SelectItem key={t} value={String(t)} className="text-xs">Dent {t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {mode === "add" && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase">Traitement</label>
            <Select value={formData.treatmentId} onValueChange={(v) => onFieldChange("treatmentId", v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {treatmentCatalog.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Statut</label>
          <Select value={formData.status} onValueChange={(v) => onFieldChange("status", v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TREATMENT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Priorité</label>
          <Select value={formData.priority} onValueChange={(v) => onFieldChange("priority", v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Coût (DA)</label>
          <Input
            type="number"
            value={formData.cost}
            onChange={(e) => onFieldChange("cost", e.target.value)}
            className="h-8 text-xs"
            placeholder={mode === "add" ? "0" : undefined}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Médecin</label>
          <Select value={formData.doctorId} onValueChange={(v) => onFieldChange("doctorId", v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Non assigné" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d: any) => (
                <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase">Notes</label>
        <Textarea
          value={formData.notes}
          onChange={(e) => onFieldChange("notes", e.target.value)}
          className={mode === "add" ? "min-h-[60px] text-xs resize-none" : "min-h-[50px] text-xs resize-none"}
          placeholder={mode === "add" ? "Notes concernant ce traitement..." : undefined}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onCancel}>Annuler</Button>
        <Button size="sm" className="h-7 gap-1 text-xs" onClick={onSubmit} disabled={isSubmitting}>
          <Save className="h-3 w-3" /> {mode === "add" ? "Ajouter" : "Enregistrer"}
        </Button>
      </div>
    </>
  );
}