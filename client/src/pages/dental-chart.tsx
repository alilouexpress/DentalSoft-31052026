import { useState } from "react";
import { useRoute } from "wouter";
import { useLanguage } from "@/i18n/language-context";
import {
  useDentalChart,
  useUpsertDentalChartEntry,
  useUpdateDentalChartEntry,
  useDeleteDentalChartEntry,
  useAddDentalChartNote,
  useCreateDentalChart,
} from "@/hooks/use-api";
import Layout from "@/components/layout";
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
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Activity,
  Stethoscope,
  Plus,
  Trash2,
  History,
  MessageSquare,
  AlertCircle,
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
  healthy: "Healthy",
  caries: "Caries",
  filled: "Filled",
  crown: "Crown",
  root_canal: "Root Canal",
  missing: "Missing",
  implant: "Implant",
  bridge: "Bridge",
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
  "Caries filling",
  "Root Canal",
  "Crown",
  "Extraction",
  "Implant",
  "Bridge",
  "Cleaning",
  "Examination",
];

const SURFACES = ["mesial", "distal", "occlusal", "buccal", "lingual"];

const SURFACE_LABELS_SHORT: Record<string, string> = {
  mesial: "M",
  distal: "D",
  occlusal: "O",
  buccal: "B",
  lingual: "L",
};

const STATUS_TO_TREATMENT: Record<string, string> = {
  caries: "Caries filling",
  root_canal: "Root Canal",
  crown: "Crown",
  missing: "Extraction",
  implant: "Implant",
  bridge: "Bridge",
  filled: "Caries filling",
  healthy: "Examination",
};

const TOOTH_STYLE = { w: 48, h: 54, gap: 6, midlineGap: 28, jawGap: 44 };

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

function ToothSurfaceDiagram({
  selectedTooth,
  entries,
  onSurfaceClick,
}: {
  selectedTooth: number;
  entries: { toothNumber: number; surface?: string | null; status: string; color?: string | null }[];
  onSurfaceClick: (surface: string) => void;
}) {
  const toothEntries = entries.filter((e) => e.toothNumber === selectedTooth);
  const getSurfaceColor = (surface: string) => {
    const entry = toothEntries.find((e) => e.surface === surface);
    return entry?.color || STATUS_COLORS[entry?.status || "healthy"] || STATUS_COLORS.healthy;
  };

  return (
    <svg viewBox="0 0 200 160" className="w-full max-w-[200px] mx-auto">
      <g>
        <rect x="30" y="10" width="140" height="140" rx="16" fill="hsl(var(--muted))" opacity={0.3} />
        <rect
          x="30"
          y="10"
          width="140"
          height="28"
          rx="8"
          fill={getSurfaceColor("lingual")}
          opacity={0.75}
          className="cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => onSurfaceClick("lingual")}
        />
        <rect
          x="30"
          y="122"
          width="140"
          height="28"
          rx="8"
          fill={getSurfaceColor("buccal")}
          opacity={0.75}
          className="cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => onSurfaceClick("buccal")}
        />
        <rect
          x="30"
          y="42"
          width="140"
          height="76"
          rx="10"
          fill={getSurfaceColor("occlusal")}
          opacity={0.75}
          className="cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => onSurfaceClick("occlusal")}
        />
        <rect
          x="10"
          y="10"
          width="20"
          height="140"
          rx="8"
          fill={getSurfaceColor("mesial")}
          opacity={0.75}
          className="cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => onSurfaceClick("mesial")}
        />
        <rect
          x="170"
          y="10"
          width="20"
          height="140"
          rx="8"
          fill={getSurfaceColor("distal")}
          opacity={0.75}
          className="cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => onSurfaceClick("distal")}
        />
        <text x="20" y="90" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" style={{ pointerEvents: "none" }}>M</text>
        <text x="180" y="90" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" style={{ pointerEvents: "none" }}>D</text>
        <text x="100" y="28" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" style={{ pointerEvents: "none" }}>L</text>
        <text x="100" y="140" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" style={{ pointerEvents: "none" }}>B</text>
        <text x="100" y="86" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" style={{ pointerEvents: "none" }}>O</text>
      </g>
    </svg>
  );
}

function Legend() {
  const { t } = useLanguage();
  return (
    <Card className="card-hover">
      <CardHeader className="pb-2 px-5 pt-4">
        <CardTitle className="text-sm font-semibold">{t("dentalChart.legend")}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
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
  );
}

