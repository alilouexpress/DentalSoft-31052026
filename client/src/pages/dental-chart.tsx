import { useState } from "react";
import { useRoute } from "wouter";
import { useLanguage } from "@/i18n/language-context";
import {
  useDentalChart,
  useUpsertDentalChartEntry,
  useUpdateDentalChartEntry,
  useDeleteDentalChartEntry,
} from "@/hooks/use-api";
import Layout from "@/components/layout";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  ToothGrid,
  Legend,
  ToothFormPanel,
  ToothHistory,
  NotePanel,
  ChartErrorCard,
  ToothEmptyCard,
} from "@/components/dental-chart";
import { STATUS_COLORS, STATUS_TO_TREATMENT } from "@/components/dental-chart/constants";

export default function DentalChart() {
  const { t } = useLanguage();
  const [, params] = useRoute<{ patientId: string }>("/dental-chart/:patientId");
  const patientId = params?.patientId;

  const { data: chartData, isLoading, isError } = useDentalChart(patientId || "");
  const upsertEntry = useUpsertDentalChartEntry();
  const updateEntry = useUpdateDentalChartEntry();
  const deleteEntry = useDeleteDentalChartEntry();

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedSurface, setSelectedSurface] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("healthy");
  const [selectedTreatment, setSelectedTreatment] = useState<string>("Examination");
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

        {isError && !chartData && <ChartErrorCard patientId={patientId || ""} />}

        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <ToothGrid
                entries={entries}
                selectedTooth={selectedTooth}
                onToothClick={handleToothClick}
              />
              <Legend />
            </div>

            <div className="lg:col-span-1 space-y-4">
              {selectedTooth ? (
                <>
                  <ToothFormPanel
                    selectedTooth={selectedTooth}
                    entries={entries}
                    selectedSurface={selectedSurface}
                    selectedStatus={selectedStatus}
                    selectedTreatment={selectedTreatment}
                    saving={saving}
                    chartId={chartId}
                    onSurfaceClick={handleSurfaceClick}
                    onStatusChange={(v) => {
                      setSelectedStatus(v);
                      if (STATUS_TO_TREATMENT[v]) {
                        setSelectedTreatment(STATUS_TO_TREATMENT[v]);
                      }
                    }}
                    onTreatmentChange={setSelectedTreatment}
                    onSave={handleSaveTreatment}
                  />
                  <ToothHistory entries={selectedEntries} onDelete={handleDeleteEntry} />
                  <NotePanel notes={notes} chartId={chartId} />
                </>
              ) : (
                <ToothEmptyCard />
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}