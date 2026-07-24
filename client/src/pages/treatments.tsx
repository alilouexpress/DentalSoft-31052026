import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/language-context";
import { useState } from "react";
import { usePatients, useCreateAppointment, useDoctors, useTreatmentCategories, useTreatments } from "@/hooks/use-api";
import type { Treatment } from "@shared/schema";
import { toast } from "sonner";
import { Plus, Clock, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, string> = {
  "Stethoscope": "🔍", "AlignCenter": "🔷", "Scissors": "✂️", "Brush": "🖌️", "Smile": "😊",
};

export default function Treatments() {
  const { t, dir } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();
  const { data: categories = [], isLoading: catsLoading } = useTreatmentCategories();
  const { data: treatments = [], isLoading: treatmentsLoading, isError, refetch } = useTreatments();
  const createAppt = useCreateAppointment();
  const [saving, setSaving] = useState(false);
  const [customPrice, setCustomPrice] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTreatment, setDetailTreatment] = useState<Treatment | null>(null);

  const filteredTreatments = selectedCat
    ? treatments.filter(t => t.categoryId === selectedCat)
    : treatments;

  const grouped = categories.map(cat => ({
    ...cat,
    procedures: treatments.filter(t => t.categoryId === cat.id),
  }));

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = document.forms.namedItem("treatment-booking") as HTMLFormElement;
    if (!form) return;
    const data = new FormData(form);
    const patientId = data.get("patientId") as string;
    const doctorId = data.get("doctorId") as string;
    const procedure = data.get("procedure") as string;
    const date = data.get("date") as string;
    if (!patientId || !doctorId || !procedure || !date) {
      toast.error(t("appointments.select-required"));
      return;
    }
    setSaving(true);
    try {
      await createAppt.mutateAsync({
        patientId, doctorId, appointmentDate: new Date(date),
        status: "Scheduled",
        notes: `${procedure}${customPrice ? ` (${customPrice} DA)` : ""}`,
        type: procedure,
      });
      toast.success(t("appointments.created"));
      setDialogOpen(false);
      setCustomPrice("");
    } catch {
      toast.error(t("appointments.create-failed"));
    }
    setSaving(false);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("treatments.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("treatments.subtitle")}</p>
          </div>
          <Button className="gap-1.5 h-9" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("appointments.new")}</span>
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { setDialogOpen(false); setCustomPrice(""); } }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>{t("treatments.new-title")}</DialogTitle></DialogHeader>
            <form id="treatment-booking" onSubmit={handleBook} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("patients.name")}</Label>
                <Select name="patientId">
                  <SelectTrigger><SelectValue placeholder={t("patients.search")} /></SelectTrigger>
                  <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("appointments.doctor")}</Label>
                <Select name="doctorId">
                  <SelectTrigger><SelectValue placeholder={t("appointments.doctor")} /></SelectTrigger>
                  <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("treatments.procedures")}</Label>
                <Select name="procedure">
                  <SelectTrigger><SelectValue placeholder={t("treatments.view-all")} /></SelectTrigger>
                  <SelectContent>
                    {treatments.map(p => (
                      <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("treatments.price")} (DA)</Label>
                <Input type="number" placeholder={t("treatments.price-placeholder")} value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("appointments.date")}</Label>
                <input type="date" name="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("treatments.tooth-number")}</Label>
                <Input name="toothNumber" placeholder={t("treatments.tooth-placeholder")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("treatments.notes")}</Label>
                <Input name="notes" placeholder={t("treatments.notes-placeholder")} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setCustomPrice(""); }}>{t("common.cancel")}</Button>
                <Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("common.save")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {isError ? (
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{t("common.error")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("common.error")}</p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {t("common.retry")}
              </Button>
            </CardContent>
          </Card>
        ) : treatmentsLoading || catsLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-4 px-5 pt-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[1, 2].map((j) => (
                      <Skeleton key={j} className="h-24 w-full rounded-xl" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          grouped.map((cat) => (
            <Card key={cat.id} className="card-hover overflow-hidden">
              <CardHeader className="pb-4 px-5 pt-5">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                    <span className="text-lg">{iconMap[cat.icon] || "🦷"}</span>
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{cat.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cat.procedures.length} {t("treatments.procedures")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {cat.procedures.map((proc) => (
                    <div key={proc.id} onClick={() => { setDetailTreatment(proc); setDetailOpen(true); }} className="flex items-start gap-3 p-3.5 rounded-xl border bg-card/50 hover:bg-card transition-all duration-200 cursor-pointer group" style={{ borderColor: "hsl(var(--border))" }}>
                      <div className="h-9 w-9 rounded-lg bg-muted/70 flex items-center justify-center shrink-0 text-base">🦷</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">{proc.name}</span>
                          {proc.status && <Badge variant="outline" className="text-[10px] capitalize">{proc.status}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{proc.description || ""}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {proc.duration}
                          </span>
                          {proc.toothNumber && (
                            <span className="flex items-center gap-1">
                              🦷 {proc.toothNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {cat.procedures.length === 0 && (
                    <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">{t("common.no-items")}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <Card className="card-hover cursor-pointer" onClick={() => setSelectedCat(null)}>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("treatments.view-all")}</p>
                <p className="text-xs text-muted-foreground">{t("treatments.available", { count: treatments.length })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onOpenChange={(o) => { if (!o) { setDetailOpen(false); setDetailTreatment(null); } }}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader><DialogTitle>{detailTreatment?.name}</DialogTitle></DialogHeader>
            {detailTreatment && (
              <div className="space-y-4">
                {detailTreatment.description && (
                  <p className="text-sm text-muted-foreground">{detailTreatment.description}</p>
                )}
                <div className="space-y-1.5">
                  <Label>{t("treatments.duration")}</Label>
                  <p className="text-sm text-foreground">{detailTreatment.duration}</p>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("treatments.price")}</Label>
                  <p className="text-sm text-foreground">{detailTreatment.price || "0.00"} DA</p>
                </div>
                {detailTreatment.toothNumber && (
                  <div className="space-y-1.5">
                    <Label>{t("treatments.tooth-number")}</Label>
                    <p className="text-sm text-foreground">{detailTreatment.toothNumber}</p>
                  </div>
                )}
                {detailTreatment.status && (
                  <div className="space-y-1.5">
                    <Label>{t("treatments.status")}</Label>
                    <p className="text-sm text-foreground capitalize">{detailTreatment.status}</p>
                  </div>
                )}
                {detailTreatment.notes && (
                  <div className="space-y-1.5">
                    <Label>{t("treatments.notes")}</Label>
                    <p className="text-sm text-muted-foreground">{detailTreatment.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => { setDetailOpen(false); setDetailTreatment(null); }}>{t("common.close")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
