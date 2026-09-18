import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/i18n/language-context";
import { Search } from "lucide-react";

interface ExpenseFiltersProps {
  startDate: string;
  endDate: string;
  categoryFilter: string;
  categories: string[];
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
}

export function ExpenseFilters({
  startDate,
  endDate,
  categoryFilter,
  categories,
  onStartDateChange,
  onEndDateChange,
  onCategoryFilterChange,
}: ExpenseFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-muted/30 p-3 rounded-xl flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="ps-9 bg-card w-44"
        />
      </div>
      <span className="text-xs text-muted-foreground">—</span>
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="bg-card w-44"
      />
      <Separator orientation="vertical" className="h-6" />
      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-44 bg-card">
          <SelectValue placeholder={t("expenses.category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("common.all")}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}