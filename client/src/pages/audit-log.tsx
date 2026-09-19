import Layout from "@/components/layout";
import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/language-context";
import { useAuditLogs } from "@/hooks/use-api";
import type { AuditLog } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { AUDIT_LOG_LIMIT as LIMIT } from "@/components/audit-log/constants";
import { AuditLogFilters, type AuditLogFiltersState } from "@/components/audit-log/audit-log-filters";
import { AuditLogTable } from "@/components/audit-log/audit-log-table";
import { AuditLogDetailDialog } from "@/components/audit-log/audit-log-detail-dialog";

const EMPTY_FILTERS: AuditLogFiltersState = {
  dateFrom: "",
  dateTo: "",
  actionFilter: "all",
  entityFilter: "all",
  userSearch: "",
};

export default function AuditLog() {
  const { t } = useLanguage();

  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * LIMIT;

  const { data: auditLogs = [], isLoading, isError, error, refetch } = useAuditLogs(LIMIT, offset);

  const [filters, setFilters] = useState<AuditLogFiltersState>(EMPTY_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (filters.actionFilter !== "all" && log.action !== filters.actionFilter) return false;
      if (filters.entityFilter !== "all" && log.entityType !== filters.entityFilter) return false;
      if (filters.userSearch && log.username) {
        const q = filters.userSearch.toLowerCase();
        if (!log.username.toLowerCase().includes(q)) return false;
      }
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (new Date(log.createdAt) < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(log.createdAt) > to) return false;
      }
      return true;
    });
  }, [auditLogs, filters]);

  const hasActiveFilters = Boolean(filters.actionFilter !== "all" || filters.entityFilter !== "all" || filters.userSearch || filters.dateFrom || filters.dateTo);
  const activeFilterCount =
    (filters.actionFilter !== "all" ? 1 : 0) +
    (filters.entityFilter !== "all" ? 1 : 0) +
    (filters.userSearch ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0);

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const openDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
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
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {filtersVisible && (
          <AuditLogFilters
            filters={filters}
            onChange={setFilters}
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        )}

        <AuditLogTable
          logs={filteredLogs}
          loadedCount={auditLogs.length}
          page={currentPage}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          hasActiveFilters={hasActiveFilters}
          onOpenDetail={openDetail}
        />
      </div>

      <AuditLogDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        log={selectedLog}
      />
    </Layout>
  );
}