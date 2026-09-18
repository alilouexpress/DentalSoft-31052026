import { useLanguage } from "@/i18n/language-context";
import type { DentalChartEntry } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Stethoscope } from "lucide-react";
import { ToothSurfaceDiagram } from "./tooth-surface-diagram";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TREATMENT_OPTIONS,
  SURFACES,
  SURFACE_LABELS_SHORT,
} from "./constants";

interface ToothFormPanelProps {
  selectedTooth: number;
  entries: DentalChartEntry[];
  selectedSurface: string | null;
  selectedStatus: string;
  selectedTreatment: string;
  saving: boolean;
  chartId?: string;
  onSurfaceClick: (surface: string) => void;
  onStatusChange: (status: string) => void;
  onTreatmentChange: (treatment: string) => void;
  onSave: () => void;
}

export function ToothFormPanel({
  selectedTooth,
  entries,
  selectedSurface,
  selectedStatus,
  selectedTreatment,
  saving,
  chartId,
  onSurfaceClick,
  onStatusChange,
  onTreatmentChange,
  onSave,
}: ToothFormPanelProps) {
  const { t } = useLanguage();

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {t("dentalChart.toothStatus")} #{selectedTooth}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {SURFACES.map((s) => {
            const entry = entries.find(
              (e) => e.toothNumber === selectedTooth && e.surface === s
            );
            const isActive = selectedSurface === s;
            return (
              <Badge
                key={s}
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer text-xs"
                style={
                  isActive
                    ? { backgroundColor: STATUS_COLORS[entry?.status || "healthy"] }
                    : entry
                      ? { borderColor: entry.color || STATUS_COLORS[entry.status] }
                      : {}
                }
                onClick={() => onSurfaceClick(s)}
              >
                {SURFACE_LABELS_SHORT[s]} - {entry ? STATUS_LABELS[entry.status] : "—"}
              </Badge>
            );
          })}
        </div>

        <ToothSurfaceDiagram
          selectedTooth={selectedTooth}
          entries={entries}
          onSurfaceClick={onSurfaceClick}
        />

        <div className="space-y-2 pt-2">
          <div className="space-y-1">
            <Label className="text-xs">{t("dentalChart.markAs")}</Label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[key] }}
                      />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{t("dentalChart.treatment")}</Label>
            <Select value={selectedTreatment} onValueChange={onTreatmentChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TREATMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-xs">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[selectedStatus] }}
            />
            <span className="text-xs text-muted-foreground">
              {STATUS_LABELS[selectedStatus]}
            </span>
          </div>

          <Button
            size="sm"
            className="w-full h-8 text-xs mt-1"
            onClick={onSave}
            disabled={saving || !chartId}
          >
            <Stethoscope className="h-3.5 w-3.5 me-1" />
            {saving ? t("common.saving") : t("dentalChart.saveTreatment")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}