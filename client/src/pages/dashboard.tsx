import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, AlertCircle, Users, Calendar, FlaskConical, DollarSign } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Line, LineChart } from "recharts";
import { useDashboardStats, useAppointments, useInvoices, useMonthlyStats } from "@/hooks/use-api";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language-context";
import { useLocation } from "wouter";
import { PageStatCard } from "@/components/page-stat-card";
import { StatusBadge } from "@/components/status-badge";

const MONTH_KEYS = ["common.month-jan", "common.month-feb", "common.month-mar", "common.month-apr", "common.month-may", "common.month-jun", "common.month-jul", "common.month-aug", "common.month-sep", "common.month-oct", "common.month-nov", "common.month-dec"];

export default function Dashboard() {
  const { t, dir } = useLanguage();
  const [, navigate] = useLocation();
  const { data: stats, isLoading: statsLoading, isError: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: invoices = [], isError: invoicesError, refetch: refetchInvoices } = useInvoices();
  const { data: monthlyStats = [] } = useMonthlyStats(new Date().getFullYear());
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: todayAppointments = [], isLoading: appointmentsLoading, isError: appointmentsError, refetch: refetchAppointments } = useAppointments(today);

  const hasError = statsError || invoicesError || appointmentsError;
  const handleRetry = () => { refetchStats(); refetchInvoices(); refetchAppointments(); };

  const completedCount = todayAppointments.filter(a => a.status === "Completed").length;
  const inProgressCount = todayAppointments.filter(a => a.status === "In Progress").length;
  const scheduledCount = todayAppointments.filter(a => a.status === "Scheduled").length;
  const pendingLab = todayAppointments.filter(a => a.type === "lab").length;

  const weeklyData = MONTH_KEYS.map((key, i) => {
    const found = monthlyStats.find(s => s.month === i + 1);
    return { name: t(key), visits: found?.appointments || 0, revenue: found ? parseFloat(found.revenue) : 0 };
  });

  const monthlyRevenue = weeklyData.reduce((s, d) => s + d.revenue, 0);

  const procAgg: Record<string, { count: number; revenue: number }> = {};
  for (const inv of invoices) {
    if (inv.status === "Paid") {
      const patient = inv;
      const key = patient.patientId;
      if (!procAgg[key]) procAgg[key] = { count: 0, revenue: 0 };
      procAgg[key].count++;
      procAgg[key].revenue += parseFloat(inv.amount);
    }
  }
  const topProcedures = Object.entries(procAgg)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, d]) => ({
      name: name.substring(0, 8),
      count: d.count,
      revenue: `${Math.round(d.revenue).toLocaleString()} ${t("common.currency-da")}`,
      pct: monthlyRevenue > 0 ? Math.round((d.revenue / monthlyRevenue) * 100) : 0,
    }));

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {hasError ? (
          <div className="p-12">
            <Card className="max-w-sm mx-auto">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{t("dashboard.failed-load") || "Failed to load dashboard"}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("dashboard.failed-load-sub") || "Something went wrong. Please try again."}</p>
                <Button variant="outline" size="sm" onClick={handleRetry}>{t("dashboard.retry") || "Retry"}</Button>
              </CardContent>
            </Card>
          </div>
        ) : (
        <>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("dashboard.subtitle")}</p>
          </div>
          <div className="text-end hidden sm:block">
            <p className="text-sm font-semibold text-foreground">{format(new Date(), "EEEE, MMMM do, yyyy")}</p>
            <p className="text-xs text-muted-foreground">{format(new Date(), "hh:mm a")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PageStatCard
            icon={Users}
            label={t("dashboard.total-patients")}
            value={stats?.totalPatients ?? 0}
            color="bg-gradient-to-br from-cyan-500/10 to-cyan-500/20 text-cyan-600"
            premium
            loading={statsLoading}
          />
          <PageStatCard
            icon={Calendar}
            label={t("dashboard.today-appointments")}
            value={todayAppointments.length}
            color="bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 text-emerald-600"
            loading={appointmentsLoading}
          />
          <PageStatCard
            icon={FlaskConical}
            label={t("dashboard.pending-lab")}
            value={pendingLab}
            color="bg-gradient-to-br from-amber-500/10 to-amber-500/20 text-amber-600"
            loading={false}
          />
          <PageStatCard
            icon={DollarSign}
            label={t("dashboard.monthly-revenue")}
            value={`${Math.round(monthlyRevenue).toLocaleString()} ${t("common.currency-da")}`}
            color="bg-gradient-to-br from-violet-500/10 to-violet-500/20 text-violet-600"
            loading={statsLoading}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="status-dot status-dot-green" />{scheduledCount} {t("dashboard.scheduled")}
          </div>
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="status-dot status-dot-blue" />{inProgressCount} {t("dashboard.in-progress")}
          </div>
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="status-dot bg-emerald-500" />{completedCount} {t("dashboard.completed")}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4 card-hover overflow-hidden">
            <CardHeader className="pb-3 px-5 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">{t("dashboard.patient-visits")}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.weekly-comparison")}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--primary))" }} />{t("dashboard.visits")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-2))" }} />{t("dashboard.revenue")}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="bg-card rounded-xl border border-border p-4 h-[270px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barCategoryGap="24%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", boxShadow: "0 8px 30px hsl(var(--foreground) / 0.1)", padding: "10px 14px", fontSize: "13px" }} />
                    <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[5, 5, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 card-hover rounded-xl border border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 px-5 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold tracking-tight">{t("dashboard.today-schedule")}</CardTitle>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {todayAppointments.length} {t("dashboard.appts")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {appointmentsLoading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5 flex-1"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-3 w-20" /></div>
                    </div>
                  ))}
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{t("dashboard.no-appointments")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("dashboard.no-appointments-sub")}</p>
                </div>
              ) : (
                <div className="space-y-1 -mx-1">
                  {todayAppointments.slice(0, 5).map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/40 transition-all duration-200 group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
                          {apt.patientName?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-tight text-foreground truncate">{apt.patientName || t("common.unknown")}</p>
                          <div className="flex items-center text-xs text-muted-foreground gap-1 mt-0.5">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{format(new Date(apt.appointmentDate), "hh:mm a")}</span>
                            <span className="mx-0.5">·</span>
                            <span className="truncate">{apt.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ms-2">
                        <StatusBadge status={apt.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {todayAppointments.length > 0 && (
                <Button variant="ghost" className="w-full mt-3 text-xs font-medium" onClick={() => navigate("/appointments")}>
                  {t("dashboard.view-schedule")}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-hover overflow-hidden">
            <CardHeader className="pb-3 px-5 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold tracking-tight">{t("dashboard.revenue-trend")}</CardTitle>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+{monthlyRevenue > 0 ? ((weeklyData[weeklyData.length - 1]?.revenue || 0) / Math.max(monthlyRevenue, 1) * 100).toFixed(1) : "0"}%</span>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="bg-card rounded-xl border border-border p-4 h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={6} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} ${t("common.currency-da")}`} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", boxShadow: "0 8px 30px hsl(var(--foreground) / 0.1)", padding: "10px 14px", fontSize: "13px" }} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2.5} dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover rounded-xl border border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-lg font-semibold tracking-tight">{t("dashboard.top-procedures")}</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                {topProcedures.length > 0 ? topProcedures.map((proc, idx) => (
                  <div key={proc.name} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-5">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground truncate">{proc.name}</span>
                        <span className="text-xs font-semibold text-foreground ms-2">{proc.revenue}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${proc.pct}%`, backgroundColor: "hsl(var(--primary))", opacity: 1 - (idx * 0.12) }} />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-end">{proc.count}</span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-8">{t("common.no-items")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </>
      )}
      </div>
    </Layout>
  );
}
