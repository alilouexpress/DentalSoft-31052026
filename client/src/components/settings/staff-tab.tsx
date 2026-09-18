import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X, Camera, AlertCircle, RefreshCw, Users } from "lucide-react";
import { useCreateStaff, useUpdateStaff, useDeleteStaff, useUploadStaffAvatar } from "@/hooks/use-api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { StaffMember, InsertStaff } from "@shared/schema";

interface StaffSettingsTabProps {
  staff: StaffMember[];
  staffLoading: boolean;
  staffError: boolean;
  refetchStaff: () => void;
}

export default function StaffSettingsTab({ staff, staffLoading, staffError, refetchStaff }: StaffSettingsTabProps) {
  const { t } = useLanguage();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const uploadAvatar = useUploadStaffAvatar();
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [deleteStaffTarget, setDeleteStaffTarget] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({ name: "", role: "Assistant", email: "", phone: "", specialization: "", commissionPercentage: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const openNewStaff = () => {
    setEditingStaff(null);
    setStaffForm({ name: "", role: "Assistant", email: "", phone: "", specialization: "", commissionPercentage: "" });
    setAvatarFile(null);
    setStaffDialogOpen(true);
  };

  const openEditStaff = (s: StaffMember) => {
    setEditingStaff(s.id);
    setStaffForm({
      name: s.name, role: s.role, email: s.email || "", phone: s.phone || "",
      specialization: s.specialization || "", commissionPercentage: s.commissionPercentage || "",
    });
    setAvatarFile(null);
    setStaffDialogOpen(true);
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name) { toast.error(t("common.error")); return; }
    const data: InsertStaff = {
      name: staffForm.name,
      role: staffForm.role,
      email: staffForm.email || null,
      phone: staffForm.phone || null,
      specialization: staffForm.specialization || null,
      commissionPercentage: staffForm.commissionPercentage || null,
    };
    try {
      if (editingStaff) {
        await updateStaff.mutateAsync({ id: editingStaff, data });
        if (avatarFile) {
          await uploadAvatar.mutateAsync({ id: editingStaff, file: avatarFile });
        }
        toast.success(t("settings.staff-updated"));
      } else {
        const created = await createStaff.mutateAsync(data);
        if (avatarFile && created) {
          await uploadAvatar.mutateAsync({ id: created.id, file: avatarFile });
        }
        toast.success(t("settings.staff-created"));
      }
      setStaffDialogOpen(false);
    } catch { toast.error(t("common.error")); }
  };

  const handleDeleteStaff = async () => {
    if (!deleteStaffTarget) return;
    try {
      await deleteStaff.mutateAsync(deleteStaffTarget);
      toast.success(t("settings.staff-deleted"));
      setDeleteStaffTarget(null);
    } catch { toast.error(t("common.error")); }
  };

  return (
    <>
      {staffLoading ? (
        <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <Skeleton className="h-4 w-40" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-24 hidden md:block" />
                <Skeleton className="h-4 w-24 hidden md:block" />
                <Skeleton className="h-4 w-20 hidden lg:block" />
                <Skeleton className="h-4 w-16 hidden lg:block" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : staffError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>
            {t("common.error")}
            <br />
                <Button variant="outline" size="sm" onClick={() => refetchStaff()} className="mt-2">
                  <RefreshCw className="h-3 w-3 mr-1" /> {t("common.retry")}
                </Button>
              </AlertDescription>
            </Alert>
          ) : (<>
        <Card className="card-hover rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 pb-0 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t("settings.staff-count", { count: staff.length })}</p>
          <Button size="sm" className="gap-2 shadow-sm" onClick={openNewStaff}>
            <Plus className="h-4 w-4" /> {t("settings.add-staff")}
          </Button>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("settings.staff-member")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("settings.staff-role")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("settings.staff-email")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">{t("settings.staff-phone")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("settings.staff-specialty")}</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">{t("settings.staff-commission")}</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.filter(s => s.isActive).map(s => (
                <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                        <AvatarImage src={s.photoUrl || undefined} />
                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                          {s.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{s.name}</div>
                        {s.specialization && <div className="text-xs text-muted-foreground">{s.specialization}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{s.role}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{s.email || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{s.phone || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{s.specialization || "—"}</TableCell>
                  <TableCell className="text-sm hidden lg:table-cell">{s.commissionPercentage ? `${s.commissionPercentage}%` : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit staff" onClick={() => openEditStaff(s)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" aria-label="Delete staff" onClick={() => setDeleteStaffTarget(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {staff.filter(s => s.isActive).length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-16 text-muted-foreground"><div className="flex flex-col items-center gap-3"><Users className="h-10 w-10 text-muted-foreground/40" /><p>{t("settings.no-staff")}</p></div></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Staff Form Dialog */}
      <Dialog open={staffDialogOpen} onOpenChange={(o) => { if (!o) setStaffDialogOpen(false); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingStaff ? t("settings.edit-staff") : t("settings.add-staff")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <div className="flex items-center gap-4 pb-2">
              <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                {avatarFile ? (
                  <AvatarImage src={URL.createObjectURL(avatarFile)} />
                ) : editingStaff ? (
                  <AvatarImage src={staff.find(s => s.id === editingStaff)?.photoUrl || undefined} />
                ) : null}
                <AvatarFallback className="bg-muted">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("avatarInput")?.click()}>
                  <Camera className="h-4 w-4 mr-1" /> {t("settings.photo")}
                </Button>
                <input id="avatarInput" type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                <p className="text-xs text-muted-foreground mt-1">{t("settings.photo-hint")}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label>{t("settings.full-name")}</Label>
                <Input required value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} placeholder={t("settings.name-placeholder")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.role-label")}</Label>
                <Select value={staffForm.role} onValueChange={(v) => setStaffForm({ ...staffForm, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assistant">{t("settings.role-assistant")}</SelectItem>
                    <SelectItem value="Doctor">{t("settings.role-doctor")}</SelectItem>
                    <SelectItem value="Admin">{t("settings.role-admin")}</SelectItem>
                    <SelectItem value="Secrétaire">{t("settings.role-secretary")}</SelectItem>
                    <SelectItem value="Hygiéniste">{t("settings.role-hygienist")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.specialization")}</Label>
                <Input value={staffForm.specialization} onChange={(e) => setStaffForm({ ...staffForm, specialization: e.target.value })} placeholder={t("settings.specialization-placeholder")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.email")}</Label>
                <Input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} placeholder={t("settings.email-placeholder")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.phone")}</Label>
                <Input value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} placeholder={t("settings.phone-placeholder")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.commission")}</Label>
                <Input type="number" step="0.1" min="0" max="100" value={staffForm.commissionPercentage} onChange={(e) => setStaffForm({ ...staffForm, commissionPercentage: e.target.value })} placeholder={t("settings.commission-placeholder")} />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setStaffDialogOpen(false)}>
                <X className="h-4 w-4 mr-1" /> {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={createStaff.isPending || updateStaff.isPending}>
                {createStaff.isPending || updateStaff.isPending ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteStaffTarget}
        onOpenChange={(o) => { if (!o) setDeleteStaffTarget(null); }}
        title={t("settings.delete-staff-title")}
        description={t("settings.delete-staff-desc")}
        confirmLabel={t("common.delete")}
        variant="destructive"
        loading={deleteStaff.isPending}
        onConfirm={handleDeleteStaff}
      />
      </>)}
    </>
  );
}