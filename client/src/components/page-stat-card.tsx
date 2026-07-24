import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PageStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  trend?: string;
  trendUp?: boolean;
  premium?: boolean;
  loading?: boolean;
  className?: string;
}

export function PageStatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
  trendUp,
  premium,
  loading,
  className,
}: PageStatCardProps) {
  if (loading) {
    return (
      <Card className={cn("card-hover", className)}>
        <CardContent className="p-5 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-hover", premium && "card-glow", className)}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold text-foreground truncate">{value}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            {trend && (
              <span className={cn("text-xs font-semibold", trendUp ? "text-emerald-600" : "text-red-600")}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
