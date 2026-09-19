import { useLanguage } from "@/i18n/language-context";
import type { AuditLog } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Clock, Shield, User } from "lucide-react";
import { actionStyles, formatCellDateTime, formatJSON, getActionLabel, getEntityLabel } from "./constants";

interface AuditLogDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLog | null;
}

export function AuditLogDetailDialog({ open, onOpenChange, log: selectedLog }: AuditLogDetailDialogProps) {
  const { t, language } = useLanguage();
  const isFr = language === "fr";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {selectedLog && (
          <>
            <div className="p-5 pb-4 border-b border-border flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-bold truncate">{t("auditLog.details")}</DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {formatCellDateTime(selectedLog.createdAt)}
                </p>
              </div>
              <Badge variant="outline" className={cn("font-medium", actionStyles[selectedLog.action] || "")}>
                {getActionLabel(selectedLog.action, isFr)}
              </Badge>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("auditLog.user")}</p>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground/60" />
                    {selectedLog.username || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("auditLog.entityType")}</p>
                  <p className="text-sm font-medium">
                    {getEntityLabel(selectedLog.entityType, isFr)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("auditLog.entityName")}</p>
                  <p className="text-sm font-medium truncate">{selectedLog.entityName || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("auditLog.date")}</p>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                    {formatCellDateTime(selectedLog.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IP</p>
                  <p className="text-sm font-mono text-muted-foreground">{selectedLog.ipAddress || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{isFr ? "Navigateur" : "User Agent"}</p>
                  <p className="text-xs font-mono text-muted-foreground truncate" title={selectedLog.userAgent || ""}>
                    {selectedLog.userAgent || "—"}
                  </p>
                </div>
              </div>

              {selectedLog.previousValue && selectedLog.newValue ? (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{isFr ? "Modifications" : "Changes"}</h4>
                  <div className="bg-muted/20 rounded-lg p-3">
                    {Object.entries(selectedLog.newValue as Record<string, unknown>).map(([key, val]) => {
                      const prevVal = (selectedLog.previousValue as Record<string, unknown>)?.[key];
                      const changed = JSON.stringify(prevVal) !== JSON.stringify(val);
                      return changed ? (
                        <div key={key} className="grid grid-cols-3 gap-3 py-1.5 text-xs border-b border-border/40 last:border-0">
                          <span className="font-semibold text-muted-foreground">{key}</span>
                          <span className="font-mono text-red-500 line-through">{formatJSON(prevVal)}</span>
                          <span className="font-mono text-emerald-600">{formatJSON(val)}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("auditLog.previousValue")}</h4>
                  <pre className="text-xs bg-muted/20 border border-border rounded-lg p-3 overflow-auto max-h-80 font-mono">
                    {formatJSON(selectedLog.previousValue || selectedLog.newValue)}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}