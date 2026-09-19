import { useLanguage } from "@/i18n/language-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, MapPin, Shield, Settings, FileEdit } from "lucide-react";
import { FormField, FormSelect } from "./form-field";
import { BLOOD_TYPES, LANGUAGES, COMMUNICATION_MODES, type FormState } from "./constants";

interface SectionProps {
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
  fieldErrors: Record<string, string>;
}

const sectionIconClass = "h-4 w-4 text-primary";

export function PersonalInfoSection({ form, onChange, fieldErrors, computedAge }: SectionProps & { computedAge: number }) {
  const { t } = useLanguage();
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className={sectionIconClass} />
          {t("workspace.section-personal")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <FormSelect
            field="gender"
            labelKey="patients.gender"
            placeholderKey="patients.select-gender"
            options={[
              { value: "Male", label: t("patients.male") },
              { value: "Female", label: t("patients.female") },
            ]}
            form={form}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">{t("patients.dob")}</Label>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => onChange("dateOfBirth", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">{t("patients.age")}</Label>
            <Input value={`${computedAge} ${t("patients.years")}`} disabled className="h-9 bg-muted/50" />
          </div>
          <FormField field="nationalId" labelKey="patients.national-id" placeholderKey="patients.national-id-placeholder" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormField field="profession" labelKey="workspace.profession" placeholderKey="workspace.profession-placeholder" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormSelect
            field="bloodType"
            labelKey="patients.blood-type"
            placeholderKey="patients.blood-type-placeholder"
            options={BLOOD_TYPES.map((bt) => ({ value: bt, label: bt }))}
            form={form}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ContactSection({ form, onChange, fieldErrors }: SectionProps) {
  const { t } = useLanguage();
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Phone className={sectionIconClass} />
          {t("workspace.section-contact")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <FormField field="phone" labelKey="patients.phone" placeholderKey="patients.phone-placeholder" type="tel" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormField field="secondaryPhone" labelKey="workspace.secondary-phone" placeholderKey="workspace.secondary-phone-placeholder" type="tel" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormField field="email" labelKey="patients.email" placeholderKey="patients.email-placeholder" type="email" form={form} onChange={onChange} fieldErrors={fieldErrors} />
        </div>
      </CardContent>
    </Card>
  );
}

export function AddressSection({ form, onChange, fieldErrors }: SectionProps) {
  const { t } = useLanguage();
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className={sectionIconClass} />
          {t("workspace.section-address")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <FormField field="address" labelKey="patients.address" placeholderKey="patients.address-placeholder" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormField field="city" labelKey="workspace.city" placeholderKey="workspace.city-placeholder" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormField field="state" labelKey="workspace.state" placeholderKey="workspace.state-placeholder" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormField field="postalCode" labelKey="workspace.postal-code" placeholderKey="workspace.postal-code-placeholder" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormField field="country" labelKey="workspace.country" placeholderKey="workspace.country-placeholder" form={form} onChange={onChange} fieldErrors={fieldErrors} />
        </div>
      </CardContent>
    </Card>
  );
}

export function EmergencyInsuranceSection({ form, onChange, fieldErrors }: SectionProps) {
  const { t } = useLanguage();
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className={sectionIconClass} />
          {t("workspace.section-emergency-insurance")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <FormField field="emergencyContact" labelKey="patients.emergency-contact" placeholderKey="patients.emergency-contact-placeholder" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormField field="emergencyPhone" labelKey="patients.emergency-phone" placeholderKey="patients.emergency-phone-placeholder" type="tel" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormField field="insuranceProvider" labelKey="patients.insurance-provider" placeholderKey="patients.insurance-provider-placeholder" form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormField field="insuranceNumber" labelKey="patients.insurance-number" placeholderKey="patients.insurance-number-placeholder" form={form} onChange={onChange} fieldErrors={fieldErrors} />
        </div>
      </CardContent>
    </Card>
  );
}

export function PreferencesSection({ form, onChange, fieldErrors }: SectionProps) {
  const { t } = useLanguage();
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className={sectionIconClass} />
          {t("workspace.section-preferences")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <FormSelect field="preferredLanguage" labelKey="workspace.preferred-language" placeholderKey="workspace.preferred-language-placeholder" options={LANGUAGES} form={form} onChange={onChange} fieldErrors={fieldErrors} />
          <FormSelect
            field="preferredCommunication"
            labelKey="workspace.preferred-communication"
            placeholderKey="workspace.preferred-communication-placeholder"
            options={COMMUNICATION_MODES.map((m) => ({ value: m.value, label: t(m.translationKey) }))}
            form={form}
            onChange={onChange}
            fieldErrors={fieldErrors}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function NotesSection({ form, onChange }: SectionProps) {
  const { t } = useLanguage();
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileEdit className={sectionIconClass} />
          {t("patients.notes")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder={t("patients.notes-placeholder")}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
      </CardContent>
    </Card>
  );
}