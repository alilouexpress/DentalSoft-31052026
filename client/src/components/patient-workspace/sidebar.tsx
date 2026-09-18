import { useState, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { printPaymentReceipt } from "@/components/patient-payment-dialog";
import { format } from "date-fns";
import {
  Activity, AlertTriangle, Banknote, CalendarCheck, CalendarPlus, CheckCircle2,
  ChevronDown, ChevronRight, Edit3, Eye, History, Plus, Printer, Trash2,
} from "lucide-react";
import type { Patient } from "@shared/schema";

interface SidebarCardProps {
  title: string;
  titleClassName?: string;
  icon: ReactNode;
  iconBg: string;
  isMobile: boolean;
  open: boolean;
  onToggle: () => void;
  stripe?: boolean;
  headerSpacing?: string;
  cardClassName?: string;
  innerClassName?: string;
  children: ReactNode;
}

function SidebarCard({ title, titleClassName = "text-slate-500 dark:text-slate-400", icon, iconBg, isMobile, open, onToggle, stripe = false, headerSpacing = "mb-3", cardClassName = "", innerClassName = "animate-in fade-in duration-300", children }: SidebarCardProps) {
  return (
    <Card className={`border-slate-200/80 dark:border-slate-700/50 shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg${cardClassName}`}>
      {stripe && <div className="h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-emerald-500" />}
      <CardContent className="p-5">
        <div className={`flex items-center justify-between ${isMobile ? "cursor-pointer select-none mb-2" : headerSpacing}`} onClick={onToggle}>
          <div className="flex items-center gap-2.5">
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
            <span className={`text-xs font-black uppercase tracking-widest ${titleClassName}`}>{title}</span>
          </div>
          {isMobile && (open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />)}
        </div>
        {(!isMobile || open) && <div className={innerClassName}>{children}</div>}
      </CardContent>
    </Card>
  );
}

interface SidebarProps {
  patient: Patient;
  patientId: string;
  treatmentCount: number;
  prescriptionCount: number;
  paymentCount: number;
  balanceAmount: number;
  hasBalance: boolean;
  totalPaid: number;
  activeTreatments: any[];
  activeMedicalAlerts: any[];
  patientPayments: any[];
  patientTimeline: any[];
  onOpenPayment: (payment: any | null) => void;
  onDeletePayment: (id: string) => void;
  onViewTab: (tab: string) => void;
  onPlanRdv: () => void;
}

export function Sidebar({ patient, patientId, treatmentCount, prescriptionCount, paymentCount, balanceAmount, hasBalance, totalPaid, activeTreatments, activeMedicalAlerts, patientPayments, patientTimeline, onOpenPayment, onDeletePayment, onViewTab, onPlanRdv }: SidebarProps) {
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

  return (
    <div className="space-y-4">
      <SidebarCard
        title="Résumé Clinique"
        icon={<Activity className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />}
        iconBg="bg-sky-100 dark:bg-sky-900/30"
        isMobile={isMobile}
        open={mobileOpenCards.summary}
        onToggle={() => toggleCard("summary")}
        stripe
        headerSpacing="mb-4"
        cardClassName=" shadow-sky-500/5 hover:shadow-lg hover:shadow-sky-500/10"
        innerClassName="space-y-2.5 animate-in fade-in duration-300"
      >
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
      </SidebarCard>

      <SidebarCard
        title="Prochain RDV"
        icon={<CalendarCheck className="h-3.5 w-3.5 text-blue-600 dark:blue-400" />}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        isMobile={isMobile}
        open={mobileOpenCards.rdv}
        onToggle={() => toggleCard("rdv")}
      >
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 text-center mb-3">
          <CalendarCheck className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Aucun rendez-vous planifié</p>
        </div>
        <Button size="sm" className="w-full h-9 gap-1.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white text-sm cursor-pointer shadow-md shadow-sky-500/20 transition-all duration-200 hover:shadow-lg" onClick={onPlanRdv}><CalendarPlus className="h-3.5 w-3.5" /> Planifier un RDV</Button>
      </SidebarCard>

      <SidebarCard
        title="Traitements Actifs"
        icon={<Activity className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />}
        iconBg="bg-violet-100 dark:bg-violet-900/30"
        isMobile={isMobile}
        open={mobileOpenCards.treatments}
        onToggle={() => toggleCard("treatments")}
      >
        {activeTreatments.length === 0 ? (
          <div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 text-center mb-3">
              <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Aucun traitement actif</p>
            </div>
            <Button size="sm" variant="outline" className="w-full h-9 gap-1.5 text-sm text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-all duration-200" onClick={() => onViewTab("treatment-plan")}><Plus className="h-3.5 w-3.5" /> Créer un plan de soins</Button>
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
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-900/30" onClick={() => onViewTab("treatment-plan")} aria-label="Voir le plan de soins"><Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /></Button>
              </div>
            ))}
          </div>
        )}
      </SidebarCard>

      <SidebarCard
        title="Alertes & Rappels"
        icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        isMobile={isMobile}
        open={mobileOpenCards.alerts}
        onToggle={() => toggleCard("alerts")}
      >
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
      </SidebarCard>

      <SidebarCard
        title="Historique Paiements"
        icon={<Banknote className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        isMobile={isMobile}
        open={mobileOpenCards.payments}
        onToggle={() => toggleCard("payments")}
      >
        {patientPayments.length === 0 ? (
          <div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 text-center mb-3">
              <Banknote className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Aucun paiement</p>
            </div>
            <Button size="sm" variant="outline" className="w-full h-9 gap-1.5 text-sm text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer transition-all duration-200" onClick={() => onOpenPayment(null)}><Plus className="h-3.5 w-3.5" /> Ajouter un paiement</Button>
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
                    <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer" onClick={() => onOpenPayment(p)} title="Modifier" aria-label="Modifier le paiement"><Edit3 className="h-3 w-3 text-slate-400" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 cursor-pointer transition-colors duration-200" onClick={() => onDeletePayment(p.id)} title="Supprimer" aria-label="Supprimer le paiement"><Trash2 className="h-3 w-3 text-slate-400 hover:text-red-500" /></Button>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer" onClick={() => onViewTab("payments")}>Voir tout ({patientPayments.length})</Button>
              <Button size="sm" variant="outline" className="h-8 gap-1 text-xs text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer" onClick={() => onOpenPayment(null)}><Plus className="h-3 w-3" /> Ajouter</Button>
            </div>
          </div>
        )}
      </SidebarCard>

      <SidebarCard
        title="Activité Récente"
        titleClassName="text-slate-500"
        icon={<History className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />}
        iconBg="bg-slate-100 dark:bg-slate-800"
        isMobile={isMobile}
        open={mobileOpenCards.timeline}
        onToggle={() => toggleCard("timeline")}
      >
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
      </SidebarCard>
    </div>
  );
}