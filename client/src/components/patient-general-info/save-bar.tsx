import { useLanguage } from "@/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveBarProps {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
}

export function SaveBar({ dirty, saving, onSave }: SaveBarProps) {
  const { t } = useLanguage();
  return (
    <div className="sticky bottom-0 bg-background border border-border/60 rounded-lg p-3 shadow-sm flex items-center justify-between">
      <span className="text-xs text-muted-foreground">
        {dirty ? t("workspace.unsaved-changes") : t("workspace.all-saved")}
      </span>
      <Button onClick={onSave} disabled={!dirty || saving} size="sm" className="gap-2">
        <Save className="h-4 w-4" />
        {saving ? t("common.saving") : t("common.save")}
      </Button>
    </div>
  );
}