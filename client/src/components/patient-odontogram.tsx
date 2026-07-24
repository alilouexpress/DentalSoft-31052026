import { useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/i18n/language-context";
import {
  useDentalChart,
  useUpsertDentalChartEntry,
  useUpdateDentalChartEntry,
  useDeleteDentalChartEntry,
  useAddDentalChartNote,
  useCreateDentalChart,
} from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Activity,
  Stethoscope,
  Plus,
  Trash2,
  History,
  MessageSquare,
  Search,
  Filter,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  healthy: "#22c55e",
  caries: "#ef4444",
  filled: "#3b82f6",
  crown: "#eab308",
  root_canal: "#a855f7",
  missing: "#6b7280",
  implant: "#14b8a6",
  bridge: "#f97316",
};

const STATUS_LABELS: Record<string, string> = {
  healthy: "Sain",
  caries: "Carie",
  filled: "Ob turé",
  crown: "Couronne",
  root_canal: "Traitement canalaire",
  missing: "Absent",
  implant: "Implant",
  bridge: "Pont",
};

const STATUS_PRIORITY: Record<string, number> = {
  caries: 1,
  missing: 2,
  root_canal: 3,
  bridge: 4,
  crown: 5,
  implant: 6,
  filled: 7,
  healthy: 8,
};

const TREATMENT_OPTIONS = [
  "Examen",
  "Détartrage",
  "Traitement carie",
  "Dévitalisation",
  "Couronne",
  "Extraction",
  "Implant",
  "Pont",
  "Prothèse",
];

const SURFACES = ["mesial", "distal", "occlusal", "buccal", "lingual"];

const SURFACE_LABELS: Record<string, string> = {
  mesial: "M",
  distal: "D",
  occlusal: "O",
  buccal: "B",
  lingual: "L",
};

const SURFACE_COLORS: Record<string, string> = {
  mesial: "rgba(59,130,246,0.2)",
  distal: "rgba(59,130,246,0.2)",
  occlusal: "rgba(245,158,11,0.2)",
  buccal: "rgba(16,185,129,0.2)",
  lingual: "rgba(16,185,129,0.2)",
};

const FDI_QUADRANTS = [
  { label: "Quadrant 1 — Supérieur Droit", teeth: [18, 17, 16, 15, 14, 13, 12, 11] },
  { label: "Quadrant 2 — Supérieur Gauche", teeth: [21, 22, 23, 24, 25, 26, 27, 28] },
  { label: "Quadrant 3 — Inférieur Gauche", teeth: [31, 32, 33, 34, 35, 36, 37, 38] },
  { label: "Quadrant 4 — Inférieur Droit", teeth: [48, 47, 46, 45, 44, 43, 42, 41] },
];

const ALL_FDI_TEETH = FDI_QUADRANTS.flatMap((q) => q.teeth);

