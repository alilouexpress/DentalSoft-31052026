import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/i18n/language-context";
import type { Expense } from "@shared/schema";
import { useMemo } from "react";
import { PieChart as PieChartIcon, Tags } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

const CHART_COLORS = ["hsl(var(--primary))", "#f97316", "#22c55e", "#a855f7", "#06b6d4", "#e11d48", "#eab308", "#14b8a6"];

export type ExpenseSummary = { total: string; byCategory: { category: string; amount: string }[] };

interface ExpenseCategoryBreakdownProps {
  summary?: ExpenseSummary;
  categories: string[];
  expenses: Expense[];
}

export function ExpenseCategoryBreakdown({ summary, categories, expenses }: ExpenseCategoryBreakdownProps) {
  const { t } = useLanguage();

  const pieData = useMemo(() => {
    if (!summary?.byCategory) return [];
    return summary.byCategory.map((c, i) => ({
      name: c.category,
      value: parseFloat(c.amount),
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [summary]);

  return (
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
  );
}