export default function DentalChart() {
  const { t, dir } = useLanguage();
  const [, params] = useRoute<{ patientId: string }>("/dental-chart/:patientId");
  const patientId = params?.patientId;
  const isRtl = dir === "rtl";

  const { data: chartData, isLoading, isError } = useDentalChart(patientId || "");
  const upsertEntry = useUpsertDentalChartEntry();
  const updateEntry = useUpdateDentalChartEntry();
  const deleteEntry = useDeleteDentalChartEntry();
  const addNote = useAddDentalChartNote();
  const createChart = useCreateDentalChart();

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedSurface, setSelectedSurface] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("healthy");
  const [selectedTreatment, setSelectedTreatment] = useState<string>("Examination");
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const entries = chartData?.entries || [];
  const notes = chartData?.notes || [];
  const chartId = chartData?.id;

  const selectedEntries = selectedTooth ? entries.filter((e) => e.toothNumber === selectedTooth) : [];

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(toothNumber);
    setSelectedSurface(null);
    setSelectedStatus("healthy");
    setSelectedTreatment("Examination");
  };

  const handleSurfaceClick = (surface: string) => {
    setSelectedSurface(surface);
    const existing = entries.find(
      (e) => e.toothNumber === selectedTooth && e.surface === surface
    );
    if (existing) {
      setSelectedStatus(existing.status);
      setSelectedTreatment(existing.treatment || STATUS_TO_TREATMENT[existing.status] || "Examination");
    } else {
      setSelectedStatus("healthy");
      setSelectedTreatment("Examination");
    }
  };

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
        treatment: selectedTreatment || null,
        color: STATUS_COLORS[selectedStatus],
        notes: null,
      };

      if (existing) {
        await updateEntry.mutateAsync({ id: existing.id, data: payload });
        toast.success("Entry updated");
      } else {
        await upsertEntry.mutateAsync(payload);
        toast.success("Entry saved");
      }
    } catch {
      toast.error("Failed to save entry");
    }
    setSaving(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry.mutateAsync(entryId);
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  const handleAddNote = async () => {
    if (!chartId || !noteText.trim()) return;
    try {
      await addNote.mutateAsync({ chartId, data: { note: noteText.trim() } });
      setNoteText("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
  };

  const handleCreateChart = async () => {
    if (!patientId) return;
    try {
      await createChart.mutateAsync({ patientId, data: { chartType: "permanent" } });
      toast.success("Chart created");
    } catch {
      toast.error("Failed to create chart");
    }
  };

  const teethRows = [
    { range: [1, 2, 3, 4, 5, 6, 7, 8], isRightHalf: false },
    { range: [9, 10, 11, 12, 13, 14, 15, 16], isRightHalf: true },
    { range: [17, 18, 19, 20, 21, 22, 23, 24], isRightHalf: false },
    { range: [25, 26, 27, 28, 29, 30, 31, 32], isRightHalf: true },
  ];

  const { w, h, gap, midlineGap, jawGap } = TOOTH_STYLE;
  const halfWidth = 8 * w + 7 * gap;
  const svgW = halfWidth + midlineGap + halfWidth + 40;
  const svgH = 2 * h + jawGap + 120;
  const leftMargin = 20;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("dentalChart.title")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("dentalChart.selectTooth")}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {isError && !chartData && (
          <Card className="card-hover">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("common.error")}</p>
              <Button variant="outline" size="sm" onClick={handleCreateChart}>
                <Plus className="h-4 w-4 me-1" />
                Create Dental Chart
              </Button>
            </CardContent>
          </Card>
        )}

        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="card-hover overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <svg
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    className="w-full"
                    style={{ maxWidth: svgW, height: "auto" }}
                  >
                    <defs>
                      <filter id="tooth-shadow">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.2" />
                      </filter>
                    </defs>

                    {teethRows.map((row, rowIdx) => {
                      const isLower = rowIdx >= 2;
                      const baseY = 32 + (isLower ? h + jawGap : 0);
                      const baseX = leftMargin + (row.isRightHalf ? halfWidth + midlineGap : 0);
                      return row.range.map((toothNum, col) => {
                        const x = baseX + col * (w + gap);
                        const y = baseY;
                        const color = getToothColor(toothNum, entries);
                        const isSelected = selectedTooth === toothNum;
                        return (
                          <g
                            key={toothNum}
                            className="cursor-pointer"
                            onClick={() => handleToothClick(toothNum)}
                            filter="url(#tooth-shadow)"
                          >
                            <rect
                              x={x}
                              y={y}
                              width={w}
                              height={h}
                              rx={8}
                              ry={8}
                              fill={color}
                              stroke={isSelected ? "#fff" : "transparent"}
                              strokeWidth={isSelected ? 3 : 0}
                              opacity={isSelected ? 1 : 0.85}
                            />
                            <text
                              x={x + w / 2}
                              y={y + h / 2 + 5}
                              textAnchor="middle"
                              fill="white"
                              fontSize={13}
                              fontWeight="bold"
                              style={{ pointerEvents: "none" }}
                            >
                              {toothNum}
                            </text>
                          </g>
                        );
                      });
                    })}

                    <line
                      x1={leftMargin + halfWidth + midlineGap / 2}
                      y1={28}
                      x2={leftMargin + halfWidth + midlineGap / 2}
                      y2={32 + h}
                      stroke="hsl(var(--border))"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={leftMargin + halfWidth + midlineGap / 2}
                      y1={32 + h + jawGap}
                      x2={leftMargin + halfWidth + midlineGap / 2}
                      y2={32 + h + jawGap + h}
                      stroke="hsl(var(--border))"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />

                    <text
                      x={svgW / 2}
                      y={18}
                      textAnchor="middle"
                      fill="hsl(var(--muted-foreground))"
                      fontSize={11}
                      fontWeight="600"
                    >
                      {t("dentalChart.title")} — Maxillaire
                    </text>
                    <text
                      x={svgW / 2}
                      y={svgH - 14}
                      textAnchor="middle"
                      fill="hsl(var(--muted-foreground))"
                      fontSize={11}
                      fontWeight="600"
                    >
                      Mandibule
                    </text>
                  </svg>
                </CardContent>
              </Card>

              <Legend />
            </div>

            <div className="lg:col-span-1 space-y-4">
              {selectedTooth ? (
                <>
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
                              onClick={() => handleSurfaceClick(s)}
                            >
                              {SURFACE_LABELS_SHORT[s]} - {entry ? STATUS_LABELS[entry.status] : "—"}
                            </Badge>
                          );
                        })}
                      </div>

                      <ToothSurfaceDiagram
                        selectedTooth={selectedTooth}
                        entries={entries}
                        onSurfaceClick={handleSurfaceClick}
                      />

                      <div className="space-y-2 pt-2">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("dentalChart.markAs")}</Label>
                          <Select
                            value={selectedStatus}
                            onValueChange={(v) => {
                              setSelectedStatus(v);
                              if (STATUS_TO_TREATMENT[v]) {
                                setSelectedTreatment(STATUS_TO_TREATMENT[v]);
                              }
                            }}
                          >
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
                          onClick={handleSaveTreatment}
                          disabled={saving || !chartId}
                        >
                          <Stethoscope className="h-3.5 w-3.5 me-1" />
                          {saving ? t("common.saving") : t("dentalChart.saveTreatment")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-hover">
                    <CardHeader className="pb-2 px-4 pt-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <History className="h-4 w-4" />
                        {t("dentalChart.history")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      {selectedEntries.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">
                          {t("common.no-items")}
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
                                      backgroundColor:
                                        entry.color || STATUS_COLORS[entry.status],
                                    }}
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium truncate">
                                      {entry.surface
                                        ? `${entry.surface} - ${STATUS_LABELS[entry.status] || entry.status}`
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

                  <Card className="card-hover">
                    <CardHeader className="pb-2 px-4 pt-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {t("dentalChart.notes")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder={t("dentalChart.addNote")}
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="min-h-[60px] text-xs"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={handleAddNote}
                        disabled={!noteText.trim() || !chartId}
                      >
                        <Plus className="h-3.5 w-3.5 me-1" />
                        {t("dentalChart.addNote")}
                      </Button>

                      {notes.length > 0 && (
                        <ScrollArea className="max-h-36">
                          <div className="space-y-2 pt-1">
                            {notes.map((note) => (
                              <div
                                key={note.id}
                                className="p-2 rounded-lg bg-muted/30 text-xs"
                              >
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
                <Card className="card-hover">
                  <CardContent className="flex flex-col items-center gap-3 py-12">
                    <Activity className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      {t("dentalChart.selectTooth")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
