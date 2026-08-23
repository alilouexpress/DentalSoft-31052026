import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { Plus, Search, FlaskConical, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { usePatients, useDoctors, useLabCases, useCreateLabCase, useUpdateLabCase, useDeleteLabCase, useStatusConfigs } from "@/hooks/use-api";

export default function LabWork() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();
  const { data: labCases = [], isLoading, isError, error, refetch } = useLabCases();
  const { data: statusConfigs = [] } = useStatusConfigs("lab");
  const createCase = useCreateLabCase();
  const deleteCase = useDeleteLabCase();
  const [form, setForm] = useState({ patientId: "", doctorId: "", labName: "", type: "", dueDate: "", description: "" });
  const [saving, setSaving] = useState(false);

  const filtered = labCases.filter(c =>
    (statusFilter === "all" || c.status === statusFilter) &&
    ((c.patientName || "").toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: labCases.length,
    inProgress: labCases.filter(c => c.status === "In Progress").length,
    completed: labCases.filter(c => c.status === "Received" || c.status === "Delivered").length,
    urgent: labCases.filter(c => c.status === "Sent" && c.dueDate && new Date(c.dueDate) < new Date()).length,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.labName || !form.type) {
      toast.error(t("lab.fields-required"));
      return;
    }
    setSaving(true);
    try {
      await createCase.mutateAsync({
        patientId: form.patientId,
        doctorId: form.doctorId,
        labName: form.labName,
        type: form.type,
        dueDate: form.dueDate ? new Date(form.dueDate) : null,
        description: form.description || null,
        status: "Sent",
      });
      toast.success(t("lab.created"));
      setDialogOpen(false);
      setForm({ patientId: "", doctorId: "", labName: "", type: "", dueDate: "", description: "" });
    } catch { toast.error(t("common.error")); }
    setSaving(false);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("lab.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("lab.subtitle")}</p>
          </div>
          <Button className="gap-2 shadow-sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> {t("lab.new-order")}
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { label: t("lab.total"), value: stats.total, icon: FlaskConical, color: "bg-cyan-50 text-cyan-600" },
            { label: t("lab.in-progress"), value: stats.inProgress, icon: Clock, color: "bg-amber-50 text-amber-600" },
            { label: t("lab.completed"), value: stats.completed, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
            { label: t("lab.urgent"), value: stats.urgent, icon: AlertCircle, color: "bg-red-50 text-red-600" },
          ].map((s, i) => (
            <Card key={i} className="card-hover">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) setDialogOpen(false); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>{t("lab.order-title")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("lab.patient")}</Label>
                <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                  <SelectTrigger><SelectValue placeholder={t("lab.select-patient")} /></SelectTrigger>
                  <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("lab.doctor")}</Label>
                <Select value={form.doctorId} onValueChange={(v) => setForm({ ...form, doctorId: v })}>
                  <SelectTrigger><SelectValue placeholder={t("appointments.doctor")} /></SelectTrigger>
                  <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t("lab.lab")}</Label>
                  <Input value={form.labName} onChange={(e) => setForm({ ...form, labName: e.target.value })} placeholder={t("lab.lab-name-placeholder")} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("lab.type")}</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue placeholder={t("lab.type-placeholder")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crown">{t("lab.type-crown")}</SelectItem>
                      <SelectItem value="Bridge">{t("lab.type-bridge")}</SelectItem>
                      <SelectItem value="Veneer">{t("lab.type-veneer")}</SelectItem>
                      <SelectItem value="Denture">{t("lab.type-denture")}</SelectItem>
                      <SelectItem value="Inlay">{t("lab.type-inlay")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("lab.due-date")}</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("lab.description")}</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("lab.cancel")}</Button>
                <Button type="submit" disabled={saving}>{saving ? t("lab.saving") : t("lab.save")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("lab.search")} className="ps-9 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue placeholder={t("common.filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {statusConfigs.map(sc => (
                <SelectItem key={sc.id} value={sc.statusValue}>{sc.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-12">
              <Card className="max-w-sm mx-auto">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{t("common.error")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error?.message || t("common.error")}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>{t("common.retry")}</Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border bg-muted/30">
                  {[t("lab.case-id"), t("lab.patient"), t("lab.doctor"), t("lab.lab"), t("lab.type"), t("lab.status"), t("lab.due-date")].map(h => (
                    <TableHead key={h} className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">{c.id.substring(0, 8)}</TableCell>
                    <TableCell className="font-medium text-sm">{c.patientName || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.doctorName || "—"}</TableCell>
                    <TableCell className="text-sm">{c.labName}</TableCell>
                    <TableCell className="text-sm">{c.type}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.dueDate ? new Date(c.dueDate).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-12"><EmptyState icon={<FlaskConical className="h-10 w-10" />} title={t("lab.no-cases")} description="Aucun cas de laboratoire trouvé" /></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
}
