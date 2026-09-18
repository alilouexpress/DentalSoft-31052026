import { PatientOdontogram } from "@/components/patient-odontogram";
import { PatientTreatmentPlan } from "@/components/patient-treatment-plan";
import { PatientImaging } from "@/components/patient-imaging";
import { PatientPrescriptions } from "@/components/patient-prescriptions";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Banknote, FileText, History, Plus, Printer } from "lucide-react";

interface TabContentProps {
  activeTab: string;
  patientId: string;
  patientName: string;
  selectedTooth: number | null;
  onToothSelect: (tooth: number | null) => void;
  patientPayments: any[];
  patientTimeline: any[];
  patientDocs: any[];
  onAddPayment: () => void;
}

export function TabContent({ activeTab, patientId, patientName, selectedTooth, onToothSelect, patientPayments, patientTimeline, patientDocs, onAddPayment }: TabContentProps) {
  switch (activeTab) {
    case "odontogram":
      return <PatientOdontogram patientId={patientId} selectedTooth={selectedTooth} onToothSelect={onToothSelect} />;
    case "imaging":
      return <PatientImaging patientId={patientId} selectedTooth={selectedTooth} />;
    case "treatment-plan":
      return <PatientTreatmentPlan patientId={patientId} selectedTooth={selectedTooth} onToothSelect={onToothSelect} />;
    case "prescriptions":
      return <PatientPrescriptions patientId={patientId} patientName={patientName} />;
    case "payments":
      return (
        <div className="space-y-3">
          {patientPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-xl border border-slate-200">
              <Banknote className="h-10 w-10 mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-500 mb-3">Aucun paiement enregistre</p>
              <Button size="sm" variant="outline" className="cursor-pointer" onClick={onAddPayment}><Plus className="h-3.5 w-3.5" /> Ajouter un paiement</Button>
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
    case "timeline":
      return patientTimeline.length === 0 ? (
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
    case "documents":
      return (
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
}