import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, MoreHorizontal, AlertCircle, Trash2, Eye, Pencil, ChevronLeft, ChevronRight, Users, UserCheck, UserX, TrendingUp, UserPlus } from "lucide-react";
import { usePatients, useDeletePatient } from "@/hooks/use-api";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { PatientFormDialog } from "@/components/patient-form-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

export default function Patients() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { data: patients = [], isLoading, isError, error, refetch } = usePatients();
  const deletePatient = useDeletePatient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
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

  const editingPatient = editingId ? patients.find(p => p.id === editingId) ?? null : null;

  const openCreate = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (patient: typeof patients[0]) => {
    setEditingId(patient.id);
    setDialogOpen(true);
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

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("patients.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("patients.subtitle")}</p>
          </div>
          <Button className="gap-2 shadow-sm cursor-pointer" onClick={openCreate}>
            <UserPlus className="h-4 w-4" /> {t("patients.add")}
          </Button>
        </div>

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

        <PatientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} patient={editingPatient} />

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

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border-b border-border bg-muted/20">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("patients.search")}
                className="ps-9 bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5 sm:ms-auto flex-wrap">
              {(["all", "Active", "Treatment", "Inactive"] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 px-3 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer",
                    statusFilter === status && status === "Active" && "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500",
                    statusFilter === status && status === "Treatment" && "bg-sky-600 text-white hover:bg-sky-700 border-sky-500",
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
            <div className="p-12 text-center">
              <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">{t("patients.failed-load")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{error?.message || t("patients.failed-load-sub")}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>{t("patients.retry")}</Button>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-16 flex items-center justify-center">
              <EmptyState
                icon={<Search className="h-8 w-8" />}
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
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" aria-label="Actions patient">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => navigate("/patients-workspace/" + patient.id)} className="cursor-pointer">
                              <Eye className="h-4 w-4 me-2" /> {t("common.view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(patient)} className="cursor-pointer">
                              <Pencil className="h-4 w-4 me-2" /> {t("patients.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} aria-label="Page précédente">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button key={i} variant={i === page ? "outline" : "ghost"} size="icon" className="h-8 w-8 text-xs cursor-pointer" onClick={() => setPage(i)}>
                      {i + 1}
                    </Button>
                  ))}
                  <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} aria-label="Page suivante">
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
