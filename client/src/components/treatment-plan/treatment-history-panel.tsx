import { useTreatmentHistory } from "@/hooks/use-api";
import { format } from "date-fns";

export function TreatmentHistoryPanel({ treatmentId }: { treatmentId: string }) {
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
    created: "Créé",
    updated: "Modifié",
    deleted: "Supprimé",
    treatment_progress_updated: "Progression mise à jour",
  };
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Historique</p>
      <div className="space-y-1.5">
        {history.map((entry: any) => (
          <div key={entry.id} className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
            <span className="font-medium text-muted-foreground">{actionLabels[entry.action] || entry.action}</span>
            <span className="text-muted-foreground/60">par {entry.username || "système"}</span>
            <span className="text-muted-foreground/40">{format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}