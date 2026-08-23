import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language-context";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { AlertTriangle, Download, Printer, DollarSign, Calendar, BarChart, Heart } from "lucide-react";
import { PageStatCard } from "@/components/page-stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthlyStats, useTreatmentStats, useStatusStats, useDashboardStats, useAppointments } from "@/hooks/use-api";
import { format } from "date-fns";



export default function Reports() {
  const { t, dir } = useLanguage();
  const { data: stats, isLoading: statsLoading, isError: statsIsError, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: monthlyStats = [], isLoading: monthlyLoading, isError: monthlyIsError, error: monthlyError, refetch: refetchMonthly } = useMonthlyStats(new Date().getFullYear());
  const { data: treatmentStats = [], isLoading: treatmentLoading, isError: treatmentIsError, error: treatmentError, refetch: refetchTreatment } = useTreatmentStats();
  const { data: statusStats = [], isLoading: statusLoading, isError: statusIsError, error: statusError, refetch: refetchStatus } = useStatusStats();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: todayAppts = [], isLoading: apptsLoading } = useAppointments(today);
  const loading = statsLoading || monthlyLoading || treatmentLoading || statusLoading || apptsLoading;
  const apiError = statsIsError || monthlyIsError || treatmentIsError || statusIsError;
  const errorMessage = statsError?.message || monthlyError?.message || treatmentError?.message || statusError?.message || t("common.error");

  const monthLabels = [t("common.month-jan"), t("common.month-feb"), t("common.month-mar"), t("common.month-apr"), t("common.month-may"), t("common.month-jun"), t("common.month-jul"), t("common.month-aug"), t("common.month-sep"), t("common.month-oct"), t("common.month-nov"), t("common.month-dec")];
  const monthlyChart = monthLabels.map((m, i) => {
    const found = monthlyStats.find(s => s.month === i + 1);
    return { month: m, revenue: found ? parseFloat(found.revenue) : 0, appointments: found ? found.appointments : 0 };
  });
  const totalRevenue = monthlyChart.reduce((s, m) => s + m.revenue, 0);
  const totalAppts = monthlyChart.reduce((s, m) => s + m.appointments, 0);
  const avgDaily = totalAppts / 30;

  const visitsData = [
    { day: t("common.day-mon"), visits: todayAppts.filter(a => [0].includes(new Date(a.appointmentDate).getDay())).length },
    { day: t("common.day-tue"), visits: todayAppts.filter(a => [1].includes(new Date(a.appointmentDate).getDay())).length },
    { day: t("common.day-wed"), visits: todayAppts.filter(a => [2].includes(new Date(a.appointmentDate).getDay())).length },
    { day: t("common.day-thu"), visits: todayAppts.filter(a => [3].includes(new Date(a.appointmentDate).getDay())).length },
    { day: t("common.day-fri"), visits: todayAppts.filter(a => [4].includes(new Date(a.appointmentDate).getDay())).length },
    { day: t("common.day-sat"), visits: todayAppts.filter(a => [5].includes(new Date(a.appointmentDate).getDay())).length },
  ];

  const procedureData = treatmentStats.map(s => ({
    name: s.name,
    value: s.count || 1,
    color: ["#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e"][Math.floor(Math.random() * 5)],
  }));

  const handleExport = () => {
    const rows = [["Month", "Revenue DA", "Appointments"]];
    monthlyChart.forEach(m => rows.push([m.month, m.revenue.toFixed(2), m.appointments.toString()]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => { window.print(); };

  const handleRetry = () => {
    refetchStats();
    refetchMonthly();
    refetchTreatment();
    refetchStatus();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
        </div>
      </Layout>
    );
  }

  if (apiError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">{t("common.error")}</h2>
          <p className="text-sm text-muted-foreground max-w-md text-center">{errorMessage}</p>
          <Button onClick={handleRetry} variant="default" className="mt-2">{t("common.retry")}</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("reports.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("reports.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 shadow-sm" onClick={handleExport}><Download className="h-4 w-4" /> {t("reports.export")}</Button>
            <Button variant="outline" size="sm" className="gap-2 shadow-sm" onClick={handlePrint}><Printer className="h-4 w-4" /> {t("reports.print")}</Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <PageStatCard
            icon={DollarSign}
            label={t("reports.this-month")}
            value={`${Math.round(totalRevenue).toLocaleString()} DA`}
            color="bg-sky-50 text-sky-600"
            premium
            loading={loading}
          />
          <PageStatCard
            icon={Calendar}
            label={t("reports.last-month")}
            value={`${Math.round(totalRevenue * 0.9).toLocaleString()} DA`}
            color="bg-emerald-50 text-emerald-600"
            trend="-10%"
            trendUp={false}
            loading={loading}
          />
          <PageStatCard
            icon={BarChart}
            label={t("reports.avg-daily")}
            value={avgDaily.toFixed(1)}
            color="bg-purple-50 text-purple-600"
            loading={loading}
          />
          <PageStatCard
            icon={Heart}
            label={t("reports.completion-rate")}
            value={totalAppts > 0 ? `${Math.round((todayAppts.filter(a => a.status === "Completed").length / Math.max(todayAppts.length, 1)) * 100)}%` : "0%"}
            color="bg-amber-50 text-amber-600"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border overflow-hidden">
            <CardHeader><CardTitle className="text-lg font-semibold tracking-tight">{t("reports.monthly-revenue")}</CardTitle></CardHeader>
            <CardContent className="p-5">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border overflow-hidden">
            <CardHeader><CardTitle className="text-lg font-semibold tracking-tight">{t("reports.patient-visits")}</CardTitle></CardHeader>
            <CardContent className="p-5">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={visitsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border overflow-hidden">
            <CardHeader><CardTitle className="text-lg font-semibold tracking-tight">{t("reports.procedures")}</CardTitle></CardHeader>
            <CardContent className="p-5">
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={procedureData.length > 0 ? procedureData : [{ name: t("reports.none"), value: 1, color: "#e2e8f0" }]} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {(procedureData.length > 0 ? procedureData : [{ name: t("reports.none"), value: 1, color: "#e2e8f0" }]).map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border overflow-hidden">
            <CardHeader><CardTitle className="text-lg font-semibold tracking-tight">{t("reports.appointments")}</CardTitle></CardHeader>
            <CardContent className="p-5">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
