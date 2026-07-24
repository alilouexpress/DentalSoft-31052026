import Layout from "@/components/layout";
import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/language-context";
import { useAuditLogs } from "@/hooks/use-api";
import type { AuditLog } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import {
  Search, Filter, X, ChevronLeft, ChevronRight, AlertCircle,
  Calendar, User, Shield, Clock, Monitor, ChevronDown, ChevronRight as ChevronRightIcon,
  FileSearch
} from "lucide-react";

const actionStyles: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  update: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400",
  delete: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  login: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
  logout: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
  backup: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
};

const actionLabels: Record<string, string> = {
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  login: "Connexion",
  logout: "Déconnexion",
  backup: "Sauvegarde",
};

const actionLabelsEn: Record<string, string> = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  login: "Login",
  logout: "Logout",
  backup: "Backup",
};

const entityTypes = [
  "patient", "appointment", "invoice", "payment",
  "treatment", "prescription", "lab_case", "task",
  "user", "setting", "backup", "document",
];

const actionTypes = ["create", "update", "delete", "login", "logout", "backup"];

const LIMIT = 50;

function formatJSON(value: unknown): string {
  if (value === null || value === undefined) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatCellDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AuditLog() {
  const { t, language } = useLanguage();
  const isFr = language === "fr";

  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * LIMIT;

  const { data: auditLogs = [], isLoading, isError, error, refetch } = useAuditLogs(LIMIT, offset);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) return false;
      if (entityFilter !== "all" && log.entityType !== entityFilter) return false;
      if (userSearch && log.username) {
        const q = userSearch.toLowerCase();
        if (!log.username.toLowerCase().includes(q)) return false;
      }
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(log.createdAt) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(log.createdAt) > to) return false;
      }
      return true;
    });
  }, [auditLogs, actionFilter, entityFilter, userSearch, dateFrom, dateTo]);

  const hasActiveFilters = actionFilter !== "all" || entityFilter !== "all" || userSearch || dateFrom || dateTo;

  const clearFilters = () => {
    setActionFilter("all");
    setEntityFilter("all");
    setUserSearch("");
    setDateFrom("");
    setDateTo("");
  };

  const openDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getActionLabel = (action: string) => {
    if (isFr) return actionLabels[action] || action;
    return actionLabelsEn[action] || action;
  };

  const getEntityLabel = (type: string) => {
    if (isFr) {
      const map: Record<string, string> = {
        patient: "Patient",
        appointment: "Rendez-vous",
        invoice: "Facture",
        payment: "Paiement",
        treatment: "Traitement",
        prescription: "Ordonnance",
        lab_case: "Laboratoire",
        task: "Tâche",
        user: "Utilisateur",
        setting: "Paramètre",
        backup: "Sauvegarde",
        document: "Document",
      };
      return map[type] || type;
    }
    const map: Record<string, string> = {
      patient: "Patient",
      appointment: "Appointment",
      invoice: "Invoice",
      payment: "Payment",
      treatment: "Treatment",
      prescription: "Prescription",
      lab_case: "Lab Case",
      task: "Task",
      user: "User",
      setting: "Setting",
      backup: "Backup",
      document: "Document",
    };
    return map[type] || type;
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("auditLog.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("auditLog.details")}</p>
          </div>
          <Button variant="outline" className="gap-2 shadow-sm" onClick={() => setFiltersVisible(!filtersVisible)}>
            <Filter className="h-4 w-4" /> {t("common.filter")}
            {hasActiveFilters && (
              <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {(actionFilter !== "all" ? 1 : 0) + (entityFilter !== "all" ? 1 : 0) + (userSearch ? 1 : 0) + (dateFrom || dateTo ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {filtersVisible && (
          <Card className="glass border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{t("auditLog.filterByDate")} (de)</label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{t("auditLog.filterByDate")} (à)</label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{t("auditLog.action")}</label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder={t("common.all")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("common.all")}</SelectItem>
                      {actionTypes.map((a) => (
                        <SelectItem key={a} value={a}>{getActionLabel(a)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{t("auditLog.entityType")}</label>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder={t("common.all")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("common.all")}</SelectItem>
                      {entityTypes.map((e) => (
                        <SelectItem key={e} value={e}>{getEntityLabel(e)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">{t("auditLog.user")}</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder={t("common.search")}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="h-9 pl-8 text-sm"
                    />
                  </div>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="flex justify-end mt-3 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8" onClick={clearFilters}>
                    <X className="h-3.5 w-3.5" /> {t("common.cancel")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
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
                <Button variant="outline" size="sm" onClick={() => refetch()}>{t("common.retry")}</Button>
              </div>
            </CardContent>
          ) : filteredLogs.length === 0 ? (
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
                    {filteredLogs.map((log) => {
                      const isExpanded = expandedRow === log.id;
                      return (
                        <>
                          <TableRow
                            key={log.id}
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
                                {getActionLabel(log.action)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {getEntityLabel(log.entityType)}
                            </TableCell>
                            <TableCell className="text-sm font-medium max-w-[200px] truncate">
                              {log.entityName || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate hidden md:table-cell">
                              {log.action === "create" && log.newValue
                                ? Object.keys(log.newValue as object).slice(0, 3).join(", ")
                                : log.action === "update" && log.previousValue && log.newValue
                                  ? Object.keys(log.newValue as object).filter(
                                      (k) => JSON.stringify((log.newValue as any)[k]) !== JSON.stringify((log.previousValue as any)[k])
                                    ).slice(0, 2).join(", ") || "—"
                                  : "—"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground"
                                onClick={(e) => { e.stopPropagation(); openDetail(log); }}
                              >
                                <ChevronRightIcon className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (log.previousValue || log.newValue) && (
                            <TableRow key={`${log.id}-expanded`} className="hover:bg-transparent">
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
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>

              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  {filteredLogs.length} résultat{filteredLogs.length > 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> {t("pagination.previous")}
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {currentPage + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    disabled={auditLogs.length < LIMIT}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    {t("pagination.next")} <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
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
                  {getActionLabel(selectedLog.action)}
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
                      {getEntityLabel(selectedLog.entityType)}
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
    </Layout>
  );
}
