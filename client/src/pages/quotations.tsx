import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useQuotations, useDeleteQuotation } from "@/hooks/use-api";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import QuotationFormDialog from "@/components/quotations/quotation-form-dialog";
import QuotationItemsDialog from "@/components/quotations/quotation-items-dialog";
import QuotationFilters from "@/components/quotations/quotation-filters";
import QuotationList from "@/components/quotations/quotation-list";

export default function Quotations() {
  const { t } = useLanguage();
  const { data: quotations = [], isLoading, isError, refetch } = useQuotations();
  const deleteQuotation = useDeleteQuotation();

  // ── Filters & Search ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Dialogs ──
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [currentQuotationId, setCurrentQuotationId] = useState<string | null>(null);

  // ── Delete Confirmation ──
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null);

  const filtered = quotations.filter((q) => {
    const mSearch = (q.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
      q.quoteNumber.toLowerCase().includes(search.toLowerCase());
    const mStatus = statusFilter === "all" || q.status === statusFilter;
    return mSearch && mStatus;
  });

  // ── Dialog handlers ──
  const openCreateDialog = () => setDialogOpen(true);

  const onQuotationCreated = (id: string) => {
    setDialogOpen(false);
    setCurrentQuotationId(id);
    setItemsDialogOpen(true);
  };

  const closeItemsDialog = () => {
    setItemsDialogOpen(false);
    setCurrentQuotationId(null);
  };

  const confirmDelete = (id: string) => {
    setQuotationToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!quotationToDelete) return;
    try {
      await deleteQuotation.mutateAsync(quotationToDelete);
      toast.success(t("common.deleted") || "Supprimé");
      setDeleteConfirmOpen(false);
      setQuotationToDelete(null);
    } catch { toast.error(t("common.error")); }
  };

  // ── Render ──
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* ── Header ── */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("quotations.title")}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{t("quotations.subtitle") || "Gérer les devis et estimations."}</p>
          </div>
          <Button className="gap-2 shadow-sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> {t("quotations.add")}
          </Button>
        </div>

        {isLoading ? (
          <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
            <CardContent className="flex items-center justify-center py-12">
              <Spinner className="h-6 w-6" />
            </CardContent>
          </Card>
        ) : isError ? (
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
        ) : (<>
          {/* ── Filters ── */}
          <QuotationFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {/* ── Quotation List ── */}
          <QuotationList
            quotations={filtered}
            onEdit={(id) => { setCurrentQuotationId(id); setItemsDialogOpen(true); }}
            onDelete={confirmDelete}
          />
        </>)}
      </div>

      {/* ── Create Quotation Dialog ── */}
      <QuotationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={onQuotationCreated}
      />

      {/* ── Items Dialog ── */}
      <QuotationItemsDialog
        open={itemsDialogOpen}
        quotationId={currentQuotationId}
        onOpenChange={(o) => { if (!o) closeItemsDialog(); }}
      />

      {/* ── Delete Confirmation ── */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("common.delete")}
        description={t("quotations.deleteConfirm") || "Êtes-vous sûr de vouloir supprimer ce devis ?"}
        confirmLabel={t("common.delete")}
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteQuotation.isPending}
      />
    </Layout>
  );
}