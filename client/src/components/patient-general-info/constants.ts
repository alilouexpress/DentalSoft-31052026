import { format } from "date-fns";

export interface FormState {
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

export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}

export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const LANGUAGES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];
export const COMMUNICATION_MODES = [
  { value: "phone", translationKey: "workspace.comm-phone" },
  { value: "email", translationKey: "workspace.comm-email" },
  { value: "sms", translationKey: "workspace.comm-sms" },
  { value: "mail", translationKey: "workspace.comm-mail" },
];