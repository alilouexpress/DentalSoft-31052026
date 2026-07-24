import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/i18n/language-context";
import { useInvoices, useCreatePayment, useUpdatePayment, useDeletePayment, usePatientDebt } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Banknote, Printer, AlertCircle, CheckCircle2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
  patientPhone?: string | null;
  paymentToEdit?: any | null;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Especes", color: "bg-emerald-100 text-emerald-700" },
  { value: "card", label: "Carte bancaire", color: "bg-blue-100 text-blue-700" },
  { value: "check", label: "Cheque", color: "bg-orange-100 text-orange-700" },
  { value: "transfer", label: "Virement", color: "bg-purple-100 text-purple-700" },
];

function formatCurrency(value: string): string {
  const num = parseFloat(value.replace(/[^0-9,]/g, "").replace(",", "."));
  if (isNaN(num)) return "";
  return num.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DA";
}

function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9,]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function printPaymentReceipt(payment: any, patientName: string, patientId: string) {
  const win = window.open("", "_blank");
  if (!win) { toast.error("Autorisez les popups pour imprimer"); return; }
  const totalPaid = parseFloat(payment.amount || "0");
  const remaining = parseFloat(payment.invoiceRemaining || "0");
  const remainingDisplay = remaining > 0
    ? remaining.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " DA"
    : "0,00 DA";
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Recu de paiement</title>
<style>
  @page { size: A5; margin: 15mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; max-width: 420px; margin: 0 auto; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { margin: 0; color: #0d9488; font-size: 20px; }
  .header p { margin: 3px 0; color: #64748b; font-size: 11px; }
  .receipt-title { text-align: center; margin: 16px 0; }
  .receipt-title h2 { margin: 0; font-size: 16px; color: #1e293b; letter-spacing: 1px; }
  .receipt-title p { margin: 4px 0; color: #64748b; font-size: 11px; }
  .info-table { width: 100%; margin: 12px 0; }
  .info-table td { padding: 3px 0; font-size: 12px; }
  .info-table td:last-child { text-align: right; font-weight: 600; }
  .amount-box { background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0; }
  .amount-box .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .amount-box .value { font-size: 28px; font-weight: 700; color: #0d9488; margin: 4px 0; }
  .divider { border: none; border-top: 1px dashed #cbd5e1; margin: 12px 0; }
  .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #94a3b8; }
</style></head><body>
  <div class="header"><h1>Cabinet Dentaire</h1><p>123 Rue des Dentistes, Alger</p><p>Tel: 0234 56 78 90</p></div>
  <div class="receipt-title"><h2>RECU DE PAIEMENT</h2><p>N°: ${payment.id?.substring(0, 8).toUpperCase() || "---"}</p></div>
  <hr class="divider">
  <table class="info-table"><tr><td>Date</td><td>${format(new Date(payment.paymentDate), "dd/MM/yyyy")}</td></tr><tr><td>Patient</td><td>${patientName}</td></tr><tr><td>ID Patient</td><td>${patientId}</td></tr></table>
  <hr class="divider">
  <div class="amount-box"><div class="label">Montant paye</div><div class="value">${totalPaid.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA</div></div>
  <table class="info-table"><tr><td>Mode de paiement</td><td>${PAYMENT_METHODS.find(m => m.value === payment.paymentMethod)?.label || payment.paymentMethod}</td></tr>
  ${payment.referenceNumber ? `<tr><td>Reference</td><td>${payment.referenceNumber}</td></tr>` : ""}
  ${payment.invoiceNumber ? `<tr><td>Facture</td><td>${payment.invoiceNumber}</td></tr>` : ""}
  <tr><td>Reste a payer</td><td>${remainingDisplay}</td></tr></table>
  ${payment.notes ? `<hr class="divider"><p style="font-size:11px;color:#64748b">Notes: ${payment.notes}</p>` : ""}
  <hr class="divider">
  <table class="info-table"><tr><td>Signature</td><td style="border-bottom:1px solid #cbd5e1;min-width:120px">&nbsp;</td></tr></table>
  <div class="footer"><p>Merci de votre confiance</p></div>
</body></html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 500);
}

export function PatientPaymentDialog({ open, onOpenChange, patientId, patientName, patientPhone, paymentToEdit }: PaymentDialogProps) {
  const { data: allInvoices = [] } = useInvoices();
  const { data: debt } = usePatientDebt(patientId);
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

  const patientInvoices = useMemo(() =>
    allInvoices.filter((inv: any) => inv.patientId === patientId),
  [allInvoices, patientId]);

  const unpaidInvoices = useMemo(() =>
    patientInvoices.filter((inv: any) => {
      const remaining = parseFloat(inv.remaining || inv.amount || "0");
      return remaining > 0;
    }),
  [patientInvoices]);

  const isEditing = !!paymentToEdit;

  const [form, setForm] = useState({
    amount: "",
    paymentMethod: "cash",
    paymentDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    invoiceId: "",
    referenceNumber: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (paymentToEdit) {
        setForm({
          amount: parseFloat(paymentToEdit.amount).toLocaleString("fr-FR", { minimumFractionDigits: 2 }),
          paymentMethod: paymentToEdit.paymentMethod || "cash",
          paymentDate: paymentToEdit.paymentDate ? format(new Date(paymentToEdit.paymentDate), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          invoiceId: paymentToEdit.invoiceId || "",
          referenceNumber: paymentToEdit.referenceNumber || "",
          notes: paymentToEdit.notes || "",
        });
      } else {
        setForm({
          amount: "",
          paymentMethod: "cash",
          paymentDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          invoiceId: unpaidInvoices.length > 0 ? unpaidInvoices[0].id : "",
          referenceNumber: "",
          notes: "",
        });
      }
      setErrors({});
    }
  }, [open, paymentToEdit, unpaidInvoices]);

  const selectedInvoice = useMemo(() =>
    patientInvoices.find((inv: any) => inv.id === form.invoiceId),
  [patientInvoices, form.invoiceId]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const amountNum = parseCurrency(form.amount);
    if (!form.amount.trim() || amountNum <= 0) errs.amount = "Le montant doit etre superieur a 0";
    if (!form.paymentMethod) errs.paymentMethod = "Mode de paiement requis";
    if (!form.paymentDate) errs.paymentDate = "Date requise";
    if (!form.invoiceId) errs.invoiceId = "Veuillez selectionner une facture";
    if ((form.paymentMethod === "check" || form.paymentMethod === "transfer") && !form.referenceNumber.trim()) {
      errs.referenceNumber = "N de reference requis pour cheque/virement";
    }
    if (selectedInvoice) {
      const invRemaining = parseFloat(selectedInvoice.remaining || selectedInvoice.amount || "0");
      if (amountNum > invRemaining) {
        errs.amount = `Le montant depasse le solde de la facture (${invRemaining.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA)`;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const amountNum = parseCurrency(form.amount);
      if (isEditing && paymentToEdit) {
        await updatePayment.mutateAsync({
          id: paymentToEdit.id,
          data: {
            amount: String(amountNum),
            paymentMethod: form.paymentMethod,
            paymentDate: new Date(form.paymentDate),
            referenceNumber: form.referenceNumber || null,
            notes: form.notes || null,
          } as any,
        });
        toast.success("Paiement modifie");
      } else {
        const result = await createPayment.mutateAsync({
          invoiceId: form.invoiceId,
          amount: String(amountNum),
          paymentMethod: form.paymentMethod,
          paymentDate: new Date(form.paymentDate),
          referenceNumber: form.referenceNumber || null,
          notes: form.notes || null,
        } as any);
        toast.success("Paiement enregistre");
        // print receipt after creation
        setTimeout(() => {
          printPaymentReceipt({
            ...result,
            paymentDate: form.paymentDate,
            invoiceRemaining: selectedInvoice ? parseFloat(selectedInvoice.remaining || selectedInvoice.amount || "0") - amountNum : 0,
            invoiceNumber: selectedInvoice?.invoiceNumber || selectedInvoice?.id,
          }, patientName, patientId);
        }, 300);
      }
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!paymentToEdit) return;
    if (!window.confirm("Supprimer ce paiement ?")) return;
    try {
      await deletePayment.mutateAsync(paymentToEdit.id);
      toast.success("Paiement supprime");
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleAmountChange = (value: string) => {
    const digits = value.replace(/[^0-9,]/g, "");
    setForm({ ...form, amount: digits });
  };

  const amountNum = parseCurrency(form.amount);
  const invRemaining = selectedInvoice ? parseFloat(selectedInvoice.remaining || selectedInvoice.amount || "0") : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-teal-600" />
            {isEditing ? "Modifier le paiement" : "Nouveau Paiement"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Montant *</Label>
            <div className="relative">
              <Input
                value={form.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="15 000,00"
                className={`h-10 text-lg font-bold text-right tabular-nums pr-14 ${errors.amount ? "border-red-500" : ""}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-teal-600 pointer-events-none">DA</span>
            </div>
            {errors.amount && <p className="text-xs text-red-600">{errors.amount}</p>}
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Mode de paiement *</Label>
            <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
              <SelectTrigger className={`h-9 text-sm ${errors.paymentMethod ? "border-red-500" : ""}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-sm">
                    <span className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.color}`}>{m.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && <p className="text-xs text-red-600">{errors.paymentMethod}</p>}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Date *</Label>
            <Input
              type="datetime-local"
              value={form.paymentDate}
              onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
              className={`h-9 text-sm ${errors.paymentDate ? "border-red-500" : ""}`}
            />
            {errors.paymentDate && <p className="text-xs text-red-600">{errors.paymentDate}</p>}
          </div>

          {/* Reference */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              N reference
              {(form.paymentMethod === "check" || form.paymentMethod === "transfer") && <span className="text-red-500"> *</span>}
            </Label>
            <Input
              value={form.referenceNumber}
              onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
              placeholder={form.paymentMethod === "check" ? "N de cheque" : form.paymentMethod === "transfer" ? "N de virement" : ""}
              className={`h-9 text-sm ${errors.referenceNumber ? "border-red-500" : ""}`}
            />
            {(form.paymentMethod === "check" || form.paymentMethod === "transfer") && (
              <p className="text-[10px] text-slate-400">Requis pour les paiements par {form.paymentMethod === "check" ? "cheque" : "virement"}</p>
            )}
            {errors.referenceNumber && <p className="text-xs text-red-600">{errors.referenceNumber}</p>}
          </div>

          {/* Invoice */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Lie a la facture *</Label>
            {unpaidInvoices.length === 0 ? (
              <div className="h-9 px-3 flex items-center text-sm text-slate-400 bg-slate-50 rounded-md border border-slate-200">
                Aucune facture impayee disponible
              </div>
            ) : (
              <Select value={form.invoiceId} onValueChange={(v) => setForm({ ...form, invoiceId: v })}>
                <SelectTrigger className={`h-9 text-sm ${errors.invoiceId ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Selectionner une facture" />
                </SelectTrigger>
                <SelectContent>
                  {unpaidInvoices.map((inv: any) => {
                    const remaining = parseFloat(inv.remaining || inv.amount || "0");
                    return (
                      <SelectItem key={inv.id} value={inv.id} className="text-sm">
                        {inv.invoiceNumber || `Facture #${inv.id.substring(0, 8)}`} — {remaining.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            {errors.invoiceId && <p className="text-xs text-red-600">{errors.invoiceId}</p>}
            {selectedInvoice && amountNum > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                {amountNum <= invRemaining ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-[10px] ${amountNum <= invRemaining ? "text-emerald-600" : "text-red-600"}`}>
                  Solde facture: {invRemaining.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA
                  {amountNum <= invRemaining && amountNum > 0 && (
                    <> &rarr; Reste: {(invRemaining - amountNum).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DA</>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Notes optionnelles..."
              className="min-h-[60px] text-sm resize-none"
            />
          </div>

        </div>

        <DialogFooter className="gap-2">
          {isEditing && (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deletePayment.isPending} className="cursor-pointer">
              Supprimer
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="cursor-pointer">Annuler</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || unpaidInvoices.length === 0} className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer gap-1.5">
            {isEditing ? "Enregistrer" : <><Printer className="h-3.5 w-3.5" /> {saving ? "Enregistrement..." : "Enregistrer & imprimer"}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
