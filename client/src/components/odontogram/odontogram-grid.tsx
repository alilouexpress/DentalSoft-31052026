import { useMemo } from "react";
import {
  ALL_FDI_TEETH,
  FDI_QUADRANTS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_PRIORITY,
  getToothColor,
  getToothStatusLabel,
} from "./constants";
import type { DentalChartEntry } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Filter, Search } from "lucide-react";

const TOOTH_W = 48;
const TOOTH_H = 54;
const TOOTH_GAP = 6;
const MIDLINE_GAP = 28;
const JAW_GAP = 44;

function ToothPath({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const path = useMemo(() => {
    const r = w * 0.18;
    const neckY = y + h * 0.55;
    return [
      `M ${x + r},${y}`,
      `Q ${x + w / 2},${y - 3} ${x + w - r},${y}`,
      `L ${x + w - r * 0.8},${neckY}`,
      `Q ${x + w - r * 1.5},${y + h} ${x + w / 2},${y + h + 6}`,
      `Q ${x + r * 1.5},${y + h} ${x + r * 0.8},${neckY}`,
      "Z",
    ].join(" ");
  }, [x, y, w, h]);
  return <path d={path} />;
}

interface OdontogramGridProps {
  entries: DentalChartEntry[];
  selectedTooth: number | null;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onToothSelect: (tooth: number) => void;
  isRtl: boolean;
}

export function OdontogramGrid({
  entries,
  selectedTooth,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onToothSelect,
  isRtl,
}: OdontogramGridProps) {
  const entriesByTooth = useMemo(() => {
    const map = new Map<number, typeof entries>();
    for (const entry of entries) {
      const existing = map.get(entry.toothNumber) || [];
      existing.push(entry);
      map.set(entry.toothNumber, existing);
    }
    return map;
  }, [entries]);

  const filteredTeeth = useMemo(() => {
    return ALL_FDI_TEETH.filter((toothNum) => {
      if (statusFilter === "all") return true;
      const toothEntries = entriesByTooth.get(toothNum);
      if (!toothEntries || toothEntries.length === 0) return statusFilter === "healthy";
      const worst = [...toothEntries].sort(
        (a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
      )[0];
      return worst.status === statusFilter;
    });
  }, [entriesByTooth, statusFilter]);

  const searchFiltered = useMemo(() => {
    if (!searchQuery) return filteredTeeth;
    const q = searchQuery.toLowerCase();
    return filteredTeeth.filter((n) => String(n).includes(q));
  }, [filteredTeeth, searchQuery]);

  const halfWidth = 8 * TOOTH_W + 7 * TOOTH_GAP;
  const svgW = halfWidth + MIDLINE_GAP + halfWidth + 40;
  const svgH = 2 * TOOTH_H + JAW_GAP + 80;

  const renderQuadrant = (
    teeth: number[],
    baseX: number,
    baseY: number,
    reverse: boolean
  ) => {
    return teeth.map((toothNum, col) => {
      const idx = reverse ? teeth.length - 1 - col : col;
      const t = teeth[idx];
      const x = baseX + col * (TOOTH_W + TOOTH_GAP);
      const y = baseY;
      const color = getToothColor(t, entries);
      const isSelected = selectedTooth === t;
      const isFiltered = !searchFiltered.includes(t);
      const label = getToothStatusLabel(t, entries);

      return (
        <Tooltip key={t}>
          <TooltipTrigger asChild>
            <g
              className={`cursor-pointer transition-all duration-200 ${
                isFiltered ? "opacity-20" : isSelected ? "opacity-100" : "opacity-85 hover:opacity-100"
              }`}
              onClick={() => onToothSelect(t)}
            >
              <ToothPath x={x} y={y} w={TOOTH_W} h={TOOTH_H} />
              <rect
                x={x}
                y={y}
                width={TOOTH_W}
                height={TOOTH_H}
                rx={TOOTH_W * 0.18}
                ry={TOOTH_W * 0.18}
                fill={color}
                stroke={isSelected ? "#fff" : "transparent"}
                strokeWidth={isSelected ? 3 : 0}
                className="transition-all duration-200"
              />
              <text
                x={x + TOOTH_W / 2}
                y={y + TOOTH_H / 2 - 3}
                textAnchor="middle"
                fill="white"
                fontSize={11}
                fontWeight="bold"
                style={{ pointerEvents: "none" }}
              >
                {t}
              </text>
            </g>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            <div className="text-xs space-y-0.5">
              <p className="font-semibold">FDI #{t}</p>
              <p>
                {label}
                {entriesByTooth.get(t)?.length ? ` · ${entriesByTooth.get(t)!.length} entrée(s)` : ""}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-7 text-xs w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Toutes les dents</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[key] }} />
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-[180px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="N° dent..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-7 text-xs pl-7"
          />
        </div>
      </div>

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full"
        style={{ maxWidth: svgW, height: "auto" }}
      >
        <defs>
          <filter id="tooth-shadow-lg">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.25" />
          </filter>
        </defs>

        <text
          x={svgW / 2}
          y={18}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={12}
          fontWeight="600"
        >
          Maxillaire (supérieur)
        </text>

        {renderQuadrant(
          FDI_QUADRANTS[0].teeth,
          20,
          32,
          !isRtl
        )}
        {renderQuadrant(
          FDI_QUADRANTS[1].teeth,
          20 + halfWidth + MIDLINE_GAP,
          32,
          isRtl
        )}

        <line
          x1={20 + halfWidth + MIDLINE_GAP / 2}
          y1={28}
          x2={20 + halfWidth + MIDLINE_GAP / 2}
          y2={32 + TOOTH_H}
          stroke="hsl(var(--border))"
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        <text
          x={svgW / 2}
          y={svgH - 14}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={12}
          fontWeight="600"
        >
          Mandibule (inférieur)
        </text>

        {renderQuadrant(
          FDI_QUADRANTS[3].teeth,
          20,
          32 + TOOTH_H + JAW_GAP,
          !isRtl
        )}
        {renderQuadrant(
          FDI_QUADRANTS[2].teeth,
          20 + halfWidth + MIDLINE_GAP,
          32 + TOOTH_H + JAW_GAP,
          isRtl
        )}

        <line
          x1={20 + halfWidth + MIDLINE_GAP / 2}
          y1={32 + TOOTH_H + JAW_GAP - 4}
          x2={20 + halfWidth + MIDLINE_GAP / 2}
          y2={32 + TOOTH_H + JAW_GAP + TOOTH_H + 4}
          stroke="hsl(var(--border))"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-border">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: STATUS_COLORS[key] }}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}