import { useRoute, Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/empty-state";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import {
  useMedicalHistory,
  useMedicalSummary,
  useCreateMedicalHistory,
  useUpdateMedicalHistory,
  useDeleteMedicalHistory,
  useBatchCreateMedicalHistory,
  usePatient,
} from "@/hooks/use-api";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  FlaskConical,
  AlertTriangle,
  Stethoscope,
  Pill,
  HeartPulse,
  Baby,
  Ban,
  ClipboardList,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const CATEGORIES = ["allergies", "diabetes", "hypertension", "pregnancy", "medications", "contraindications", "other"] as const;

type Severity = "critical" | "moderate" | "minor" | "none";

const SEVERITY_OPTIONS: { value: Severity; labelKey: string }[] = [
  { value: "critical", labelKey: "medicalHistory.critical" },
  { value: "moderate", labelKey: "medicalHistory.moderate" },
  { value: "minor", labelKey: "medicalHistory.minor" },
  { value: "none", labelKey: "medicalHistory.none" },
];

const severityColor: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  minor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  none: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

const severityDot: Record<string, string> = {
  critical: "bg-red-500",
  moderate: "bg-yellow-500",
  minor: "bg-green-500",
  none: "bg-slate-400",
};

const categoryIcons: Record<string, typeof FlaskConical> = {
  allergies: FlaskConical,
  diabetes: AlertTriangle,
  hypertension: HeartPulse,
  pregnancy: Baby,
  medications: Pill,
  contraindications: Ban,
  other: ClipboardList,
};

interface FormState {
  category: string;
  value: string;
  severity: Severity;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  notes: string;
}

const emptyForm: FormState = {
  category: "allergies",
  value: "",
  severity: "none",
  startDate: "",
  endDate: "",
  isCurrent: true,
  notes: "",
};

const QUICK_CONDITIONS: Record<string, string[]> = {
  allergies: ["Pénicilline", "Latex", "Arachides", "Iode", "Aspirine", "Sulfamides", "Anesthésiques locaux"],
  diabetes: ["Type 1", "Type 2", "Gestationnel", "Pré-diabète"],
  hypertension: ["Essentielle", "Secondaire", "Maligne"],
  pregnancy: ["Enceinte", "Allaitement", "Post-partum"],
  medications: ["Anticoagulants", "Antihypertenseurs", "Insuline", "Corticostéroïdes", "Bisphosphonates"],
  contraindications: ["Allergie à l'anesthésie", "Hémophilie", "Endocardite", "Radiothérapie"],
  other: [],
};

