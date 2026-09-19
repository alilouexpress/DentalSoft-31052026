import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";

const STATUS_OPTIONS = ["draft", "pending", "approved", "rejected", "converted"];

interface QuotationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export default function QuotationFilters({ search, onSearchChange, statusFilter, onStatusFilterChange }: QuotationFiltersProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("common.search")}
          className="ps-9 bg-card"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[160px] bg-card">
          <SelectValue placeholder={t("common.filter")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("common.all")}</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>{t(`quotations.status-${s}`) || s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}