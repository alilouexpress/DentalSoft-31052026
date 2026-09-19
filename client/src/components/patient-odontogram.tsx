import { useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/i18n/language-context";
import {
  useDentalChart,
  useUpsertDentalChartEntry,
  useUpdateDentalChartEntry,
  useCreateDentalChart,
} from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { STATUS_COLORS } from "./odontogram/constants";
import { OdontogramGrid } from "./odontogram/odontogram-grid";
import { ToothDetailsPanel } from "./odontogram/tooth-details-panel";
import { ToothHistoryPanel } from "./odontogram/tooth-history-panel";
import { ToothNotesPanel } from "./odontogram/tooth-notes-panel";
import { toast } from "sonner";
import { Activity, Plus } from "lucide-react";

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

  const handleCreateChart = async () => {
    if (!patientId) return;
    try {
      await createChart.mutateAsync({ patientId, data: { chartType: "permanent" } });
      toast.success("Odontogramme créé");
    } catch {
      toast.error(t("common.error"));
    }
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
            <OdontogramGrid
              entries={entries}
              selectedTooth={selectedTooth}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onToothSelect={handleToothClick}
              isRtl={isRtl}
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-4">
        {selectedTooth ? (
          <>
            <ToothDetailsPanel
              toothNumber={selectedTooth}
              entries={entries}
              selectedSurface={selectedSurface}
              selectedStatus={selectedStatus}
              selectedTreatment={selectedTreatment}
              saving={saving}
              chartId={chartId}
              onSurfaceSelect={handleSurfaceClick}
              onStatusChange={setSelectedStatus}
              onTreatmentChange={setSelectedTreatment}
              onSave={handleSaveTreatment}
            />
            <ToothHistoryPanel entries={selectedEntries} />
            <ToothNotesPanel chartId={chartId} notes={notes} />
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