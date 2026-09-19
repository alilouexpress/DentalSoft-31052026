import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/language-context";
import { useInvoicePayments } from "@/hooks/use-api";

interface PaymentHistoryDialogProps {
  invoiceId: string | null;
  onClose: () => void;
}

export function PaymentHistoryDialog({ invoiceId, onClose }: PaymentHistoryDialogProps) {
  const { t } = useLanguage();
  const { data: invoicePayments = [] } = useInvoicePayments(invoiceId || "");
  return (
    <Dialog open={!!invoiceId} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{t("billing.payment-history")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {invoicePayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("billing.no-payments")}</p>
          ) : (
            invoicePayments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-semibold">{parseFloat(p.amount).toLocaleString()} DA</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.paymentDate).toLocaleDateString()} &middot; {p.paymentMethod}
                  </p>
                </div>
                {p.notes && <p className="text-xs text-muted-foreground max-w-[200px] truncate">{p.notes}</p>}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}