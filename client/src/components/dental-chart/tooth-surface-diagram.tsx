import type { DentalChartEntry } from "@shared/schema";
import { STATUS_COLORS } from "./constants";

interface ToothSurfaceDiagramProps {
  selectedTooth: number;
  entries: DentalChartEntry[];
  onSurfaceClick: (surface: string) => void;
}

export function ToothSurfaceDiagram({
  selectedTooth,
  entries,
  onSurfaceClick,
}: ToothSurfaceDiagramProps) {
  const toothEntries = entries.filter((e) => e.toothNumber === selectedTooth);
  const getSurfaceColor = (surface: string) => {
    const entry = toothEntries.find((e) => e.surface === surface);
    return entry?.color || STATUS_COLORS[entry?.status || "healthy"] || STATUS_COLORS.healthy;
  };

  return (
    <svg viewBox="0 0 200 160" className="w-full max-w-[200px] mx-auto">
      <g>
        <rect x="30" y="10" width="140" height="140" rx="16" fill="hsl(var(--muted))" opacity={0.3} />
        <rect
          x="30"
          y="10"
          width="140"
          height="28"
          rx="8"
          fill={getSurfaceColor("lingual")}
          opacity={0.75}
          className="cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => onSurfaceClick("lingual")}
        />
        <rect
          x="30"
          y="122"
          width="140"
          height="28"
          rx="8"
          fill={getSurfaceColor("buccal")}
          opacity={0.75}
          className="cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => onSurfaceClick("buccal")}
        />
        <rect
          x="30"
          y="42"
          width="140"
          height="76"
          rx="10"
          fill={getSurfaceColor("occlusal")}
          opacity={0.75}
          className="cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => onSurfaceClick("occlusal")}
        />
        <rect
          x="10"
          y="10"
          width="20"
          height="140"
          rx="8"
          fill={getSurfaceColor("mesial")}
          opacity={0.75}
          className="cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => onSurfaceClick("mesial")}
        />
        <rect
          x="170"
          y="10"
          width="20"
          height="140"
          rx="8"
          fill={getSurfaceColor("distal")}
          opacity={0.75}
          className="cursor-pointer hover:opacity-100 transition-opacity"
          onClick={() => onSurfaceClick("distal")}
        />
        <text x="20" y="90" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" style={{ pointerEvents: "none" }}>M</text>
        <text x="180" y="90" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" style={{ pointerEvents: "none" }}>D</text>
        <text x="100" y="28" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" style={{ pointerEvents: "none" }}>L</text>
        <text x="100" y="140" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" style={{ pointerEvents: "none" }}>B</text>
        <text x="100" y="86" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" style={{ pointerEvents: "none" }}>O</text>
      </g>
    </svg>
  );
}