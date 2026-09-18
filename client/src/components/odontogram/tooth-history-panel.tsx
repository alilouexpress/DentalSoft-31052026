import { useLanguage } from "@/i18n/language-context";
import { STATUS_COLORS, STATUS_LABELS, SURFACE_LABELS } from "./constants";
import type { DentalChartEntry } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeleteDentalChartEntry } from "@/hooks/use-api";
import { toast } from "sonner";
import { History, Trash2 } from "lucide-react";

interface ToothHistoryPanelProps {
  entries: DentalChartEntry[];
}

export function ToothHistoryPanel({ entries }: ToothHistoryPanelProps) {
  const { t } = useLanguage();
  const deleteEntry = useDeleteDentalChartEntry();
  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntry.mutateAsync(entryId);
      toast.success(t("common.deleted"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <History className="h-4 w-4" />
          {t("dentalChart.history")}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Aucune entrée pour cette dent
          </p>
        ) : (
          <ScrollArea className="max-h-48">
            <div className="space-y-2">
              {entries.map((entry) => (
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
  );
}