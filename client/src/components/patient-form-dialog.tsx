import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { X, Phone, Mail, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FieldError } from "@/components/ui/field";
import { useCreatePatient, useUpdatePatient } from "@/hooks/use-api";
import type { Patient } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/language-context";

interface PatientForm {
  name: string; age: string; gender: string; phone: string;
  email: string; address: string; status: string; balance: string;
  dateOfBirth: string; bloodType: string; nationalId: string;
  emergencyContact: string; emergencyPhone: string;
  insuranceProvider: string; insuranceNumber: string; notes: string;
}

const emptyForm = (): PatientForm => ({
  name: "", age: "", gender: "", phone: "",
  email: "", address: "", status: "Active", balance: "0.00",
  dateOfBirth: "", bloodType: "", nationalId: "",
  emergencyContact: "", emergencyPhone: "",
  insuranceProvider: "", insuranceNumber: "", notes: "",
});

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
}

export function PatientFormDialog({ open, onOpenChange, patient }: PatientFormDialogProps) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const [formData, setFormData] = useState<PatientForm>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEditing = !!patient;

  useEffect(() => {
    if (!open) return;
    if (patient) {
      setFormData({
        name: patient.name, age: String(patient.age),
        gender: patient.gender, phone: patient.phone || "", email: patient.email || "",
        address: patient.address || "", status: patient.status, balance: patient.balance || "0.00",
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : "",
        bloodType: patient.bloodType || "",
        nationalId: patient.nationalId || "",
        emergencyContact: patient.emergencyContact || "",
        emergencyPhone: patient.emergencyPhone || "",
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
        notes: patient.notes || "",
      });
    } else {
      setFormData(emptyForm());
    }
    setFieldErrors({});
  }, [open, patient]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = t("common.field-required");
    if (!formData.age.trim()) errors.age = t("common.field-required");
    if (formData.age && (Number(formData.age) < 0 || Number(formData.age) > 150)) errors.age = t("common.field-invalid");
    if (!formData.gender) errors.gender = t("common.field-required");
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = t("common.field-invalid");
    if (formData.phone && !/^[\d\s\-+()]{6,20}$/.test(formData.phone)) errors.phone = t("common.field-invalid");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const resetAndClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const baseData = {
      name: formData.name, age: Number(formData.age),
      gender: formData.gender, phone: formData.phone, email: formData.email,
      address: formData.address, status: formData.status, balance: formData.balance,
      bloodType: formData.bloodType || null,
      nationalId: formData.nationalId || null,
      emergencyContact: formData.emergencyContact || null,
      emergencyPhone: formData.emergencyPhone || null,
      insuranceProvider: formData.insuranceProvider || null,
      insuranceNumber: formData.insuranceNumber || null,
      notes: formData.notes || null,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
    };
    try {
      if (isEditing && patient) {
        await updatePatient.mutateAsync({ id: patient.id, data: baseData });
        toast.success(t("patients.updated"));
      } else {
        const created = await createPatient.mutateAsync({ ...baseData, lastVisit: null });
        toast.success(t("patients.created"));
        navigate("/patients-workspace/" + created.id);
      }
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? t("patients.update-failed") : t("patients.create-failed"));
    }
  };

  const isPending = createPatient.isPending || updatePatient.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetAndClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="p-5 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {isEditing ? t("patients.edit") : t("patients.add")}
            </DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-name" className="text-xs font-semibold text-foreground">{t("patients.full-name")} *</Label>
              <Input id="pf-name" required value={formData.name} onChange={(e) => handleFieldChange("name", e.target.value)} placeholder={t("patients.name-placeholder")} className={fieldErrors.name ? "border-destructive" : ""} />
              {fieldErrors.name && <FieldError errors={[{ message: fieldErrors.name }]} />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-age" className="text-xs font-semibold text-foreground">{t("patients.age")} *</Label>
              <Input id="pf-age" type="number" required value={formData.age} onChange={(e) => handleFieldChange("age", e.target.value)} placeholder={t("patients.age-placeholder")} className={fieldErrors.age ? "border-destructive" : ""} />
              {fieldErrors.age && <FieldError errors={[{ message: fieldErrors.age }]} />}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-gender" className="text-xs font-semibold text-foreground">{t("patients.gender")} *</Label>
              <Select value={formData.gender} onValueChange={(v) => handleFieldChange("gender", v)}>
                <SelectTrigger id="pf-gender" className={fieldErrors.gender ? "border-destructive" : ""}>
                  <SelectValue placeholder={t("patients.select-gender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">{t("patients.male")}</SelectItem>
                  <SelectItem value="Female">{t("patients.female")}</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.gender && <FieldError errors={[{ message: fieldErrors.gender }]} />}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-phone" className="text-xs font-semibold text-foreground">{t("patients.phone")}</Label>
            <div className="relative">
              <Phone className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="pf-phone" value={formData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} placeholder={t("patients.phone-placeholder")} className={cn("ps-9", fieldErrors.phone && "border-destructive")} />
            </div>
            {fieldErrors.phone && <FieldError errors={[{ message: fieldErrors.phone }]} />}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-email" className="text-xs font-semibold text-foreground">{t("patients.email")}</Label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="pf-email" type="email" value={formData.email} onChange={(e) => handleFieldChange("email", e.target.value)} placeholder={t("patients.email-placeholder")} className={cn("ps-9", fieldErrors.email && "border-destructive")} />
            </div>
            {fieldErrors.email && <FieldError errors={[{ message: fieldErrors.email }]} />}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-address" className="text-xs font-semibold text-foreground">{t("patients.address")}</Label>
            <div className="relative">
              <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="pf-address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder={t("patients.address-placeholder")} className="ps-9" />
            </div>
          </div>
          <Separator />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("patients.medical-info")}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-dob" className="text-xs font-semibold text-foreground">{t("patients.dob")}</Label>
              <Input id="pf-dob" type="date" value={formData.dateOfBirth} onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-blood" className="text-xs font-semibold text-foreground">{t("patients.blood-type")}</Label>
              <Select value={formData.bloodType} onValueChange={(v) => handleFieldChange("bloodType", v)}>
                <SelectTrigger id="pf-blood"><SelectValue placeholder={t("patients.blood-type-placeholder")} /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bt => (
                    <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-nid" className="text-xs font-semibold text-foreground">{t("patients.national-id")}</Label>
            <Input id="pf-nid" value={formData.nationalId} onChange={(e) => handleFieldChange("nationalId", e.target.value)} placeholder={t("patients.national-id-placeholder")} />
          </div>
          <Separator />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("patients.emergency-section")}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-ec" className="text-xs font-semibold text-foreground">{t("patients.emergency-contact")}</Label>
              <Input id="pf-ec" value={formData.emergencyContact} onChange={(e) => handleFieldChange("emergencyContact", e.target.value)} placeholder={t("patients.emergency-contact-placeholder")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-ep" className="text-xs font-semibold text-foreground">{t("patients.emergency-phone")}</Label>
              <Input id="pf-ep" value={formData.emergencyPhone} onChange={(e) => handleFieldChange("emergencyPhone", e.target.value)} placeholder={t("patients.emergency-phone-placeholder")} />
            </div>
          </div>
          <Separator />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("patients.insurance-section")}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-iprov" className="text-xs font-semibold text-foreground">{t("patients.insurance-provider")}</Label>
              <Input id="pf-iprov" value={formData.insuranceProvider} onChange={(e) => handleFieldChange("insuranceProvider", e.target.value)} placeholder={t("patients.insurance-provider-placeholder")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-inum" className="text-xs font-semibold text-foreground">{t("patients.insurance-number")}</Label>
              <Input id="pf-inum" value={formData.insuranceNumber} onChange={(e) => handleFieldChange("insuranceNumber", e.target.value)} placeholder={t("patients.insurance-number-placeholder")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-notes" className="text-xs font-semibold text-foreground">{t("patients.notes")}</Label>
            <textarea id="pf-notes" value={formData.notes} onChange={(e) => handleFieldChange("notes", e.target.value)} placeholder={t("patients.notes-placeholder")} className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" rows={2} />
          </div>
          <DialogFooter className="gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              <X className="h-4 w-4 me-1" /> {t("patients.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("patients.saving") : t("patients.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
