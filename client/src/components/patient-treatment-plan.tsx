import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { usePatientTreatments, useCreatePatientTreatment, useUpdatePatientTreatment, useDeletePatientTreatment, useTreatments, useDoctors } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { TreatmentPlanStats } from "@/components/treatment-plan/treatment-stats";
import { TreatmentToothFilter } from "@/components/treatment-plan/tooth-filter";
import { TreatmentPlanForm, type TreatmentFormData } from "@/components/treatment-plan/treatment-form";
import { TreatmentPlanList } from "@/components/treatment-plan/treatment-list";

interface PatientTreatmentPlanProps {
  patientId: string;
  selectedTooth?: number | null;
  onToothSelect?: (tooth: number | null) => void;
}

export function PatientTreatmentPlan({ patientId, selectedTooth, onToothSelect }: PatientTreatmentPlanProps) {
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const { data: treatments = [], isLoading } = usePatientTreatments(patientId);
  const { data: treatmentCatalog = [] } = useTreatments();
  const { data: doctors = [] } = useDoctors();
  const createTreatment = useCreatePatientTreatment();
  const updateTreatment = useUpdatePatientTreatment();
  const deleteTreatment = useDeletePatientTreatment();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toothFilter, setToothFilter] = useState<string>(selectedTooth ? String(selectedTooth) : "");

  const [formData, setFormData] = useState<TreatmentFormData>({
    toothNumber: selectedTooth ? String(selectedTooth) : "",
    treatmentId: "",
    doctorId: "",
    status: "pending",
    priority: "medium",
    cost: "",
    notes: "",
  });

  useEffect(() => {
    if (selectedTooth) {
      setToothFilter(String(selectedTooth));
    }
  }, [selectedTooth]);

  const stats = useMemo(() => {
    const total = treatments.length;
    const planned = treatments.filter((t) => t.status === "planned" || t.status === "pending").length;
    const inProgress = treatments.filter((t) => t.status === "in_progress").length;
    const completed = treatments.filter((t) => t.status === "completed").length;
    const cancelled = treatments.filter((t) => t.status === "cancelled").length;
    const active = total - completed - cancelled;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, planned, inProgress, completed, cancelled, active, pct };
  }, [treatments]);

  const filteredTreatments = toothFilter && toothFilter !== "__all__"
    ? treatments.filter((t) => t.toothNumber === toothFilter)
    : treatments;

  const resetForm = () => {
    setFormData({
      toothNumber: selectedTooth ? String(selectedTooth) : "",
      treatmentId: "",
      doctorId: "",
      status: "pending",
      priority: "medium",
      cost: "",
      notes: "",
    });
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.toothNumber || !formData.treatmentId) {
      toast.error("Veuillez sélectionner une dent et un traitement");
      return;
    }
    try {
      await createTreatment.mutateAsync({
        patientId,
        data: {
          patientId,
          toothNumber: formData.toothNumber,
          treatmentId: formData.treatmentId,
          doctorId: formData.doctorId || undefined,
          status: formData.status,
          priority: formData.priority,
          cost: formData.cost || undefined,
          notes: formData.notes || undefined,
        },
      });
      toast.success("Traitement ajouté au plan de soins");
      resetForm();
    } catch {
      toast.error("Erreur lors de l'ajout du traitement");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateTreatment.mutateAsync({
        id,
        data: {
          status: formData.status,
          priority: formData.priority,
          notes: formData.notes,
          cost: formData.cost || undefined,
          doctorId: formData.doctorId || undefined,
        },
      });
      toast.success("Traitement mis à jour");
      setEditingId(null);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce traitement du plan de soins ?")) return;
    try {
      await deleteTreatment.mutateAsync(id);
      toast.success("Traitement supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleEdit = (treatment: any) => {
    setEditingId(treatment.id);
    setFormData({
      toothNumber: treatment.toothNumber || "",
      treatmentId: treatment.treatmentId || "",
      doctorId: treatment.doctorId || "",
      status: treatment.status || "pending",
      priority: treatment.priority || "medium",
      cost: treatment.cost || "",
      notes: treatment.notes || "",
    });
  };

  const handleFieldChange = (field: keyof TreatmentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TreatmentPlanStats
        stats={stats}
        showForm={showForm}
        onToggleForm={() => { resetForm(); setShowForm(!showForm); }}
      />
      <TreatmentToothFilter value={toothFilter} onValueChange={setToothFilter} />
      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <TreatmentPlanForm
              mode="add"
              formData={formData}
              treatmentCatalog={treatmentCatalog}
              doctors={doctors}
              isSubmitting={createTreatment.isPending}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              onFieldChange={handleFieldChange}
            />
          </CardContent>
        </Card>
      )}
      <TreatmentPlanList
        treatments={filteredTreatments}
        toothFilter={toothFilter}
        editingId={editingId}
        expandedId={expandedId}
        formData={formData}
        isUpdating={updateTreatment.isPending}
        onFieldChange={handleFieldChange}
        onToggleExpand={(id) => setExpandedId((prev) => (prev === id ? null : id))}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCancelEdit={() => setEditingId(null)}
        onSaveEdit={handleUpdate}
        onToothSelect={onToothSelect}
      />
    </div>
  );
}