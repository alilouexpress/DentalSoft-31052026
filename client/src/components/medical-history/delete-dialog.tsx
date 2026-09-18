import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useDeleteMedicalHistory } from "@/hooks/use-api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string | null;
}

export default function MedicalHistoryDeleteDialog({ open, onOpenChange, targetId }: Props) {
  const { t } = useLanguage();
  const deleteMedicalHistory = useDeleteMedicalHistory();

  const handleDelete = async () => {
    if (!targetId) return;
    try {
      await deleteMedicalHistory.mutateAsync(targetId);
      toast.success(t("common.deleted"));
    } catch {
      toast.error(t("common.error"));
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t("common.confirm-delete")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{t("common.confirm-delete-prompt")}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}