import { useLanguage } from "@/i18n/language-context";
import type { DentalChartEntry } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { TOOTH_STYLE, getToothColor } from "./constants";

const teethRows = [
  { range: [1, 2, 3, 4, 5, 6, 7, 8], isRightHalf: false },
  { range: [9, 10, 11, 12, 13, 14, 15, 16], isRightHalf: true },
  { range: [17, 18, 19, 20, 21, 22, 23, 24], isRightHalf: false },
  { range: [25, 26, 27, 28, 29, 30, 31, 32], isRightHalf: true },
];

interface ToothGridProps {
  entries: DentalChartEntry[];
  selectedTooth: number | null;
  onToothClick: (toothNumber: number) => void;
}

export function ToothGrid({ entries, selectedTooth, onToothClick }: ToothGridProps) {
  const { t } = useLanguage();
  const { w, h, gap, midlineGap, jawGap } = TOOTH_STYLE;
  const halfWidth = 8 * w + 7 * gap;
  const svgW = halfWidth + midlineGap + halfWidth + 40;
  const svgH = 2 * h + jawGap + 120;
  const leftMargin = 20;

  return (
    <Card className="card-hover overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full"
          style={{ maxWidth: svgW, height: "auto" }}
        >
          <defs>
            <filter id="tooth-shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.2" />
            </filter>
          </defs>

          {teethRows.map((row, rowIdx) => {
            const isLower = rowIdx >= 2;
            const baseY = 32 + (isLower ? h + jawGap : 0);
            const baseX = leftMargin + (row.isRightHalf ? halfWidth + midlineGap : 0);
            return row.range.map((toothNum, col) => {
              const x = baseX + col * (w + gap);
              const y = baseY;
              const color = getToothColor(toothNum, entries);
              const isSelected = selectedTooth === toothNum;
              return (
                <g
                  key={toothNum}
                  className="cursor-pointer"
                  onClick={() => onToothClick(toothNum)}
                  filter="url(#tooth-shadow)"
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={8}
                    ry={8}
                    fill={color}
                    stroke={isSelected ? "#fff" : "transparent"}
                    strokeWidth={isSelected ? 3 : 0}
                    opacity={isSelected ? 1 : 0.85}
                  />
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize={13}
                    fontWeight="bold"
                    style={{ pointerEvents: "none" }}
                  >
                    {toothNum}
                  </text>
                </g>
              );
            });
          })}

          <line
            x1={leftMargin + halfWidth + midlineGap / 2}
            y1={28}
            x2={leftMargin + halfWidth + midlineGap / 2}
            y2={32 + h}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <line
            x1={leftMargin + halfWidth + midlineGap / 2}
            y1={32 + h + jawGap}
            x2={leftMargin + halfWidth + midlineGap / 2}
            y2={32 + h + jawGap + h}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeDasharray="3 3"
          />

          <text
            x={svgW / 2}
            y={18}
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize={11}
            fontWeight="600"
          >
            {t("dentalChart.title")} — Maxillaire
          </text>
          <text
            x={svgW / 2}
            y={svgH - 14}
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize={11}
            fontWeight="600"
          >
            Mandibule
          </text>
        </svg>
      </CardContent>
    </Card>
  );
}