import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateExpense, useExpenseCategories, useUpdateExpense } from "@/hooks/use-api";
import { useLanguage } from "@/i18n/language-context";
import type { Expense } from "@shared/schema";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
}

interface FormState {
  category: string;
  description: string;
  amount: string;
  date: string;
  type: string;
  recurring: boolean;
  recurringInterval: string;
  notes: string;
}

const emptyForm = (): FormState => ({
  category: "",
  description: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  type: "variable",
  recurring: false,
  recurringInterval: "",
  notes: "",
});

const expenseToForm = (expense: Expense): FormState => ({
  category: expense.category,
  description: expense.description,
  amount: expense.amount,
  date: new Date(expense.date).toISOString().split("T")[0],
  type: expense.type,
  recurring: expense.recurring,
  recurringInterval: expense.recurringInterval || "",
  notes: expense.notes || "",
});

export function ExpenseFormDialog({ open, onOpenChange, expense }: ExpenseFormDialogProps) {
  const { t } = useLanguage();
  const { data: categories = [] } = useExpenseCategories();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const editingId = expense?.id ?? null;
  const [newCategoryInput, setNewCategoryInput] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(expense ? expenseToForm(expense) : emptyForm());
      setNewCategoryInput(false);
      setSaving(false);
    }
  }, [open, expense]);

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
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
    setSaving(false);
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
    <Dialog open={open} onOpenChange={(o) => { if (!o) onOpenChange(false); }}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}