import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/language-context";
import { StatusBadge } from "@/components/status-badge";
import { useInvoices } from "@/hooks/use-api";

interface ViewInvoiceDialogProps {
  patientId: string | null;
  onClose: () => void;
}

export function ViewInvoiceDialog({ patientId, onClose }: ViewInvoiceDialogProps) {
  const { t, dir } = useLanguage();
  const { data: allInvoices = [] } = useInvoices();

  return (
    <Dialog open={!!patientId} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={`sm:max-w-lg ${dir === "rtl" ? "font-arabic" : ""}`}>
        <DialogHeader>
          <DialogTitle>{t("debt.view-invoice")}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto space-y-3">
          {allInvoices.filter(i => i.patientId === patientId).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t("debt.no-invoices")}</p>
          ) : (
            allInvoices.filter(i => i.patientId === patientId).map(inv => {
              const paid = parseFloat(inv.paidAmount || "0");
              const remaining = Math.max(0, parseFloat(inv.amount) - paid);
              return (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{inv.invoiceNumber || inv.id.substring(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(inv.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{parseFloat(inv.amount).toLocaleString()} DA</p>
                    {remaining > 0 && <p className="text-xs text-red-600">{remaining.toLocaleString()} DA {t("debt.remaining")}</p>}
                  </div>
                  <StatusBadge status={inv.status} />
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}