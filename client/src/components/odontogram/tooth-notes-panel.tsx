import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import type { DentalChartNote } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAddDentalChartNote } from "@/hooks/use-api";
import { toast } from "sonner";
import { MessageSquare, Plus } from "lucide-react";

interface ToothNotesPanelProps {
  chartId: string | null | undefined;
  notes: DentalChartNote[];
}

export function ToothNotesPanel({ chartId, notes }: ToothNotesPanelProps) {
  const { t } = useLanguage();
  const [noteText, setNoteText] = useState("");
  const addNote = useAddDentalChartNote();

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

  return (
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
  );
}