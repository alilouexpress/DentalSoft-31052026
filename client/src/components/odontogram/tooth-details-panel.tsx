import { useLanguage } from "@/i18n/language-context";
import {
  SURFACES,
  SURFACE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  TREATMENT_OPTIONS,
  getSurfaceColor,
} from "./constants";
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

interface ToothDetailsPanelProps {
  toothNumber: number;
  entries: DentalChartEntry[];
  selectedSurface: string | null;
  selectedStatus: string;
  selectedTreatment: string;
  saving: boolean;
  chartId: string | null | undefined;
  onSurfaceSelect: (surface: string) => void;
  onStatusChange: (status: string) => void;
  onTreatmentChange: (treatment: string) => void;
  onSave: () => void;
}

export function ToothDetailsPanel({
  toothNumber,
  entries,
  selectedSurface,
  selectedStatus,
  selectedTreatment,
  saving,
  chartId,
  onSurfaceSelect,
  onStatusChange,
  onTreatmentChange,
  onSave,
}: ToothDetailsPanelProps) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Dent FDI #{toothNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {SURFACES.map((s) => {
            const entry = entries.find(
              (e) => e.toothNumber === toothNumber && e.surface === s
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
                onClick={() => onSurfaceSelect(s)}
              >
                {SURFACE_LABELS[s]} - {entry ? STATUS_LABELS[entry.status] : "—"}
              </Badge>
            );
          })}
        </div>

        <div className="flex justify-center">
          <svg viewBox="0 0 200 160" className="w-full max-w-[180px]">
            <rect x="30" y="10" width="140" height="140" rx="16" fill="hsl(var(--muted))" opacity={0.3} />
            {(["lingual", "mesial", "occlusal", "buccal", "distal"] as const).map((s) => {
              const toothEntries = entries.filter(
                (e) => e.toothNumber === toothNumber
              );
              const color = getSurfaceColor(s, toothEntries);
              const label = SURFACE_LABELS[s];
              const positions: Record<string, { x: number; y: number; w: number; h: number; labelX: number; labelY: number }> = {
                lingual: { x: 30, y: 10, w: 140, h: 28, labelX: 100, labelY: 28 },
                buccal: { x: 30, y: 122, w: 140, h: 28, labelX: 100, labelY: 140 },
                occlusal: { x: 30, y: 42, w: 140, h: 76, labelX: 100, labelY: 86 },
                mesial: { x: 10, y: 10, w: 20, h: 140, labelX: 20, labelY: 86 },
                distal: { x: 170, y: 10, w: 20, h: 140, labelX: 180, labelY: 86 },
              };
              const pos = positions[s];
              const isActiveSurface = selectedSurface === s;
              return (
                <g key={s} onClick={() => onSurfaceSelect(s)} className="cursor-pointer">
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.w}
                    height={pos.h}
                    rx={s === "occlusal" ? 10 : 8}
                    fill={color}
                    opacity={isActiveSurface ? 1 : 0.75}
                    stroke={isActiveSurface ? "#fff" : "transparent"}
                    strokeWidth={isActiveSurface ? 2 : 0}
                    className="transition-all duration-200"
                  />
                  <text
                    x={pos.labelX}
                    y={pos.labelY}
                    textAnchor="middle"
                    fill="white"
                    fontSize={11}
                    fontWeight="bold"
                    style={{ pointerEvents: "none" }}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

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
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[key] }} />
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

          <Button
            size="sm"
            className="w-full h-8 text-xs mt-1"
            onClick={onSave}
            disabled={saving || !chartId}
          >
            <Stethoscope className="h-3.5 w-3.5 me-1" />
            {saving ? t("common.saving") : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}