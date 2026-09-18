import { AlertCircle, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const TREATMENT_STATUSES = [
  { value: "pending", label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "planned", label: "Planifié", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "in_progress", label: "En cours", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "completed", label: "Terminé", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "cancelled", label: "Annulé", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

export const PRIORITIES: { value: string; label: string; color: string; icon: LucideIcon | null }[] = [
  { value: "low", label: "Basse", color: "bg-gray-100 text-gray-600", icon: null },
  { value: "medium", label: "Moyenne", color: "bg-blue-100 text-blue-700", icon: null },
  { value: "high", label: "Haute", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  { value: "urgent", label: "Urgente", color: "bg-red-100 text-red-700", icon: AlertTriangle },
];

export const FDI_TEETH = [
  18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
  48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38,
  55,54,53,52,51,61,62,63,64,65,
  85,84,83,82,81,71,72,73,74,75,
];