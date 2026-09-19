import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/i18n/language-context";
import { AlertTriangle, Banknote, ChevronLeft, ChevronRight, CircleCheck, Clock, Eye } from "lucide-react";

export interface DebtorRow {
  id: string;
  name: string;
  totalInvoiced: string;
  totalPaid: string;
  balance: string;
  lastPaymentDate: string | null;
  overdueDays: number;
  currentPhase?: string;
  currentPhaseColor?: string;
  treatmentPercentage: number;
}

const severityBadge: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  major: "bg-orange-100 text-orange-700 border-orange-200",
  minor: "bg-yellow-100 text-yellow-700 border-yellow-200",
  neutral: "bg-blue-100 text-blue-700 border-blue-200",
};

const severityLabel: Record<string, string> = {
  critical: "debt.severity-critical",
  major: "debt.severity-major",
  minor: "debt.severity-minor",
  neutral: "debt.severity-neutral",
};

const getSeverity = (days: number): string => {
  if (days > 90) return "critical";
  if (days > 30) return "major";
  if (days > 7) return "minor";
  return "neutral";
};

interface DebtorsTableProps {
  debtors: DebtorRow[];
  resultCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddPayment: (debtor: DebtorRow) => void;
  onViewInvoice: (debtor: DebtorRow) => void;
  onHistory: (debtor: DebtorRow) => void;
}

export function DebtorsTable({ debtors, resultCount, page, totalPages, onPageChange, onAddPayment, onViewInvoice, onHistory }: DebtorsTableProps) {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("common.name")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.total-invoiced")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.total-paid")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.balance")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.status")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.overdue-days")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.phase")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.progress")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("debt.due-date")}</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtors.map((debtor) => {
              const severity = getSeverity(debtor.overdueDays);
              return (
                <TableRow key={debtor.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-medium">{debtor.name}</TableCell>
                  <TableCell>{parseFloat(debtor.totalInvoiced).toLocaleString()} {t("common.currency-dzd")}</TableCell>
                  <TableCell>{parseFloat(debtor.totalPaid).toLocaleString()} {t("common.currency-dzd")}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${parseFloat(debtor.balance) > 0 ? "text-destructive" : "text-green-600"}`}>
                      {parseFloat(debtor.balance).toLocaleString()} {t("common.currency-dzd")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {parseFloat(debtor.balance) <= 0 ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CircleCheck className="h-3 w-3 me-1 inline" />
                        {t("debt.status-settled")}
                      </Badge>
                    ) : debtor.overdueDays > 0 ? (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <AlertTriangle className="h-3 w-3 me-1 inline" />
                        {t("debt.status-overdue")}
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        <CircleCheck className="h-3 w-3 me-1 inline" />
                        {t("debt.status-current")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {debtor.overdueDays > 0 ? (
                      <Badge className={severityBadge[severity]}>
                        <AlertTriangle className="h-3 w-3 me-1 inline" />
                        {debtor.overdueDays}j
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {debtor.currentPhase ? (
                      <Badge className={debtor.currentPhaseColor || "bg-gray-100 text-gray-700"}>
                        {debtor.currentPhase}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {debtor.currentPhase ? (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${debtor.treatmentPercentage >= 100 ? "bg-green-500" : "bg-blue-500"}`}
                            style={{ width: `${Math.min(debtor.treatmentPercentage, 100)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{debtor.treatmentPercentage}%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {debtor.lastPaymentDate ? new Date(debtor.lastPaymentDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={t("debt.add-payment")} aria-label="Ajouter un paiement" onClick={() => onAddPayment(debtor)}>
                        <Banknote className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={t("debt.view-invoice")} aria-label="Voir la facture" onClick={() => onViewInvoice(debtor)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title={t("debt.payment-history")} aria-label="Historique des paiements" onClick={() => onHistory(debtor)}>
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/10">
          <p className="text-xs text-muted-foreground">{resultCount} résultat{resultCount > 1 ? "s" : ""}</p>
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
      </CardContent>
    </Card>
  );
}