import { useLanguage } from "@/i18n/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateDentalChart } from "@/hooks/use-api";
import { toast } from "sonner";
import { AlertCircle, Plus } from "lucide-react";

interface ChartErrorCardProps {
  patientId: string;
}

export function ChartErrorCard({ patientId }: ChartErrorCardProps) {
  const { t } = useLanguage();
  const createChart = useCreateDentalChart();

  const handleCreateChart = async () => {
    if (!patientId) return;
    try {
      await createChart.mutateAsync({ patientId, data: { chartType: "permanent" } });
      toast.success("Chart created");
    } catch {
      toast.error("Failed to create chart");
    }
  };

  return (
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
  );
}