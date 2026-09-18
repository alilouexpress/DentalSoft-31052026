import {
  FlaskConical,
  AlertTriangle,
  HeartPulse,
  Baby,
  Pill,
  Ban,
  ClipboardList,
} from "lucide-react";

export const CATEGORIES = ["allergies", "diabetes", "hypertension", "pregnancy", "medications", "contraindications", "other"] as const;

export type Severity = "critical" | "moderate" | "minor" | "none";

export const SEVERITY_OPTIONS: { value: Severity; labelKey: string }[] = [
  { value: "critical", labelKey: "medicalHistory.critical" },
  { value: "moderate", labelKey: "medicalHistory.moderate" },
  { value: "minor", labelKey: "medicalHistory.minor" },
  { value: "none", labelKey: "medicalHistory.none" },
];

export const severityColor: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  minor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  none: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

export const severityDot: Record<string, string> = {
  critical: "bg-red-500",
  moderate: "bg-yellow-500",
  minor: "bg-green-500",
  none: "bg-slate-400",
};

export const categoryIcons: Record<string, typeof FlaskConical> = {
  allergies: FlaskConical,
  diabetes: AlertTriangle,
  hypertension: HeartPulse,
  pregnancy: Baby,
  medications: Pill,
  contraindications: Ban,
  other: ClipboardList,
};

export interface FormState {
  category: string;
  value: string;
  severity: Severity;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  notes: string;
}

export const emptyForm: FormState = {
  category: "allergies",
  value: "",
  severity: "none",
  startDate: "",
  endDate: "",
  isCurrent: true,
  notes: "",
};

export const QUICK_CONDITIONS: Record<string, string[]> = {
  allergies: ["Pénicilline", "Latex", "Arachides", "Iode", "Aspirine", "Sulfamides", "Anesthésiques locaux"],
  diabetes: ["Type 1", "Type 2", "Gestationnel", "Pré-diabète"],
  hypertension: ["Essentielle", "Secondaire", "Maligne"],
  pregnancy: ["Enceinte", "Allaitement", "Post-partum"],
  medications: ["Anticoagulants", "Antihypertenseurs", "Insuline", "Corticostéroïdes", "Bisphosphonates"],
  contraindications: ["Allergie à l'anesthésie", "Hémophilie", "Endocardite", "Radiothérapie"],
  other: [],
};

export const formatDate = (dateVal: Date | string | null | undefined) => {
  if (!dateVal) return "—";
  return new Date(dateVal).toLocaleDateString();
};