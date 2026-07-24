import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { usePatientTreatments, useCreatePatientTreatment, useUpdatePatientTreatment, useDeletePatientTreatment, useTreatments, useDoctors, useTreatmentHistory } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Edit3, Trash2, Save, X, ChevronDown, ChevronUp, Eye, AlertCircle, ArrowUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const TREATMENT_STATUSES = [
  { value: "pending", label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "planned", label: "Planifi\u00e9", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "in_progress", label: "En cours", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "completed", label: "Termin\u00e9", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "cancelled", label: "Annul\u00e9", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

const PRIORITIES = [
  { value: "low", label: "Basse", color: "bg-gray-100 text-gray-600", icon: null },
  { value: "medium", label: "Moyenne", color: "bg-blue-100 text-blue-700", icon: null },
  { value: "high", label: "Haute", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  { value: "urgent", label: "Urgente", color: "bg-red-100 text-red-700", icon: AlertTriangle },
];

const FDI_TEETH = [
  18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
  48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38,
  55,54,53,52,51,61,62,63,64,65,
  85,84,83,82,81,71,72,73,74,75,
];

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

  const [formData, setFormData] = useState({
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

  const handleToothFilterChange = (val: string) => {
    setToothFilter(val);
  };

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
      toast.error("Veuillez s\u00e9lectionner une dent et un traitement");
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
      toast.success("Traitement ajout\u00e9 au plan de soins");
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
      toast.success("Traitement mis \u00e0 jour");
      setEditingId(null);
    } catch {
      toast.error("Erreur lors de la mise \u00e0 jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce traitement du plan de soins ?")) return;
    try {
      await deleteTreatment.mutateAsync(id);
      toast.success("Traitement supprim\u00e9");
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

  const getStatusBadge = (status: string) => {
    const s = TREATMENT_STATUSES.find((s) => s.value === status);
    return s ? (
      <Badge variant="outline" className={`${s.color} text-[10px] px-2 py-0`}>{s.label}</Badge>
    ) : (
      <Badge variant="outline" className="text-[10px]">{status}</Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const p = PRIORITIES.find((p) => p.value === priority);
    return p ? (
      <Badge variant="outline" className={`${p.color} text-[10px] px-2 py-0 gap-0.5`}>
        {p.icon && <p.icon className="h-2.5 w-2.5" />}
        {p.label}
      </Badge>
    ) : null;
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
      {/* Stats + Progress Bar */}
      <Card className="border-border/40 shadow-sm bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Plan de soins</h3>
              <Badge variant="secondary" className="text-[10px]">{stats.total} total</Badge>
            </div>
            <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => { resetForm(); setShowForm(!showForm); }}>
              {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {showForm ? "Annuler" : "Nouveau traitement"}
            </Button>
          </div>
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{stats.completed}/{stats.total} termin\u00e9s</span>
              <span>{stats.pct}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-blue-50 rounded p-1.5">
              <p className="text-lg font-bold text-blue-700">{stats.planned + stats.inProgress}</p>
              <p className="text-[10px] text-blue-600/70 uppercase tracking-wider">En cours</p>
            </div>
            <div className="bg-emerald-50 rounded p-1.5">
              <p className="text-lg font-bold text-emerald-700">{stats.completed}</p>
              <p className="text-[10px] text-emerald-600/70 uppercase tracking-wider">Termin\u00e9s</p>
            </div>
            <div className="bg-amber-50 rounded p-1.5">
              <p className="text-lg font-bold text-amber-700">{stats.planned}</p>
              <p className="text-[10px] text-amber-600/70 uppercase tracking-wider">Planifi\u00e9s</p>
            </div>
            <div className="bg-rose-50 rounded p-1.5">
              <p className="text-lg font-bold text-rose-700">{stats.cancelled}</p>
              <p className="text-[10px] text-rose-600/70 uppercase tracking-wider">Annul\u00e9s</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tooth filter */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground shrink-0">Filtrer par dent:</label>
        <Select value={toothFilter || "__all__"} onValueChange={(v) => setToothFilter(v === "__all__" ? "" : v)}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Toutes les dents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__" className="text-xs">Toutes les dents</SelectItem>
            {FDI_TEETH.map((t) => (
              <SelectItem key={t} value={String(t)} className="text-xs">Dent {t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {toothFilter && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => setToothFilter("")}>
            <X className="h-3 w-3 mr-1" /> Effacer
          </Button>
        )}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Dent</label>
                <Select value={formData.toothNumber} onValueChange={(v) => setFormData({ ...formData, toothNumber: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="S\u00e9lectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {FDI_TEETH.map((t) => (
                      <SelectItem key={t} value={String(t)} className="text-xs">Dent {t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Traitement</label>
                <Select value={formData.treatmentId} onValueChange={(v) => setFormData({ ...formData, treatmentId: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="S\u00e9lectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatmentCatalog.map((t: any) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Statut</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
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
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Priorit\u00e9</label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
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
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Co\u00fbt (DA)</label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="h-8 text-xs"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">M\u00e9decin</label>
                <Select value={formData.doctorId} onValueChange={(v) => setFormData({ ...formData, doctorId: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Non assign\u00e9" />
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
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="min-h-[60px] text-xs resize-none"
                placeholder="Notes concernant ce traitement..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={resetForm}>Annuler</Button>
              <Button size="sm" className="h-7 gap-1 text-xs" onClick={handleSubmit} disabled={createTreatment.isPending}>
                <Save className="h-3 w-3" /> Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment list */}
      {filteredTreatments.length === 0 ? (
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
      ) : (
        <div className="space-y-2">
          {filteredTreatments.map((treatment) => {
            const isEditing = editingId === treatment.id;
            const isExpanded = expandedId === treatment.id;
            const priority = treatment.priority || "medium";
            const isHighOrUrgent = priority === "high" || priority === "urgent";
            return (
              <Card
                key={treatment.id}
                className={`border-border/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${isHighOrUrgent ? "border-l-2 border-l-orange-400" : ""}`}
                onClick={() => onToothSelect?.(treatment.toothNumber ? parseInt(treatment.toothNumber) : null)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{treatment.treatmentName || "Traitement"}</span>
                        {getStatusBadge(treatment.status || "pending")}
                        {getPriorityBadge(treatment.priority || "medium")}
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
                        <span>Cr\u00e9\u00e9: {format(new Date(treatment.createdAt), "dd/MM/yyyy")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : treatment.id); }}
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-primary"
                        onClick={(e) => { e.stopPropagation(); handleEdit(treatment); }}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-rose-500"
                        onClick={(e) => { e.stopPropagation(); handleDelete(treatment.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded section: notes + history */}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Statut</label>
                          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
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
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Priorit\u00e9</label>
                          <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
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
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Co\u00fbt (DA)</label>
                          <Input
                            type="number"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">M\u00e9decin</label>
                          <Select value={formData.doctorId} onValueChange={(v) => setFormData({ ...formData, doctorId: v })}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Non assign\u00e9" />
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
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="min-h-[50px] text-xs resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingId(null)}>Annuler</Button>
                        <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => handleUpdate(treatment.id)} disabled={updateTreatment.isPending}>
                          <Save className="h-3 w-3" /> Enregistrer
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TreatmentHistoryPanel({ treatmentId }: { treatmentId: string }) {
  const { data: history = [], isLoading: histLoading } = useTreatmentHistory(treatmentId);
  if (histLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
        Historique...
      </div>
    );
  }
  if (history.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        Aucun historique disponible
      </div>
    );
  }
  const actionLabels: Record<string, string> = {
    created: "Cr\u00e9\u00e9",
    updated: "Modifi\u00e9",
    deleted: "Supprim\u00e9",
    treatment_progress_updated: "Progression mise \u00e0 jour",
  };
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Historique</p>
      <div className="space-y-1.5">
        {history.map((entry: any) => (
          <div key={entry.id} className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
            <span className="font-medium text-muted-foreground">{actionLabels[entry.action] || entry.action}</span>
            <span className="text-muted-foreground/60">par {entry.username || "syst\u00e8me"}</span>
            <span className="text-muted-foreground/40">{format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
