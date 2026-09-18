import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { useLanguage } from "@/i18n/language-context";
import type { Expense } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Banknote, Edit3, Trash2 } from "lucide-react";

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseTable({ expenses, isLoading, onEdit, onDelete }: ExpenseTableProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 border-b border-border">
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              {t("expenses.date")}
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              {t("expenses.category")}
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              {t("expenses.description")}
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              {t("expenses.amount")}
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              {t("expenses.type")}
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              {t("common.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12">
                <div className="flex flex-col gap-4 px-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ) : expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12">
                <EmptyState
                  icon={<Banknote className="h-10 w-10" />}
                  title={t("common.no-data")}
                  description={t("expenses.no-expenses") || "Aucune dépense trouvée"}
                />
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((exp) => (
              <TableRow key={exp.id} className="hover:bg-muted/40 transition-colors">
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(exp.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
                    {exp.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">{exp.description}</TableCell>
                <TableCell className="text-sm font-semibold">
                  {parseFloat(exp.amount).toLocaleString()} DA
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      exp.type === "fixed"
                        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                        : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800"
                    )}
                  >
                    {exp.type === "fixed" ? t("expenses.fixed") : t("expenses.variable")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={t("common.edit")}
                      onClick={() => onEdit(exp)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive transition-colors duration-200"
                      title={t("common.delete")}
                      onClick={() => onDelete(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}