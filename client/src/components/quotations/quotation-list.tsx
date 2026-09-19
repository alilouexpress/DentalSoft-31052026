import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import { useApproveQuotation, useConvertQuotationToInvoice } from "@/hooks/use-api";
import { FileText, CheckCircle, ArrowRightFromLine, Trash2, Eye } from "lucide-react";
import type { Quotation } from "@shared/schema";

type QuotationRow = Quotation & { patientName?: string; doctorName?: string };

interface QuotationListProps {
  quotations: QuotationRow[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function QuotationList({ quotations, onEdit, onDelete }: QuotationListProps) {
  const { t } = useLanguage();
  const approveQuotation = useApproveQuotation();
  const convertQuotation = useConvertQuotationToInvoice();

  const handleApprove = async (id: string) => {
    try {
      await approveQuotation.mutateAsync(id);
      toast.success(t("quotations.approved") || "Devis approuvé");
    } catch { toast.error(t("common.error")); }
  };

  const handleConvert = async (id: string) => {
    try {
      await convertQuotation.mutateAsync(id);
      toast.success(t("quotations.converted") || "Devis converti en facture");
    } catch { toast.error(t("common.error")); }
  };

  const handleViewPdf = (id: string) => {
    const token = localStorage.getItem("dentalsoft-token");
    const url = `/api/pdf/quotation/${id}${token ? `?token=${token}` : ""}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden card-hover">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 border-b border-border">
            {[t("quotations.number"), t("quotations.patient"), t("quotations.doctor"), t("quotations.amount"), t("quotations.discount"), t("quotations.tax"), t("quotations.final"), t("quotations.status"), t("common.date"), t("common.actions")].map((h) => (
              <TableHead key={h} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((q) => (
            <TableRow key={q.id} className="hover:bg-muted/40 transition-colors">
              <TableCell className="font-mono text-xs text-muted-foreground">{q.quoteNumber}</TableCell>
              <TableCell className="font-medium text-sm">{q.patientName || "—"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{q.doctorName || "—"}</TableCell>
              <TableCell className="text-sm font-semibold">{parseFloat(q.totalAmount).toLocaleString()} DA</TableCell>
              <TableCell className="text-sm text-muted-foreground">{parseFloat(q.discount).toLocaleString()} DA</TableCell>
              <TableCell className="text-sm text-muted-foreground">{parseFloat(q.tax).toLocaleString()} DA</TableCell>
              <TableCell className="text-sm font-bold text-foreground">{parseFloat(q.finalAmount).toLocaleString()} DA</TableCell>
              <TableCell>
                <StatusBadge status={q.status.charAt(0).toUpperCase() + q.status.slice(1)} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell>
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title={t("common.edit")} aria-label="Modifier le devis" onClick={() => onEdit(q.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {q.status === "draft" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" title={t("quotations.approve")} aria-label="Approuver le devis" onClick={() => handleApprove(q.id)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {q.status === "approved" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title={t("quotations.convertToInvoice")} aria-label="Convertir en facture" onClick={() => handleConvert(q.id)}>
                      <ArrowRightFromLine className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="PDF" aria-label="Voir le PDF" onClick={() => handleViewPdf(q.id)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title={t("common.delete")} aria-label="Supprimer le devis" onClick={() => onDelete(q.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {quotations.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                {t("common.no-data")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}