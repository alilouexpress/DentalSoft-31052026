import type { Patient, MedicalHistoryRecord } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Phone, Mail, CalendarPlus, Calendar, AlertTriangle, FileEdit,
  Printer, CheckCircle2, CalendarCheck,
} from "lucide-react";

interface PatientHeaderProps {
  patient: Patient;
  activeMedicalAlerts: MedicalHistoryRecord[];
  balanceAmount: number;
  hasBalance: boolean;
  onPlanRdv: () => void;
  onEdit: () => void;
}

export function PatientHeader({ patient, activeMedicalAlerts, balanceAmount, hasBalance, onPlanRdv, onEdit }: PatientHeaderProps) {
  const initials = patient.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="relative bg-gradient-to-br from-white via-white to-sky-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/20 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-lg shadow-sky-500/5 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-sky-400 via-sky-500 to-emerald-500" style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }} />

      <div className="p-6 sm:p-7 space-y-5">
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

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-all duration-200 hover:shadow-sm hover:-translate-y-px" onClick={() => patient.phone && window.open(`tel:${patient.phone}`)}><Phone className="h-3.5 w-3.5" /> Appeler</Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-all duration-200 hover:shadow-sm hover:-translate-y-px" onClick={() => patient.email && window.open(`mailto:${patient.email}`)}><Mail className="h-3.5 w-3.5" /> Email</Button>
          <Button size="sm" className="h-9 gap-1.5 text-sm bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white cursor-pointer shadow-md shadow-sky-500/25 transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-px" onClick={onPlanRdv}><CalendarPlus className="h-3.5 w-3.5" /> Nouveau RDV</Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-all duration-200 hover:shadow-sm hover:-translate-y-px" onClick={onEdit}><FileEdit className="h-3.5 w-3.5" /> Modifier</Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-200" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /> Imprimer</Button>
        </div>

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
  );
}