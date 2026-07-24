import { useRoute, useLocation } from "wouter";
import Layout from "@/components/layout";
import { useLanguage } from "@/i18n/language-context";
import { useAuth } from "@/auth/auth-context";
import { usePatient, usePatientDocuments, useUploadPatientDocument, useDeletePatientDocument } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import {
  ArrowLeft, Upload, ImageIcon, Scan, FileText, FileImage, FileCheck, File,
  X, Download, Trash2, Loader2, Eye, AlertCircle, RefreshCw
} from "lucide-react";
import { format } from "date-fns";

const DOCUMENT_TYPES = ["photo", "xray", "pdf", "scan", "consent", "other"] as const;

const categoryConfig: Record<string, { labelKey: string; icon: any; isImage: boolean }> = {
  photo: { labelKey: "documents.photos", icon: ImageIcon, isImage: true },
  xray: { labelKey: "documents.xrays", icon: Scan, isImage: true },
  pdf: { labelKey: "documents.pdfs", icon: FileText, isImage: false },
  scan: { labelKey: "documents.scans", icon: FileImage, isImage: true },
  consent: { labelKey: "documents.consents", icon: FileCheck, isImage: false },
  other: { labelKey: "documents.other", icon: File, isImage: false },
};

const typeIconMap: Record<string, any> = {
  photo: ImageIcon,
  xray: Scan,
  pdf: FileText,
  scan: FileImage,
  consent: FileCheck,
  other: File,
};

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Documents() {
  const [, params] = useRoute<{ patientId: string }>("/documents/:patientId");
  const [, navigate] = useLocation();
  const { t, dir } = useLanguage();
  const { user } = useAuth();
  const patientId = params?.patientId || "";

  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const { data: documents = [], isLoading: docsLoading, isError: docsError, refetch: refetchDocs } = usePatientDocuments(patientId);
  const uploadMutation = useUploadPatientDocument();
  const deleteMutation = useDeletePatientDocument();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [uploadForm, setUploadForm] = useState({ name: "", type: "photo", category: "", notes: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error(t("common.select-file") || "Veuillez sélectionner un fichier"); return; }
    try {
      await uploadMutation.mutateAsync({
        patientId,
        file,
        name: uploadForm.name || file.name,
        type: uploadForm.type,
        category: uploadForm.category || undefined,
        notes: uploadForm.notes || undefined,
      });
      toast.success(t("common.saved") || "Document téléchargé");
      setUploadOpen(false);
      setUploadForm({ name: "", type: "photo", category: "", notes: "" });
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      toast.error(t("common.error") || "Échec du téléchargement");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(t("common.deleted") || "Document supprimé");
      setDeleteTarget(null);
    } catch {
      toast.error(t("common.error") || "Échec de la suppression");
    }
  };

  const grouped = DOCUMENT_TYPES.reduce((acc, type) => {
    acc[type] = documents.filter(d => d.type === type);
    return acc;
  }, {} as Record<string, typeof documents>);

  const nonEmptyTypes = DOCUMENT_TYPES.filter(t => (grouped[t]?.length ?? 0) > 0);

  const rtl = dir === "rtl";

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patients")} className="h-9 w-9" aria-label="Retour aux patients">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("documents.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {patientLoading ? <Skeleton className="h-4 w-32 inline-block" /> : patient?.name || t("common.unknown")}
            </p>
          </div>
        </div>
        <Button onClick={() => setUploadOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          {t("documents.upload")}
        </Button>
      </div>

      {docsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : docsError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>
            {t("common.error")}
            <br />
            <Button variant="outline" size="sm" onClick={() => refetchDocs()} className="mt-2">
              <RefreshCw className="h-3 w-3 mr-1" /> {t("common.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<File className="h-8 w-8" />}
          title={t("documents.title")}
          description={t("documents.no-documents") || "Aucun document trouvé pour ce patient."}
          action={<Button size="sm" onClick={() => setUploadOpen(true)} className="cursor-pointer">{t("documents.upload")}</Button>}
        />
      ) : (
        <div className="space-y-8">
          {/* Category overview cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DOCUMENT_TYPES.map((type) => {
              const docs = grouped[type] || [];
              const config = categoryConfig[type];
              const Icon = config.icon;
              return (
                <Card key={type} className={cn(
                  "card-hover cursor-pointer transition-all",
                  docs.length === 0 && "opacity-40"
                )}>
                  <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t(config.labelKey)}</p>
                      <p className="text-2xl font-bold text-primary">{docs.length}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Document sections */}
          {nonEmptyTypes.map((type) => {
            const docs = grouped[type];
            const config = categoryConfig[type];
            const Icon = config.icon;
            const isImage = config.isImage;

            return (
              <section key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">{t(config.labelKey)}</h2>
                  <Badge variant="secondary" className={cn(rtl ? "mr-2" : "ml-2")}>{docs.length}</Badge>
                </div>
                {isImage ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {docs.map((doc) => (
                      <Card key={doc.id} className="group overflow-hidden card-hover">
                        <div className="relative aspect-[4/3] bg-muted cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                          <img
                            src={doc.filePath}
                            alt={doc.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-7 w-7 rounded-full glass"
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc); }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(doc.createdAt), "dd/MM/yyyy")}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {docs.map((doc) => {
                      const DocIcon = typeIconMap[doc.type] || File;
                      return (
                        <Card key={doc.id} className="card-hover">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <DocIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{doc.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{format(new Date(doc.createdAt), "dd/MM/yyyy")}</span>
                                <span>·</span>
                                <span>{formatFileSize(doc.fileSize)}</span>
                                <Badge variant="outline" className="text-[10px] h-4 px-1">{doc.type}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild aria-label="Voir le document">
                                <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => setDeleteTarget(doc)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("documents.upload")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Fichier</Label>
              <Input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label>{t("documents.name")}</Label>
              <Input
                value={uploadForm.name}
                onChange={e => setUploadForm(p => ({ ...p, name: e.target.value }))}
                placeholder={t("documents.name") + "..."}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("documents.type")}</Label>
              <Select value={uploadForm.type} onValueChange={v => setUploadForm(p => ({ ...p, type: v }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(dt => (
                    <SelectItem key={dt} value={dt}>{t(categoryConfig[dt].labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("documents.category")}</Label>
              <Input
                value={uploadForm.category}
                onChange={e => setUploadForm(p => ({ ...p, category: e.target.value }))}
                placeholder={t("documents.category") + "..."}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={uploadForm.notes}
                onChange={e => setUploadForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)} className="h-9">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleUpload} disabled={uploadMutation.isPending} className="h-9 gap-2">
              {uploadMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("documents.upload")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(o) => { if (!o) setPreviewDoc(null); }}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden border-0">
          {previewDoc && (
            <div className="relative bg-black/5">
              <div className={cn(
                "absolute top-3 z-10 flex gap-2",
                rtl ? "left-3" : "right-3"
              )}>
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full glass-strong shadow-lg" asChild>
                  <a href={previewDoc.filePath} target="_blank" rel="noopener noreferrer" title={t("documents.download")}>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full glass-strong shadow-lg" onClick={() => setPreviewDoc(null)} aria-label="Fermer l'aperçu">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center p-2">
                <img
                  src={previewDoc.filePath}
                  alt={previewDoc.name}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                {previewDoc.name}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title={t("documents.delete")}
        description={`${t("documents.delete")} "${deleteTarget?.name || ""}" ?`}
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </Layout>
  );
}
