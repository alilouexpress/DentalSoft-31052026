import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Search, Clock, X, CalendarDays, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppointments, useDoctors, usePatients, useCreateAppointment, useTimeSlots, useStatusConfigs } from "@/hooks/use-api";
import { useState } from "react";
import { format, addDays, subDays, parse } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card as CardUI, CardContent as CardContentUI } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { FieldError } from "@/components/ui/field";
import { useLanguage } from "@/i18n/language-context";

export default function Appointments() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = format(selectedDate, "yyyy-MM-dd");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState("all");
  const { data: timeSlots = [] } = useTimeSlots();
  const { data: statusConfigs = [] } = useStatusConfigs("appointment");
  const [formData, setFormData] = useState({
    patientId: "", doctorId: "", date: format(selectedDate, "yyyy-MM-dd"), time: "", duration: "45",
    type: t("appointments.type-consultation"), status: "Scheduled", notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { data: appointments = [], isLoading, isError, error, refetch } = useAppointments(dateString);
  const { data: doctors = [] } = useDoctors();
  const { data: patients = [] } = usePatients();
  const createAppointment = useCreateAppointment();

  const typeColors: Record<string, string> = {};
  for (const sc of statusConfigs) {
    typeColors[sc.statusValue] = sc.colorClass;
  }

  const goToPreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.patientId) errors.patientId = t("common.field-required");
    if (!formData.doctorId) errors.doctorId = t("common.field-required");
    if (!formData.time) errors.time = t("common.field-required");
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    try {
      const dialogDate = parse(formData.date, "yyyy-MM-dd", new Date());
      const time = formData.time ? parse(formData.time, "HH:mm", dialogDate) : dialogDate;
      await createAppointment.mutateAsync({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDate: time,
        duration: Number(formData.duration),
        type: formData.type,
        status: formData.status,
        notes: formData.notes || null,
      });
      toast.success(t("appointments.created"));
      setDialogOpen(false);
      setFormData({ ...formData, patientId: "", doctorId: "", time: "", notes: "" });
    } catch {
      toast.error(t("appointments.create-failed"));
    }
  };

  const resetForm = () => { setDialogOpen(false); setFormData({ ...formData, patientId: "", doctorId: "", time: "", notes: "" }); setFieldErrors({}); };

  const displayDoctors = doctorFilter !== "all" ? doctors.filter(d => d.id === doctorFilter) : doctors;
  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  const filteredAppointments = searchTerm
    ? appointments.filter(a =>
        (a.patientName || "").toLowerCase().includes(searchTerm.toLowerCase())
      )
    : appointments;

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("appointments.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("appointments.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label="Previous day" onClick={goToPreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-3 min-w-[140px] justify-center">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-semibold text-foreground">{format(selectedDate, "MMM dd, yyyy")}</span>
                {isToday && <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{t("common.today")}</span>}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label="Next day" onClick={goToNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button className="gap-2 shadow-sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> {t("appointments.new")}
            </Button>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto p-0 gap-0">
            <div className="p-5 pb-4 border-b border-border">
              <DialogHeader><DialogTitle className="text-lg font-bold">{t("appointments.create-title")}</DialogTitle></DialogHeader>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">{t("appointments.patient")}</Label>
                {patients.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2 border border-dashed border-border rounded-lg text-center">{t("common.no-items")} {t("common.create-first")}</div>
                ) : (
                  <Select value={formData.patientId} onValueChange={(v) => { setFormData({ ...formData, patientId: v }); if (fieldErrors.patientId) setFieldErrors(p => { const n = { ...p }; delete n.patientId; return n; }); }}>
                    <SelectTrigger className={fieldErrors.patientId ? "border-destructive" : ""}><SelectValue placeholder={t("appointments.patient")} /></SelectTrigger>
                    <SelectContent>{patients.map(p => (<SelectItem key={p.id} value={p.id}>{p.name} ({p.patientId})</SelectItem>))}</SelectContent>
                  </Select>
                )}
                {fieldErrors.patientId && <FieldError errors={[{ message: fieldErrors.patientId }]} />}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">{t("appointments.doctor")}</Label>
                {doctors.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2 border border-dashed border-border rounded-lg text-center">{t("common.no-items")}</div>
                ) : (
                  <Select value={formData.doctorId} onValueChange={(v) => { setFormData({ ...formData, doctorId: v }); if (fieldErrors.doctorId) setFieldErrors(p => { const n = { ...p }; delete n.doctorId; return n; }); }}>
                    <SelectTrigger className={fieldErrors.doctorId ? "border-destructive" : ""}><SelectValue placeholder={t("appointments.doctor")} /></SelectTrigger>
                    <SelectContent>{doctors.map(d => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}</SelectContent>
                  </Select>
                )}
                {fieldErrors.doctorId && <FieldError errors={[{ message: fieldErrors.doctorId }]} />}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">{t("appointments.date")}</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">{t("appointments.time")}</Label>
                  <Select value={formData.time} onValueChange={(v) => { setFormData({ ...formData, time: v }); if (fieldErrors.time) setFieldErrors(p => { const n = { ...p }; delete n.time; return n; }); }}>
                    <SelectTrigger className={fieldErrors.time ? "border-destructive" : ""}><SelectValue placeholder={t("appointments.time")} /></SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(s => (<SelectItem key={s.id} value={s.value}>{s.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.time && <FieldError errors={[{ message: fieldErrors.time }]} />}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">{t("appointments.duration")}</Label>
                  <Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">{t("appointments.type")}</Label>
                <Input value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} placeholder={t("appointments.type-placeholder")} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">{t("appointments.notes")}</Label>
                <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder={t("appointments.notes-placeholder")} />
              </div>
              <DialogFooter className="gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-1" /> {t("appointments.cancel")}</Button>
                <Button type="submit" className="shadow-sm" disabled={createAppointment.isPending || !formData.patientId || !formData.doctorId}>
                  {createAppointment.isPending ? <><span className="animate-pulse-soft">{t("appointments.booking")}</span></> : t("appointments.book")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="bg-muted/30 p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t("appointments.search-patient")} className="pl-9 bg-card" />
            </div>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-[170px] bg-card">
                <SelectValue placeholder={t("appointments.filter-doctor")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("appointments.all-doctors")}</SelectItem>
                {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col card-hover">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="space-y-4 w-full">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
                    <Skeleton className="h-16 flex-1 rounded-lg" />
                    <Skeleton className="h-16 flex-1 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <CardUI className="max-w-sm w-full">
                <CardContentUI className="p-5 text-center">
                  <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{t("appointments.failed-load")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error?.message || t("appointments.failed-load-sub")}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>{t("appointments.retry")}</Button>
                </CardContentUI>
              </CardUI>
            </div>
          ) : displayDoctors.length === 0 ? (
            <EmptyState icon={<CalendarDays className="h-8 w-8" />} title={t("appointments.no-doctors")} description={t("appointments.no-doctors-sub")} />
          ) : (
            <>
              <div className="flex border-b border-border bg-muted/30">
                <div className="w-20 p-3 border-r border-border font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-center shrink-0">
                  {t("appointments.time")}
                </div>
                {displayDoctors.map(doctor => (
                  <div key={doctor.id} className="flex-1 p-3 text-sm font-semibold text-center border-r border-border last:border-r-0 min-w-0">
                    <span className="truncate block">{doctor.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="flex border-b border-border min-h-[90px] group hover:bg-muted/20 transition-colors">
                    <div className="w-20 p-2 border-r border-border text-xs font-medium text-muted-foreground flex justify-center pt-3 bg-muted/10 shrink-0">
                      {slot.label}
                    </div>
                    {displayDoctors.map(doctor => {
                      const apt = filteredAppointments.find(a => {
                        const aptTime = format(new Date(a.appointmentDate), "HH:mm");
                        return a.doctorId === doctor.id && aptTime === slot.value;
                      });
                      return (
                        <div key={`${doctor.id}-${slot.id}`} className="flex-1 p-1.5 border-r border-border last:border-r-0 relative">
                          {apt ? (
                            <div className={cn(
                              "h-full w-full rounded-lg p-2.5 border-l-[4px] shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
                              typeColors[apt.status] || "border-l-slate-400 bg-slate-50/80 text-slate-800"
                            )}>
                              <div className="font-bold text-sm leading-tight mb-0.5">{apt.patientName || t("common.unknown")}</div>
                              <div className="text-xs opacity-75 mb-1">{apt.type}</div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <StatusBadge status={apt.status} />
                              </div>
                              <div className="flex items-center text-xs opacity-60 mt-1">
                                <Clock className="h-3 w-3 mr-1" /> {apt.duration} min
                              </div>
                            </div>
                          ) : (
                            <div className="h-full w-full opacity-0 group-hover:opacity-100 hover:bg-primary/5 transition-all flex items-center justify-center cursor-pointer rounded-lg border-2 border-dashed border-transparent hover:border-primary/20">
                              <Plus className="h-4 w-4 text-primary/40" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
