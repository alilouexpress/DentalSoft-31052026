import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n/language-context";
import { usePatientPayments } from "@/hooks/use-api";

interface PaymentHistoryDialogProps {
  patientId: string | null;
  onClose: () => void;
}

export function PaymentHistoryDialog({ patientId, onClose }: PaymentHistoryDialogProps) {
  const { t, dir } = useLanguage();
  const { data: payHistory = [] } = usePatientPayments(patientId || "");

  return (
    <Dialog open={!!patientId} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={`sm:max-w-lg ${dir === "rtl" ? "font-arabic" : ""}`}>
        <DialogHeader>
          <DialogTitle>{t("debt.payment-history")}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto space-y-3">
          {payHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t("debt.no-payments")}</p>
          ) : (
            payHistory.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{parseFloat(p.amount).toLocaleString()} DA</p>
                  <p className="text-xs text-muted-foreground">{p.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{new Date(p.paymentDate).toLocaleDateString()}</p>
                  {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}