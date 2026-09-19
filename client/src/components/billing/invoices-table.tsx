import type { Invoice } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/language-context";
import { cn } from "@/lib/utils";
import { Search, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, FileText, Wallet, History } from "lucide-react";

type InvoiceRow = Invoice & { patientName?: string; remaining?: string };

interface InvoicesTableProps {
  search: string;
  onSearchChange: (value: string) => void;
  pageItems: InvoiceRow[];
  totalRows: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  onView: (id: string) => void;
  onPay: (id: string) => void;
  onHistory: (id: string) => void;
}

export function InvoicesTable({
  search, onSearchChange, pageItems, totalRows, page, totalPages, onPageChange,
  isLoading, isError, error, onRetry, onView, onPay, onHistory,
}: InvoicesTableProps) {
  const { t } = useLanguage();
  return (
    <>
      <div className="bg-muted/30 p-3 rounded-xl flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("patients.search")} className="ps-9 bg-card" value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{t("common.error")}</h3>
              <p className="text-sm text-muted-foreground">{error?.message || t("common.no-data")}</p>
              <Button variant="outline" size="sm" onClick={onRetry}>{t("common.retry")}</Button>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border">
                {[t("billing.invoice-id"), t("billing.patient"), t("billing.amount"), t("billing.paid"), t("billing.remaining"), t("billing.date"), t("billing.due-date-header"), t("billing.status"), ""].map(h => (
                  <TableHead key={h} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border">
                {[t("billing.invoice-id"), t("billing.patient"), t("billing.amount"), t("billing.paid"), t("billing.remaining"), t("billing.date"), t("billing.due-date-header"), t("billing.status"), ""].map(h => (
                  <TableHead key={h} className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map(inv => {
                const paid = parseFloat(inv.paidAmount || "0.00");
                const remaining = parseFloat(inv.remaining || inv.amount) - paid;
                const displayRemaining = Math.max(0, remaining).toFixed(2);
                return (
                  <TableRow key={inv.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">{inv.id.substring(0, 8)}</TableCell>
                    <TableCell className="font-medium text-sm">{inv.patientName || "—"}</TableCell>
                    <TableCell className="text-sm font-semibold">{parseFloat(inv.amount).toLocaleString()} DA</TableCell>
                    <TableCell className="text-sm text-emerald-600 font-medium">{paid.toLocaleString()} DA</TableCell>
                    <TableCell className={cn("text-sm font-medium", paid >= parseFloat(inv.amount) ? "text-emerald-600" : "text-amber-600")}>
                      {parseFloat(displayRemaining).toLocaleString()} DA
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={t("billing.view-invoice")} aria-label="Voir la facture" onClick={() => onView(inv.id)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={t("billing.pay")} aria-label="Payer" onClick={() => onPay(inv.id)}>
                          <Wallet className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={t("billing.payment-history")} aria-label="Historique des paiements" onClick={() => onHistory(inv.id)}>
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {totalRows === 0 && (
                <TableRow><TableCell colSpan={9} className="py-12">
                  <EmptyState
                    icon={<FileText className="h-10 w-10" />}
                    title={t("billing.no-invoices")}
                    description={t("billing.no-invoices-desc") || "Aucune facture trouvée"}
                  />
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/10">
            <p className="text-xs text-muted-foreground">{totalRows} résultat{totalRows > 1 ? "s" : ""}</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => onPageChange(Math.max(0, page - 1))} aria-label="Page précédente">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} variant={i === page ? "outline" : "ghost"} size="icon" className="h-8 w-8 text-xs" onClick={() => onPageChange(i)}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} aria-label="Page suivante">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}