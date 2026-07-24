import { useLanguage } from "@/i18n/language-context";
import { useInvoiceDetail, useClinicSetting } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, Download, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoicePrintProps {
  invoiceId: string | null;
  open: boolean;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Partially Paid": "bg-amber-50 text-amber-700 border-amber-200",
  Pending: "bg-blue-50 text-blue-700 border-blue-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
  Cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  Draft: "bg-slate-50 text-slate-700 border-slate-200",
};

const paymentMethodLabel: Record<string, string> = {
  cash: "Espèces",
  card: "Carte bancaire",
  check: "Chèque",
  transfer: "Virement",
};

export default function InvoicePrint({ invoiceId, open, onClose }: InvoicePrintProps) {
  const { t } = useLanguage();
  const { data: invoice, isLoading } = useInvoiceDetail(invoiceId || "");
  const { data: clinicName } = useClinicSetting("clinicName");
  const { data: clinicAddress } = useClinicSetting("clinicAddress");
  const { data: clinicPhone } = useClinicSetting("clinicPhone");
  const { data: clinicEmail } = useClinicSetting("clinicEmail");
  const { data: clinicDoctorName } = useClinicSetting("clinicDoctorName");

  const cName = typeof clinicName?.value === "string" ? clinicName.value : "DentalSoft";
  const cAddress = typeof clinicAddress?.value === "string" ? clinicAddress.value : "";
  const cPhone = typeof clinicPhone?.value === "string" ? clinicPhone.value : "";
  const cEmail = typeof clinicEmail?.value === "string" ? clinicEmail.value : "";
  const cDoctor = typeof clinicDoctorName?.value === "string" ? clinicDoctorName.value : "";

  const handlePrint = () => {
    const content = document.getElementById("invoice-printable");
    if (!content) return;
    const printWindow = window.open("", "_blank", "width=800,height=1000");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Facture</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.5; }
        .invoice-container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
        .clinic-info h1 { font-size: 20px; font-weight: 700; color: #2563eb; margin-bottom: 2px; }
        .clinic-info p { font-size: 10px; color: #64748b; }
        .invoice-meta { text-align: right; }
        .invoice-meta h2 { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: 2px; }
        .invoice-meta p { font-size: 10px; color: #64748b; }
        .invoice-meta .inv-number { font-family: monospace; font-size: 11px; color: #334155; }
        .section-title { font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
        .patient-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
        .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
        .patient-grid .field { display: flex; gap: 6px; }
        .patient-grid .label { font-size: 9px; color: #94a3b8; text-transform: uppercase; min-width: 60px; }
        .patient-grid .value { font-size: 11px; font-weight: 500; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #f1f5f9; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; padding: 8px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; }
        td { padding: 8px 10px; font-size: 11px; border-bottom: 1px solid #f1f5f9; }
        tr:last-child td { border-bottom: none; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
        .summary-row.total { font-weight: 700; font-size: 14px; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 8px; margin-top: 4px; }
        .summary-row.paid { color: #16a34a; }
        .summary-row.remaining { color: #dc2626; font-weight: 600; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 600; }
        .status-Paid { background: #dcfce7; color: #166534; }
        .status-Pending { background: #dbeafe; color: #1e40af; }
        .status-Overdue { background: #fee2e2; color: #991b1b; }
        .status-Partially { background: #fef3c7; color: #92400e; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 24px 0; }
        .sig-box { text-align: center; }
        .sig-line { border-top: 1px solid #cbd5e1; margin-top: 50px; padding-top: 6px; font-size: 9px; color: #64748b; text-transform: uppercase; }
        .footer { text-align: center; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 20px; }
        .footer p { font-size: 9px; color: #94a3b8; }
        .footer .brand { font-size: 10px; font-weight: 600; color: #2563eb; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; font-weight: 900; color: rgba(37, 99, 235, 0.04); letter-spacing: 10px; pointer-events: none; z-index: 0; }
      </style></head><body>
      <div class="watermark">${cName}</div>
      ${content.innerHTML}
      </body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  if (!open || !invoiceId) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-lg">{t("billing.view-invoice")}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-4 w-4" /> {t("billing.invoice-print")}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Fermer">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-70px)] px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !invoice ? (
            <p className="text-center py-20 text-muted-foreground">{t("common.no-data")}</p>
          ) : (
            <div id="invoice-printable" className="invoice-container bg-white rounded-lg border shadow-sm p-6">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 mb-5" style={{ borderBottom: "3px solid #2563eb" }}>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: "#2563eb" }}>{cName}</h1>
                  {cDoctor && <p className="text-sm font-medium text-slate-600">{cDoctor}</p>}
                  {cAddress && <p className="text-xs text-slate-400 mt-0.5">{cAddress}</p>}
                  {cPhone && <p className="text-xs text-slate-400">{cPhone}</p>}
                  {cEmail && <p className="text-xs text-slate-400">{cEmail}</p>}
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-extrabold tracking-widest" style={{ color: "#2563eb" }}>{t("billing.invoice-header")}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="font-mono">{invoice.invoiceNumber || invoice.id.substring(0, 8).toUpperCase()}</span>
                  </p>
                  <p className="text-xs text-slate-400">{t("billing.invoice-date")}: {new Date(invoice.date).toLocaleDateString()}</p>
                  {invoice.dueDate && <p className="text-xs text-slate-400">{t("billing.invoice-due")}: {new Date(invoice.dueDate).toLocaleDateString()}</p>}
                  <div className="mt-2">
                    <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-semibold", statusColors[invoice.status] || "bg-gray-100 text-gray-700")}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              {invoice.patient && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("billing.invoice-patient")}</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 gap-x-8 gap-y-1">
                    <div className="flex gap-2"><span className="text-[10px] text-slate-400 uppercase min-w-[70px]">{t("billing.invoice-patient")}</span><span className="text-sm font-medium">{invoice.patient.name}</span></div>
                    {invoice.patient.patientId && <div className="flex gap-2"><span className="text-[10px] text-slate-400 uppercase min-w-[70px]">ID</span><span className="text-sm font-mono">{invoice.patient.patientId}</span></div>}
                    {invoice.patient.phone && <div className="flex gap-2"><span className="text-[10px] text-slate-400 uppercase min-w-[70px]">{t("billing.invoice-phone")}</span><span className="text-sm">{invoice.patient.phone}</span></div>}
                    {invoice.patient.gender && <div className="flex gap-2"><span className="text-[10px] text-slate-400 uppercase min-w-[70px]">{t("patients.gender")}</span><span className="text-sm">{invoice.patient.gender}</span></div>}
                    {invoice.patient.dateOfBirth && <div className="flex gap-2"><span className="text-[10px] text-slate-400 uppercase min-w-[70px]">{t("patients.dob")}</span><span className="text-sm">{new Date(invoice.patient.dateOfBirth).toLocaleDateString()}</span></div>}
                    {invoice.patient.address && <div className="flex gap-2 col-span-2"><span className="text-[10px] text-slate-400 uppercase min-w-[70px]">{t("billing.invoice-address")}</span><span className="text-sm">{invoice.patient.address}</span></div>}
                    {invoice.patient.insuranceProvider && <div className="flex gap-2"><span className="text-[10px] text-slate-400 uppercase min-w-[70px]">Assurance</span><span className="text-sm">{invoice.patient.insuranceProvider}</span></div>}
                  </div>
                </div>
              )}

              {/* Treatments Table */}
              {invoice.items && invoice.items.length > 0 ? (
                <div className="mb-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("billing.invoice-treatments")}</p>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">#</th>
                        {invoice.items[0]?.toothNumber != null && <th className="text-center text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">{t("billing.invoice-tooth")}</th>}
                        <th className="text-left text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">{t("billing.invoice-description")}</th>
                        <th className="text-center text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">{t("billing.invoice-qty")}</th>
                        <th className="text-right text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">{t("billing.invoice-unit-price")}</th>
                        <th className="text-right text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">{t("billing.invoice-discount")}</th>
                        <th className="text-right text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">{t("billing.invoice-total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item: any, idx: number) => (
                        <tr key={item.id}>
                          <td className="py-2 px-3 text-xs text-slate-500 border-b border-slate-100">{idx + 1}</td>
                          {item.toothNumber != null && <td className="py-2 px-3 text-xs text-center font-mono border-b border-slate-100">{item.toothNumber}</td>}
                          <td className="py-2 px-3 text-xs font-medium border-b border-slate-100">{item.description}</td>
                          <td className="py-2 px-3 text-xs text-center border-b border-slate-100">{item.quantity}</td>
                          <td className="py-2 px-3 text-xs text-right border-b border-slate-100">{parseFloat(item.unitPrice).toLocaleString()} DA</td>
                          <td className="py-2 px-3 text-xs text-right border-b border-slate-100">{parseFloat(item.discount || "0") > 0 ? `-${item.discount}%` : "—"}</td>
                          <td className="py-2 px-3 text-xs text-right font-semibold border-b border-slate-100">{parseFloat(item.total).toLocaleString()} DA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mb-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("billing.invoice-treatments")}</p>
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-6 text-center">
                    <p className="text-xs text-slate-400">{t("billing.invoice-no-treatments")}</p>
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("billing.invoice-financial-summary")}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-500">{t("billing.invoice-amount")}</span>
                    <span className="font-medium">{parseFloat(invoice.amount).toLocaleString()} DA</span>
                  </div>
                  <div className="flex justify-between text-xs py-1" style={{ color: "#16a34a" }}>
                    <span>{t("billing.invoice-paid")}</span>
                    <span className="font-semibold">{parseFloat(invoice.paidAmount || "0").toLocaleString()} DA</span>
                  </div>
                  {parseFloat(invoice.amount) - parseFloat(invoice.paidAmount || "0") > 0 && (
                    <div className="flex justify-between text-xs py-1" style={{ color: "#dc2626" }}>
                      <span className="font-semibold">{t("billing.invoice-remaining")}</span>
                      <span className="font-bold">{(parseFloat(invoice.amount) - parseFloat(invoice.paidAmount || "0")).toLocaleString()} DA</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 mt-2" style={{ borderTop: "2px solid #2563eb" }}>
                    <span className="text-sm font-bold" style={{ color: "#2563eb" }}>{t("billing.invoice-total")}</span>
                    <span className="text-base font-extrabold" style={{ color: "#2563eb" }}>{parseFloat(invoice.amount).toLocaleString()} DA</span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {invoice.payments && invoice.payments.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("billing.invoice-payment-history")}</p>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">{t("billing.invoice-date")}</th>
                        <th className="text-right text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">{t("billing.invoice-amount")}</th>
                        <th className="text-left text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">{t("billing.payment-method")}</th>
                        <th className="text-left text-[10px] bg-slate-100 font-bold uppercase text-slate-500 py-2 px-3 border-b-2 border-slate-200">{t("billing.invoice-notes")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.payments.map((p: any) => (
                        <tr key={p.id}>
                          <td className="py-2 px-3 text-xs border-b border-slate-100">{new Date(p.paymentDate).toLocaleDateString()}</td>
                          <td className="py-2 px-3 text-xs text-right font-semibold border-b border-slate-100">{parseFloat(p.amount).toLocaleString()} DA</td>
                          <td className="py-2 px-3 text-xs border-b border-slate-100">{paymentMethodLabel[p.paymentMethod] || p.paymentMethod}</td>
                          <td className="py-2 px-3 text-xs text-slate-400 border-b border-slate-100">{p.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 my-6">
                <div className="text-center">
                  <div className="h-16" />
                  <div className="border-t border-slate-300 pt-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("billing.invoice-dentist-signature")}</p>
                    {cDoctor && <p className="text-xs font-medium mt-1">{cDoctor}</p>}
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-16" />
                  <div className="border-t border-slate-300 pt-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("billing.invoice-clinic-stamp")}</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-16" />
                  <div className="border-t border-slate-300 pt-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("billing.invoice-patient-signature")}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center border-t-2 border-slate-200 pt-3 mt-4">
                <p className="text-xs font-medium text-slate-500">{t("billing.invoice-thank")}</p>
                <p className="text-[10px] text-slate-400 mt-1">{t("billing.invoice-legal")}</p>
                <p className="text-[10px] font-semibold mt-1" style={{ color: "#2563eb" }}>DentaSoft — {t("billing.invoice-generated-by")}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
