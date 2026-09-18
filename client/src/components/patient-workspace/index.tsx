import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePatient, usePatientTreatments, useMedicalHistory, usePrescriptions,
  usePatientImages, usePatientDebt, usePatientPayments, usePatientDocuments,
  useAuditLogs, useDeletePayment,
} from "@/hooks/use-api";
import { useUpdatePatientGeneralInfo } from "@/hooks/use-patient-general-info";
import { PatientPaymentDialog } from "@/components/patient-payment-dialog";
import { PatientHeader } from "./patient-header";
import { TabNav, ToothIcon, type TabBadge, type WorkspaceTab } from "./tab-nav";
import { TabContent } from "./tab-content";
import { Sidebar } from "./sidebar";
import { EditInfoDialog } from "./edit-info-dialog";
import { AppointmentDialog } from "./appointment-dialog";
import { Camera, ClipboardList, Pill, Banknote, History, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Patient, Payment } from "@shared/schema";

const STORAGE_KEY_PREFIX = "dentalsoft-patient-tab-";

interface PatientWorkspaceProps {
  patientId: string;
}

export function PatientWorkspace({ patientId }: PatientWorkspaceProps) {
  const queryClient = useQueryClient();

  // ── Data ──
  const { data: patient } = usePatient(patientId);
  const { data: medicalRecords = [] } = useMedicalHistory(patientId);
  const { data: treatments = [] } = usePatientTreatments(patientId);
  const { data: prescriptions = [] } = usePrescriptions(patientId);
  const { data: patientImages = [] } = usePatientImages(patientId);
  const { data: debt } = usePatientDebt(patientId);
  const updateGeneralInfo = useUpdatePatientGeneralInfo();
  const deletePayment = useDeletePayment();

  // ── Derived counts ──
  const treatmentCount = treatments.length;
  const prescriptionCount = prescriptions.length;
  const imagingCount = patientImages.length;
  const activeTreatments = useMemo(() => treatments.filter((t: any) => t.status === "in_progress" || t.status === "planned"), [treatments]);
  const activeMedicalAlerts = useMemo(() => medicalRecords.filter((r: any) => r.status === "active"), [medicalRecords]);

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<string>(() => {
    try { return localStorage.getItem(STORAGE_KEY_PREFIX + patientId) || "odontogram"; } catch { return "odontogram"; }
  });
  const setTab = useCallback((tab: string) => {
    setActiveTab(tab);
    try { localStorage.setItem(STORAGE_KEY_PREFIX + patientId, tab); } catch { }
  }, [patientId]);

  // ── UI state ──
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [rdvOpen, setRdvOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);

  // ── Conditional fetches ──
  const { data: patientPayments = [] } = usePatientPayments(activeTab === "payments" ? patientId : "");
  const { data: patientDocs = [] } = usePatientDocuments(activeTab === "documents" ? patientId : "");
  const { data: auditLogs = [] } = useAuditLogs(100);
  const patientTimeline = useMemo(() =>
    auditLogs.filter((log: any) => log.entityId === patientId || log.entityType?.startsWith("patient_")).slice(0, 50),
    [auditLogs, patientId]);

  if (!patient) return null;

  const balanceAmount = parseFloat(patient.balance || "0");
  const hasBalance = balanceAmount > 0;
  const paymentCount = debt?.paymentCount ?? patientPayments.length;
  const totalPaid = debt?.totalPaid ? parseFloat(debt.totalPaid) : 0;

  // ── Tab definitions with badges ──
  const tabBadges: Record<string, TabBadge | undefined> = {
    imaging: imagingCount > 0 ? { count: imagingCount, variant: "secondary" } : undefined,
    "treatment-plan": treatmentCount > 0 ? { count: treatmentCount, variant: "secondary" } : undefined,
    prescriptions: prescriptionCount > 0 ? { count: prescriptionCount, variant: "secondary" } : undefined,
  };

  const tabs: WorkspaceTab[] = [
    { value: "odontogram", icon: ToothIcon, label: "Odontogramme" },
    { value: "imaging", icon: Camera, label: "Imagerie" },
    { value: "treatment-plan", icon: ClipboardList, label: "Plan de soins" },
    { value: "prescriptions", icon: Pill, label: "Ordonnances" },
    { value: "payments", icon: Banknote, label: "Paiements" },
    { value: "timeline", icon: History, label: "Chronologie" },
    { value: "documents", icon: FileText, label: "Documents" },
  ];

  // ── Handlers ──
  const handleSaveQuickNote = async (note: string) => {
    if (!note.trim()) return;
    try {
      const existing = patient.notes || "";
      const updated = existing ? `${existing}\n--- ${format(new Date(), "dd/MM/yyyy HH:mm")} ---\n${note}` : `--- ${format(new Date(), "dd/MM/yyyy HH:mm")} ---\n${note}`;
      await updateGeneralInfo.mutateAsync({ id: patient.id, data: { notes: updated } });
      toast.success("Note enregistree");
      return true;
    } catch { toast.error("Erreur lors de l'enregistrement"); return false; }
  };

  const handleDeletePayment = useCallback(async (id: string) => {
    if (!window.confirm("Supprimer ce paiement ?")) return;
    try {
      await deletePayment.mutateAsync(id);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Paiement supprimé");
    } catch { toast.error("Erreur"); }
  }, [deletePayment, queryClient]);

  const openPayment = useCallback((payment: Payment | null) => {
    setPaymentToEdit(payment);
    setPaymentOpen(true);
  }, []);

  return (
    <div className="flex-1 min-w-0 space-y-5">
      <PatientHeader
        patient={patient}
        activeMedicalAlerts={activeMedicalAlerts}
        balanceAmount={balanceAmount}
        hasBalance={hasBalance}
        onPlanRdv={() => setRdvOpen(true)}
        onEdit={() => setEditOpen(true)}
      />

      <TabNav tabs={tabs} tabBadges={tabBadges} activeTab={activeTab} onTabChange={setTab} />

      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">
        <div className="min-w-0">
          <TabContent
            activeTab={activeTab}
            patientId={patientId}
            patientName={patient.name}
            selectedTooth={selectedTooth}
            onToothSelect={setSelectedTooth}
            patientPayments={patientPayments}
            patientTimeline={patientTimeline}
            patientDocs={patientDocs}
            onAddPayment={() => openPayment(null)}
          />
        </div>

        <div className="space-y-4">
          <Sidebar
            patient={patient}
            patientId={patientId}
            treatmentCount={treatmentCount}
            prescriptionCount={prescriptionCount}
            paymentCount={paymentCount}
            balanceAmount={balanceAmount}
            hasBalance={hasBalance}
            totalPaid={totalPaid}
            activeTreatments={activeTreatments}
            activeMedicalAlerts={activeMedicalAlerts}
            patientPayments={patientPayments}
            patientTimeline={patientTimeline}
            onOpenPayment={openPayment}
            onDeletePayment={handleDeletePayment}
            onViewTab={setTab}
            onPlanRdv={() => setRdvOpen(true)}
          />
        </div>
      </div>

      <PatientPaymentDialog
        open={paymentOpen}
        onOpenChange={(open) => { setPaymentOpen(open); if (!open) { queryClient.invalidateQueries({ queryKey: ["patients"] }); } }}
        patientId={patientId}
        patientName={patient.name}
        patientPhone={patient.phone}
        paymentToEdit={paymentToEdit}
      />

      <EditInfoDialog open={editOpen} onOpenChange={setEditOpen} patient={patient} />

      <AppointmentDialog open={rdvOpen} onOpenChange={setRdvOpen} patientId={patientId} />
    </div>
  );
}