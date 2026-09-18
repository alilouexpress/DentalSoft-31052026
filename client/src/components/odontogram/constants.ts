import type { DentalChartEntry } from "@shared/schema";

export const STATUS_COLORS: Record<string, string> = {
  healthy: "#22c55e",
  caries: "#ef4444",
  filled: "#3b82f6",
  crown: "#eab308",
  root_canal: "#a855f7",
  missing: "#6b7280",
  implant: "#14b8a6",
  bridge: "#f97316",
};

export const STATUS_LABELS: Record<string, string> = {
  healthy: "Sain",
  caries: "Carie",
  filled: "Ob turé",
  crown: "Couronne",
  root_canal: "Traitement canalaire",
  missing: "Absent",
  implant: "Implant",
  bridge: "Pont",
};

export const STATUS_PRIORITY: Record<string, number> = {
  caries: 1,
  missing: 2,
  root_canal: 3,
  bridge: 4,
  crown: 5,
  implant: 6,
  filled: 7,
  healthy: 8,
};

export const TREATMENT_OPTIONS = [
  "Examen",
  "Détartrage",
  "Traitement carie",
  "Dévitalisation",
  "Couronne",
  "Extraction",
  "Implant",
  "Pont",
  "Prothèse",
];

export const SURFACES = ["mesial", "distal", "occlusal", "buccal", "lingual"];

export const SURFACE_LABELS: Record<string, string> = {
  mesial: "M",
  distal: "D",
  occlusal: "O",
  buccal: "B",
  lingual: "L",
};

export const SURFACE_COLORS: Record<string, string> = {
  mesial: "rgba(59,130,246,0.2)",
  distal: "rgba(59,130,246,0.2)",
  occlusal: "rgba(245,158,11,0.2)",
  buccal: "rgba(16,185,129,0.2)",
  lingual: "rgba(16,185,129,0.2)",
};

export const FDI_QUADRANTS = [
  { label: "Quadrant 1 — Supérieur Droit", teeth: [18, 17, 16, 15, 14, 13, 12, 11] },
  { label: "Quadrant 2 — Supérieur Gauche", teeth: [21, 22, 23, 24, 25, 26, 27, 28] },
  { label: "Quadrant 3 — Inférieur Gauche", teeth: [31, 32, 33, 34, 35, 36, 37, 38] },
  { label: "Quadrant 4 — Inférieur Droit", teeth: [48, 47, 46, 45, 44, 43, 42, 41] },
];

export const ALL_FDI_TEETH = FDI_QUADRANTS.flatMap((q) => q.teeth);

export function getToothColor(
  toothNumber: number,
  entries: DentalChartEntry[]
): string {
  const toothEntries = entries.filter((e) => e.toothNumber === toothNumber);
  if (toothEntries.length === 0) return STATUS_COLORS.healthy;
  const worst = toothEntries.sort(
    (a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
  )[0];
  return worst.color || STATUS_COLORS[worst.status] || STATUS_COLORS.healthy;
}

export function getToothStatusLabel(
  toothNumber: number,
  entries: DentalChartEntry[]
): string {
  const toothEntries = entries.filter((e) => e.toothNumber === toothNumber);
  if (toothEntries.length === 0) return STATUS_LABELS.healthy;
  const worst = toothEntries.sort(
    (a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
  )[0];
  return STATUS_LABELS[worst.status] || worst.status;
}

export function getSurfaceColor(
  surface: string,
  toothEntries: DentalChartEntry[]
): string {
  const entry = toothEntries.find((e) => e.surface === surface);
  return entry?.color || STATUS_COLORS[entry?.status || "healthy"] || STATUS_COLORS.healthy;
}