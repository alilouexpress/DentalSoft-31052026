import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/language-context";

interface QuotationTotalsProps {
  totalAmount: number;
  discount: string;
  tax: string;
  finalAmount: number;
  onDiscountChange: (value: string) => void;
  onTaxChange: (value: string) => void;
}

export default function QuotationTotals({ totalAmount, discount, tax, finalAmount, onDiscountChange, onTaxChange }: QuotationTotalsProps) {
  const { t } = useLanguage();
  return (
    <div className="border border-border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("quotations.amount")}</span>
        <span className="font-semibold font-mono">{totalAmount.toLocaleString()} DA</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-16">{t("quotations.discount")}</Label>
          <Input type="number" step="0.01" min={0} className="h-8 text-sm font-mono w-28" value={discount} onChange={(e) => onDiscountChange(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-16">{t("quotations.tax")}</Label>
          <Input type="number" step="0.01" min={0} className="h-8 text-sm font-mono w-28" value={tax} onChange={(e) => onTaxChange(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
        <span className="font-bold">{t("quotations.final")}</span>
        <span className="font-bold text-lg font-mono">{finalAmount.toLocaleString()} DA</span>
      </div>
    </div>
  );
}