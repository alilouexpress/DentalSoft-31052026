import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, Filter, X, UserPlus, Mail, Phone, MapPin, MoreHorizontal, AlertCircle, Trash2, Calendar, Banknote, Eye, Edit, ChevronLeft, ChevronRight, Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { usePatients, useCreatePatient, useDeletePatient, useUpdatePatient } from "@/hooks/use-api";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Separator } from "@/components/ui/separator";
import { FieldError } from "@/components/ui/field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



interface PatientForm {
  name: string; age: string; gender: string; phone: string;
  email: string; address: string; status: string; balance: string;
  dateOfBirth: string; bloodType: string; nationalId: string;
  emergencyContact: string; emergencyPhone: string;
  insuranceProvider: string; insuranceNumber: string; notes: string;
}

const emptyForm = (): PatientForm => ({
  name: "", age: "", gender: "", phone: "",
  email: "", address: "", status: "Active", balance: "0.00",
  dateOfBirth: "", bloodType: "", nationalId: "",
  emergencyContact: "", emergencyPhone: "",
  insuranceProvider: "", insuranceNumber: "", notes: "",
});

const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

export default function Patients() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { data: patients = [], isLoading, isError, error, refetch } = usePatients();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formData, setFormData] = useState<PatientForm>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = t("common.field-required");
    if (!formData.age.trim()) errors.age = t("common.field-required");
    if (formData.age && (Number(formData.age) < 0 || Number(formData.age) > 150)) errors.age = t("common.field-invalid");
    if (!formData.gender) errors.gender = t("common.field-required");
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = t("common.field-invalid");
    if (formData.phone && !/^[\d\s\-+()]{6,20}$/.test(formData.phone)) errors.phone = t("common.field-invalid");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };


  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 15;

  useEffect(() => { setPage(0); }, [searchQuery, statusFilter]);

  const filteredPatients = patients.filter(patient =>
    (patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === "all" || patient.status === statusFilter)
  );
  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE);
  const paginatedPatients = filteredPatients.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const editPatientData = editingPatient ? patients.find(p => p.id === editingPatient) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const baseData = {
        name: formData.name, age: Number(formData.age),
        gender: formData.gender, phone: formData.phone, email: formData.email,
        address: formData.address, status: formData.status, balance: formData.balance,
        bloodType: formData.bloodType || null,
        nationalId: formData.nationalId || null,
        emergencyContact: formData.emergencyContact || null,
        emergencyPhone: formData.emergencyPhone || null,
        insuranceProvider: formData.insuranceProvider || null,
        insuranceNumber: formData.insuranceNumber || null,
        notes: formData.notes || null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
      };
      if (editingPatient) {
        await updatePatient.mutateAsync({ id: editingPatient, data: baseData });
        toast.success(t("patients.updated"));
        setDialogOpen(false);
        setEditingPatient(null);
        setFormData(emptyForm());
      } else {
        const created = await createPatient.mutateAsync({ ...baseData, lastVisit: null });
        toast.success(t("patients.created"));
        setDialogOpen(false);
        setEditingPatient(null);
        setFormData(emptyForm());
        navigate("/patients-workspace/" + created.id);
      }
    } catch {
      toast.error(editingPatient ? t("patients.update-failed") : t("patients.create-failed"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePatient.mutateAsync(deleteTarget);
      toast.success(t("patients.deleted"));
      setDeleteTarget(null);
    } catch {
      toast.error(t("patients.delete-failed"));
    }
  };

  const openCreate = () => {
    setEditingPatient(null);
    setFormData(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (patient: typeof patients[0]) => {
    setEditingPatient(patient.id);
    setFormData({
      name: patient.name, age: String(patient.age),
      gender: patient.gender, phone: patient.phone || "", email: patient.email || "",
      address: patient.address || "", status: patient.status, balance: patient.balance || "0.00",
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : "",
      bloodType: patient.bloodType || "",
      nationalId: patient.nationalId || "",
      emergencyContact: patient.emergencyContact || "",
      emergencyPhone: patient.emergencyPhone || "",
      insuranceProvider: patient.insuranceProvider || "",
      insuranceNumber: patient.insuranceNumber || "",
      notes: patient.notes || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingPatient(null);
    setFormData(emptyForm());
    setFieldErrors({});
  };

  const isPending = createPatient.isPending || updatePatient.isPending;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("patients.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("patients.subtitle")}</p>
          </div>
          <Button className="gap-2 shadow-sm" onClick={openCreate}>
            <UserPlus className="h-4 w-4" /> {t("patients.add")}
          </Button>
        </div>

        {/* Premium Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { icon: Users, label: "Total", value: patients.length.toString(), color: "from-primary/80 to-primary/40" },
            { icon: UserCheck, label: "Actifs", value: patients.filter(p => p.status === "Active").length.toString(), color: "from-emerald-500 to-emerald-400" },
            { icon: UserX, label: "Inactifs", value: patients.filter(p => p.status !== "Active").length.toString(), color: "from-slate-400 to-slate-300" },
            { icon: TrendingUp, label: "Solde total", value: `${patients.reduce((s, p) => s + parseFloat(p.balance || "0"), 0).toLocaleString()} DA`, color: "from-amber-500 to-amber-400" },
          ] as const).map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="card-hover border-border/40 shadow-sm overflow-hidden">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    <p className="text-sm sm:text-base font-bold text-foreground truncate">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0">
            <div className="p-5 pb-4 border-b border-border">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">
                  {editingPatient ? t("patients.edit") : t("patients.add")}
                </DialogTitle>
              </DialogHeader>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-foreground">{t("patients.full-name")} *</Label>
                  <Input id="name" required value={formData.name} onChange={(e) => handleFieldChange("name", e.target.value)} placeholder={t("patients.name-placeholder")} className={fieldErrors.name ? "border-destructive" : ""} />
                  {fieldErrors.name && <FieldError errors={[{ message: fieldErrors.name }]} />}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-xs font-semibold text-foreground">{t("patients.age")} *</Label>
                  <Input id="age" type="number" required value={formData.age} onChange={(e) => handleFieldChange("age", e.target.value)} placeholder={t("patients.age-placeholder")} className={fieldErrors.age ? "border-destructive" : ""} />
                  {fieldErrors.age && <FieldError errors={[{ message: fieldErrors.age }]} />}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-xs font-semibold text-foreground">{t("patients.gender")} *</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleFieldChange("gender", v)}>
                    <SelectTrigger id="gender" className={fieldErrors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder={t("patients.select-gender")} />
                    </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">{t("patients.male")}</SelectItem>
                    <SelectItem value="Female">{t("patients.female")}</SelectItem>
                  </SelectContent>
                  </Select>
                  {fieldErrors.gender && <FieldError errors={[{ message: fieldErrors.gender }]} />}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-foreground">{t("patients.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" value={formData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} placeholder={t("patients.phone-placeholder")} className={cn("ps-9", fieldErrors.phone && "border-destructive")} />
                </div>
                {fieldErrors.phone && <FieldError errors={[{ message: fieldErrors.phone }]} />}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">{t("patients.email")}</Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder={t("patients.email-placeholder")} className={cn("ps-9", fieldErrors.email && "border-destructive")} />
                </div>
                {fieldErrors.email && <FieldError errors={[{ message: fieldErrors.email }]} />}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold text-foreground">{t("patients.address")}</Label>
                <div className="relative">
                  <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder={t("patients.address-placeholder")} className="ps-9" />
                </div>
              </div>
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("patients.medical-info")}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dateOfBirth" className="text-xs font-semibold text-foreground">{t("patients.dob")}</Label>
                  <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bloodType" className="text-xs font-semibold text-foreground">{t("patients.blood-type")}</Label>
                  <Select value={formData.bloodType} onValueChange={(v) => handleFieldChange("bloodType", v)}>
                    <SelectTrigger id="bloodType"><SelectValue placeholder={t("patients.blood-type-placeholder")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nationalId" className="text-xs font-semibold text-foreground">{t("patients.national-id")}</Label>
                <Input id="nationalId" value={formData.nationalId} onChange={(e) => handleFieldChange("nationalId", e.target.value)} placeholder={t("patients.national-id-placeholder")} />
              </div>
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("patients.emergency-section")}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="emergencyContact" className="text-xs font-semibold text-foreground">{t("patients.emergency-contact")}</Label>
                  <Input id="emergencyContact" value={formData.emergencyContact} onChange={(e) => handleFieldChange("emergencyContact", e.target.value)} placeholder={t("patients.emergency-contact-placeholder")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="emergencyPhone" className="text-xs font-semibold text-foreground">{t("patients.emergency-phone")}</Label>
                  <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={(e) => handleFieldChange("emergencyPhone", e.target.value)} placeholder={t("patients.emergency-phone-placeholder")} />
                </div>
              </div>
              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("patients.insurance-section")}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="insuranceProvider" className="text-xs font-semibold text-foreground">{t("patients.insurance-provider")}</Label>
                  <Input id="insuranceProvider" value={formData.insuranceProvider} onChange={(e) => handleFieldChange("insuranceProvider", e.target.value)} placeholder={t("patients.insurance-provider-placeholder")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="insuranceNumber" className="text-xs font-semibold text-foreground">{t("patients.insurance-number")}</Label>
                  <Input id="insuranceNumber" value={formData.insuranceNumber} onChange={(e) => handleFieldChange("insuranceNumber", e.target.value)} placeholder={t("patients.insurance-number-placeholder")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold text-foreground">{t("patients.notes")}</Label>
                <textarea id="notes" value={formData.notes} onChange={(e) => handleFieldChange("notes", e.target.value)} placeholder={t("patients.notes-placeholder")} className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" rows={2} />
              </div>
              <DialogFooter className="gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 me-1" /> {t("patients.cancel")}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? t("patients.saving") : t("patients.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
          title={t("patients.delete-title")}
          description={t("patients.delete-desc-generic")}
          confirmLabel={t("patients.confirm-delete")}
          variant="destructive"
          loading={deletePatient.isPending}
          onConfirm={handleDelete}
        />

        <div className="bg-muted/30 p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("patients.search")}
                className="ps-9 bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5">
              {(["all", "Active", "Treatment", "Inactive"] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 px-3 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer",
                    statusFilter === status && status === "Active" && "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500",
                    statusFilter === status && status === "Treatment" && "bg-cyan-600 text-white hover:bg-cyan-700 border-sky-500",
                    statusFilter === status && status === "Inactive" && "bg-slate-500 text-white hover:bg-slate-600 border-slate-500",
                    statusFilter === status && status === "all" && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all" ? "Tous" : status === "Active" ? "Actifs" : status === "Treatment" ? "En traitement" : "Inactifs"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card card-hover rounded-xl border border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
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
                  <h3 className="text-base font-semibold text-foreground mb-1">{t("patients.failed-load")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error?.message || t("patients.failed-load-sub")}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>{t("patients.retry")}</Button>
                </CardContent>
              </Card>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-16 flex items-center justify-center">
              <EmptyState
                icon={searchQuery ? <Search className="h-8 w-8" /> : <UserPlus className="h-8 w-8" />}
                title={searchQuery ? t("patients.no-found") : t("patients.no-data")}
                description={searchQuery ? t("patients.no-found-sub") : t("patients.no-data-sub")}
                action={!searchQuery ? <Button size="sm" onClick={() => setDialogOpen(true)} className="cursor-pointer">{t("patients.add")}</Button> : undefined}
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border bg-muted/30">
                    <TableHead className="w-[90px] font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("patients.id")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("patients.name")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("patients.details")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("patients.last-visit")}</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("patients.status")}</TableHead>
                    <TableHead className="text-end font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("patients.balance")}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPatients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="group cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => navigate("/patients-workspace/" + patient.id)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">{patient.patientId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                            {patient.photoUrl && <AvatarImage src={patient.photoUrl} alt={patient.name} />}
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xs">
                              {getInitials(patient.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm text-foreground">{patient.name}</div>
                            <div className="text-xs text-muted-foreground">{patient.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {patient.age} {t("patients.years")} &middot; {patient.gender}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {patient.lastVisit ? format(new Date(patient.lastVisit), "MMM dd, yyyy") : <span className="text-muted-foreground/50">&mdash;</span>}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={patient.status} />
                      </TableCell>
                      <TableCell className={cn(
                        "text-end font-semibold text-sm",
                        patient.balance !== "0.00" ? "text-red-600" : "text-muted-foreground"
                      )}>
                        {patient.balance} DA
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" aria-label="View details">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => navigate("/patients-workspace/" + patient.id)}>
                              <Eye className="h-4 w-4 me-2" /> {t("common.view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/patients-workspace/" + patient.id)}>
                              <Eye className="h-4 w-4 me-2" /> Dossier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/patients-workspace/" + patient.id)}>
                              <Edit className="h-4 w-4 me-2" /> {t("patients.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => setDeleteTarget(patient.id)}
                            >
                              <Trash2 className="h-4 w-4 me-2" /> {t("patients.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  {t("patients.showing", { count: filteredPatients.length, total: patients.length })}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} aria-label="Page précédente">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button key={i} variant={i === page ? "outline" : "ghost"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(i)}>
                      {i + 1}
                    </Button>
                  ))}
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} aria-label="Page suivante">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
