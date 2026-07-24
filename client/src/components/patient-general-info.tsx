import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/i18n/language-context";
import { useUploadPatientPhoto } from "@/hooks/use-patient-general-info";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FieldError } from "@/components/ui/field";
import { Camera, Save, User, Phone, MapPin, Shield, Settings, Heart, FileEdit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Patient } from "@shared/schema";

interface PatientGeneralInfoProps {
  patient: Patient;
  onSave: (id: string, data: Record<string, any>) => Promise<void>;
}

interface FormState {
  name: string;
  gender: string;
  dateOfBirth: string;
  nationalId: string;
  profession: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  emergencyContact: string;
  emergencyPhone: string;
  insuranceProvider: string;
  insuranceNumber: string;
  preferredLanguage: string;
  preferredCommunication: string;
  bloodType: string;
  notes: string;
}

function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}

function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LANGUAGES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];
const COMMUNICATION_MODES = [
  { value: "phone", translationKey: "workspace.comm-phone" },
  { value: "email", translationKey: "workspace.comm-email" },
  { value: "sms", translationKey: "workspace.comm-sms" },
  { value: "mail", translationKey: "workspace.comm-mail" },
];

export function PatientGeneralInfo({ patient, onSave }: PatientGeneralInfoProps) {
  const { t } = useLanguage();
  const uploadPhoto = useUploadPatientPhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormState>(() => ({
    name: patient.name || "",
    gender: patient.gender || "",
    dateOfBirth: toDateInputValue(patient.dateOfBirth),
    nationalId: patient.nationalId || "",
    profession: patient.profession || "",
    phone: patient.phone || "",
    secondaryPhone: patient.secondaryPhone || "",
    email: patient.email || "",
    address: patient.address || "",
    city: patient.city || "",
    state: patient.state || "",
    postalCode: patient.postalCode || "",
    country: patient.country || "",
    emergencyContact: patient.emergencyContact || "",
    emergencyPhone: patient.emergencyPhone || "",
    insuranceProvider: patient.insuranceProvider || "",
    insuranceNumber: patient.insuranceNumber || "",
    preferredLanguage: patient.preferredLanguage || "",
    preferredCommunication: patient.preferredCommunication || "",
    bloodType: patient.bloodType || "",
    notes: patient.notes || "",
  }));

  const computedAge = calculateAge(form.dateOfBirth);

  useEffect(() => {
    setForm({
      name: patient.name || "",
      gender: patient.gender || "",
      dateOfBirth: toDateInputValue(patient.dateOfBirth),
      nationalId: patient.nationalId || "",
      profession: patient.profession || "",
      phone: patient.phone || "",
      secondaryPhone: patient.secondaryPhone || "",
      email: patient.email || "",
      address: patient.address || "",
      city: patient.city || "",
      state: patient.state || "",
      postalCode: patient.postalCode || "",
      country: patient.country || "",
      emergencyContact: patient.emergencyContact || "",
      emergencyPhone: patient.emergencyPhone || "",
      insuranceProvider: patient.insuranceProvider || "",
      insuranceNumber: patient.insuranceNumber || "",
      preferredLanguage: patient.preferredLanguage || "",
      preferredCommunication: patient.preferredCommunication || "",
      bloodType: patient.bloodType || "",
      notes: patient.notes || "",
    });
    setDirty(false);
    setFieldErrors({});
  }, [patient.id]);

  const handleChange = useCallback((field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setDirty(true);
    setFieldErrors(prev => {
      if (!prev[field]) return prev;
      const n = { ...prev };
      delete n[field];
      return n;
    });
  }, []);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = t("common.field-required");
    if (!form.gender) errors.gender = t("common.field-required");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(patient.id, {
        name: form.name,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : null,
        age: computedAge || patient.age,
        nationalId: form.nationalId || null,
        profession: form.profession || null,
        phone: form.phone || null,
        secondaryPhone: form.secondaryPhone || null,
        email: form.email || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        postalCode: form.postalCode || null,
        country: form.country || null,
        emergencyContact: form.emergencyContact || null,
        emergencyPhone: form.emergencyPhone || null,
        insuranceProvider: form.insuranceProvider || null,
        insuranceNumber: form.insuranceNumber || null,
        preferredLanguage: form.preferredLanguage || null,
        preferredCommunication: form.preferredCommunication || null,
        bloodType: form.bloodType || null,
        notes: form.notes || null,
      });
      setDirty(false);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadPhoto.mutateAsync({ id: patient.id, file });
      toast.success(t("workspace.photo-updated"));
    } catch {
      toast.error(t("workspace.photo-failed"));
    }
    e.target.value = "";
  };

  const renderField = (
    field: keyof FormState,
    labelKey: string,
    placeholderKey: string,
    type: "text" | "email" | "tel" = "text",
  ) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">{t(labelKey)}</Label>
      <Input
        type={type}
        value={form[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={t(placeholderKey)}
        className={`h-9 ${fieldErrors[field] ? "border-destructive" : ""}`}
      />
      {fieldErrors[field] && <FieldError errors={[{ message: fieldErrors[field] }]} />}
    </div>
  );

  const renderSelect = (
    field: keyof FormState,
    labelKey: string,
    placeholderKey: string,
    options: { value: string; label: string }[],
  ) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">{t(labelKey)}</Label>
      <Select value={form[field]} onValueChange={(v) => handleChange(field, v)}>
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

  const sectionIconClass = "h-4 w-4 text-primary";

  return (
    <div className="space-y-5 max-w-4xl">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />

      {/* Identity Card */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="h-12 bg-gradient-to-r from-primary/60 to-primary/20" />
        <CardContent className="relative -mt-8 pb-4">
          <div className="flex items-end gap-4">
            <div className="relative group cursor-pointer shrink-0" onClick={handlePhotoClick}>
              <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                <AvatarImage src={patient.photoUrl || undefined} />
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {patient.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderField("name", "patients.full-name", "patients.name-placeholder")}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">{t("patients.status")}</Label>
                  <Input value={patient.status} disabled className="h-9 bg-muted/50" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                <User className="h-3 w-3" />
                <span className="font-mono">{t("patients.patient-id")}: {patient.patientId}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className={sectionIconClass} />
            {t("workspace.section-personal")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {renderSelect("gender", "patients.gender", "patients.select-gender", [
              { value: "Male", label: t("patients.male") },
              { value: "Female", label: t("patients.female") },
            ])}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">{t("patients.dob")}</Label>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">{t("patients.age")}</Label>
              <Input value={`${computedAge} ${t("patients.years")}`} disabled className="h-9 bg-muted/50" />
            </div>
            {renderField("nationalId", "patients.national-id", "patients.national-id-placeholder")}
            {renderField("profession", "workspace.profession", "workspace.profession-placeholder")}
            {renderSelect("bloodType", "patients.blood-type", "patients.blood-type-placeholder",
              BLOOD_TYPES.map((bt) => ({ value: bt, label: bt }))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Phone className={sectionIconClass} />
            {t("workspace.section-contact")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {renderField("phone", "patients.phone", "patients.phone-placeholder", "tel")}
            {renderField("secondaryPhone", "workspace.secondary-phone", "workspace.secondary-phone-placeholder", "tel")}
            {renderField("email", "patients.email", "patients.email-placeholder", "email")}
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className={sectionIconClass} />
            {t("workspace.section-address")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {renderField("address", "patients.address", "patients.address-placeholder")}
            {renderField("city", "workspace.city", "workspace.city-placeholder")}
            {renderField("state", "workspace.state", "workspace.state-placeholder")}
            {renderField("postalCode", "workspace.postal-code", "workspace.postal-code-placeholder")}
            {renderField("country", "workspace.country", "workspace.country-placeholder")}
          </div>
        </CardContent>
      </Card>

      {/* Emergency & Insurance */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className={sectionIconClass} />
            {t("workspace.section-emergency-insurance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {renderField("emergencyContact", "patients.emergency-contact", "patients.emergency-contact-placeholder")}
            {renderField("emergencyPhone", "patients.emergency-phone", "patients.emergency-phone-placeholder", "tel")}
            {renderField("insuranceProvider", "patients.insurance-provider", "patients.insurance-provider-placeholder")}
            {renderField("insuranceNumber", "patients.insurance-number", "patients.insurance-number-placeholder")}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className={sectionIconClass} />
            {t("workspace.section-preferences")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {renderSelect("preferredLanguage", "workspace.preferred-language", "workspace.preferred-language-placeholder", LANGUAGES)}
            {renderSelect("preferredCommunication", "workspace.preferred-communication", "workspace.preferred-communication-placeholder",
              COMMUNICATION_MODES.map((m) => ({ value: m.value, label: t(m.translationKey) }))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
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
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder={t("patients.notes-placeholder")}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Save Bar */}
      <div className="sticky bottom-0 bg-background border border-border/60 rounded-lg p-3 shadow-sm flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {dirty ? t("workspace.unsaved-changes") : t("workspace.all-saved")}
        </span>
        <Button onClick={handleSave} disabled={!dirty || saving} size="sm" className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}