function ToothPath({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const path = useMemo(() => {
    const r = w * 0.18;
    const neckY = y + h * 0.55;
    return [
      `M ${x + r},${y}`,
      `Q ${x + w / 2},${y - 3} ${x + w - r},${y}`,
      `L ${x + w - r * 0.8},${neckY}`,
      `Q ${x + w - r * 1.5},${y + h} ${x + w / 2},${y + h + 6}`,
      `Q ${x + r * 1.5},${y + h} ${x + r * 0.8},${neckY}`,
      "Z",
    ].join(" ");
  }, [x, y, w, h]);
  return <path d={path} />;
}

function getToothColor(
  toothNumber: number,
  entries: { toothNumber: number; status: string; color?: string | null }[]
): string {
  const toothEntries = entries.filter((e) => e.toothNumber === toothNumber);
  if (toothEntries.length === 0) return STATUS_COLORS.healthy;
  const worst = toothEntries.sort(
    (a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
  )[0];
  return worst.color || STATUS_COLORS[worst.status] || STATUS_COLORS.healthy;
}

function getToothStatusLabel(
  toothNumber: number,
  entries: { toothNumber: number; status: string }[]
): string {
  const toothEntries = entries.filter((e) => e.toothNumber === toothNumber);
  if (toothEntries.length === 0) return STATUS_LABELS.healthy;
  const worst = toothEntries.sort(
    (a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
  )[0];
  return STATUS_LABELS[worst.status] || worst.status;
}

function getSurfaceColor(
  surface: string,
  toothEntries: { surface?: string | null; status: string; color?: string | null }[]
): string {
  const entry = toothEntries.find((e) => e.surface === surface);
  return entry?.color || STATUS_COLORS[entry?.status || "healthy"] || STATUS_COLORS.healthy;
}

interface PatientOdontogramProps {
  patientId: string;
  selectedTooth?: number | null;
  onToothSelect?: (tooth: number | null) => void;
}

export function PatientOdontogram({ patientId, selectedTooth: externalSelectedTooth, onToothSelect }: PatientOdontogramProps) {
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";

  const { data: chartData, isLoading, isError } = useDentalChart(patientId);
  const upsertEntry = useUpsertDentalChartEntry();
  const updateEntry = useUpdateDentalChartEntry();
  const deleteEntry = useDeleteDentalChartEntry();
  const addNote = useAddDentalChartNote();
  const createChart = useCreateDentalChart();

  const [internalSelectedTooth, setInternalSelectedTooth] = useState<number | null>(null);
  const selectedTooth = externalSelectedTooth !== undefined ? externalSelectedTooth : internalSelectedTooth;
  const setSelectedTooth = (tooth: number | null) => {
    setInternalSelectedTooth(tooth);
    onToothSelect?.(tooth);
  };
  const [selectedSurface, setSelectedSurface] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("healthy");
  const [selectedTreatment, setSelectedTreatment] = useState<string>("Examen");
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const entries = chartData?.entries || [];
  const notes = chartData?.notes || [];
  const chartId = chartData?.id;

  const selectedEntries = useMemo(
    () => (selectedTooth ? entries.filter((e) => e.toothNumber === selectedTooth) : []),
    [selectedTooth, entries]
  );

  const entriesByTooth = useMemo(() => {
    const map = new Map<number, typeof entries>();
    for (const entry of entries) {
      const existing = map.get(entry.toothNumber) || [];
      existing.push(entry);
      map.set(entry.toothNumber, existing);
    }
    return map;
  }, [entries]);

  const filteredTeeth = useMemo(() => {
    return ALL_FDI_TEETH.filter((toothNum) => {
      if (statusFilter === "all") return true;
      const toothEntries = entriesByTooth.get(toothNum);
      if (!toothEntries || toothEntries.length === 0) return statusFilter === "healthy";
      const worst = [...toothEntries].sort(
        (a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
      )[0];
      return worst.status === statusFilter;
    });
  }, [entriesByTooth, statusFilter]);

  const searchFiltered = useMemo(() => {
    if (!searchQuery) return filteredTeeth;
    const q = searchQuery.toLowerCase();
    return filteredTeeth.filter((n) => String(n).includes(q));
  }, [filteredTeeth, searchQuery]);

  const handleToothClick = useCallback((toothNumber: number) => {
    setSelectedTooth(toothNumber);
    setSelectedSurface(null);
    setSelectedStatus("healthy");
    setSelectedTreatment("Examen");
  }, []);

  const handleSurfaceClick = useCallback(
    (surface: string) => {
      setSelectedSurface(surface);
      const existing = entries.find(
        (e) => e.toothNumber === selectedTooth && e.surface === surface
      );
      if (existing) {
        setSelectedStatus(existing.status);
        setSelectedTreatment(existing.treatment || "Examen");
      } else {
        setSelectedStatus("healthy");
        setSelectedTreatment("Examen");
      }
    },
    [entries, selectedTooth]
  );

  const handleSaveTreatment = async () => {
    if (!selectedTooth || !chartId) return;
    setSaving(true);
    try {
      const existing = entries.find(
        (e) =>
          e.toothNumber === selectedTooth &&
          (selectedSurface ? e.surface === selectedSurface : !e.surface)
      );
      const payload = {
        chartId,
        toothNumber: selectedTooth,
        surface: selectedSurface || null,
        status: selectedStatus,
        treatment: selectedTreatment,
        color: STATUS_COLORS[selectedStatus],
        notes: null,
      };

      if (existing) {
        await updateEntry.mutateAsync({ id: existing.id, data: payload });
      } else {
        await upsertEntry.mutateAsync(payload);
      }
      toast.success(t("common.saved"));
    } catch {
      toast.error(t("common.error"));
    }
    setSaving(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry.mutateAsync(entryId);
      toast.success(t("common.deleted"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleAddNote = async () => {
    if (!chartId || !noteText.trim()) return;
    try {
      await addNote.mutateAsync({ chartId, data: { note: noteText.trim() } });
      setNoteText("");
      toast.success(t("common.saved"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleCreateChart = async () => {
    if (!patientId) return;
    try {
      await createChart.mutateAsync({ patientId, data: { chartType: "permanent" } });
      toast.success("Odontogramme créé");
    } catch {
      toast.error(t("common.error"));
    }
  };

  const TOOTH_W = 48;
  const TOOTH_H = 54;
  const TOOTH_GAP = 6;
  const MIDLINE_GAP = 28;
  const JAW_GAP = 44;
  const halfWidth = 8 * TOOTH_W + 7 * TOOTH_GAP;
  const svgW = halfWidth + MIDLINE_GAP + halfWidth + 40;
  const svgH = 2 * TOOTH_H + JAW_GAP + 80;

  const renderQuadrant = (
    teeth: number[],
    baseX: number,
    baseY: number,
    reverse: boolean
  ) => {
    return teeth.map((toothNum, col) => {
      const idx = reverse ? teeth.length - 1 - col : col;
      const t = teeth[idx];
      const x = baseX + col * (TOOTH_W + TOOTH_GAP);
      const y = baseY;
      const color = getToothColor(t, entries);
      const isSelected = selectedTooth === t;
      const isFiltered = !searchFiltered.includes(t);
      const label = getToothStatusLabel(t, entries);

      return (
        <Tooltip key={t}>
          <TooltipTrigger asChild>
            <g
              className={`cursor-pointer transition-all duration-200 ${
                isFiltered ? "opacity-20" : isSelected ? "opacity-100" : "opacity-85 hover:opacity-100"
              }`}
              onClick={() => handleToothClick(t)}
            >
              <ToothPath x={x} y={y} w={TOOTH_W} h={TOOTH_H} />
              <rect
                x={x}
                y={y}
                width={TOOTH_W}
                height={TOOTH_H}
                rx={TOOTH_W * 0.18}
                ry={TOOTH_W * 0.18}
                fill={color}
                stroke={isSelected ? "#fff" : "transparent"}
                strokeWidth={isSelected ? 3 : 0}
                className="transition-all duration-200"
              />
              <text
                x={x + TOOTH_W / 2}
                y={y + TOOTH_H / 2 - 3}
                textAnchor="middle"
                fill="white"
                fontSize={11}
                fontWeight="bold"
                style={{ pointerEvents: "none" }}
              >
                {t}
              </text>
            </g>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            <div className="text-xs space-y-0.5">
              <p className="font-semibold">FDI #{t}</p>
              <p>
                {label}
                {entriesByTooth.get(t)?.length ? ` · ${entriesByTooth.get(t)!.length} entrée(s)` : ""}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError && !chartData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <Activity className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("common.error")}</p>
          <Button variant="outline" size="sm" onClick={handleCreateChart}>
            <Plus className="h-4 w-4 me-1" />
            Créer l'odontogramme
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-7 text-xs w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">Toutes les dents</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[key] }} />
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 max-w-[180px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="N° dent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-7 text-xs pl-7"
                />
              </div>
            </div>

            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full"
              style={{ maxWidth: svgW, height: "auto" }}
            >
              <defs>
                <filter id="tooth-shadow-lg">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.25" />
                </filter>
              </defs>

              <text
                x={svgW / 2}
                y={18}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize={12}
                fontWeight="600"
              >
                Maxillaire (supérieur)
              </text>

              {renderQuadrant(
                FDI_QUADRANTS[0].teeth,
                20,
                32,
                !isRtl
              )}
              {renderQuadrant(
                FDI_QUADRANTS[1].teeth,
                20 + halfWidth + MIDLINE_GAP,
                32,
                isRtl
              )}

              <line
                x1={20 + halfWidth + MIDLINE_GAP / 2}
                y1={28}
                x2={20 + halfWidth + MIDLINE_GAP / 2}
                y2={32 + TOOTH_H}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                strokeDasharray="3 3"
              />

              <text
                x={svgW / 2}
                y={svgH - 14}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize={12}
                fontWeight="600"
              >
                Mandibule (inférieur)
              </text>

              {renderQuadrant(
                FDI_QUADRANTS[3].teeth,
                20,
                32 + TOOTH_H + JAW_GAP,
                !isRtl
              )}
              {renderQuadrant(
                FDI_QUADRANTS[2].teeth,
                20 + halfWidth + MIDLINE_GAP,
                32 + TOOTH_H + JAW_GAP,
                isRtl
              )}

              <line
                x1={20 + halfWidth + MIDLINE_GAP / 2}
                y1={32 + TOOTH_H + JAW_GAP - 4}
                x2={20 + halfWidth + MIDLINE_GAP / 2}
                y2={32 + TOOTH_H + JAW_GAP + TOOTH_H + 4}
                stroke="hsl(var(--border))"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            </svg>

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-border">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[key] }}
                  />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-4">
        {selectedTooth ? (
          <>
            <Card>
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Dent FDI #{selectedTooth}
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
                        onClick={() => handleSurfaceClick(s)}
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
                        (e) => e.toothNumber === selectedTooth
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
                        <g key={s} onClick={() => handleSurfaceClick(s)} className="cursor-pointer">
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
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                    <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
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
                    onClick={handleSaveTreatment}
                    disabled={saving || !chartId}
                  >
                    <Stethoscope className="h-3.5 w-3.5 me-1" />
                    {saving ? t("common.saving") : "Enregistrer"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  {t("dentalChart.history")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {selectedEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    Aucune entrée pour cette dent
                  </p>
                ) : (
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {selectedEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: entry.color || STATUS_COLORS[entry.status],
                              }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">
                                {entry.surface
                                  ? `${SURFACE_LABELS[entry.surface] || entry.surface} - ${STATUS_LABELS[entry.status] || entry.status}`
                                  : STATUS_LABELS[entry.status] || entry.status}
                              </p>
                              {entry.treatment && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {entry.treatment}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("dentalChart.notes")}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <Textarea
                  placeholder="Ajouter une note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[60px] text-xs"
                />
                <Button
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || !chartId}
                >
                  <Plus className="h-3.5 w-3.5 me-1" />
                  Ajouter une note
                </Button>

                {notes.length > 0 && (
                  <ScrollArea className="max-h-36">
                    <div className="space-y-2 pt-1">
                      {notes.map((note) => (
                        <div key={note.id} className="p-2 rounded-lg bg-muted/30 text-xs">
                          <p className="text-foreground">{note.note}</p>
                          {note.createdAt && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <Activity className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Sélectionnez une dent pour voir les détails
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
