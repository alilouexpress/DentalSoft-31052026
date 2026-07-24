import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-8 text-center relative", className)}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl" />
      </div>
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ring-1 ring-primary/10 animate-float">
          <div className="text-primary/60">{icon}</div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1.5 relative">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm relative">{description}</p>}
      {action && <div className="mt-6 relative">{action}</div>}
    </div>
  );
}
