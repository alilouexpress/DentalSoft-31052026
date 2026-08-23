import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageStatCard } from "@/components/page-stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/language-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  Banknote,
  PieChart as PieChartIcon,
  Tags,
  Receipt,
} from "lucide-react";
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useExpenseSummary,
  useExpenseCategories,
  useDashboardStats,
} from "@/hooks/use-api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

const CHART_COLORS = ["hsl(var(--primary))", "#f97316", "#22c55e", "#a855f7", "#06b6d4", "#e11d48", "#eab308", "#14b8a6"];

export default function Expenses() {
  const { t } = useLanguage();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryInput, setNewCategoryInput] = useState(false);
  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "variable",
    recurring: false,
    recurringInterval: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: expenses = [], isLoading } = useExpenses(startDate, endDate);
  const { data: summary } = useExpenseSummary(startDate, endDate);
  const { data: categories = [] } = useExpenseCategories();
  const { data: dashboardStats } = useDashboardStats();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const monthlyRevenue = parseFloat(dashboardStats?.monthlyRevenue || "0");
  const totalExpenses = parseFloat(summary?.total || "0");
  const profit = monthlyRevenue - totalExpenses;

  const fixedTotal = expenses.filter((e) => e.type === "fixed").reduce((s, e) => s + parseFloat(e.amount), 0);
  const variableTotal = expenses.filter((e) => e.type === "variable").reduce((s, e) => s + parseFloat(e.amount), 0);

  const filtered = categoryFilter === "all" ? expenses : expenses.filter((e) => e.category === categoryFilter);

  const pieData = useMemo(() => {
    if (!summary?.byCategory) return [];
    return summary.byCategory.map((c, i) => ({
      name: c.category,
      value: parseFloat(c.amount),
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [summary]);

  const resetForm = () => {
    setForm({
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      type: "variable",
      recurring: false,
      recurringInterval: "",
      notes: "",
    });
    setNewCategoryInput(false);
  };

  const openAdd = () => {
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (expense: typeof expenses[number]) => {
    setEditingId(expense.id);
    setForm({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split("T")[0],
      type: expense.type,
      recurring: expense.recurring,
      recurringInterval: expense.recurringInterval || "",
      notes: expense.notes || "",
    });
    setNewCategoryInput(false);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.description || !form.amount) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        category: form.category,
        description: form.description,
        amount: form.amount,
        date: new Date(form.date),
        type: form.type,
        recurring: form.recurring,
        recurringInterval: form.recurring ? form.recurringInterval : null,
        notes: form.notes || null,
      };
      if (editingId) {
        await updateExpense.mutateAsync({ id: editingId, data: payload });
        toast.success("Dépense modifiée");
      } else {
        await createExpense.mutateAsync(payload);
        toast.success("Dépense créée");
      }
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
    setSaving(false);
  };

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

  const handleCategorySelect = (val: string) => {
    if (val === "__new__") {
      setNewCategoryInput(true);
      setForm({ ...form, category: "" });
    } else {
      setNewCategoryInput(false);
      setForm({ ...form, category: val });
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
          <Button className="gap-2 shadow-sm" onClick={openAdd}>
            <Plus className="h-4 w-4" /> {t("expenses.addExpense")}
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <PageStatCard
            icon={Banknote}
            label={t("expenses.total")}
            value={`${totalExpenses.toLocaleString()} DA`}
            color="bg-gradient-to-br from-cyan-500/10 to-cyan-500/20 text-cyan-600"
            premium
            loading={isLoading}
          />
          <PageStatCard
            icon={Receipt}
            label={t("expenses.fixed")}
            value={`${fixedTotal.toLocaleString()} DA`}
            color="bg-gradient-to-br from-blue-500/10 to-blue-500/20 text-blue-600"
            loading={isLoading}
          />
          <PageStatCard
            icon={TrendingUp}
            label={t("expenses.variable")}
            value={`${variableTotal.toLocaleString()} DA`}
            color="bg-gradient-to-br from-orange-500/10 to-orange-500/20 text-orange-600"
            loading={isLoading}
          />
          <PageStatCard
            icon={profit >= 0 ? TrendingUp : TrendingDown}
            label={t("expenses.profit")}
            value={`${profit.toLocaleString()} DA`}
            color={profit >= 0 ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 text-emerald-600" : "bg-gradient-to-br from-red-500/10 to-red-500/20 text-red-600"}
            loading={isLoading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                {t("expenses.byCategory")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-52 text-sm text-muted-foreground">{t("common.no-data")}</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {pieData.map((_entry, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                      }}
                      formatter={(value: number) => `${value.toLocaleString()} DA`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex flex-wrap gap-3 mt-2">
                {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="font-medium text-foreground">{entry.value.toLocaleString()} DA</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Tags className="h-4 w-4" />
                {t("expenses.category")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t("common.no-data")}</p>
              ) : (
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/30 text-sm"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary/60 shrink-0" />
                      <span className="font-medium">{cat}</span>
                      <span className="text-xs text-muted-foreground ms-auto">
                        {expenses.filter((e) => e.category === cat).length}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/30 p-3 rounded-xl flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ps-9 bg-card w-44"
            />
          </div>
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-card w-44"
          />
          <Separator orientation="vertical" className="h-6" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
              ) : filtered.length === 0 ? (
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
                filtered.map((exp) => (
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
                          onClick={() => openEdit(exp)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive transition-colors duration-200"
                          title={t("common.delete")}
                          onClick={() => setDeleteTarget(exp.id)}
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { setDialogOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingId ? t("common.edit") : t("expenses.addExpense")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("expenses.category")}</Label>
                <Select value={newCategoryInput ? "__new__" : form.category} onValueChange={handleCategorySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("expenses.category")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__">+ {t("expenses.addExpense")}</SelectItem>
                  </SelectContent>
                </Select>
                {newCategoryInput && (
                  <Input
                    className="mt-2"
                    placeholder="Nouvelle catégorie"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    autoFocus
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label>{t("expenses.amount")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("expenses.description")}</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Fournitures de bureau"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("expenses.date")}</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("expenses.type")}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">{t("expenses.fixed")}</SelectItem>
                    <SelectItem value="variable">{t("expenses.variable")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="recurring"
                  checked={form.recurring}
                  onCheckedChange={(v) => setForm({ ...form, recurring: v as boolean })}
                />
                <Label htmlFor="recurring" className="text-sm font-normal cursor-pointer">
                  {t("expenses.recurring")}
                </Label>
              </div>
              {form.recurring && (
                <Select
                  value={form.recurringInterval}
                  onValueChange={(v) => setForm({ ...form, recurringInterval: v })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Intervalle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="quarterly">Trimestriel</SelectItem>
                    <SelectItem value="yearly">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">{t("billing.notes-optional")}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t("billing.notes-placeholder")}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
