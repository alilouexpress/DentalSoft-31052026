import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/i18n/language-context";
import { useUploadPatientPhoto } from "@/hooks/use-patient-general-info";
import { toast } from "sonner";
import type { Patient } from "@shared/schema";
import { IdentityCard } from "./patient-general-info/identity-card";
import {
  PersonalInfoSection,
  ContactSection,
  AddressSection,
  EmergencyInsuranceSection,
  PreferencesSection,
  NotesSection,
} from "./patient-general-info/sections";
import { SaveBar } from "./patient-general-info/save-bar";
import { type FormState, toDateInputValue, calculateAge } from "./patient-general-info/constants";

interface PatientGeneralInfoProps {
  patient: Patient;
  onSave: (id: string, data: Record<string, any>) => Promise<void>;
}

function createInitialForm(patient: Patient): FormState {
  return {
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
  };
}

export function PatientGeneralInfo({ patient, onSave }: PatientGeneralInfoProps) {
  const { t } = useLanguage();
  const uploadPhoto = useUploadPatientPhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>(() => createInitialForm(patient));

  const computedAge = calculateAge(form.dateOfBirth);

  useEffect(() => {
    setForm(createInitialForm(patient));
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

  return (
    <div className="space-y-5 max-w-4xl">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />

      <IdentityCard
        patient={patient}
        onPhotoClick={handlePhotoClick}
        form={form}
        onChange={handleChange}
        fieldErrors={fieldErrors}
      />

      <PersonalInfoSection
        form={form}
        onChange={handleChange}
        fieldErrors={fieldErrors}
        computedAge={computedAge}
      />
      <ContactSection form={form} onChange={handleChange} fieldErrors={fieldErrors} />
      <AddressSection form={form} onChange={handleChange} fieldErrors={fieldErrors} />
      <EmergencyInsuranceSection form={form} onChange={handleChange} fieldErrors={fieldErrors} />
      <PreferencesSection form={form} onChange={handleChange} fieldErrors={fieldErrors} />
      <NotesSection form={form} onChange={handleChange} fieldErrors={fieldErrors} />

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
    </div>
  );
}