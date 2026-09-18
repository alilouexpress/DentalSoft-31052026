import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ExpenseCategoryBreakdown } from "@/components/expenses/expense-category-breakdown";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog";
import { ExpenseStats } from "@/components/expenses/expense-stats";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { useDashboardStats, useDeleteExpense, useExpenseCategories, useExpenses, useExpenseSummary } from "@/hooks/use-api";
import { useLanguage } from "@/i18n/language-context";
import type { Expense } from "@shared/schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Expenses() {
  const { t } = useLanguage();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: expenses = [], isLoading } = useExpenses(startDate, endDate);
  const { data: summary } = useExpenseSummary(startDate, endDate);
  const { data: categories = [] } = useExpenseCategories();
  const { data: dashboardStats } = useDashboardStats();
  const deleteExpense = useDeleteExpense();

  const monthlyRevenue = parseFloat(dashboardStats?.monthlyRevenue || "0");
  const totalExpenses = parseFloat(summary?.total || "0");
  const profit = monthlyRevenue - totalExpenses;

  const fixedTotal = expenses.filter((e) => e.type === "fixed").reduce((s, e) => s + parseFloat(e.amount), 0);
  const variableTotal = expenses.filter((e) => e.type === "variable").reduce((s, e) => s + parseFloat(e.amount), 0);

  const filtered = categoryFilter === "all" ? expenses : expenses.filter((e) => e.category === categoryFilter);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpense.mutateAsync(deleteTarget);
      toast.success("Dépense supprimée");
      setDeleteTarget(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("expenses.title")}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{t("dashboard.monthly-revenue-sub")}</p>
          </div>
          <Button className="gap-2 shadow-sm" onClick={() => { setEditingExpense(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4" /> {t("expenses.addExpense")}
          </Button>
        </div>

        <ExpenseStats
          totalExpenses={totalExpenses}
          fixedTotal={fixedTotal}
          variableTotal={variableTotal}
          profit={profit}
          isLoading={isLoading}
        />

        <ExpenseCategoryBreakdown summary={summary} categories={categories} expenses={expenses} />

        <ExpenseFilters
          startDate={startDate}
          endDate={endDate}
          categoryFilter={categoryFilter}
          categories={categories}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onCategoryFilterChange={setCategoryFilter}
        />

        <ExpenseTable
          expenses={filtered}
          isLoading={isLoading}
          onEdit={(expense) => { setEditingExpense(expense); setDialogOpen(true); }}
          onDelete={(id) => setDeleteTarget(id)}
        />
      </div>

      <ExpenseFormDialog open={dialogOpen} onOpenChange={setDialogOpen} expense={editingExpense} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title="Supprimer la dépense"
        description="Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteExpense.isPending}
        onConfirm={handleDelete}
      />
    </Layout>
  );
}