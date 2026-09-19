import { useLanguage } from "@/i18n/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, X } from "lucide-react";
import { actionTypes, entityTypes, getActionLabel, getEntityLabel } from "./constants";

export interface AuditLogFiltersState {
  dateFrom: string;
  dateTo: string;
  actionFilter: string;
  entityFilter: string;
  userSearch: string;
}

interface AuditLogFiltersProps {
  filters: AuditLogFiltersState;
  onChange: (next: AuditLogFiltersState) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function AuditLogFilters({ filters, onChange, hasActiveFilters, onClear }: AuditLogFiltersProps) {
  const { t, language } = useLanguage();
  const isFr = language === "fr";

  const set = <K extends keyof AuditLogFiltersState>(key: K, value: AuditLogFiltersState[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <Card className="glass border-border/50 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">{t("auditLog.filterByDate")} (de)</label>
            <Input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">{t("auditLog.filterByDate")} (à)</label>
            <Input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">{t("auditLog.action")}</label>
            <Select value={filters.actionFilter} onValueChange={(v) => set("actionFilter", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {actionTypes.map((a) => (
                  <SelectItem key={a} value={a}>{getActionLabel(a, isFr)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">{t("auditLog.entityType")}</label>
            <Select value={filters.entityFilter} onValueChange={(v) => set("entityFilter", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder={t("common.all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {entityTypes.map((e) => (
                  <SelectItem key={e} value={e}>{getEntityLabel(e, isFr)}</SelectItem>
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
                value={filters.userSearch}
                onChange={(e) => set("userSearch", e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex justify-end mt-3 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8" onClick={onClear}>
              <X className="h-3.5 w-3.5" /> {t("common.cancel")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}