import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumCard, PremiumCardContent } from "@/components/premium-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { useAuth } from "@/auth/auth-context";
import { toast } from "sonner";
import { Building2, Clock, Bell, Users, Plus, Edit, Trash2, X, Camera, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ThreeDIcon from "@/components/three-d-icon";
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff, useUploadStaffAvatar, useClinicSetting, useSetClinicSetting, useUsers, useCreateUser, useDeleteUser } from "@/hooks/use-api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { StaffMember, InsertStaff } from "@shared/schema";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

export default function Settings() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState("general");
  const { data: staff = [], isLoading: staffLoading, isError: staffError, refetch: refetchStaff } = useStaff();
  const { data: clinicName, isLoading: clinicNameLoading, isError: clinicNameError, refetch: refetchClinicName } = useClinicSetting("clinicName");
  const { data: clinicAddress } = useClinicSetting("clinicAddress");
  const { data: clinicPhone } = useClinicSetting("clinicPhone");
  const { data: clinicEmail } = useClinicSetting("clinicEmail");
  const { data: clinicDoctorName } = useClinicSetting("clinicDoctorName");
  const { data: clinicHours, isLoading: clinicHoursLoading, isError: clinicHoursError, refetch: refetchClinicHours } = useClinicSetting("clinicHours");
  const setSetting = useSetClinicSetting();
  const [hours, setHours] = useState<Record<string, { start: string; end: string; closed: boolean }>>({});
  const [notifications, setNotifications] = useState({ emailNotif: true, smsNotif: false, apptReminder: true, marketing: false });

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const uploadAvatar = useUploadStaffAvatar();
  const { data: users = [], isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [deleteStaffTarget, setDeleteStaffTarget] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({ name: "", role: "Assistant", email: "", phone: "", specialization: "", commissionPercentage: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState({ username: "", password: "", role: "assistant", staffId: "" });
  const [deleteUserTarget, setDeleteUserTarget] = useState<string | null>(null);

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username || !userForm.password) return;
    try {
      await createUser.mutateAsync({
        username: userForm.username,
        password: userForm.password,
        role: userForm.role,
        staffId: userForm.staffId || undefined,
      });
      toast.success(t("settings.users-added"));
      setUserDialogOpen(false);
      setUserForm({ username: "", password: "", role: "assistant", staffId: "" });
    } catch { toast.error(t("common.error")); }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return;
    try {
      await deleteUser.mutateAsync(deleteUserTarget);
      toast.success(t("settings.users-deleted"));
      setDeleteUserTarget(null);
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

  useEffect(() => {
    if (clinicHours?.value) {
      const h = clinicHours.value as Record<string, string | null>;
      setHours(Object.fromEntries(days.map(d => {
        const range = (h as any)[d];
        if (!range) return [d, { start: "09:00", end: "17:00", closed: true }];
        const [start, end] = (range as string).split("-");
        return [d, { start, end, closed: false }];
      })));
    }
  }, [clinicHours]);

  const handleSaveHours = async () => {
    const value: Record<string, string | null> = {};
    for (const d of days) {
      const h = hours[d];
      value[d] = h?.closed ? null : `${h.start}-${h.end}`;
    }
    await setSetting.mutateAsync({ key: "clinicHours", value });
    toast.success(t("settings.saved"));
  };

  const handleSaveGeneral = async () => {
    const nameInput = document.getElementById("clinicNameInput") as HTMLInputElement;
    const addressInput = document.getElementById("clinicAddressInput") as HTMLInputElement;
    const phoneInput = document.getElementById("clinicPhoneInput") as HTMLInputElement;
    const emailInput = document.getElementById("clinicEmailInput") as HTMLInputElement;
    const doctorInput = document.getElementById("clinicDoctorInput") as HTMLInputElement;
    if (nameInput?.value) await setSetting.mutateAsync({ key: "clinicName", value: nameInput.value });
    if (addressInput) await setSetting.mutateAsync({ key: "clinicAddress", value: addressInput.value });
    if (phoneInput) await setSetting.mutateAsync({ key: "clinicPhone", value: phoneInput.value });
    if (emailInput) await setSetting.mutateAsync({ key: "clinicEmail", value: emailInput.value });
    if (doctorInput) await setSetting.mutateAsync({ key: "clinicDoctorName", value: doctorInput.value });
    toast.success(t("settings.saved"));
  };

  const handleSaveNotifications = async () => {
    await setSetting.mutateAsync({ key: "notificationPreferences", value: notifications });
    toast.success(t("settings.saved"));
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("settings.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("settings.subtitle")}</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-5 gap-1 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="general" className="gap-2"><ThreeDIcon icon="setting" size={18} /> {t("settings.general")}</TabsTrigger>
            <TabsTrigger value="hours" className="gap-2"><ThreeDIcon icon="calender" size={18} /> {t("settings.hours")}</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2"><ThreeDIcon icon="bell" size={18} /> {t("settings.notifications")}</TabsTrigger>
            <TabsTrigger value="staff" className="gap-2"><ThreeDIcon icon="boy" size={18} /> {t("settings.staff")}</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><ThreeDIcon icon="lock" size={18} /> {t("settings.users")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            {clinicNameLoading ? (
              <PremiumCard variant="glow">
                <PremiumCardContent className="space-y-4">
                  <Skeleton className="h-4 w-40" />
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            ) : clinicNameError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("common.error")}</AlertTitle>
                <AlertDescription>
                  {t("common.error")}
                  <br />
                  <Button variant="outline" size="sm" onClick={() => refetchClinicName()} className="mt-2">
                    <RefreshCw className="h-3 w-3 mr-1" /> {t("common.retry")}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <PremiumCard variant="glow">
                <PremiumCardContent className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("settings.clinic-info")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>{t("settings.clinic-name")}</Label>
                      <Input id="clinicNameInput" defaultValue={typeof clinicName?.value === "string" ? clinicName.value : t("settings.clinic-default-name")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("settings.clinic-doctor-name")}</Label>
                      <Input id="clinicDoctorInput" defaultValue={typeof clinicDoctorName?.value === "string" ? clinicDoctorName.value : ""} placeholder="Dr. ..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("settings.clinic-address")}</Label>
                      <Input id="clinicAddressInput" defaultValue={typeof clinicAddress?.value === "string" ? clinicAddress.value : ""} placeholder="123 Rue ..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("settings.clinic-phone")}</Label>
                      <Input id="clinicPhoneInput" defaultValue={typeof clinicPhone?.value === "string" ? clinicPhone.value : ""} placeholder="+213 ..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("settings.clinic-email")}</Label>
                      <Input id="clinicEmailInput" defaultValue={typeof clinicEmail?.value === "string" ? clinicEmail.value : ""} placeholder="contact@..." />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveGeneral} className="shadow-sm">{t("settings.save")}</Button>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            )}
          </TabsContent>

          <TabsContent value="hours" className="mt-6">
            {clinicHoursLoading ? (
              <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-10" />
                      <Skeleton className="h-9 w-32" />
                      <span className="text-muted-foreground">—</span>
                      <Skeleton className="h-9 w-32" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : clinicHoursError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("common.error")}</AlertTitle>
                <AlertDescription>
                  {t("common.error")}
                  <br />
                  <Button variant="outline" size="sm" onClick={() => refetchClinicHours()} className="mt-2">
                    <RefreshCw className="h-3 w-3 mr-1" /> {t("common.retry")}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {days.map(day => {
                  const h = hours[day];
                  if (!h) return null;
                  return (
                    <div key={day} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                      <div className="w-28 font-medium text-sm">{t("settings." + day)}</div>
                      <Switch checked={!h.closed} onCheckedChange={(v) => setHours({ ...hours, [day]: { ...h, closed: !v } })} />
                      {h.closed ? (
                        <span className="text-sm text-muted-foreground italic">{t("settings.closed")}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input type="time" value={h.start} onChange={(e) => setHours({ ...hours, [day]: { ...h, start: e.target.value } })} className="w-32 h-9" />
                          <span className="text-muted-foreground">—</span>
                          <Input type="time" value={h.end} onChange={(e) => setHours({ ...hours, [day]: { ...h, end: e.target.value } })} className="w-32 h-9" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveHours} className="shadow-sm">{t("settings.save")}</Button>
                </div>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-4">
                {[
                  { key: "emailNotif", label: t("settings.email-notif") },
                  { key: "smsNotif", label: t("settings.sms-notif") },
                  { key: "apptReminder", label: t("settings.appt-reminder") },
                  { key: "marketing", label: t("settings.marketing") },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <span className="text-sm font-medium">{item.label}</span>
                    <Switch checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(v) => setNotifications({ ...notifications, [item.key]: v })} />
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveNotifications} disabled={setSetting.isPending} className="shadow-sm">{t("settings.save")}</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="mt-6">
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
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {usersLoading ? (
              <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <Skeleton className="h-4 w-40" />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32 hidden md:block" />
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : usersError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("common.error")}</AlertTitle>
                <AlertDescription>
                  {t("common.error")}
                  <br />
                      <Button variant="outline" size="sm" onClick={() => refetchUsers()} className="mt-2">
                        <RefreshCw className="h-3 w-3 mr-1" /> {t("common.retry")}
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (<>
              <Card className="card-hover rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-5 pb-0 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t("settings.users-count", { count: users.length })}</p>
                <Button size="sm" className="gap-2 shadow-sm" onClick={() => setUserDialogOpen(true)}>
                  <Plus className="h-4 w-4" /> {t("settings.users-add")}
                </Button>
              </div>
              <div className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("settings.users-username")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("settings.users-role")}</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("settings.users-staff")}</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-medium text-sm">{u.username}</TableCell>
                        <TableCell className="text-sm capitalize">{u.role}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {u.staffId ? staff.find(s => s.id === u.staffId)?.name || "—" : "—"}
                        </TableCell>
                        <TableCell>
                          {u.id !== currentUser?.id && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" aria-label="Delete user" onClick={() => setDeleteUserTarget(u.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center py-16 text-muted-foreground"><div className="flex flex-col items-center gap-3"><Users className="h-10 w-10 text-muted-foreground/40" /><p>{t("settings.users-no-data")}</p></div></TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Dialog open={userDialogOpen} onOpenChange={(o) => { if (!o) setUserDialogOpen(false); }}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>{t("settings.users-add")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>{t("settings.users-username")} *</Label>
                    <Input required value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} placeholder={t("settings.username-placeholder")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("settings.users-password")} *</Label>
                    <Input required type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder={t("settings.password-placeholder")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("settings.users-role")}</Label>
                    <Select value={userForm.role} onValueChange={(v) => setUserForm({ ...userForm, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t("settings.role-admin")}</SelectItem>
                        <SelectItem value="doctor">{t("settings.role-doctor")}</SelectItem>
                        <SelectItem value="assistant">{t("settings.role-assistant")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("settings.users-staff")}</Label>
                    <Select value={userForm.staffId} onValueChange={(v) => setUserForm({ ...userForm, staffId: v })}>
                      <SelectTrigger><SelectValue placeholder={t("settings.users-select-staff")} /></SelectTrigger>
                      <SelectContent>
                        {staff.filter(s => s.isActive).map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="gap-2 pt-2 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setUserDialogOpen(false)}>
                      <X className="h-4 w-4 mr-1" /> {t("common.cancel")}
                    </Button>
                    <Button type="submit" disabled={createUser.isPending}>{createUser.isPending ? t("settings.creating") : t("settings.create")}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <ConfirmDialog
              open={!!deleteUserTarget}
              onOpenChange={(o) => { if (!o) setDeleteUserTarget(null); }}
              title={t("settings.delete-user-title")}
              description={t("settings.delete-user-desc")}
              confirmLabel={t("common.delete")}
              variant="destructive"
              loading={deleteUser.isPending}
              onConfirm={handleDeleteUser}
            />
            </>)}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
