import Layout from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Circle, CircleCheck, CircleDot, MoreHorizontal, Trash2, AlertCircle, ClipboardList } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTasks, useCreateTask, useDeleteTask, useUpdateTask, useStaff } from "@/hooks/use-api";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

export default function Tasks() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: tasks = [], isLoading, isError, error, refetch } = useTasks();
  const { data: staff = [] } = useStaff();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [form, setForm] = useState({ title: "", assigneeId: "", priority: "Medium", dueDate: "", description: "" });

  const filtered = tasks.filter(t => tab === "all" || t.status === tab);

  const tabs = [
    { key: "all", label: t("tasks.all") },
    { key: "Pending", label: t("tasks.pending") },
    { key: "In Progress", label: t("tasks.in-progress") },
    { key: "Completed", label: t("tasks.completed") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error(t("tasks.title-required")); return; }
    try {
      await createTask.mutateAsync({
        title: form.title,
        assigneeId: form.assigneeId || null,
        priority: form.priority,
        dueDate: form.dueDate ? new Date(form.dueDate) : null,
        description: form.description || null,
        status: "Pending",
      });
      toast.success(t("tasks.created"));
      setDialogOpen(false);
      setForm({ title: "", assigneeId: "", priority: "Medium", dueDate: "", description: "" });
    } catch { toast.error(t("common.error")); }
  };

  const handleDelete = (id: string) => {
    deleteTask.mutate(id, { onSuccess: () => toast.success(t("tasks.deleted")) });
  };

  const handleStatusToggle = (task: typeof tasks[0]) => {
    const nextStatus = task.status === "Pending" ? "In Progress" : task.status === "In Progress" ? "Completed" : "Pending";
    updateTask.mutate({ id: task.id, data: { status: nextStatus } });
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("tasks.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("tasks.subtitle")}</p>
          </div>
          <Button className="gap-2 shadow-sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> {t("tasks.new-task")}
          </Button>
        </div>

        <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
          {tabs.map(tabItem => (
            <Button variant="ghost" key={tabItem.key} onClick={() => setTab(tabItem.key)}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer",
                tab === tabItem.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {tabItem.label}
              <span className="ms-1.5 text-xs text-muted-foreground">
                ({tab === tabItem.key ? filtered.length : (tabItem.key === "all" ? tasks.length : tasks.filter(t => t.status === tabItem.key).length)})
              </span>
            </Button>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) setDialogOpen(false); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>{t("tasks.create-title")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("tasks.title-field")}</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t("tasks.assignee")}</Label>
                  <Select value={form.assigneeId} onValueChange={(v) => setForm({ ...form, assigneeId: v })}>
                    <SelectTrigger><SelectValue placeholder={t("tasks.assignee-placeholder")} /></SelectTrigger>
                    <SelectContent>
                      {staff.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("tasks.priority")}</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">{t("tasks.low")}</SelectItem>
                      <SelectItem value="Medium">{t("tasks.medium")}</SelectItem>
                      <SelectItem value="High">{t("tasks.high")}</SelectItem>
                      <SelectItem value="Urgent">{t("tasks.urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("tasks.due-date")}</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("tasks.description")}</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("tasks.cancel")}</Button>
                <Button type="submit" disabled={createTask.isPending}>{createTask.isPending ? t("tasks.saving") : t("tasks.save")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
                <TableRow className="bg-muted/30 border-b border-border">
                  <TableHead className="w-8"></TableHead>
                  {[t("tasks.task"), t("tasks.assignee"), t("tasks.priority"), t("tasks.due-date"), t("tasks.status")].map(h => (
                    <TableHead key={h} className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{h}</TableHead>
                  ))}
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(task => (
                  <TableRow key={task.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => handleStatusToggle(task)} aria-label="Toggle task status">
                        {task.status === "Completed" ? <CircleCheck className="h-4 w-4" /> : task.status === "In Progress" ? <CircleDot className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{task.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{task.assigneeName || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={task.priority} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-red-600 gap-2" onClick={() => handleDelete(task.id)}>
                            <Trash2 className="h-4 w-4" /> {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-12">
                    <EmptyState
                      icon={<ClipboardList className="h-10 w-10" />}
                      title={t("tasks.no-tasks")}
                      description="Aucune tâche trouvée"
                    />
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
}
