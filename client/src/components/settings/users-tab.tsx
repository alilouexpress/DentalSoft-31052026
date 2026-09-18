import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { useAuth } from "@/auth/auth-context";
import { toast } from "sonner";
import { Plus, Trash2, X, AlertCircle, RefreshCw, Users } from "lucide-react";
import { useCreateUser, useDeleteUser } from "@/hooks/use-api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { User, StaffMember } from "@shared/schema";

interface UsersSettingsTabProps {
  users: User[];
  usersLoading: boolean;
  usersError: boolean;
  refetchUsers: () => void;
  staff: StaffMember[];
}

export default function UsersSettingsTab({ users, usersLoading, usersError, refetchUsers, staff }: UsersSettingsTabProps) {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState({ username: "", password: "", role: "assistant", staffId: "" });
  const [deleteUserTarget, setDeleteUserTarget] = useState<string | null>(null);

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

  return (
    <>
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
    </>
  );
}