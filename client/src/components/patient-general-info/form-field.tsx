import { useLanguage } from "@/i18n/language-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldError } from "@/components/ui/field";
import type { FormState } from "./constants";

interface FormFieldProps {
  field: keyof FormState;
  labelKey: string;
  placeholderKey: string;
  type?: "text" | "email" | "tel";
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
  fieldErrors: Record<string, string>;
}

export function FormField({
  field,
  labelKey,
  placeholderKey,
  type = "text",
  form,
  onChange,
  fieldErrors,
}: FormFieldProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">{t(labelKey)}</Label>
      <Input
        type={type}
        value={form[field]}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={t(placeholderKey)}
        className={`h-9 ${fieldErrors[field] ? "border-destructive" : ""}`}
      />
      {fieldErrors[field] && <FieldError errors={[{ message: fieldErrors[field] }]} />}
    </div>
  );
}

interface FormSelectProps extends Omit<FormFieldProps, "type"> {
  options: { value: string; label: string }[];
}

export function FormSelect({
  field,
  labelKey,
  placeholderKey,
  options,
  form,
  onChange,
  fieldErrors,
}: FormSelectProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">{t(labelKey)}</Label>
      <Select value={form[field]} onValueChange={(v) => onChange(field, v)}>
        <SelectTrigger className={`h-9 ${fieldErrors[field] ? "border-destructive" : ""}`}>
          <SelectValue placeholder={t(placeholderKey)} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {fieldErrors[field] && <FieldError errors={[{ message: fieldErrors[field] }]} />}
    </div>
  );
}