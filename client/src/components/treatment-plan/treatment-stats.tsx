import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

export interface TreatmentPlanStatsData {
  total: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  active: number;
  pct: number;
}

interface TreatmentPlanStatsProps {
  stats: TreatmentPlanStatsData;
  showForm: boolean;
  onToggleForm: () => void;
}

export function TreatmentPlanStats({ stats, showForm, onToggleForm }: TreatmentPlanStatsProps) {
  return (
    <Card className="border-border/40 shadow-sm bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Plan de soins</h3>
            <Badge variant="secondary" className="text-[10px]">{stats.total} total</Badge>
          </div>
          <Button size="sm" className="h-7 gap-1 text-xs" onClick={onToggleForm}>
            {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            {showForm ? "Annuler" : "Nouveau traitement"}
          </Button>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>{stats.completed}/{stats.total} terminés</span>
            <span>{stats.pct}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-blue-50 rounded p-1.5">
            <p className="text-lg font-bold text-blue-700">{stats.planned + stats.inProgress}</p>
            <p className="text-[10px] text-blue-600/70 uppercase tracking-wider">En cours</p>
          </div>
          <div className="bg-emerald-50 rounded p-1.5">
            <p className="text-lg font-bold text-emerald-700">{stats.completed}</p>
            <p className="text-[10px] text-emerald-600/70 uppercase tracking-wider">Terminés</p>
          </div>
          <div className="bg-amber-50 rounded p-1.5">
            <p className="text-lg font-bold text-amber-700">{stats.planned}</p>
            <p className="text-[10px] text-amber-600/70 uppercase tracking-wider">Planifiés</p>
          </div>
          <div className="bg-rose-50 rounded p-1.5">
            <p className="text-lg font-bold text-rose-700">{stats.cancelled}</p>
            <p className="text-[10px] text-rose-600/70 uppercase tracking-wider">Annulés</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}