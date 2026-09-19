import { Fragment, useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import type { AuditLog } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import {
  AlertCircle, Calendar, ChevronLeft, ChevronRight,
  ChevronRight as ChevronRightIcon, FileSearch, User,
} from "lucide-react";
import {
  actionStyles, AUDIT_LOG_LIMIT, formatCellDateTime, formatJSON,
  getActionLabel, getEntityLabel,
} from "./constants";

interface AuditLogTableProps {
  logs: AuditLog[];
  loadedCount: number;
  page: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  hasActiveFilters: boolean;
  onOpenDetail: (log: AuditLog) => void;
}

const SKELETON_ROWS = [1, 2, 3, 4, 5];

function detailsPreview(log: AuditLog): string {
  if (log.action === "create" && log.newValue) {
    return Object.keys(log.newValue as object).slice(0, 3).join(", ");
  }
  if (log.action === "update" && log.previousValue && log.newValue) {
    const keys = Object.keys(log.newValue as object).filter(
      (k) => JSON.stringify((log.newValue as any)[k]) !== JSON.stringify((log.previousValue as any)[k])
    );
    return keys.slice(0, 2).join(", ") || "—";
  }
  return "—";
}

export function AuditLogTable({
  logs, loadedCount, page, onPageChange,
  isLoading, isError, error, onRetry, hasActiveFilters, onOpenDetail,
}: AuditLogTableProps) {
  const { t, language } = useLanguage();
  const isFr = language === "fr";
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpand = (id: string) => setExpandedRow((prev) => (prev === id ? null : id));

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="p-5 space-y-4">
          {SKELETON_ROWS.map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-32 flex-1" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center dark:bg-red-950/30">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-foreground">{t("common.error")}</h3>
            <p className="text-sm text-muted-foreground">{error?.message || t("common.no-data")}</p>
            <Button variant="outline" size="sm" onClick={onRetry}>{t("common.retry")}</Button>
          </div>
        </CardContent>
      ) : logs.length === 0 ? (
        <div className="py-16">
          <EmptyState
            icon={<FileSearch className="h-8 w-8" />}
            title={t("auditLog.noResults")}
            description={hasActiveFilters ? t("auditLog.noResults") : t("common.no-data")}
          />
        </div>
      ) : (
        <>
          <ScrollArea className="max-w-full">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border bg-muted/30">
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[160px]">{t("auditLog.date")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[120px]">{t("auditLog.user")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[110px]">{t("auditLog.action")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[120px]">{t("auditLog.entityType")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[140px]">{t("auditLog.entityName")}</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[180px] hidden md:table-cell">{t("auditLog.details")}</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  return (
                    <Fragment key={log.id}>
                      <TableRow
                        className="group cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => toggleExpand(log.id)}
                      >
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                            {formatCellDateTime(log.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                            {log.username || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-medium text-xs px-2 py-0.5", actionStyles[log.action] || "")}>
                            {getActionLabel(log.action, isFr)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {getEntityLabel(log.entityType, isFr)}
                        </TableCell>
                        <TableCell className="text-sm font-medium max-w-[200px] truncate">
                          {log.entityName || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate hidden md:table-cell">
                          {detailsPreview(log)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={(e) => { e.stopPropagation(); onOpenDetail(log); }}
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isExpanded && !!(log.previousValue || log.newValue) && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={7} className="p-0">
                            <div className="bg-muted/20 border-t border-border px-4 py-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {log.previousValue ? (
                                  <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("auditLog.previousValue")}</h4>
                                    <pre className="text-xs bg-card border border-border rounded-lg p-3 overflow-auto max-h-40 font-mono text-muted-foreground">
                                      {formatJSON(log.previousValue)}
                                    </pre>
                                  </div>
                                ) : null}
                                {log.newValue ? (
                                  <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t("auditLog.newValue")}</h4>
                                    <pre className="text-xs bg-card border border-border rounded-lg p-3 overflow-auto max-h-40 font-mono text-foreground">
                                      {formatJSON(log.newValue)}
                                    </pre>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
            <p className="text-xs text-muted-foreground">
              {logs.length} résultat{logs.length > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                disabled={page === 0}
                onClick={() => onPageChange(Math.max(0, page - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> {t("pagination.previous")}
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {page + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                disabled={loadedCount < AUDIT_LOG_LIMIT}
                onClick={() => onPageChange(page + 1)}
              >
                {t("pagination.next")} <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}