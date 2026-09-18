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
  healthy: "Healthy",
  caries: "Caries",
  filled: "Filled",
  crown: "Crown",
  root_canal: "Root Canal",
  missing: "Missing",
  implant: "Implant",
  bridge: "Bridge",
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
  "Caries filling",
  "Root Canal",
  "Crown",
  "Extraction",
  "Implant",
  "Bridge",
  "Cleaning",
  "Examination",
];

export const SURFACES = ["mesial", "distal", "occlusal", "buccal", "lingual"];

export const SURFACE_LABELS_SHORT: Record<string, string> = {
  mesial: "M",
  distal: "D",
  occlusal: "O",
  buccal: "B",
  lingual: "L",
};

export const STATUS_TO_TREATMENT: Record<string, string> = {
  caries: "Caries filling",
  root_canal: "Root Canal",
  crown: "Crown",
  missing: "Extraction",
  implant: "Implant",
  bridge: "Bridge",
  filled: "Caries filling",
  healthy: "Examination",
};

export const TOOTH_STYLE = { w: 48, h: 54, gap: 6, midlineGap: 28, jawGap: 44 };

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