export default function MedicalHistory() {
  const [, params] = useRoute<{ patientId: string }>("/medical-history/:patientId");
  const patientId = params?.patientId || "";
  const { t, dir } = useLanguage();
  const [, navigate] = useLocation();

  const { data: patient } = usePatient(patientId);
  const { data: records = [], isLoading, isError, refetch } = useMedicalHistory(patientId);
  const { data: summary = [] } = useMedicalSummary(patientId);

  const createMedicalHistory = useCreateMedicalHistory();
  const updateMedicalHistory = useUpdateMedicalHistory();
  const deleteMedicalHistory = useDeleteMedicalHistory();
  const batchCreate = useBatchCreateMedicalHistory();

  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [batchCategory, setBatchCategory] = useState("allergies");
  const [batchSelections, setBatchSelections] = useState<Set<string>>(new Set());

  const filtered = activeTab === "all" ? records : records.filter((r) => r.category === activeTab);

  useEffect(() => {
    if (!dialogOpen) {
      setEditingId(null);
      setForm(emptyForm);
    }
  }, [dialogOpen]);

  const openEdit = (record: typeof records[0]) => {
    setEditingId(record.id);
    setForm({
      category: record.category,
      value: record.value,
      severity: (record.severity as Severity) || "none",
      startDate: record.startDate ? new Date(record.startDate).toISOString().slice(0, 10) : "",
      endDate: record.endDate ? new Date(record.endDate).toISOString().slice(0, 10) : "",
      isCurrent: record.isCurrent,
      notes: record.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.value.trim()) {
      toast.error(t("medicalHistory.value-required"));
      return;
    }
    setSaving(true);
    try {
      const basePayload = {
        category: form.category,
        value: form.value.trim(),
        severity: form.severity === "none" ? null : form.severity,
        startDate: form.startDate ? new Date(form.startDate) : null,
        endDate: form.endDate ? new Date(form.endDate) : null,
        notes: form.notes.trim() || null,
        isCurrent: form.isCurrent,
      };

      if (editingId) {
        await updateMedicalHistory.mutateAsync({ id: editingId, data: basePayload });
        toast.success(t("common.saved"));
      } else {
        await createMedicalHistory.mutateAsync({ patientId, data: { ...basePayload, patientId } });
        toast.success(t("medicalHistory.created"));
      }
      setDialogOpen(false);
    } catch {
      toast.error(t("common.error"));
    }
    setSaving(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteMedicalHistory.mutateAsync(deleteTargetId);
      toast.success(t("common.deleted"));
    } catch {
      toast.error(t("common.error"));
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const toggleBatchSelection = (value: string) => {
    setBatchSelections((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const handleBatchSave = async () => {
    if (batchSelections.size === 0) {
      toast.error(t("medicalHistory.select-conditions"));
      return;
    }
    setSaving(true);
    try {
      const records = Array.from(batchSelections).map((value) => ({
        patientId,
        category: batchCategory,
        value,
        severity: null,
        startDate: null as Date | null,
        endDate: null as Date | null,
        notes: null,
        isCurrent: true,
      }));
      await batchCreate.mutateAsync({ patientId, records });
      toast.success(t("medicalHistory.batch-created"));
      setBatchDialogOpen(false);
      setBatchSelections(new Set());
    } catch {
      toast.error(t("common.error"));
    }
    setSaving(false);
  };

  const formatDate = (dateVal: Date | string | null | undefined) => {
    if (!dateVal) return "—";
    return new Date(dateVal).toLocaleDateString();
  };

  const severityBadge = (severity: string | null | undefined) => {
    const s = severity || "none";
    const key = s in severityColor ? s : "none";
    return (
      <Badge variant="outline" className={severityColor[key]}>
        <span className={`h-1.5 w-1.5 rounded-full me-1.5 ${severityDot[key]}`} />
        {t(`medicalHistory.${key}`)}
      </Badge>
    );
  };

  const categoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      allergies: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      diabetes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      hypertension: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      pregnancy: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800",
      medications: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      contraindications: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      other: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    };
    const Icon = categoryIcons[category] || ClipboardList;
    return (
      <Badge variant="outline" className={colors[category] || colors.other}>
        <Icon className="h-3 w-3 me-1" />
        {t(`medicalHistory.${category}`)}
      </Badge>
    );
  };

  const rtl = dir === "rtl";

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex flex-col gap-6 p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>
              {t("common.error")}
              <br />
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                <RefreshCw className="h-3 w-3 mr-1" /> {t("common.retry")}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/patients">
                <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Filtrer">
                 <ArrowLeft className="h-4 w-4" />
               </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {t("medicalHistory.title")}
                </h1>
                {patient && (
                  <span className="text-lg text-muted-foreground font-normal">
                    — {patient.name}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{t("medicalHistory.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1.5 h-9" onClick={() => { setBatchCategory("allergies"); setBatchDialogOpen(true); setBatchSelections(new Set()); }}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("medicalHistory.batch")}</span>
            </Button>
            <Button className="gap-1.5 h-9" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("medicalHistory.add")}</span>
            </Button>
          </div>
        </div>

        {summary.length > 0 && (
          <Card className="card-hover">
            <CardHeader className="pb-3 px-5 pt-5 cursor-pointer select-none" onClick={() => setSummaryExpanded(!summaryExpanded)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  {t("medicalHistory.summary")}
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Effacer la recherche">
                  {summaryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {summaryExpanded && (
              <CardContent className="px-5 pb-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {summary.map((group) => (
                    <div key={group.category} className="p-3.5 rounded-xl border bg-card/50">
                      <div className="flex items-center gap-2 mb-2">
                        {categoryBadge(group.category)}
                      </div>
                      <div className="space-y-1.5">
                        {group.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${severityDot[item.severity || "none"]}`} />
                            <span className="text-foreground">{item.value}</span>
                            {item.isCurrent && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-[10px] px-1.5 py-0">
                                {t("medicalHistory.current")}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <Card className="card-hover">
          <CardHeader className="pb-0 px-5 pt-5">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{t("medicalHistory.list")}</CardTitle>
              </div>
              <TabsList className="mt-3 flex-wrap h-auto">
                <TabsTrigger value="all" className="text-xs">{t("common.all")}</TabsTrigger>
                {CATEGORIES.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="text-xs">
                    {t(`medicalHistory.${cat}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-4">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">{t("medicalHistory.category")}</TableHead>
                    <TableHead>{t("medicalHistory.value")}</TableHead>
                    <TableHead className="w-[110px]">{t("medicalHistory.severity")}</TableHead>
                    <TableHead className="w-[100px]">{t("medicalHistory.startDate")}</TableHead>
                    <TableHead className="w-[100px]">{t("medicalHistory.endDate")}</TableHead>
                    <TableHead className="w-[80px]">{t("medicalHistory.current")}</TableHead>
                    <TableHead className="w-[90px] text-end">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12">
                        <EmptyState
                          icon={<ClipboardList className="h-10 w-10" />}
                          title={t("common.no-items")}
                          description="Aucun historique médical trouvé"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{categoryBadge(record.category)}</TableCell>
                        <TableCell className="font-medium">{record.value}</TableCell>
                        <TableCell>{severityBadge(record.severity)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{formatDate(record.startDate)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{formatDate(record.endDate)}</TableCell>
                        <TableCell>
                          {record.isCurrent ? (
                            <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100">
                              {t("common.yes")}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {t("common.no")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(record)} aria-label="Modifier l'enregistrement">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive transition-colors duration-200" onClick={() => confirmDelete(record.id)} aria-label="Supprimer l'enregistrement">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) setDialogOpen(false); }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingId ? t("common.edit") : t("medicalHistory.add")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("medicalHistory.category")}</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("medicalHistory.category")} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`medicalHistory.${cat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("medicalHistory.value")}</Label>
              <Input
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={t("medicalHistory.value-placeholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("medicalHistory.severity")}</Label>
              <Select value={form.severity} onValueChange={(v: Severity) => setForm((f) => ({ ...f, severity: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("medicalHistory.severity")} />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${severityDot[opt.value]}`} />
                        {t(opt.labelKey)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("medicalHistory.startDate")}</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("medicalHistory.endDate")}</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isCurrent}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isCurrent: v }))}
                id="is-current"
              />
              <Label htmlFor="is-current" className="cursor-pointer">{t("medicalHistory.current")}</Label>
            </div>
            <div className="space-y-1.5">
              <Label>{t("medicalHistory.notes")}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder={t("medicalHistory.notes-placeholder")}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
                {t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t("common.confirm-delete")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("common.confirm-delete-prompt")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={batchDialogOpen} onOpenChange={(o) => { if (!o) { setBatchDialogOpen(false); setBatchSelections(new Set()); } }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("medicalHistory.batch")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("medicalHistory.category")}</Label>
              <Select value={batchCategory} onValueChange={(v) => { setBatchCategory(v); setBatchSelections(new Set()); }}>
                <SelectTrigger>
                  <SelectValue placeholder={t("medicalHistory.category")} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`medicalHistory.${cat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("medicalHistory.quick-conditions")}</Label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                {QUICK_CONDITIONS[batchCategory]?.length ? (
                  QUICK_CONDITIONS[batchCategory].map((condition) => {
                    const selected = batchSelections.has(condition);
                    return (
                      <div
                        key={condition}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                          selected
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                        onClick={() => toggleBatchSelection(condition)}
                      >
                        <div
                          className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all ${
                            selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                          }`}
                        >
                          {selected && (
                            <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="flex-1">{condition}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground col-span-2 py-4 text-center">
                    {t("common.no-items")}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBatchDialogOpen(false); setBatchSelections(new Set()); }}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleBatchSave} disabled={saving || batchSelections.size === 0}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : null}
              {t("common.save")} ({batchSelections.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
