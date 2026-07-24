import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/stat-card";
import { useLanguage } from "@/i18n/language-context";
import { Calendar, Phone, Mail, MapPin, Banknote } from "lucide-react";
import { format } from "date-fns";
import type { Patient } from "@shared/schema";

interface PatientSidebarProps {
  patient: Patient;
}

export function PatientSidebar({ patient }: PatientSidebarProps) {
  const { t } = useLanguage();

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
              {patient.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-foreground truncate">{patient.name}</h2>
            <p className="text-xs text-muted-foreground font-mono">{patient.patientId}</p>
          </div>
        </div>

        <StatusBadge status={patient.status} />

        <Separator />

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{patient.age} {t("patients.years")} &middot; {patient.gender}</span>
          </div>
          {patient.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}
          {patient.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{patient.address}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-1">
          {patient.lastVisit && (
            <StatCard
              icon={Calendar}
              label={t("workspace.last-visit")}
              value={format(new Date(patient.lastVisit), "dd/MM/yyyy")}
            />
          )}
          <StatCard
            icon={Banknote}
            label={t("workspace.balance")}
            value={`${parseFloat(patient.balance || "0").toLocaleString()} DA`}
            className={parseFloat(patient.balance || "0") > 0 ? "text-red-600" : ""}
          />
        </div>

        {patient.notes && (
          <>
            <Separator />
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{t("patients.notes")}</p>
              <p className="text-xs text-muted-foreground">{patient.notes}</p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
