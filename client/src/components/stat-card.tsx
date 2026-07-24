import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconClassName?: string;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, iconClassName, className }: StatCardProps) {
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/40", className)}>
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className={cn("h-4 w-4 text-primary", iconClassName)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
