import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useBatchCreateMedicalHistory } from "@/hooks/use-api";
import { CATEGORIES, QUICK_CONDITIONS } from "./constants";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

export default function MedicalHistoryBatchDialog({ open, onOpenChange, patientId }: Props) {
  const { t } = useLanguage();
  const batchCreate = useBatchCreateMedicalHistory();
  const [batchCategory, setBatchCategory] = useState("allergies");
  const [batchSelections, setBatchSelections] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setBatchCategory("allergies");
      setBatchSelections(new Set());
    }
  }, [open]);

  const toggleBatchSelection = (value: string) => {
    setBatchSelections((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const handleBatchSave = async () => {
    if (batchSelections.size === 0) {
      toast.error(t("medicalHistory.select-conditions"));
      return;
    }
    setSaving(true);
    try {
      const records = Array.from(batchSelections).map((value) => ({
        patientId,
        category: batchCategory,
        value,
        severity: null,
        startDate: null as Date | null,
        endDate: null as Date | null,
        notes: null,
        isCurrent: true,
      }));
      await batchCreate.mutateAsync({ patientId, records });
      toast.success(t("medicalHistory.batch-created"));
      onOpenChange(false);
      setBatchSelections(new Set());
    } catch {
      toast.error(t("common.error"));
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onOpenChange(false); setBatchSelections(new Set()); } }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("medicalHistory.batch")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("medicalHistory.category")}</Label>
            <Select value={batchCategory} onValueChange={(v) => { setBatchCategory(v); setBatchSelections(new Set()); }}>
              <SelectTrigger>
                <SelectValue placeholder={t("medicalHistory.category")} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`medicalHistory.${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("medicalHistory.quick-conditions")}</Label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {QUICK_CONDITIONS[batchCategory]?.length ? (
                QUICK_CONDITIONS[batchCategory].map((condition) => {
                  const selected = batchSelections.has(condition);
                  return (
                    <div
                      key={condition}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                        selected
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      onClick={() => toggleBatchSelection(condition)}
                    >
                      <div
                        className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${
                          selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                        }`}
                      >
                        {selected && (
                          <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="flex-1">{condition}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">
                  {t("common.no-items")}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setBatchSelections(new Set()); }}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleBatchSave} disabled={saving || batchSelections.size === 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
            {t("common.save")} ({batchSelections.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}