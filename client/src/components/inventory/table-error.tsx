import { useLanguage } from "@/i18n/language-context";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

export function TableErrorRows({ colSpan, onRetry }: { colSpan: number; onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-muted-foreground">{t("common.error") || "Erreur de chargement"}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 me-1" /> {t("common.retry") || "Réessayer"}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
