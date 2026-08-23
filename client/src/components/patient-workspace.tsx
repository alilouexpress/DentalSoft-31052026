import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/language-context";
import { usePatient, usePatientTreatments, usePatientPayments, useMedicalHistory, usePatientDocuments, useAuditLogs, useCreateAppointment, useDoctors, usePrescriptions, usePatientImages, usePatientDebt, useDeletePayment } from "@/hooks/use-api";
import { useUpdatePatientGeneralInfo } from "@/hooks/use-patient-general-info";
import { useIsMobile } from "@/hooks/use-mobile";
import { PatientPaymentDialog, printPaymentReceipt } from "@/components/patient-payment-dialog";
import { PatientOdontogram } from "@/components/patient-odontogram";
import { PatientTreatmentPlan } from "@/components/patient-treatment-plan";
import { PatientImaging } from "@/components/patient-imaging";
import { PatientPrescriptions } from "@/components/patient-prescriptions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Patient, Payment, PatientTreatment, MedicalHistoryRecord, AuditLog, Doctor, PatientDocument } from "@shared/schema";
import {
  Phone, Mail, CalendarPlus, Calendar, Banknote, Activity,
  Pill, FileText, Scan, ClipboardList, User, MapPin, FileEdit,
  Camera, ChevronDown, ChevronRight,
  CalendarCheck, AlertTriangle, MessageSquare, History,
  Stethoscope, Printer, Eye, Plus, CheckCircle2, Trash2, Edit3,
} from "lucide-react";

const STORAGE_KEY_PREFIX = "dentalsoft-patient-tab-";

interface PatientWorkspaceProps {
  patientId: string;
}

interface TabBadge {
  count: number;
  variant: "default" | "secondary" | "destructive" | "outline";
}

function CollapsibleSection({ title, icon: Icon, defaultOpen = true, children }: { title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full py-2.5 px-1 cursor-pointer transition-colors hover:bg-muted/50 rounded-md border-0 bg-transparent text-left">
        <Icon className="h-3.5 w-3.5 text-sky-600 shrink-0" />
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex-1">{title}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
      </button>
      {open && <div className="pb-3 px-1">{children}</div>}
    </div>
  );
}

const ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7 3C9 3 10 4.5 12 4.5C14 4.5 15 3 17 3C19 3 20 4.5 20 6C20 9 19 12 18 15C17.5 16.5 16 17.5 15.5 19C15.2 20 14.5 21 13.5 21C12.5 21 12 20 12 19C12 20 11.5 21 10.5 21C9.5 21 8.8 20 8.5 19C8 17.5 6.5 16.5 6 15C5 12 4 9 4 6C4 4.5 5 3 7 3Z" />
    <path d="M12 4.5V11" />
  </svg>
);

