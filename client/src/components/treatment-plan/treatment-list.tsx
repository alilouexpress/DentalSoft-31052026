import { format } from "date-fns";
import { ChevronDown, ChevronUp, Edit3, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PatientTreatment } from "@shared/schema";
import { TreatmentStatusBadge, TreatmentPriorityBadge } from "./badges";
import { TreatmentPlanForm, type TreatmentFormData } from "./treatment-form";
import { TreatmentHistoryPanel } from "./treatment-history-panel";

export type TreatmentRecord = PatientTreatment & { treatmentName?: string; doctorName?: string };

interface TreatmentPlanListProps {
  treatments: TreatmentRecord[];
  toothFilter: string;
  editingId: string | null;
  expandedId: string | null;
  formData: TreatmentFormData;
  isUpdating: boolean;
  onFieldChange: (field: keyof TreatmentFormData, value: string) => void;
  onToggleExpand: (id: string) => void;
  onEdit: (treatment: TreatmentRecord) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onToothSelect?: (tooth: number | null) => void;
}

export function TreatmentPlanList({
  treatments,
  toothFilter,
  editingId,
  expandedId,
  formData,
  isUpdating,
  onFieldChange,
  onToggleExpand,
  onEdit,
  onDelete,
  onCancelEdit,
  onSaveEdit,
  onToothSelect,
}: TreatmentPlanListProps) {
  if (treatments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <svg className="h-10 w-10 mb-2 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11h4" />
          <path d="M12 16h4" />
          <path d="M8 11h.01" />
          <path d="M8 16h.01" />
        </svg>
        <p className="text-sm">Aucun traitement dans le plan de soins</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {toothFilter ? "Aucun traitement pour cette dent" : "Ajoutez un traitement pour commencer"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {treatments.map((treatment) => (
        <TreatmentPlanCard
          key={treatment.id}
          treatment={treatment}
          isEditing={editingId === treatment.id}
          isExpanded={expandedId === treatment.id}
          formData={formData}
          isUpdating={isUpdating}
          onFieldChange={onFieldChange}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          onToothSelect={onToothSelect}
        />
      ))}
    </div>
  );
}

interface TreatmentPlanCardProps {
  treatment: TreatmentRecord;
  isEditing: boolean;
  isExpanded: boolean;
  formData: TreatmentFormData;
  isUpdating: boolean;
  onFieldChange: (field: keyof TreatmentFormData, value: string) => void;
  onToggleExpand: (id: string) => void;
  onEdit: (treatment: TreatmentRecord) => void;
  onDelete: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onToothSelect?: (tooth: number | null) => void;
}

function TreatmentPlanCard({
  treatment,
  isEditing,
  isExpanded,
  formData,
  isUpdating,
  onFieldChange,
  onToggleExpand,
  onEdit,
  onDelete,
  onCancelEdit,
  onSaveEdit,
  onToothSelect,
}: TreatmentPlanCardProps) {
  const priority = treatment.priority || "medium";
  const isHighOrUrgent = priority === "high" || priority === "urgent";
  return (
    <Card
      className={`border-border/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${isHighOrUrgent ? "border-l-2 border-l-orange-400" : ""}`}
      onClick={() => onToothSelect?.(treatment.toothNumber ? parseInt(treatment.toothNumber) : null)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{treatment.treatmentName || "Traitement"}</span>
              <TreatmentStatusBadge status={treatment.status || "pending"} />
              <TreatmentPriorityBadge priority={treatment.priority || "medium"} />
              {treatment.toothNumber && (
                <Badge variant="secondary" className="text-[10px] font-mono">Dent {treatment.toothNumber}</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
              {treatment.cost && (
                <span>{parseFloat(treatment.cost).toLocaleString()} DA</span>
              )}
              {treatment.doctorName && (
                <span>Dr. {treatment.doctorName}</span>
              )}
              <span>Créé: {format(new Date(treatment.createdAt), "dd/MM/yyyy")}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => { e.stopPropagation(); onToggleExpand(treatment.id); }}
            >
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-primary"
              onClick={(e) => { e.stopPropagation(); onEdit(treatment); }}
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-rose-500"
              onClick={(e) => { e.stopPropagation(); onDelete(treatment.id); }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {isExpanded && !isEditing && (
          <div className="mt-3 space-y-3 border-t pt-3">
            {treatment.notes && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Notes</p>
                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                  {treatment.notes}
                </div>
              </div>
            )}
            <TreatmentHistoryPanel treatmentId={treatment.id} />
          </div>
        )}

        {isEditing && (
          <div className="mt-3 space-y-3 border-t pt-3">
            <TreatmentPlanForm
              mode="edit"
              formData={formData}
              isSubmitting={isUpdating}
              onSubmit={() => onSaveEdit(treatment.id)}
              onCancel={onCancelEdit}
              onFieldChange={onFieldChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}