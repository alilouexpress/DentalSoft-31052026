import { cn } from "@/lib/utils";

export function stockLevel(current: number, minimum: number) {
  if (minimum <= 0) return "green";
  const ratio = current / minimum;
  if (ratio > 0.5) return "green";
  if (ratio > 0.25) return "amber";
  return "red";
}

export function StockIndicator({ current, minimum }: { current: number; minimum: number }) {
  const level = stockLevel(current, minimum);
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-2 w-2 rounded-full",
        level === "green" ? "bg-emerald-500" : level === "amber" ? "bg-amber-500" : "bg-red-500",
      )} />
      <span className={cn(
        "text-sm font-medium",
        level === "green" ? "text-emerald-600" : level === "amber" ? "text-amber-600" : "text-red-600",
      )}>{current}</span>
    </div>
  );
}