export function PatientWorkspace({ patientId }: PatientWorkspaceProps) {
  const { dir } = useLanguage();
  const queryClient = useQueryClient();

  // ── Data ──
  const { data: patient } = usePatient(patientId);
  const { data: medicalRecords = [] } = useMedicalHistory(patientId);
  const { data: treatments = [] } = usePatientTreatments(patientId);
  const { data: prescriptions = [] } = usePrescriptions(patientId);
  const { data: patientImages = [] } = usePatientImages(patientId);
  const { data: doctorList = [] } = useDoctors();
  const { data: debt } = usePatientDebt(patientId);
  const updateGeneralInfo = useUpdatePatientGeneralInfo();
  const createAppointment = useCreateAppointment();
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

  // ── Mobile collapsible cards ──
  const isMobile = useIsMobile();
  const [mobileOpenCards, setMobileOpenCards] = useState<Record<string, boolean>>({
    summary: true,
    rdv: false,
    treatments: false,
    alerts: false,
    payments: false,
    timeline: false,
  });
  const toggleCard = (cardKey: string) => {
    if (!isMobile) return;
    setMobileOpenCards((prev) => ({ ...prev, [cardKey]: !prev[cardKey] }));
  };

  // ── UI state ──
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [rdvOpen, setRdvOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
  const [rdvForm, setRdvForm] = useState({ doctorId: "", appointmentDate: "", type: "Consultation", notes: "" });
  const [editForm, setEditForm] = useState({ phone: "", email: "", address: "", bloodType: "", nationalId: "", emergencyContact: "", emergencyPhone: "", insuranceProvider: "", insuranceNumber: "", notes: "" });

  // ── Conditional fetches ──
  const { data: patientPayments = [] } = usePatientPayments(activeTab === "payments" ? patientId : "");
  const { data: patientDocs = [] } = usePatientDocuments(activeTab === "documents" ? patientId : "");
  const { data: auditLogs = [] } = useAuditLogs(100);
  const patientTimeline = useMemo(() =>
    auditLogs.filter((log: any) => log.entityId === patientId || log.entityType?.startsWith("patient_")).slice(0, 50),
    [auditLogs, patientId]);

  if (!patient) return null;

  const initials = patient.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
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

  const tabs = [
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

  const tabContent = () => {
    switch (activeTab) {
      case "odontogram": return <PatientOdontogram patientId={patientId} selectedTooth={selectedTooth} onToothSelect={setSelectedTooth} />;
      case "imaging": return <PatientImaging patientId={patientId} selectedTooth={selectedTooth} />;
      case "treatment-plan": return <PatientTreatmentPlan patientId={patientId} selectedTooth={selectedTooth} onToothSelect={setSelectedTooth} />;
      case "prescriptions": return <PatientPrescriptions patientId={patientId} patientName={patient.name} />;
      case "payments": return (
        <div className="space-y-3">
          {patientPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
              <Banknote className="h-10 w-10 mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-500 mb-3">Aucun paiement enregistre</p>
              <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => { setPaymentToEdit(null); setPaymentOpen(true); }}><Plus className="h-3.5 w-3.5" /> Ajouter un paiement</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {patientPayments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">{parseFloat(p.amount).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA</p>
                    <p className="text-xs text-slate-500">{format(new Date(p.paymentDate), "dd/MM/yyyy")} &middot; {p.paymentMethod}</p>
                  </div>
                  {p.notes && <p className="text-xs text-slate-400 truncate max-w-[200px] text-right">{p.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      );
      case "timeline": return patientTimeline.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
          <History className="h-10 w-10 mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Aucune activite recente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {patientTimeline.map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
              <div className="mt-1.5"><div className="h-2 w-2 rounded-full bg-sky-500" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</p>
                <p className="text-sm font-medium text-slate-800">{log.action} {log.entityName ? `- ${log.entityName}` : ""}</p>
                {log.username && <p className="text-xs text-slate-400">par {log.username}</p>}
              </div>
            </div>
          ))}
        </div>
      );
      case "documents": return (
        <div className="space-y-2">
          {patientDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
              <FileText className="h-10 w-10 mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">Aucun document</p>
            </div>
          ) : patientDocs.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.type || "document"}</p>
                </div>
              </div>
              {doc.filePath && (
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 cursor-pointer" asChild aria-label="Lien">
                  <a href={doc.filePath} target="_blank" rel="noopener noreferrer" download><Printer className="h-3.5 w-3.5" /></a>
                </Button>
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex-1 min-w-0 space-y-5">

      {/* ════════════════════════════════════════════════════════════
          HEADER — Premium patient identity card
          ════════════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-white via-white to-sky-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/20 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-lg shadow-sky-500/5 overflow-hidden">
        {/* Animated gradient accent stripe */}
        <div className="h-1.5 bg-gradient-to-r from-sky-400 via-sky-500 to-emerald-500" style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }} />

        <div className="p-6 sm:p-7 space-y-5">
          {/* Avatar + Identity */}
          <div className="flex gap-5 sm:gap-6">
            <div className="relative group">
              <Avatar className="h-[88px] w-[88px] border-[3px] border-white dark:border-slate-700 shadow-lg shadow-sky-500/20 shrink-0 ring-2 ring-sky-500/20 transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={patient.photoUrl || undefined} />
                <AvatarFallback className="text-2xl font-black bg-gradient-to-br from-sky-500 via-sky-600 to-emerald-600 text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[3px] border-white dark:border-slate-800 shadow-sm ${patient.status === "Active" || patient.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                }`} />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">{patient.name}</h1>
                <Badge className={`px-3 py-1 text-xs font-bold rounded-full border-0 shadow-sm ${patient.status === "Active" || patient.status === "active"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                  {patient.status === "Active" || patient.status === "active" ? "● Actif" : patient.status === "inactive" || patient.status === "Inactive" ? "○ Inactif" : patient.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-md text-xs">{patient.patientId}</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="font-medium">{patient.age} ans</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="font-medium">{patient.gender === "Male" ? "Homme" : "Femme"}</span>
                {patient.phone && <><span className="text-slate-300 dark:text-slate-600">|</span><span className="flex items-center gap-1.5 font-medium"><Phone className="h-3.5 w-3.5 text-sky-500" />{patient.phone}</span></>}
              </div>
              {patient.email && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5 text-sky-500" />
                  <span className="font-medium">{patient.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                {patient.bloodType && (
                  <span className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    <span className="text-red-400">●</span> {patient.bloodType}
                  </span>
                )}
                {patient.insuranceProvider && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    Mutuelle: {patient.insuranceProvider}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 flex-wrap pt-0.5">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-sky-500" /><span className="font-semibold text-slate-600 dark:text-slate-300">Dernière visite:</span> {patient.lastVisit ? format(new Date(patient.lastVisit), "dd/MM/yyyy") : <span className="italic text-slate-400">Aucune</span>}</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="flex items-center gap-1.5"><CalendarCheck className="h-3.5 w-3.5 text-sky-500" /><span className="font-semibold text-slate-600 dark:text-slate-300">Prochain RDV:</span> <span className="italic text-slate-400">Aucun</span></span>
              </div>
            </div>
          </div>

          {/* Alerts banner */}
          {activeMedicalAlerts.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/10 border border-red-200/60 dark:border-red-800/40 rounded-xl py-3 px-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest block">Alertes médicales</span>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">{activeMedicalAlerts.map((r: any) => r.condition || r.name).join(" · ")}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-all duration-200 hover:shadow-sm hover:-translate-y-px" onClick={() => patient.phone && window.open(`tel:${patient.phone}`)}><Phone className="h-3.5 w-3.5" /> Appeler</Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-all duration-200 hover:shadow-sm hover:-translate-y-px" onClick={() => patient.email && window.open(`mailto:${patient.email}`)}><Mail className="h-3.5 w-3.5" /> Email</Button>
            <Button size="sm" className="h-9 gap-1.5 text-sm bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white cursor-pointer shadow-md shadow-sky-500/25 transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-px" onClick={() => setRdvOpen(true)}><CalendarPlus className="h-3.5 w-3.5" /> Nouveau RDV</Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-all duration-200 hover:shadow-sm hover:-translate-y-px" onClick={() => { setEditForm({ phone: patient.phone || "", email: patient.email || "", address: patient.address || "", bloodType: patient.bloodType || "", nationalId: patient.nationalId || "", emergencyContact: patient.emergencyContact || "", emergencyPhone: patient.emergencyPhone || "", insuranceProvider: patient.insuranceProvider || "", insuranceNumber: patient.insuranceNumber || "", notes: patient.notes || "" }); setEditOpen(true); }}><FileEdit className="h-3.5 w-3.5" /> Modifier</Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-200" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /> Imprimer</Button>
          </div>

          {/* Balance — Premium glassmorphism card */}
          <div className={`relative rounded-xl p-4 flex items-center justify-between overflow-hidden ${hasBalance
            ? "bg-gradient-to-r from-red-50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/10 border border-red-200/60 dark:border-red-800/30"
            : "bg-gradient-to-r from-emerald-50 to-sky-50/50 dark:from-emerald-950/20 dark:to-sky-950/10 border border-emerald-200/60 dark:border-emerald-800/30"
            }`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${hasBalance
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-emerald-100 dark:bg-emerald-900/30"
                }`}>
                {hasBalance ? (
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Solde du patient</span>
                <span className={`text-xs font-medium ${hasBalance ? "text-red-600/70 dark:text-red-400/70" : "text-emerald-600/70 dark:text-emerald-400/70"
                  }`}>
                  {hasBalance ? "Dette en cours" : "Aucune dette"}
                </span>
              </div>
            </div>
            <span className={`text-3xl font-black tabular-nums tracking-tight ${hasBalance ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              }`}>
              {balanceAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA
            </span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          STICKY NAVIGATION TABS — Full width, high contrast
          ════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/50 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            const badge = tabBadges[tab.value];
            return (
              <button
                key={tab.value}
                onClick={() => setTab(tab.value)}
                className={`group relative flex items-center gap-2 min-w-[120px] px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0
                  ${isActive
                    ? "text-sky-700 dark:text-sky-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  }`}
              >
                <Icon className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400"}`} />
                {tab.label}
                {badge && (
                  <Badge className={`ml-0.5 text-[10px] px-1.5 py-0 font-bold rounded-full border-0 transition-colors duration-300 ${isActive
                    ? "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}>
                    {badge.count}
                  </Badge>
                )}
                {/* Active indicator bar */}
                <span className={`absolute bottom-0 left-2 right-2 h-[3px] rounded-full transition-all duration-300 ${isActive
                  ? "bg-gradient-to-r from-sky-500 to-emerald-500 opacity-100"
                  : "bg-transparent opacity-0 group-hover:bg-slate-300 group-hover:opacity-40"
                  }`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MAIN CONTENT — 65/35 Layout
          ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">

        {/* ── LEFT: Tab Content ── */}
        <div className="min-w-0">
          {tabContent()}
        </div>

        {/* ── RIGHT: Sidebar Cards ── */}
        <div className="space-y-4">

          {/* CARD 1: Résumé Clinique */}
          <Card className="border-slate-200/80 dark:border-slate-700/50 shadow-md shadow-sky-500/5 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10">
            <div className="h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-emerald-500" />
            <CardContent className="p-5">
              <div
                className={`flex items-center justify-between ${isMobile ? "cursor-pointer select-none mb-2" : "mb-4"}`}
                onClick={() => toggleCard("summary")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                    <Activity className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Résumé Clinique</span>
                </div>
                {isMobile && (
                  mobileOpenCards.summary ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
              {(!isMobile || mobileOpenCards.summary) && (
                <div className="space-y-2.5 animate-in fade-in duration-300">
                  {[
                    { label: "Visites", value: "-", color: "text-slate-900 dark:text-white" },
                    { label: "Traitements", value: treatmentCount, color: "text-slate-900 dark:text-white", suffix: activeTreatments.length > 0 ? ` (${activeTreatments.length} actifs)` : "" },
                    { label: "Prescriptions", value: prescriptionCount, color: "text-slate-900 dark:text-white" },
                    { label: "Paiements", value: paymentCount, color: "text-slate-900 dark:text-white" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</span>
                      <span className={`text-xl font-black tabular-nums ${s.color}`}>
                        {s.value}{s.suffix || ""}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Solde</span>
                      <span className={`text-2xl font-black tabular-nums ${hasBalance ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {balanceAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-0.5 px-2">
                      Total payé: {totalPaid.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 2: Prochain RDV */}
          <Card className="border-slate-200/80 dark:border-slate-700/50 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-5">
              <div
                className={`flex items-center justify-between ${isMobile ? "cursor-pointer select-none mb-2" : "mb-3"}`}
                onClick={() => toggleCard("rdv")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CalendarCheck className="h-3.5 w-3.5 text-blue-600 dark:blue-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Prochain RDV</span>
                </div>
                {isMobile && (
                  mobileOpenCards.rdv ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
              {(!isMobile || mobileOpenCards.rdv) && (
                <div className="animate-in fade-in duration-300">
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 text-center mb-3">
                    <CalendarCheck className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Aucun rendez-vous planifié</p>
                  </div>
                  <Button size="sm" className="w-full h-9 gap-1.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white text-sm cursor-pointer shadow-md shadow-sky-500/20 transition-all duration-200 hover:shadow-lg" onClick={() => setRdvOpen(true)}><CalendarPlus className="h-3.5 w-3.5" /> Planifier un RDV</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 3: Traitements Actifs */}
          <Card className="border-slate-200/80 dark:border-slate-700/50 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-5">
              <div
                className={`flex items-center justify-between ${isMobile ? "cursor-pointer select-none mb-2" : "mb-3"}`}
                onClick={() => toggleCard("treatments")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Activity className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Traitements Actifs</span>
                </div>
                {isMobile && (
                  mobileOpenCards.treatments ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
              {(!isMobile || mobileOpenCards.treatments) && (
                <div className="animate-in fade-in duration-300">
                  {activeTreatments.length === 0 ? (
                    <div>
                      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 text-center mb-3">
                        <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Aucun traitement actif</p>
                      </div>
                      <Button size="sm" variant="outline" className="w-full h-9 gap-1.5 text-sm text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-all duration-200" onClick={() => setTab("treatment-plan")}><Plus className="h-3.5 w-3.5" /> Créer un plan de soins</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeTreatments.slice(0, 3).map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between py-2 px-2 rounded-lg border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{t.treatmentName || `Traitement #${t.id}`}</p>
                            <Badge className={`text-[10px] px-1.5 py-0 rounded-full border-0 font-bold ${t.status === "in_progress" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                              }`}>
                              {t.status === "in_progress" ? "En cours" : "Planifié"}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-900/30" onClick={() => setTab("treatment-plan")} aria-label="Voir le plan de soins"><Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 4: Alertes & Rappels */}
          <Card className="border-slate-200/80 dark:border-slate-700/50 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-5">
              <div
                className={`flex items-center justify-between ${isMobile ? "cursor-pointer select-none mb-2" : "mb-3"}`}
                onClick={() => toggleCard("alerts")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Alertes & Rappels</span>
                </div>
                {isMobile && (
                  mobileOpenCards.alerts ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
              {(!isMobile || mobileOpenCards.alerts) && (
                <div className="animate-in fade-in duration-300">
                  {activeMedicalAlerts.length === 0 ? (
                    <div className="flex items-center gap-2.5 py-2 px-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Aucune alerte active</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeMedicalAlerts.map((r: any) => (
                        <div key={r.id} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-offset-1 ${r.category === "allergy" ? "bg-red-500 ring-red-200 dark:ring-red-800" :
                            r.category === "condition" ? "bg-amber-500 ring-amber-200 dark:ring-amber-800" :
                              "bg-blue-500 ring-blue-200 dark:ring-blue-800"
                            }`} />
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.condition || r.name}</p>
                          <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 ml-auto">{r.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 5: Historique Paiements */}
          <Card className="border-slate-200/80 dark:border-slate-700/50 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-5">
              <div
                className={`flex items-center justify-between ${isMobile ? "cursor-pointer select-none mb-2" : "mb-3"}`}
                onClick={() => toggleCard("payments")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Banknote className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Historique Paiements</span>
                </div>
                {isMobile && (
                  mobileOpenCards.payments ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
              {(!isMobile || mobileOpenCards.payments) && (
                <div className="animate-in fade-in duration-300">
                  {patientPayments.length === 0 ? (
                    <div>
                      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 text-center mb-3">
                        <Banknote className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Aucun paiement</p>
                      </div>
                      <Button size="sm" variant="outline" className="w-full h-9 gap-1.5 text-sm text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-all duration-200" onClick={() => { setPaymentToEdit(null); setPaymentOpen(true); }}><Plus className="h-3.5 w-3.5" /> Ajouter un paiement</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {patientPayments.slice(0, 3).map((p: any) => {
                        const methodConfig = [
                          { value: "cash", label: "Especes", color: "bg-emerald-100 text-emerald-700" },
                          { value: "card", label: "Carte", color: "bg-blue-100 text-blue-700" },
                          { value: "check", label: "Cheque", color: "bg-orange-100 text-orange-700" },
                          { value: "transfer", label: "Virement", color: "bg-purple-100 text-purple-700" },
                        ].find(m => m.value === p.paymentMethod);
                        return (
                          <div key={p.id} className="py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{parseFloat(p.amount).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{format(new Date(p.paymentDate), "dd/MM/yyyy")}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${methodConfig?.color || "bg-slate-100 text-slate-600 dark:bg-slate-800"}`}>
                                  {methodConfig?.label || p.paymentMethod}
                                </span>
                              </div>
                            </div>
                            {p.invoiceNumber && <p className="text-[10px] text-slate-400 mt-0.5">Facture {p.invoiceNumber}</p>}
                            <div className="flex items-center gap-1 mt-1.5">
                              <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer" onClick={() => printPaymentReceipt(p, patient.name, patientId)} title="Imprimer reçu" aria-label="Imprimer le reçu"><Printer className="h-3 w-3 text-slate-400" /></Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer" onClick={() => { setPaymentToEdit(p); setPaymentOpen(true); }} title="Modifier" aria-label="Modifier le paiement"><Edit3 className="h-3 w-3 text-slate-400" /></Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer transition-colors duration-200" onClick={async () => { if (window.confirm("Supprimer ce paiement ?")) { try { await deletePayment.mutateAsync(p.id); queryClient.invalidateQueries({ queryKey: ["patients"] }); toast.success("Paiement supprimé"); } catch { toast.error("Erreur"); } } }} title="Supprimer" aria-label="Supprimer le paiement"><Trash2 className="h-3 w-3 text-slate-400 hover:text-red-500" /></Button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex items-center gap-2 pt-1">
                        <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer" onClick={() => setTab("payments")}>Voir tout ({patientPayments.length})</Button>
                        <Button size="sm" variant="outline" className="h-8 gap-1 text-xs text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer" onClick={() => { setPaymentToEdit(null); setPaymentOpen(true); }}><Plus className="h-3 w-3" /> Ajouter</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 6: Activité Récente */}
          <Card className="border-slate-200/80 dark:border-slate-700/50 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-5">
              <div
                className={`flex items-center justify-between ${isMobile ? "cursor-pointer select-none mb-2" : "mb-3"}`}
                onClick={() => toggleCard("timeline")}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <History className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Activité Récente</span>
                </div>
                {isMobile && (
                  mobileOpenCards.timeline ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </div>
              {(!isMobile || mobileOpenCards.timeline) && (
                <div className="animate-in fade-in duration-300">
                  {patientTimeline.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucune activité récente</p>
                  ) : (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      <div className="space-y-0 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                        {patientTimeline.slice(0, 4).map((log: any) => {
                          const actionColor = log.action === "created" ? "bg-emerald-500" : log.action === "deleted" ? "bg-red-500" : "bg-blue-500";
                          return (
                            <div key={log.id} className="relative pl-6 pb-3 last:pb-0">
                              <div className={`absolute left-0 top-1.5 h-[10px] w-[10px] rounded-full ${actionColor} ring-2 ring-white z-10`} />
                              <p className="text-xs font-medium text-slate-800 leading-tight">{log.action === "created" ? "Créé" : log.action === "deleted" ? "Supprimé" : "Modifié"} {log.entityName ? `- ${log.entityName}` : ""}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{format(new Date(log.createdAt), "dd/MM HH:mm")}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          PAYMENT DIALOG
          ════════════════════════════════════════════════════════════ */}
      <PatientPaymentDialog
        open={paymentOpen}
        onOpenChange={(open) => { setPaymentOpen(open); if (!open) { queryClient.invalidateQueries({ queryKey: ["patients"] }); } }}
        patientId={patientId}
        patientName={patient.name}
        patientPhone={patient.phone}
        paymentToEdit={paymentToEdit}
      />

      {/* ════════════════════════════════════════════════════════════
          EDIT DIALOG
          ════════════════════════════════════════════════════════════ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier les informations</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <CollapsibleSection title="Identite" icon={User} defaultOpen={true}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-[10px] font-semibold">Groupe sanguin</Label><Select value={editForm.bloodType || undefined} onValueChange={(v) => setEditForm({ ...editForm, bloodType: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selectionner" /></SelectTrigger><SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1"><Label className="text-[10px] font-semibold">National ID</Label><Input value={editForm.nationalId} onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })} className="h-8 text-xs" /></div>
              </div>
            </CollapsibleSection>
            <CollapsibleSection title="Contact" icon={MapPin} defaultOpen={true}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-[10px] font-semibold">Telephone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="h-8 text-xs" /></div>
                  <div className="space-y-1"><Label className="text-[10px] font-semibold">Email</Label><Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="h-8 text-xs" /></div>
                </div>
                <div className="space-y-1"><Label className="text-[10px] font-semibold">Adresse</Label><Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="h-8 text-xs" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-[10px] font-semibold">Contact urgence</Label><Input value={editForm.emergencyContact} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} className="h-8 text-xs" /></div>
                  <div className="space-y-1"><Label className="text-[10px] font-semibold">Tel. urgence</Label><Input value={editForm.emergencyPhone} onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })} className="h-8 text-xs" /></div>
                </div>
              </div>
            </CollapsibleSection>
            <CollapsibleSection title="Assurance" icon={Stethoscope} defaultOpen={false}>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-[10px] font-semibold">Assurance</Label><Input value={editForm.insuranceProvider} onChange={(e) => setEditForm({ ...editForm, insuranceProvider: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-[10px] font-semibold">N assurance</Label><Input value={editForm.insuranceNumber} onChange={(e) => setEditForm({ ...editForm, insuranceNumber: e.target.value })} className="h-8 text-xs" /></div>
              </div>
            </CollapsibleSection>
            <CollapsibleSection title="Notes" icon={FileEdit} defaultOpen={false}>
              <Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="min-h-[60px] text-xs resize-none" />
            </CollapsibleSection>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button size="sm" onClick={async () => { try { await updateGeneralInfo.mutateAsync({ id: patientId, data: editForm as any }); toast.success("Informations mises a jour"); setEditOpen(false); } catch { toast.error("Erreur"); } }} disabled={updateGeneralInfo.isPending}>
              {updateGeneralInfo.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════════════════════
          RDV DIALOG
          ════════════════════════════════════════════════════════════ */}
      <Dialog open={rdvOpen} onOpenChange={setRdvOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Planifier un rendez-vous</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label className="text-xs">Medecin</Label><Select value={rdvForm.doctorId || undefined} onValueChange={(v) => setRdvForm({ ...rdvForm, doctorId: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selectionner" /></SelectTrigger><SelectContent>{doctorList.map((d: any) => <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Date et heure</Label><Input type="datetime-local" value={rdvForm.appointmentDate} onChange={(e) => setRdvForm({ ...rdvForm, appointmentDate: e.target.value })} className="h-8 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Type</Label><Select value={rdvForm.type || undefined} onValueChange={(v) => setRdvForm({ ...rdvForm, type: v })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{["Consultation", "Controle", "Urgence", "Detartrage", "Autre"].map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Notes</Label><Textarea value={rdvForm.notes} onChange={(e) => setRdvForm({ ...rdvForm, notes: e.target.value })} className="min-h-[50px] text-xs resize-none" placeholder="Notes optionnelles..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRdvOpen(false)}>Annuler</Button>
            <Button size="sm" onClick={async () => { if (!rdvForm.doctorId || !rdvForm.appointmentDate) { toast.error("Medecin et date requis"); return; } try { await createAppointment.mutateAsync({ patientId, doctorId: rdvForm.doctorId, appointmentDate: new Date(rdvForm.appointmentDate), type: rdvForm.type, status: "Scheduled", notes: rdvForm.notes || undefined }); toast.success("Rendez-vous planifie"); setRdvOpen(false); setRdvForm({ doctorId: "", appointmentDate: "", type: "Consultation", notes: "" }); } catch { toast.error("Erreur"); } }} disabled={createAppointment.isPending}>
              {createAppointment.isPending ? "Enregistrement..." : "Planifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
